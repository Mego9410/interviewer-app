import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SessionRecap } from "@/components/session/session-recap";
import { DemoBanner } from "@/components/demo/demo-banner";

export const metadata = { title: "Demo · Recap" };

export default function DemoRecap() {
  return (
    <>
      <DemoBanner />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
          <Link href="/demo">
            <ArrowLeft />
            Dashboard
          </Link>
        </Button>

        <header className="mb-6">
          <p className="eyebrow mb-2">Session recap</p>
          <h1 className="font-serif text-4xl italic tracking-tight">Jane Doe</h1>
        </header>

        <SessionRecap
          sessionId="demo"
          initialShowNotes={
            "## Jane Doe — Acme, scaling, and the case against team size\n\nJane Doe joins to talk about scaling Acme to 200 people and why she now argues most teams grow too fast.\n\n- The second year nearly broke the company — hiring outran process\n- Her 'remote past fifty' rule came from watching autonomy collapse at scale\n- Changed her mind on org charts: fewer layers, clearer ownership"
          }
          segments={[
            { id: "s1", speaker: "host", text: "So you scaled Acme to two hundred people in three years." },
            { id: "s2", speaker: "guest", text: "Yeah, and honestly the second year nearly broke us — we hired too fast and the process just didn't exist yet." },
            { id: "s3", speaker: "host", text: "When you say it nearly broke you — what started failing first?" },
            { id: "s4", speaker: "guest", text: "Onboarding. New people had no idea who owned what, so everything routed back to me." },
          ]}
          suggestions={[
            { id: "q1", question: "When you say it nearly broke you — what actually started failing first?", status: "asked" },
            { id: "q2", question: "Your blog said remote-first breaks past 50 — is that the line where hiring outran process?", status: "asked" },
            { id: "q3", question: "Do you regret the pace, or was the chaos necessary?", status: "dismissed" },
          ]}
        />
      </main>
    </>
  );
}
