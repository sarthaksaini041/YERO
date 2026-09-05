/**
 * Platform logo SVG components for LeetCode, CodeChef, and Codeforces.
 * Self-contained, inline SVGs — no external image requests.
 */

export function LeetCodeLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 95 111"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="LeetCode"
    >
      <path
        d="M68.67 56.22L37.45 87.44a7.5 7.5 0 0 1-10.6 0 7.5 7.5 0 0 1 0-10.6l25.44-25.44-25.44-25.44a7.5 7.5 0 0 1 10.6-10.6l31.22 31.22a7.5 7.5 0 0 1 0 9.64Z"
        fill="#FFA116"
      />
      <path
        d="M28.34 93.5h38.32a7.5 7.5 0 0 1 0 15H28.34a7.5 7.5 0 0 1 0-15Z"
        fill="#B3B3B3"
      />
      <path
        d="M68.67 56.22L37.45 87.44a7.5 7.5 0 0 1-10.6-10.6l31.22-31.22 10.6 10.6Z"
        fill="#E38B00"
      />
    </svg>
  );
}

export function CodeChefLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CodeChef"
    >
      <rect width="512" height="512" rx="100" fill="#5B4638" />
      <path
        d="M256 72c-63.5 0-115 51.5-115 115v138c0 63.5 51.5 115 115 115s115-51.5 115-115V187c0-63.5-51.5-115-115-115Z"
        fill="#F5F0EB"
      />
      <circle cx="220" cy="210" r="22" fill="#5B4638" />
      <circle cx="292" cy="210" r="22" fill="#5B4638" />
      <path
        d="M215 280c11 20 55 20 82 0"
        stroke="#5B4638"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M141 225c-18 0-30 12-30 30s12 30 30 30"
        stroke="#5B4638"
        strokeWidth="16"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M371 225c18 0 30 12 30 30s-12 30-30 30"
        stroke="#5B4638"
        strokeWidth="16"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function CodeforcesLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Codeforces"
    >
      <rect width="512" height="512" rx="100" fill="#1B91F1" />
      {/* Three bars - the Codeforces logo style */}
      <rect x="96" y="224" width="80" height="192" rx="12" fill="white" />
      <rect x="216" y="128" width="80" height="288" rx="12" fill="#E34234" />
      <rect x="336" y="96" width="80" height="320" rx="12" fill="white" />
    </svg>
  );
}

/** Returns the logo component for a given platform */
export function PlatformLogo({
  platform,
  size = 32,
}: {
  platform: "leetcode" | "codechef" | "codeforces";
  size?: number;
}) {
  switch (platform) {
    case "leetcode":
      return <LeetCodeLogo size={size} />;
    case "codechef":
      return <CodeChefLogo size={size} />;
    case "codeforces":
      return <CodeforcesLogo size={size} />;
  }
}
