"use client";

import * as React from "react";
import { updateProfileName, updatePassword, type ProfileData } from "@/actions/profile";
import { logoutAction } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import {
  LogOutIcon,
  Loading03Icon,
  CheckmarkCircle01Icon,
  Alert01Icon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";

interface ProfileContainerProps {
  initialData: ProfileData;
}

function StatusBanner({ success, message }: { success: boolean; message: string }) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-2.5 px-3.5 py-2.5 rounded-[var(--radius-md)] text-[13px]",
        success
          ? "bg-[var(--color-success-light)] text-[var(--color-success)] border border-[var(--color-success-border)]"
          : "bg-[var(--color-danger-light)] text-[var(--color-danger)] border border-[var(--color-danger-border)]"
      )}
    >
      <Icon icon={success ? CheckmarkCircle01Icon : Alert01Icon} size="sm" className="shrink-0" />
      <span className="font-medium">{message}</span>
    </div>
  );
}

export function ProfileContainer({ initialData }: ProfileContainerProps) {
  const [name, setName] = React.useState(initialData.name);
  const [isUpdatingName, setIsUpdatingName] = React.useState(false);
  const [nameStatus, setNameStatus] = React.useState<{ success?: boolean; message?: string } | null>(null);

  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);
  const [passwordStatus, setPasswordStatus] = React.useState<{ success?: boolean; message?: string } | null>(null);

  const [isLoggingOut, startLogoutTransition] = React.useTransition();

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isUpdatingName) return;
    setIsUpdatingName(true);
    setNameStatus(null);
    const res = await updateProfileName(name.trim());
    setIsUpdatingName(false);
    if (res.success) {
      setNameStatus({ success: true, message: "Name updated successfully." });
      setTimeout(() => setNameStatus(null), 4000);
    } else {
      setNameStatus({ success: false, message: res.error || "Failed to update name." });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || isUpdatingPassword) return;
    if (newPassword.length < 6) {
      setPasswordStatus({ success: false, message: "Password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ success: false, message: "Passwords do not match." });
      return;
    }
    setIsUpdatingPassword(true);
    setPasswordStatus(null);
    const res = await updatePassword(newPassword);
    setIsUpdatingPassword(false);
    if (res.success) {
      setPasswordStatus({ success: true, message: "Password updated successfully." });
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordStatus(null), 4000);
    } else {
      setPasswordStatus({ success: false, message: res.error || "Failed to update password." });
    }
  };

  const handleLogout = () => {
    startLogoutTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <div className="w-full max-w-5xl space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-heading-xl">Profile</h1>
      </div>

      {/* ── Profile & Password Cards (Side-by-side on large devices) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* ── Account Details Card ── */}
        <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-xs)] overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[var(--color-border)]">
            <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">
              Account Details
            </h2>
          </div>

          <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
            {nameStatus && (
              <StatusBanner success={nameStatus.success!} message={nameStatus.message!} />
            )}

            <form onSubmit={handleUpdateName} className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="profile-email" className="block text-[12px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                    Email
                  </label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={initialData.email}
                    disabled
                    className="text-[var(--color-text-muted)] bg-[var(--color-surface-muted)] cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="profile-name" className="block text-[12px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                    Display Name
                  </label>
                  <Input
                    id="profile-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isUpdatingName}
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" size="sm" disabled={isUpdatingName || name.trim() === initialData.name}>
                  {isUpdatingName ? (
                    <><Icon icon={Loading03Icon} size="xs" className="animate-spin" />Saving…</>
                  ) : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Change Password Card ── */}
        <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-xs)] overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[var(--color-border)]">
            <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">
              Password
            </h2>
          </div>

          <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
            {passwordStatus && (
              <StatusBanner success={passwordStatus.success!} message={passwordStatus.message!} />
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="profile-new-password" className="block text-[12px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      id="profile-new-password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isUpdatingPassword}
                      placeholder="At least 6 characters"
                      className="pr-11"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <IconButton
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword(!showPassword)}
                        variant="ghost"
                        size="sm"
                        rounded="md"
                        className="w-7 h-7"
                      >
                        <Icon icon={showPassword ? ViewOffIcon : ViewIcon} size="xs" />
                      </IconButton>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="profile-confirm-password" className="block text-[12px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                    Confirm Password
                  </label>
                  <Input
                    id="profile-confirm-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isUpdatingPassword}
                    placeholder="Re-enter password"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isUpdatingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                >
                  {isUpdatingPassword ? (
                    <><Icon icon={Loading03Icon} size="xs" className="animate-spin" />Updating…</>
                  ) : "Update Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ── Sign Out ── */}
      <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-[var(--shadow-xs)] px-5 py-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[14.5px] font-semibold text-[var(--color-text-primary)]">Session</h2>
          <p className="text-[12.5px] text-[var(--color-text-muted)] mt-0.5">Signed in as {initialData.email}</p>
        </div>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <><Icon icon={Loading03Icon} size="xs" className="animate-spin" />Signing out…</>
          ) : (
            <><Icon icon={LogOutIcon} size="xs" />Sign Out</>
          )}
        </Button>
      </div>
    </div>
  );
}
