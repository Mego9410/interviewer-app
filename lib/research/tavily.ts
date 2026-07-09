import "server-only";

/**
 * Tavily research provider (M1). Server-side only — the key never reaches the
 * client. Kept behind this small interface so the provider can be swapped
 * later (Section 13 open decision) without touching the pipeline.
 */

const TAVILY_SEARCH_URL = "https://api.tavily.com/search";
const TAVILY_EXTRACT_URL = "https://api.tavily.com/extract";

export interface RawSource {
  url: string;
  title: string | null;
  snippet: string;
}

interface TavilySearchResult {
  url: string;
  title?: string;
  content?: string;
}

interface TavilyExtractResult {
  url: string;
  raw_content?: string;
}

function getKey(): string {
  const key = process.env.TAVILY_API_KEY;
  if (!key) {
    throw new Error("TAVILY_API_KEY is not set");
  }
  return key;
}

/** Truncate raw page text so a single source can't blow the model context. */
function clamp(text: string, max = 1500): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.length > max ? trimmed.slice(0, max) + "…" : trimmed;
}

/** Run one web search and return result snippets. */
async function search(query: string, maxResults = 4): Promise<RawSource[]> {
  const res = await fetch(TAVILY_SEARCH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: getKey(),
      query,
      search_depth: "advanced",
      max_results: maxResults,
    }),
  });

  if (!res.ok) {
    throw new Error(`Tavily search failed (${res.status})`);
  }

  const data = (await res.json()) as { results?: TavilySearchResult[] };
  return (data.results ?? [])
    .filter((r) => r.url && r.content)
    .map((r) => ({
      url: r.url,
      title: r.title ?? null,
      snippet: clamp(r.content!),
    }));
}

/** Extract readable text from caller-provided links. */
async function extract(urls: string[]): Promise<RawSource[]> {
  if (urls.length === 0) return [];

  const res = await fetch(TAVILY_EXTRACT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: getKey(), urls }),
  });

  if (!res.ok) {
    // Extraction is best-effort — a bad link shouldn't fail the whole dossier.
    return [];
  }

  const data = (await res.json()) as { results?: TavilyExtractResult[] };
  return (data.results ?? [])
    .filter((r) => r.url && r.raw_content)
    .map((r) => ({ url: r.url, title: null, snippet: clamp(r.raw_content!) }));
}

/**
 * Gather grounded sources for a guest: extract any provided links, then run a
 * few targeted searches. De-duplicated by URL and capped so the model prompt
 * stays bounded.
 */
export async function gatherSources(
  name: string,
  links: string[],
  cap = 8
): Promise<RawSource[]> {
  const queries = [name, `${name} interview`, `${name} recent work`];

  const batches = await Promise.allSettled([
    extract(links),
    ...queries.map((q) => search(q)),
  ]);

  const seen = new Set<string>();
  const sources: RawSource[] = [];
  for (const batch of batches) {
    if (batch.status !== "fulfilled") continue;
    for (const s of batch.value) {
      if (seen.has(s.url)) continue;
      seen.add(s.url);
      sources.push(s);
      if (sources.length >= cap) return sources;
    }
  }
  return sources;
}
