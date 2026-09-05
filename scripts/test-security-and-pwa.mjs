import assert from "node:assert/strict";

const BASE_URL = "http://localhost:3000";
const CRON_SECRET = "8fa6575b7a5e82123d6d90bb60020396af0931b802a95044";

async function testSecurityAndPwa() {
  console.log("=== Testing Security Headers, Rate Limiting & PWA Assets ===");

  // 1. Test HTTP Security Headers on /login
  console.log("\n1. Testing Security Headers on GET /login...");
  const res = await fetch(`${BASE_URL}/login`);
  assert.equal(res.status, 200, "Should return 200");

  const csp = res.headers.get("content-security-policy");
  const xfo = res.headers.get("x-frame-options");
  const xcto = res.headers.get("x-content-type-options");
  const rp = res.headers.get("referrer-policy");
  const hsts = res.headers.get("strict-transport-security");

  console.log("   Content-Security-Policy:", csp ? "✓ Present" : "✗ Missing");
  console.log("   X-Frame-Options:        ", xfo);
  console.log("   X-Content-Type-Options: ", xcto);
  console.log("   Referrer-Policy:        ", rp);
  console.log("   Strict-Transport-Sec:   ", hsts ? "✓ Present" : "✗ Missing");

  assert.ok(csp && csp.includes("default-src"), "CSP must include default-src");
  assert.equal(xfo, "DENY", "X-Frame-Options must be DENY");
  assert.equal(xcto, "nosniff", "X-Content-Type-Options must be nosniff");
  assert.equal(rp, "strict-origin-when-cross-origin", "Referrer-Policy must match");
  console.log("   ✓ All HTTP security headers verified successfully!");

  // 2. Test PWA Web Manifest
  console.log("\n2. Testing Web App Manifest (/site.webmanifest)...");
  const manifestRes = await fetch(`${BASE_URL}/site.webmanifest`);
  assert.equal(manifestRes.status, 200, "Manifest should return 200");
  const manifest = await manifestRes.json();
  console.log("   Name:        ", manifest.name);
  console.log("   Short Name:  ", manifest.short_name);
  console.log("   Display:     ", manifest.display);
  assert.equal(manifest.name, "YERO");
  assert.equal(manifest.display, "standalone");
  assert.ok(manifest.icons.some((i) => i.purpose === "maskable"), "Must include maskable icon");
  console.log("   ✓ PWA Manifest is valid and meets installability standards!");


  // 3. Test Service Worker File
  console.log("\n3. Testing Service Worker (/sw.js)...");
  const swRes = await fetch(`${BASE_URL}/sw.js`);
  assert.equal(swRes.status, 200, "Service worker should return 200");
  const swText = await swRes.text();
  assert.ok(swText.includes("addEventListener(\"push\""), "SW must have push listener");
  assert.ok(swText.includes("addEventListener(\"notificationclick\""), "SW must have notificationclick listener");
  assert.ok(swText.includes("caches.open"), "SW must implement caching");
  console.log("   ✓ Service worker file verified with caching and push handlers!");

  // 4. Test Offline Fallback Page
  console.log("\n4. Testing Offline Page (/offline.html)...");
  const offlineRes = await fetch(`${BASE_URL}/offline.html`);
  assert.equal(offlineRes.status, 200, "Offline page should return 200");
  const offlineText = await offlineRes.text();
  assert.ok(offlineText.includes("offline"), "Must contain offline message");
  console.log("   ✓ Offline fallback page verified!");

  // 5. Test Cron Endpoint Authorization
  console.log("\n5. Testing /api/cron/reminders Security & Authorization...");
  // Unauthorized request (no secret)
  const unauthRes = await fetch(`${BASE_URL}/api/cron/reminders`);
  console.log("   Request without secret status:", unauthRes.status);
  assert.equal(unauthRes.status, 401, "Should reject unauthenticated request with 401");

  // Invalid secret
  const badSecretRes = await fetch(`${BASE_URL}/api/cron/reminders`, {
    headers: { Authorization: "Bearer bad-secret-token" },
  });
  console.log("   Request with bad secret status:", badSecretRes.status);
  assert.equal(badSecretRes.status, 401, "Should reject bad secret with 401");

  // Valid secret
  const validRes = await fetch(`${BASE_URL}/api/cron/reminders`, {
    headers: { Authorization: `Bearer ${CRON_SECRET}` },
  });
  console.log("   Request with valid secret status:", validRes.status);
  assert.equal(validRes.status, 200, "Should accept valid secret with 200");
  const cronData = await validRes.json();
  console.log("   Cron Execution Response:", cronData.success ? "Success" : "Failed", `(IST: ${cronData.result?.istTime})`);
  assert.equal(cronData.success, true);
  console.log("   ✓ Cron endpoint authorization verified!");

  console.log("\n=== ALL SECURITY & PWA TESTS PASSED ===");
}

testSecurityAndPwa().catch((err) => {
  console.error("Security / PWA test failed:", err);
  process.exit(1);
});
