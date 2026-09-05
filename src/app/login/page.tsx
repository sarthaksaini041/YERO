"use client";

import * as React from "react";
import { useActionState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { loginAction, type AuthFormState } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";

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
        staggerChildren: shouldReduceMotion ? 0 : 0.07,
        delayChildren: shouldReduceMotion ? 0 : 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.32,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col select-none">
      {/* Transparent Header with YERO Capsule */}
      <header className="w-full bg-transparent sticky top-0 z-30 pt-3 pb-1">
        <div className="max-w-xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full liquid-glass-card border border-white/90 shadow-2xs">
            <Image
              src="/logo-sm.webp"
              alt="YERO Logo"
              width={20}
              height={20}
              className="w-5 h-5 rounded-md object-cover"
              priority
            />
            <span className="font-semibold text-slate-900 tracking-tight text-xs">
              YERO
            </span>
          </div>
        </div>
      </header>

      {/* Centered Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 -mt-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-[380px] mx-auto"
        >
          {/* Floating Liquid Glass Login Card */}
          <motion.div
            variants={itemVariants}
            className="liquid-glass-card rounded-[26px] p-6 sm:p-7 border border-white/90 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.05),0_2px_8px_-2px_rgba(15,23,42,0.02)] backdrop-blur-2xl"
          >
            {/* Animated Error Banner (Zero Layout Jitter) */}
            <AnimatePresence mode="wait">
              {state?.error && (
                <motion.div
                  key="error-banner"
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden mb-4"
                >
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50/90 border border-rose-200/80 text-xs text-rose-700 leading-relaxed shadow-2xs"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
                    <span>{state.error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form action={formAction} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="identifier"
                  className="block text-xs font-medium text-slate-600"
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
                  className="h-11 rounded-xl text-sm"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-slate-600"
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
                    className="h-11 rounded-xl pr-10 text-sm tracking-[0.08em]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100/60 active:scale-95 flex items-center justify-center transition-all cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {showPassword ? (
                        <motion.span
                          key="eye-off"
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          transition={{ duration: 0.12 }}
                          className="flex items-center justify-center"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="eye"
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          transition={{ duration: 0.12 }}
                          className="flex items-center justify-center"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-1.5">
                <button
                  type="submit"
                  disabled={isPending}
                  className="group relative w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs tracking-wide shadow-sm hover:shadow-md active:scale-[0.985] disabled:opacity-60 disabled:pointer-events-none transition-all duration-200 cursor-pointer flex items-center justify-center overflow-hidden"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isPending ? (
                      <motion.div
                        key="submitting"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-2"
                      >
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white/90" />
                        <span>Signing in...</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="ready"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center justify-center gap-1.5"
                      >
                        <span>Sign In</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 text-slate-300" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
