"use client";

import * as React from "react";
import { useActionState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { loginAction, type AuthFormState } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import Image from "next/image";
import {
  ViewIcon,
  ViewOffIcon,
  Alert01Icon,
  ArrowRight01Icon,
  Loading03Icon,
  CheckmarkCircle01Icon,
  ListViewIcon,
  StickyNote01Icon,
  Notification03Icon,
} from "@hugeicons/core-free-icons";

/* ── Feature item for the left panel ── */
function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-white">
        {icon}
      </div>
      <span className="text-[13.5px] text-white/80 font-medium">{text}</span>
    </div>
  );
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<AuthFormState, FormData>(
    loginAction,
    {}
  );

  const [showPassword, setShowPassword] = React.useState(false);
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const shouldReduceMotion = useReducedMotion();

  const formVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.07,
        delayChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <div className="min-h-dvh flex">
      {/* ── Left Brand Panel (desktop only) ── */}
      <div
        className="hidden lg:flex lg:w-[420px] xl:w-[480px] shrink-0 flex-col justify-between p-10 relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #4338CA 0%, #4F46E5 50%, #6366F1 100%)",
        }}
      >
        {/* Background geometric decoration */}
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)", transform: "translate(30%, -30%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)", transform: "translate(-30%, 30%)" }}
        />

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-[12px] overflow-hidden shadow-lg">
              <Image
                src="/logo-sm.webp"
                alt="YERO"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span
              className="text-white font-bold text-[22px] tracking-tight"
              style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
            >
              YERO
            </span>
          </div>

          <h1
            className="text-white font-bold text-[28px] leading-tight tracking-tight mb-3"
            style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
          >
            Your personal<br />productivity space
          </h1>
          <p className="text-white/70 text-[14.5px] leading-relaxed mb-10">
            A calm, focused workspace to manage your daily tasks, capture notes, and track your goals.
          </p>

          <div className="space-y-3">
            <FeatureItem
              icon={<Icon icon={ListViewIcon} size="sm" />}
              text="Daily task lists with progress tracking"
            />
            <FeatureItem
              icon={<Icon icon={StickyNote01Icon} size="sm" />}
              text="Notes with search and pinning"
            />
            <FeatureItem
              icon={<Icon icon={Notification03Icon} size="sm" />}
              text="Smart notifications and reminders"
            />
            <FeatureItem
              icon={<Icon icon={CheckmarkCircle01Icon} size="sm" />}
              text="Competitive programming stats"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-white/40 text-[11.5px]">
          © {new Date().getFullYear()} YERO. All rights reserved.
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[var(--color-bg)]">
        <motion.div
          variants={formVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-[400px]"
        >
          {/* Mobile brand */}
          <motion.div variants={itemVariants} className="lg:hidden mb-8 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-[14px] overflow-hidden shadow-[var(--shadow-md)] mb-3">
              <Image
                src="/logo-sm.webp"
                alt="YERO"
                width={48}
                height={48}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span
              className="font-bold text-[20px] text-[var(--color-text-primary)] tracking-tight"
              style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
            >
              YERO
            </span>
          </motion.div>

          {/* Heading */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2
              className="text-[26px] font-bold text-[var(--color-text-primary)] tracking-tight"
              style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
            >
              Welcome back
            </h2>
            <p className="mt-1.5 text-[14px] text-[var(--color-text-muted)]">
              Sign in to your YERO account
            </p>
          </motion.div>

          {/* Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-md)] p-6 sm:p-7"
          >
            {/* Error Banner */}
            <AnimatePresence mode="wait">
              {state?.error && (
                <motion.div
                  key="error-banner"
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden mb-5"
                >
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 p-3.5 rounded-[var(--radius-md)] bg-[var(--color-danger-light)] border border-[var(--color-danger-border)] text-[13px] text-[var(--color-danger)] font-medium"
                  >
                    <Icon icon={Alert01Icon} size="sm" className="shrink-0 mt-px" />
                    <span>{state.error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form action={formAction} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="identifier"
                  className="block text-[12px] font-semibold text-[var(--color-text-muted)]"
                >
                  Email
                </label>
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isPending}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-[12px] font-semibold text-[var(--color-text-muted)]"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isPending}
                    className="pr-12 tracking-[0.06em]"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <IconButton
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      size="sm"
                      rounded="md"
                      className="w-8 h-8"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {showPassword ? (
                          <motion.span
                            key="eye-off"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.12 }}
                            className="flex items-center"
                          >
                            <Icon icon={ViewOffIcon} size="sm" />
                          </motion.span>
                        ) : (
                          <motion.span
                            key="eye"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.12 }}
                            className="flex items-center"
                          >
                            <Icon icon={ViewIcon} size="sm" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </IconButton>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-[42px] text-[14.5px] font-semibold group mt-1"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isPending ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="flex items-center gap-2"
                    >
                      <Icon icon={Loading03Icon} size="sm" className="animate-spin" />
                      <span>Signing in…</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="ready"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="flex items-center gap-2"
                    >
                      <span>Sign In</span>
                      <Icon
                        icon={ArrowRight01Icon}
                        size="sm"
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
