import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mglneknqwgpzjijfuaac.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nbG5la25xd2dwemppamZ1YWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MDIxNzYsImV4cCI6MjEwNDE3ODE3Nn0.HkzlKEjLFWVl-6L3PJrlwGdN8THvxis3pnpLgGhrfzo";
const APP_URL = "http://localhost:3000";
const CRON_SECRET = "8fa6575b7a5e82123d6d90bb60020396af0931b802a95044";

async function runEndToEndReminderTest() {
  console.log("=== Starting End-to-End Push & Reminder Engine Test ===");

  // 1. Authenticate user
  console.log("\n1. Signing in as sarthak@yero.app...");
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "sarthak@yero.app",
    password: "00000000",
  });

  if (authError || !authData.user) {
    throw new Error(`Auth failed: ${authError?.message}`);
  }
  const userId = authData.user.id;
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${authData.session.access_token}` },
    },
  });
  console.log(`   ✓ Authenticated user ID: ${userId}`);

  // 2. Clean previous test logs and test tasks for today to ensure a clean state
  console.log("\n2. Resetting test tasks and logs for clean run...");
  await userClient.from("tasks").delete().eq("user_id", userId);
  await userClient.from("notification_logs").delete().eq("user_id", userId);

  // 3. Register a mock push subscription for this device
  console.log("\n3. Registering push subscription for user device...");
  const mockEndpoint = `https://fcm.googleapis.com/fcm/send/test-sub-${Date.now()}`;
  const { error: subError } = await userClient.from("push_subscriptions").upsert({
    user_id: userId,
    endpoint: mockEndpoint,
    p256dh: "BMockKey1234567890abcdefghijklmnopqrstuvwxyz",
    auth: "MockAuthKey123",
    user_agent: "Node.js Test Client",
  });
  assert.ifError(subError);

  // Ensure preferences enabled
  await userClient.from("user_preferences").upsert({
    user_id: userId,
    notifications_enabled: true,
    active_hours_start_ist: 9,
    active_hours_end_ist: 21,
  });
  console.log("   ✓ Push subscription and preferences active in database.");

  // 4. TEST STATE 1: Zero tasks created today
  console.log("\n4. Testing STATE 1: User has 0 tasks today...");
  // 4a. Morning slot (hour 10 IST)
  const testMorningDate = "2026-09-05T04:30:00.000Z"; // 10:00 IST
  const cronRes1 = await fetch(
    `${APP_URL}/api/cron/reminders?secret=${CRON_SECRET}&testDate=${testMorningDate}&force=true`
  );
  const json1 = await cronRes1.json();
  const userDetail1 = json1.result.details.find((d) => d.userId === userId);
  console.log("   Morning slot (10:00 IST) result:", userDetail1?.eventType, userDetail1?.status);
  assert.equal(userDetail1?.eventType, "DAILY_PROMPT", "Expected DAILY_PROMPT for 0 tasks in morning");

  // 4b. Idempotency test: Repeat run at same slot
  console.log("   Testing idempotency (repeat run at same slot)...");
  const cronRes1Repeat = await fetch(
    `${APP_URL}/api/cron/reminders?secret=${CRON_SECRET}&testDate=${testMorningDate}&force=true`
  );
  const json1Repeat = await cronRes1Repeat.json();
  const userDetail1Repeat = json1Repeat.result.details.find((d) => d.userId === userId);
  console.log("   Repeat run result:", userDetail1Repeat?.status, userDetail1Repeat?.message);
  assert.equal(userDetail1Repeat?.status, "DUPLICATE_SKIPPED", "Expected DUPLICATE_SKIPPED on repeat run");
  console.log("   ✓ Zero duplicates sent for duplicate morning trigger!");

  // 4c. 3-hour reminder tick (hour 13 IST -> 07:30 UTC)
  const test3hDate = "2026-09-05T07:30:00.000Z"; // 13:00 IST (slot 12)
  const cronRes2 = await fetch(
    `${APP_URL}/api/cron/reminders?secret=${CRON_SECRET}&testDate=${test3hDate}&force=true`
  );
  const json2 = await cronRes2.json();
  const userDetail2 = json2.result.details.find((d) => d.userId === userId);
  console.log("   3-Hour tick (13:00 IST) result:", userDetail2?.eventType, userDetail2?.status);
  assert.equal(userDetail2?.eventType, "NO_TASKS_REMINDER", "Expected NO_TASKS_REMINDER for 0 tasks after morning");
  console.log("   ✓ 3-Hour reminder successfully triggered when user still has 0 tasks!");

  // 5. TEST STATE 2: Tasks created, some incomplete remaining
  console.log("\n5. Testing STATE 2: User creates tasks (incomplete remaining)...");
  // Insert 2 tasks created today
  const { data: task1, error: t1Err } = await userClient
    .from("tasks")
    .insert({ user_id: userId, title: "Review quarterly roadmap", completed: false })
    .select()
    .single();
  assert.ifError(t1Err);

  const { data: task2, error: t2Err } = await userClient
    .from("tasks")
    .insert({ user_id: userId, title: "Update security policies", completed: false })
    .select()
    .single();
  assert.ifError(t2Err);

  console.log("   Inserted 2 tasks for today. Calling reminder engine at slot 15 IST...");
  const testProgressDate = "2026-09-05T10:00:00.000Z"; // 15:30 IST (slot 15)
  const cronRes3 = await fetch(
    `${APP_URL}/api/cron/reminders?secret=${CRON_SECRET}&testDate=${testProgressDate}&force=true`
  );
  const json3 = await cronRes3.json();
  const userDetail3 = json3.result.details.find((d) => d.userId === userId);
  console.log("   Progress result:", userDetail3?.eventType, "-", userDetail3?.body || userDetail3?.message);
  assert.equal(userDetail3?.eventType, "PROGRESS_REMINDER", "Expected PROGRESS_REMINDER when tasks exist");
  assert.ok(
    (userDetail3?.body || userDetail3?.message || "").includes("2 tasks left"),
    "Expected '2 tasks left' in message"
  );
  console.log("   ✓ 'No tasks' reminders stopped immediately!");
  console.log("   ✓ Dynamic remaining count correctly formatted:", userDetail3?.body || userDetail3?.message);

  // 6. TEST STATE 3: User completes all tasks
  console.log("\n6. Testing STATE 3: User completes all tasks...");
  await userClient.from("tasks").update({ completed: true }).eq("id", task1.id);
  await userClient.from("tasks").update({ completed: true }).eq("id", task2.id);

  const testCompletedDate = "2026-09-05T12:00:00.000Z"; // 17:30 IST (slot 15)
  const cronRes4 = await fetch(
    `${APP_URL}/api/cron/reminders?secret=${CRON_SECRET}&testDate=${testCompletedDate}&force=true`
  );
  const json4 = await cronRes4.json();
  const userDetail4 = json4.result.details.find((d) => d.userId === userId);
  console.log("   Completion result:", userDetail4?.eventType, "-", userDetail4?.body || userDetail4?.message);
  assert.equal(userDetail4?.eventType, "ALL_COMPLETED", "Expected ALL_COMPLETED when all tasks are done");
  assert.ok(
    (userDetail4?.body || userDetail4?.message || "").includes("All tasks completed"),
    "Expected 'All tasks completed' message"
  );
  console.log("   ✓ Incomplete task reminders stopped!");
  console.log("   ✓ Completion notification dispatched:", userDetail4?.body || userDetail4?.message);


  // Run again to verify completion notification is sent only once per day
  console.log("   Testing completion notification deduplication (repeat run)...");
  const cronRes4Repeat = await fetch(
    `${APP_URL}/api/cron/reminders?secret=${CRON_SECRET}&testDate=${testCompletedDate}&force=true`
  );
  const json4Repeat = await cronRes4Repeat.json();
  const userDetail4Repeat = json4Repeat.result.details.find((d) => d.userId === userId);
  console.log("   Repeat run result:", userDetail4Repeat?.status);
  assert.equal(userDetail4Repeat?.status, "DUPLICATE_SKIPPED");
  console.log("   ✓ Completion notification is idempotent (sent exactly once per day)");

  // 7. TEST INVALID SUBSCRIPTION PRUNING
  console.log("\n7. Testing Automatic Subscription Pruning...");
  const { data: pruneCount, error: pruneErr } = await supabase.rpc("prune_push_subscription", {
    p_endpoint: mockEndpoint,
  });
  assert.ifError(pruneErr);
  console.log(`   Pruned ${pruneCount} expired/invalid subscription.`);
  assert.equal(pruneCount, 1, "Should prune exactly 1 subscription");

  const { data: remainingSubs } = await userClient
    .from("push_subscriptions")
    .select("id")
    .eq("endpoint", mockEndpoint);
  assert.equal(remainingSubs?.length, 0, "Subscription should no longer exist in database");
  console.log("   ✓ Dead subscription successfully pruned from database!");

  // Clean up test tasks
  await userClient.from("tasks").delete().eq("user_id", userId);
  await userClient.from("notification_logs").delete().eq("user_id", userId);

  console.log("\n=== ALL END-TO-END REMINDER TESTS PASSED SUCCESSFULLY ===");
}

runEndToEndReminderTest().catch((err) => {
  console.error("End-to-End Reminder test failed:", err);
  process.exit(1);
});
