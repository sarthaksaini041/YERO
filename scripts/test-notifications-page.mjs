import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mglneknqwgpzjijfuaac.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nbG5la25xd2dwemppamZ1YWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MDIxNzYsImV4cCI6MjEwNDE3ODE3Nn0.HkzlKEjLFWVl-6L3PJrlwGdN8THvxis3pnpLgGhrfzo";
const APP_URL = "http://localhost:3000";

async function testNotificationsPage() {
  console.log("=== Testing Notifications Page & System ===");

  // 1. Unauthenticated request to /notifications
  console.log("\n1. Testing route protection on GET /notifications (unauthenticated)...");
  const unauthRes = await fetch(`${APP_URL}/notifications`, { redirect: "manual" });
  console.log(`   Response status: ${unauthRes.status}`);
  assert.equal(
    unauthRes.status === 307 || unauthRes.status === 302 || unauthRes.status === 303,
    true,
    "Expected redirect for unauthenticated visitor"
  );
  console.log("   ✓ Route protection verified: unauthenticated users redirected to /login");

  // 2. Authenticate user
  console.log("\n2. Signing in as sarthak@yero.app...");
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "sarthak@yero.app",
    password: "00000000",
  });
  assert.ifError(authError);
  assert.ok(authData.user, "User should be signed in");
  const userId = authData.user.id;
  console.log(`   ✓ Authenticated as user ${userId}`);

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${authData.session.access_token}` },
    },
  });

  // 3. Clean any previous test logs
  console.log("\n3. Testing Database CRUD on notification_logs via authenticated client...");
  await userClient.from("notification_logs").delete().eq("user_id", userId);

  // 4. Insert test notification log
  const todayIst = new Date().toISOString().split("T")[0];
  const { data: insertData, error: insertError } = await userClient
    .from("notification_logs")
    .insert({
      user_id: userId,
      event_type: "TEST_NOTIFICATION",
      target_date_ist: todayIst,
      hour_slot_ist: Math.floor(Date.now() % 1000000),
      title: "Plan your day with YERO",
      body: "This is a test notification from YERO. Your daily task reminders are active!",
      status: "SENT",
      sent_at: new Date().toISOString(),
    })
    .select()
    .single();

  assert.ifError(insertError);
  assert.ok(insertData?.id, "Notification log should be inserted");
  console.log(`   ✓ Inserted test notification log ID: ${insertData.id}`);

  // 5. Query notification logs
  const { data: logs, error: queryError } = await userClient
    .from("notification_logs")
    .select("*")
    .eq("user_id", userId)
    .order("sent_at", { ascending: false });

  assert.ifError(queryError);
  assert.equal(logs.length, 1, "Should have retrieved 1 notification log");
  assert.equal(logs[0].title, "Plan your day with YERO");
  console.log(`   ✓ Queried notification log: "${logs[0].title}" - status: ${logs[0].status}`);

  // 6. Delete notification log
  const { error: delError } = await userClient
    .from("notification_logs")
    .delete()
    .eq("id", insertData.id);
  assert.ifError(delError);

  const { data: remainingLogs } = await userClient
    .from("notification_logs")
    .select("*")
    .eq("user_id", userId);
  assert.equal(remainingLogs.length, 0, "Notification log should be deleted");
  console.log("   ✓ Deleted notification log successfully");

  console.log("\n=== ALL NOTIFICATIONS PAGE TESTS PASSED ===");
}

testNotificationsPage().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
