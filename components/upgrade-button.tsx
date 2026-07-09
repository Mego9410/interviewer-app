"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button, type ButtonProps } from "@/components/ui/button";

export function UpgradeButton({
  children = "Upgrade to Pro",
  ...props
}: ButtonProps) {
  const [loading, setLoading] = useState(false);

  async function upgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Could not start checkout.");
        setLoading(false);
        return;
      }
      window.location.href = data.url as string;
    } catch {
      toast.error("Network error — please try again.");
      setLoading(false);
    }
  }

  return (
    <Button onClick={upgrade} disabled={loading} {...props}>
      {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
      {children}
    </Button>
  );
}
