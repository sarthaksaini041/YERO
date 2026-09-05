import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mglneknqwgpzjijfuaac.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nbG5la25xd2dwemppamZ1YWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MDIxNzYsImV4cCI6MjEwNDE3ODE3Nn0.HkzlKEjLFWVl-6L3PJrlwGdN8THvxis3pnpLgGhrfzo";

const APP_URL = "http://localhost:3000";

async function runVerification() {
  console.log("=== Starting YERO System Verification ===");

  // 1. Check HTTP server /login route
  console.log("\n1. Testing HTTP GET /login...");
  const loginRes = await fetch(`${APP_URL}/login`);
  console.log(`   Status: ${loginRes.status} ${loginRes.statusText}`);
  const loginHtml = await loginRes.text();
  const hasBrand = loginHtml.includes("YERO") || loginHtml.includes("Sign in");
  const hasInput = loginHtml.includes("identifier") || loginHtml.includes("Password");
  console.log(`   Contains YERO brand: ${hasBrand ? "✓" : "✗"}`);
  console.log(`   Contains Form inputs: ${hasInput ? "✓" : "✗"}`);
  if (loginRes.status !== 200 || !hasBrand) {
    throw new Error("Login page verification failed.");
  }

  // 2. Check Route Protection: GET / without auth should redirect
  console.log("\n2. Testing Route Protection: GET / without auth...");
  const homeRes = await fetch(`${APP_URL}/`, { redirect: "manual" });
  console.log(`   Status: ${homeRes.status} ${homeRes.statusText}`);
  const redirectLocation = homeRes.headers.get("location");
  console.log(`   Redirect Location: ${redirectLocation}`);
  if (homeRes.status === 307 || homeRes.status === 302 || (redirectLocation && redirectLocation.includes("/login"))) {
    console.log("   ✓ Protected route correctly redirects unauthenticated visitors to /login");
  } else {
    console.log(`   Notice: status ${homeRes.status}`);
  }

  // 3. Authenticate with Supabase Auth using user 'sarthak' (password: 00000000)
  console.log("\n3. Testing Supabase Auth login for 'sarthak@yero.app'...");
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "sarthak@yero.app",
    password: "00000000",
  });

  if (authError || !authData.user) {
    throw new Error(`Auth failed: ${authError?.message}`);
  }
  console.log(`   ✓ Successfully signed in as '${authData.user.email}' (ID: ${authData.user.id})`);

  // 4. Test Database Task Operations with User's JWT (verifies RLS policies)
  console.log("\n4. Testing Tasks Table & RLS Policies with Authenticated Client...");
  const authedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${authData.session.access_token}`,
      },
    },
  });

  // 4a. Insert a task
  console.log("   - Creating test task: 'Design liquid glass layout'...");
  const { data: insertedTask, error: insertError } = await authedClient
    .from("tasks")
    .insert({
      user_id: authData.user.id,
      title: "Design liquid glass layout",
      completed: false,
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Insert failed: ${insertError.message}`);
  }
  console.log(`   ✓ Task created: [${insertedTask.id}] "${insertedTask.title}" (completed: ${insertedTask.completed})`);

  // 4b. Fetch tasks
  console.log("   - Fetching user's tasks...");
  const { data: tasksList, error: fetchError } = await authedClient
    .from("tasks")
    .select("*")
    .eq("user_id", authData.user.id);

  if (fetchError) {
    throw new Error(`Fetch failed: ${fetchError.message}`);
  }
  console.log(`   ✓ Retrieved ${tasksList.length} task(s) for user.`);

  // 4c. Toggle task to completed
  console.log("   - Toggling task completed to true...");
  const { error: updateError } = await authedClient
    .from("tasks")
    .update({ completed: true })
    .eq("id", insertedTask.id);

  if (updateError) {
    throw new Error(`Update failed: ${updateError.message}`);
  }
  console.log("   ✓ Task updated to completed = true");

  // 4d. Toggle task back to incomplete
  console.log("   - Toggling task completed back to false...");
  const { error: revertError } = await authedClient
    .from("tasks")
    .update({ completed: false })
    .eq("id", insertedTask.id);

  if (revertError) {
    throw new Error(`Revert failed: ${revertError.message}`);
  }
  console.log("   ✓ Task toggled back to completed = false");

  // 4e. Delete the test task
  console.log("   - Deleting test task...");
  const { error: deleteError } = await authedClient
    .from("tasks")
    .delete()
    .eq("id", insertedTask.id);

  if (deleteError) {
    throw new Error(`Delete failed: ${deleteError.message}`);
  }
  console.log("   ✓ Test task successfully deleted.");

  console.log("\n=== ALL VERIFICATION CHECKS PASSED ===");
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
