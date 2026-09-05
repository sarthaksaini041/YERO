import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Allowed domains for avatar proxying to prevent open relay
const ALLOWED_DOMAINS = [
  "assets.leetcode.com",
  "cdn.codechef.com",
  "codechef.com",
  "codeforces.com",
  "userpic.codeforces.org",
  "avatars.githubusercontent.com",
  "github.com",
];

export async function GET(request: NextRequest) {
  const targetUrl = request.nextUrl.searchParams.get("url");

  if (!targetUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const parsed = new URL(targetUrl);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return new NextResponse("Invalid protocol", { status: 400 });
    }

    const hostname = parsed.hostname.toLowerCase();
    const isAllowed = ALLOWED_DOMAINS.some(
      (d) => hostname === d || hostname.endsWith(`.${d}`)
    );

    if (!isAllowed) {
      return new NextResponse("Domain not allowed", { status: 403 });
    }

    // Codeforces userpic.codeforces.org is blocked by Cloudflare (503),
    // but codeforces.com/userpic/... serves the exact same image with HTTP 200.
    let fetchUrl = targetUrl;
    if (fetchUrl.includes("userpic.codeforces.org/")) {
      fetchUrl = fetchUrl.replace("userpic.codeforces.org/", "codeforces.com/userpic/");
    }

    const upstreamRes = await fetch(fetchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
      next: { revalidate: 86400 },
    });

    if (!upstreamRes.ok) {
      return new NextResponse("Failed to fetch upstream avatar", {
        status: upstreamRes.status,
      });
    }

    const contentType = upstreamRes.headers.get("content-type") || "image/jpeg";
    const imageBuffer = await upstreamRes.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new NextResponse("Error fetching avatar", { status: 500 });
  }
}
