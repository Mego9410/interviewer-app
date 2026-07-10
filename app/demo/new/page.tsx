import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DemoBanner } from "@/components/demo/demo-banner";

export const metadata = { title: "Demo · New dossier" };

export default function DemoNew() {
  return (
    <>
      <DemoBanner />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
          <Link href="/demo">
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Guest name</Label>
                <Input id="name" placeholder="e.g. Jane Doe" defaultValue="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="links">Links (optional)</Label>
                <Textarea
                  id="links"
                  rows={4}
                  defaultValue={"https://acme.com/about\nhttps://janedoe.blog/remote-past-fifty"}
                />
                <p className="text-xs text-muted-foreground">
                  The more you add, the more grounded the dossier.
                </p>
              </div>
              <Button asChild>
                <Link href="/demo/dossier">Build dossier</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
