import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { pushSubscriptionSchema, unsubscribeSchema } from "@/lib/validations/push";
import { checkRateLimit } from "@/lib/security/rate-limiter";

export async function POST(request: NextRequest) {
  // 1. Rate Limiting
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const rateLimit = checkRateLimit(`push-sub:${ip}`, 20, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many subscription attempts. Please try again shortly." },
      { status: 429 }
    );
  }

  // 2. Authentication
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Body validation
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parseResult = pushSubscriptionSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0]?.message || "Invalid push subscription format." },
      { status: 400 }
    );
  }

  const { endpoint, keys } = parseResult.data;
  const userAgent = request.headers.get("user-agent") || undefined;

  // 4. Upsert subscription in Supabase
  const { error: insertError } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        user_agent: userAgent,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id, endpoint" }
    );

  if (insertError) {
    console.error("[Push API] Subscription upsert error:", insertError.message);
    return NextResponse.json({ error: "Failed to save push subscription." }, { status: 500 });
  }

  // 5. Ensure user_preferences row exists
  await supabase
    .from("user_preferences")
    .upsert(
      {
        user_id: user.id,
        notifications_enabled: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  return NextResponse.json({ success: true, message: "Subscribed successfully." });
}

export async function DELETE(request: NextRequest) {
  // 1. Authentication
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Body validation
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parseResult = unsubscribeSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0]?.message || "Invalid unsubscribe payload." },
      { status: 400 }
    );
  }

  const { endpoint } = parseResult.data;

  // 3. Delete subscription
  const { error: deleteError } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);

  if (deleteError) {
    console.error("[Push API] Unsubscribe delete error:", deleteError.message);
    return NextResponse.json({ error: "Failed to remove subscription." }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Unsubscribed successfully." });
}
