"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  Mail,
  Lock,
  X,
  UserPlus,
  LogIn,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

// Password requirements for industry-standard security
const passwordRequirements = [
  { id: "length", label: "At least 8 characters", regex: /.{8,}/ },
  { id: "uppercase", label: "At least one uppercase letter", regex: /[A-Z]/ },
  { id: "lowercase", label: "At least one lowercase letter", regex: /[a-z]/ },
  { id: "number", label: "At least one number", regex: /[0-9]/ },
  {
    id: "special",
    label: "At least one special character (!@#$%^&*)",
    regex: /[!@#$%^&*(),.?":{}|<>]/,
  },
];

// Login Schema (simpler validation)
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Registration Schema (strict validation)
const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLogin,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    reset: resetSignup,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Watch password for strength indicator
  const watchedPassword = watch("password", "");

  // Calculate password strength
  const passwordStrength = useMemo(() => {
    if (!passwordValue && !watchedPassword) return { score: 0, checks: [] };
    const pwd = passwordValue || watchedPassword;
    const checks = passwordRequirements.map((req) => ({
      ...req,
      passed: req.regex.test(pwd),
    }));
    const score = checks.filter((c) => c.passed).length;
    return { score, checks };
  }, [passwordValue, watchedPassword]);

  const strengthLabel = useMemo(() => {
    const { score } = passwordStrength;
    if (score === 0) return { text: "", color: "" };
    if (score <= 2) return { text: "Weak", color: "text-red-500" };
    if (score <= 3) return { text: "Fair", color: "text-orange-500" };
    if (score <= 4) return { text: "Good", color: "text-yellow-500" };
    return { text: "Strong", color: "text-green-500" };
  }, [passwordStrength]);

  const onLoginSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      onClose();
      window.location.reload();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.email.split("@")[0] },
        },
      });
      if (error) throw error;
      setSuccess("Registration successful! Please check your email to verify.");
      resetSignup();
      setPasswordValue("");
      setIsLogin(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetLogin();
    resetSignup();
    setPasswordValue("");
    setError(null);
    setSuccess(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            {isLogin ? (
              <LogIn className="w-6 h-6 text-blue-600" />
            ) : (
              <UserPlus className="w-6 h-6 text-emerald-600" />
            )}
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {isLogin ? (
            /* LOGIN FORM */
            <form
              onSubmit={handleLoginSubmit(onLoginSubmit)}
              className="space-y-4"
            >
              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    {...registerLogin("email")}
                    type="email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-50 dark:bg-slate-800"
                    placeholder="name@example.com"
                    disabled={loading}
                  />
                </div>
                {loginErrors.email && (
                  <p className="text-xs text-red-500">
                    {loginErrors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    {...registerLogin("password")}
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-50 dark:bg-slate-800"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="text-xs text-red-500">
                    {loginErrors.password.message}
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800 flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm border border-green-200 dark:border-green-800 flex items-center gap-2">
                  <Check size={16} />
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full font-semibold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="animate-spin" size={18} />}
                Sign In
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form
              onSubmit={handleSignupSubmit(onRegisterSubmit)}
              className="space-y-4"
            >
              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    {...registerSignup("email")}
                    type="email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-slate-50 dark:bg-slate-800"
                    placeholder="name@example.com"
                    disabled={loading}
                  />
                </div>
                {signupErrors.email && (
                  <p className="text-xs text-red-500">
                    {signupErrors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field with Strength Indicator */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <ShieldCheck size={14} />
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    {...registerSignup("password", {
                      onChange: (e) => setPasswordValue(e.target.value),
                    })}
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-slate-50 dark:bg-slate-800"
                    placeholder="Create a strong password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {(passwordValue || watchedPassword) && (
                  <div className="mt-2 space-y-2">
                    {/* Strength Bar */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            level <= passwordStrength.score
                              ? level <= 2
                                ? "bg-red-500"
                                : level <= 3
                                  ? "bg-orange-500"
                                  : level <= 4
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              : "bg-slate-200 dark:bg-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                    <div
                      className={`text-xs font-medium ${strengthLabel.color}`}
                    >
                      {strengthLabel.text &&
                        `Password Strength: ${strengthLabel.text}`}
                    </div>

                    {/* Requirements Checklist */}
                    <div className="grid grid-cols-1 gap-1 mt-2">
                      {passwordStrength.checks.map((req) => (
                        <div
                          key={req.id}
                          className={`flex items-center gap-2 text-xs ${
                            req.passed
                              ? "text-green-600 dark:text-green-400"
                              : "text-slate-400"
                          }`}
                        >
                          {req.passed ? (
                            <Check size={12} className="shrink-0" />
                          ) : (
                            <div className="w-3 h-3 border rounded-full border-slate-300 shrink-0" />
                          )}
                          <span>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {signupErrors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {signupErrors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    {...registerSignup("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-slate-50 dark:bg-slate-800"
                    placeholder="Confirm your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {signupErrors.confirmPassword && (
                  <p className="text-xs text-red-500">
                    {signupErrors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800 flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm border border-green-200 dark:border-green-800 flex items-center gap-2">
                  <Check size={16} />
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || passwordStrength.score < 5}
                className="w-full font-semibold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="animate-spin" size={18} />}
                {passwordStrength.score < 5
                  ? "Complete Password Requirements"
                  : "Create Account"}
              </button>
            </form>
          )}

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccess(null);
                setPasswordValue("");
              }}
              className="text-blue-600 font-semibold hover:underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">
                or
              </span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <button
            onClick={async () => {
              await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                },
              });
            }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
