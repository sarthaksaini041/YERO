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
} from "@hugeicons/core-free-icons";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<AuthFormState, FormData>(
    loginAction,
    {}
  );

  const [showPassword, setShowPassword] = React.useState(false);
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.06,
        delayChildren: shouldReduceMotion ? 0 : 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.3,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 py-6 select-none"
      style={{ background: "var(--color-bg)" }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-[380px] mx-auto"
      >
        {/* Brand & Headline */}
        <motion.div variants={itemVariants} className="mb-4 text-center flex flex-col items-center">
          <Image
            src="/logo-sm.webp"
            alt="YERO"
            width={36}
            height={36}
            className="w-9 h-9 rounded-xl object-cover shadow-[var(--shadow-xs)] mb-2"
            priority
          />
          <h1 className="text-heading-lg">Welcome back</h1>
        </motion.div>

          {/* Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-md)] p-5 sm:p-6"
          >
            {/* Error Banner */}
            <AnimatePresence mode="wait">
              {state?.error && (
                <motion.div
                  key="error-banner"
                  initial={{ opacity: 0, height: 0, y: -6 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden mb-4"
                >
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--color-danger-light)] border border-red-200 text-[12.5px] text-[var(--color-danger)] leading-relaxed"
                  >
                    <Icon icon={Alert01Icon} size="sm" className="shrink-0 mt-0.5" />
                    <span>{state.error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form action={formAction} className="space-y-3.5">
              {/* Email */}
              <div className="space-y-1">
                <label
                  htmlFor="identifier"
                  className="block text-[12.5px] font-medium text-[var(--color-text-secondary)]"
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
              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="block text-[12.5px] font-medium text-[var(--color-text-secondary)]"
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
              <div className="pt-1">
                <Button
                  type="submit"
                  disabled={isPending}
                  loading={isPending}
                  className="group w-full h-10 text-[14px] rounded-xl"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isPending ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
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
                        transition={{ duration: 0.15 }}
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
              </div>
            </form>
          </motion.div>
        </motion.div>
    </div>
  );
}
