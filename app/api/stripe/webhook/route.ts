import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Plan } from "@/types";

// Stripe webhook: flips profiles.plan on subscription events (PRD 9).
// Uses raw-body signature verification and the service-role client (no user
// session here, so RLS can't apply).
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) {
    return NextResponse.json({ error: "Missing webhook secret" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  async function setPlanByCustomer(customerId: string, plan: Plan) {
    await admin.from("profiles").update({ plan }).eq("stripe_customer_id", customerId);
  }

  async function setPlanByUser(userId: string, plan: Plan, customerId?: string) {
    await admin
      .from("profiles")
      .update(customerId ? { plan, stripe_customer_id: customerId } : { plan })
      .eq("id", userId);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const customerId =
        typeof session.customer === "string" ? session.customer : undefined;
      if (userId) {
        await setPlanByUser(userId, "pro", customerId);
      } else if (customerId) {
        await setPlanByCustomer(customerId, "pro");
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const sub = event.data.object as Stripe.Subscription;
      const active = sub.status === "active" || sub.status === "trialing";
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      await setPlanByCustomer(customerId, active ? "pro" : "free");
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      await setPlanByCustomer(customerId, "free");
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
