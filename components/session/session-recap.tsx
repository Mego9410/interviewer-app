"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Speaker, SuggestionStatus } from "@/types";

interface RecapSegment {
  id: string;
  speaker: Speaker | null;
  text: string;
}

interface RecapSuggestion {
  id: string;
  question: string;
  status: SuggestionStatus;
}

export function SessionRecap({
  sessionId,
  initialShowNotes,
  segments,
  suggestions,
}: {
  sessionId: string;
  initialShowNotes: string;
  segments: RecapSegment[];
  suggestions: RecapSuggestion[];
}) {
  const [notes, setNotes] = useState(initialShowNotes);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/session/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showNotes: notes }),
      });
      if (!res.ok) throw new Error();
      toast.success("Show notes saved.");
    } catch {
      toast.error("Could not save — please try again.");
    } finally {
      setSaving(false);
    }
  }

  const asked = suggestions.filter((s) => s.status === "asked");
  const dismissed = suggestions.filter((s) => s.status === "dismissed");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Show notes</CardTitle>
          <CardDescription>
            A grounded draft from the transcript and the follow-ups you asked.
            Edit freely.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={12}
            className="font-mono text-sm"
            placeholder="No show notes were generated."
          />
          <Button onClick={save} disabled={saving} size="sm">
            {saving && <Loader2 className="animate-spin" />}
            Save
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suggestion log</CardTitle>
          <CardDescription>
            {asked.length} asked · {dismissed.length} dismissed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No suggestions were generated this session.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {suggestions.map((s) => (
                <li key={s.id} className="flex items-start gap-2">
                  {s.status === "asked" ? (
                    <Check className="mt-0.5 size-4 shrink-0 text-green-600" />
                  ) : s.status === "dismissed" ? (
                    <X className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-muted-foreground/40" />
                  )}
                  <span
                    className={cn(
                      s.status === "dismissed" && "text-muted-foreground"
                    )}
                  >
                    {s.question}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          {segments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No transcript was captured.
            </p>
          ) : (
            <div className="space-y-2 text-sm leading-relaxed">
              {segments.map((seg) => (
                <p key={seg.id}>
                  <span
                    className={cn(
                      "mr-2 text-xs font-semibold uppercase tracking-wide",
                      seg.speaker === "guest"
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {seg.speaker ?? "…"}
                  </span>
                  {seg.text}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
