"use client";

import * as React from "react";
import { usePwa } from "@/components/pwa/PwaProvider";
import { Download, Check } from "lucide-react";

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
    <button
      type="button"
      onClick={handleInstall}
      aria-label="Install YERO App"
      title="Install YERO App on your device"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-card border border-white/90 shadow-2xs text-xs font-medium text-slate-700 hover:text-slate-950 hover:bg-white/95 active:scale-95 transition-all cursor-pointer"
    >
      {justInstalled ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-emerald-700 font-semibold">Installed</span>
        </>
      ) : (
        <>
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span>Install App</span>
        </>
      )}
    </button>
  );
}
