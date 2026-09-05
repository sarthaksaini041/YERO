"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { ConnectorCard } from "./ConnectorCard";
import { ConnectModal } from "./ConnectModal";
import { PlatformLogo } from "./PlatformLogos";
import type { Platform } from "@/lib/connectors/types";
import type { ConnectorRecord } from "@/actions/connectors";

interface PlatformMeta {
  platform: Platform;
  label: string;
  description: string;
}

const PLATFORMS: PlatformMeta[] = [
  {
    platform: "leetcode",
    label: "LeetCode",
    description: "Track your problem-solving stats, contest ratings, and solved counts.",
  },
  {
    platform: "codechef",
    label: "CodeChef",
    description: "Sync your CodeChef rating, stars, global rank, and contest history.",
  },
  {
    platform: "codeforces",
    label: "Codeforces",
    description: "Connect Codeforces to track your rating, rank, and contest performance.",
  },
  {
    platform: "github",
    label: "GitHub",
    description: "Track your public repositories, stars, followers, and languages.",
  },
];

interface ConnectorsContainerProps {
  initialConnectors: ConnectorRecord[];
}

export function ConnectorsContainer({ initialConnectors }: ConnectorsContainerProps) {
  const [connectors, setConnectors] = React.useState<
    Record<Platform, ConnectorRecord | null>
  >(() => {
    const map: Record<Platform, ConnectorRecord | null> = {
      leetcode: null,
      codechef: null,
      codeforces: null,
      github: null,
    };
    for (const c of initialConnectors) {
      map[c.platform] = c;
    }
    return map;
  });

  const [activeModal, setActiveModal] = React.useState<Platform | null>(null);

  const handleConnectorUpdate = (platform: Platform, connector: ConnectorRecord | null) => {
    setConnectors((prev) => ({ ...prev, [platform]: connector }));
  };

  const handleSuccess = (platform: Platform, connector: ConnectorRecord) => {
    handleConnectorUpdate(platform, connector);
    setActiveModal(null);
  };

  return (
    <div className="space-y-5">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-heading-xl">Connectors</h1>
      </div>

      {/* ── Platform Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
        {PLATFORMS.map((meta) => (
          <ConnectorCard
            key={meta.platform}
            platform={meta.platform}
            label={meta.label}
            description={meta.description}
            connector={connectors[meta.platform]}
            onConnect={() => setActiveModal(meta.platform)}
            onConnectorUpdate={(c) => handleConnectorUpdate(meta.platform, c)}
          />
        ))}
      </div>

      {/* ── Connect Modal ── */}
      <AnimatePresence>
        {activeModal && (
          <ConnectModal
            key={activeModal}
            platform={activeModal}
            platformLabel={PLATFORMS.find((p) => p.platform === activeModal)!.label}
            platformIcon={<PlatformLogo platform={activeModal} size={28} />}
            onClose={() => setActiveModal(null)}
            onSuccess={(c) => handleSuccess(activeModal, c)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
