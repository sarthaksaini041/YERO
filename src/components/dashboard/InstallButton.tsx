"use client";

import * as React from "react";
import { usePwa } from "@/components/pwa/PwaProvider";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Download02Icon, Tick02Icon } from "@hugeicons/core-free-icons";

export function InstallButton() {
  const { isInstallable, isInstalled, installApp } = usePwa();
  const [justInstalled, setJustInstalled] = React.useState(false);

  if (isInstalled || (!isInstallable && !justInstalled)) {
    return null;
  }

  const handleInstall = async () => {
    const accepted = await installApp();
    if (accepted) {
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 3000);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleInstall}
      aria-label="Install YERO app on your device"
      title="Install YERO App"
      className="rounded-xl gap-1.5 text-[12px] h-9"
    >
      {justInstalled ? (
        <>
          <Icon icon={Tick02Icon} size="xs" className="text-[var(--color-success)]" />
          <span className="text-[var(--color-success)] font-semibold">Installed</span>
        </>
      ) : (
        <>
          <Icon icon={Download02Icon} size="xs" />
          <span>Install</span>
        </>
      )}
    </Button>
  );
}
