import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { DossierStatus, Profile } from "@/types";

import { SignOutButton } from "./sign-out-button";

interface GuestRow {
  id: string;
  name: string;
  created_at: string;
  dossiers: { id: string; status: DossierStatus; created_at: string }[];
}

const STATUS_LABEL: Record<DossierStatus, string> = {
  pending: "Researching…",
  ready: "Ready",
  failed: "Failed",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: guests }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
    supabase
      .from("guests")
      .select("id, name, created_at, dossiers(id, status, created_at)")
      .order("created_at", { ascending: false })
      .returns<GuestRow[]>(),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Guests</h1>
          <p className="text-sm text-muted-foreground">
            {user.email} · {profile?.plan ?? "free"} plan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link href="/dossier/new">
              <Plus />
              New dossier
            </Link>
          </Button>
          <SignOutButton />
        </div>
      </header>

      {!guests || guests.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No guests yet</CardTitle>
            <CardDescription>
              Add your first guest to build a grounded dossier and a bank of
              rarely-asked angles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dossier/new">
                <Plus />
                New dossier
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {guests.map((guest) => {
            const dossier = guest.dossiers
              ?.slice()
              .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
            const inner = (
              <Card className="transition-colors hover:bg-accent/40">
                <CardContent className="flex items-center justify-between py-4">
                  <span className="font-medium">{guest.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {dossier ? STATUS_LABEL[dossier.status] : "No dossier"}
                  </span>
                </CardContent>
              </Card>
            );
            return (
              <li key={guest.id}>
                {dossier ? (
                  <Link href={`/dossier/${dossier.id}`}>{inner}</Link>
                ) : (
                  inner
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
