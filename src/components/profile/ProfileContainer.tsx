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
  UserAccountIcon,
  SquareLockPasswordIcon,
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

export function ProfileContainer({ initialData }: ProfileContainerProps) {
  // Name state
  const [name, setName] = React.useState(initialData.name);
  const [isUpdatingName, setIsUpdatingName] = React.useState(false);
  const [nameStatus, setNameStatus] = React.useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  // Password state
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);
  const [passwordStatus, setPasswordStatus] = React.useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  // Logout state
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
    <div className="space-y-4">
      {/* ── Section Title ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-heading-lg">Profile</h1>
      </div>

      {/* ── Account Details Card ── */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-[var(--color-border)] shadow-[var(--shadow-xs)] space-y-3.5">
        <div className="flex items-center gap-2.5 pb-1 border-b border-[var(--color-border)]/60">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-light)] text-[var(--color-accent)] flex items-center justify-center shrink-0">
            <Icon icon={UserAccountIcon} size="sm" />
          </div>
          <h2 className="text-[14.5px] font-semibold text-[var(--color-text-primary)]">
            Account Details
          </h2>
        </div>

        {nameStatus && (
          <div
            role="status"
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-[12.5px]",
              nameStatus.success
                ? "bg-[var(--color-success-light)] text-[var(--color-success)] border border-emerald-200"
                : "bg-[var(--color-danger-light)] text-[var(--color-danger)] border border-red-200"
            )}
          >
            <Icon
              icon={nameStatus.success ? CheckmarkCircle01Icon : Alert01Icon}
              size="xs"
              className="shrink-0"
            />
            <span>{nameStatus.message}</span>
          </div>
        )}

        <form onSubmit={handleUpdateName} className="space-y-3">
          {/* Email (Read only) */}
          <div className="space-y-1">
            <label
              htmlFor="profile-email"
              className="block text-[12.5px] font-medium text-[var(--color-text-secondary)]"
            >
              Email Address
            </label>
            <Input
              id="profile-email"
              type="email"
              value={initialData.email}
              disabled
              className="bg-gray-50 text-[var(--color-text-muted)] cursor-not-allowed text-[13.5px]"
            />
          </div>

          {/* Name / Username */}
          <div className="space-y-1">
            <label
              htmlFor="profile-name"
              className="block text-[12.5px] font-medium text-[var(--color-text-secondary)]"
            >
              Name / Username
            </label>
            <Input
              id="profile-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isUpdatingName}
              placeholder="Your name"
              className="text-[13.5px]"
            />
          </div>

          <div className="flex justify-end pt-0.5">
            <Button
              type="submit"
              size="sm"
              disabled={isUpdatingName || name.trim() === initialData.name}
              loading={isUpdatingName}
            >
              {isUpdatingName ? (
                <>
                  <Icon icon={Loading03Icon} size="xs" className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Name"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* ── Change Password Card ── */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-[var(--color-border)] shadow-[var(--shadow-xs)] space-y-3.5">
        <div className="flex items-center gap-2.5 pb-1 border-b border-[var(--color-border)]/60">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Icon icon={SquareLockPasswordIcon} size="sm" />
          </div>
          <h2 className="text-[14.5px] font-semibold text-[var(--color-text-primary)]">
            Security & Password
          </h2>
        </div>

        {passwordStatus && (
          <div
            role="status"
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-[12.5px]",
              passwordStatus.success
                ? "bg-[var(--color-success-light)] text-[var(--color-success)] border border-emerald-200"
                : "bg-[var(--color-danger-light)] text-[var(--color-danger)] border border-red-200"
            )}
          >
            <Icon
              icon={passwordStatus.success ? CheckmarkCircle01Icon : Alert01Icon}
              size="xs"
              className="shrink-0"
            />
            <span>{passwordStatus.message}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-3">
          {/* New Password */}
          <div className="space-y-1">
            <label
              htmlFor="profile-new-password"
              className="block text-[12.5px] font-medium text-[var(--color-text-secondary)]"
            >
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
                className="pr-10 text-[13.5px]"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
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

          {/* Confirm Password */}
          <div className="space-y-1">
            <label
              htmlFor="profile-confirm-password"
              className="block text-[12.5px] font-medium text-[var(--color-text-secondary)]"
            >
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
              className="text-[13.5px]"
            />
          </div>

          <div className="flex justify-end pt-0.5">
            <Button
              type="submit"
              size="sm"
              disabled={
                isUpdatingPassword ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword
              }
              loading={isUpdatingPassword}
            >
              {isUpdatingPassword ? (
                <>
                  <Icon icon={Loading03Icon} size="xs" className="animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* ── Sign Out Section ── */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-[var(--color-border)] shadow-[var(--shadow-xs)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
            Account Session
          </h2>
          <p className="text-[12.5px] text-[var(--color-text-muted)] mt-0.5">
            Sign out of your account on this device.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-[var(--color-danger)] bg-[var(--color-danger-light)] border border-red-200 hover:bg-red-100 hover:text-red-700 transition-colors cursor-pointer disabled:opacity-50 shrink-0 select-none"
        >
          {isLoggingOut ? (
            <Icon icon={Loading03Icon} size="sm" className="animate-spin text-[var(--color-danger)]" />
          ) : (
            <Icon icon={LogOutIcon} size="sm" />
          )}
          <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
        </button>
      </div>
    </div>
  );
}
