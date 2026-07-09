"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isApiError, type CreateDossierResponse } from "@/types";

export default function NewDossierPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [linksText, setLinksText] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const links = linksText
      .split(/[\n,]/)
      .map((l) => l.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/dossier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), links }),
      });
      const data: CreateDossierResponse | { error: string } = await res.json();

      if (!res.ok || isApiError(data)) {
        toast.error(isApiError(data) ? data.error : "Something went wrong.");
        setLoading(false);
        return;
      }
      router.push(`/dossier/${data.dossierId}`);
    } catch {
      toast.error("Network error — please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link href="/dashboard">
          <ArrowLeft />
          Dashboard
        </Link>
      </Button>

      <p className="eyebrow mb-2">New dossier</p>
      <h1 className="mb-6 font-display text-3xl font-semibold tracking-tight">
        Who&apos;s your next guest?
      </h1>
      <Card>
        <CardHeader>
          <CardDescription>
            A name and a few links is enough. We research public sources and
            draft ten rarely-asked angles — each tied to a citation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Guest name</Label>
              <Input
                id="name"
                placeholder="e.g. Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="links">Links (optional)</Label>
              <Textarea
                id="links"
                placeholder={
                  "One per line — LinkedIn, personal site, articles…\nhttps://…"
                }
                value={linksText}
                onChange={(e) => setLinksText(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                The more you add, the more grounded the dossier.
              </p>
            </div>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading && <Loader2 className="animate-spin" />}
              {loading ? "Researching…" : "Build dossier"}
            </Button>
            {loading && (
              <p className="text-xs text-muted-foreground">
                This runs live web research and can take up to a minute.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
