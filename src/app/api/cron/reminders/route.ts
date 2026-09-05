import { NextResponse, type NextRequest } from "next/server";
import { runReminderEngine } from "@/lib/notifications/reminder-engine";
import { checkRateLimit } from "@/lib/security/rate-limiter";

export async function GET(request: NextRequest) {
  return handleCron(request);
}

export async function POST(request: NextRequest) {
  return handleCron(request);
}

async function handleCron(request: NextRequest) {
  // 1. Secret Authorization Check
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  const querySecret = request.nextUrl.searchParams.get("secret");

  const expectedSecret = process.env.CRON_SECRET;
  const providedSecret = bearerToken || querySecret;

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized: Invalid or missing cron secret." }, { status: 401 });
  }

  // 2. Rate Limiting for authenticated cron caller: 120 reqs/min
  const ip = request.headers.get("x-forwarded-for") || "cron-caller";
  const rateLimit = checkRateLimit(`cron-reminders:${ip}`, 120, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }


  // 3. Optional date override for testing/dry-runs
  const testDateParam = request.nextUrl.searchParams.get("testDate");
  const forceRun = request.nextUrl.searchParams.get("force") === "true";
  const referenceDate = testDateParam ? new Date(testDateParam) : new Date();

  try {
    const result = await runReminderEngine(referenceDate, forceRun);
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("[Cron Reminders] Failed to execute reminder engine:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute reminder run." },
      { status: 500 }
    );
  }
}
