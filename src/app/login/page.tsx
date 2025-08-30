"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import AuthLayout from "@/components/Shared/AuthLayout";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      setMessage(message);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      variant="login"
      title="Welcome Back"
      subtitle="Continue your learning journey with Old Medu. Access your personalized educational experience."
    >
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-sm animate-scale-in">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            Sign In
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center space-x-2 animate-fade-in">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center space-x-2 animate-fade-in">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">{message}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2 animate-fade-in delay-300">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-[#11434E]" />
                  <span>Email Address</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="h-12 px-4 border-2 border-gray-200 focus:border-[#11434E] focus:ring-[#11434E]/20 transition-all duration-200 rounded-lg auth-form-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2 animate-fade-in delay-400">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-[#11434E]" />
                  <span>Password</span>
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="h-12 px-4 pr-12 border-2 border-gray-200 focus:border-[#11434E] focus:ring-[#11434E]/20 transition-all duration-200 rounded-lg auth-form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-[#11434E] to-[#082408] hover:from-[#082408] hover:to-[#11434E] text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none group auth-button animate-fade-in delay-500"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>

            <div className="text-center pt-4 animate-fade-in delay-600">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-[#11434E] hover:text-[#082408] transition-colors duration-200 underline decoration-2 underline-offset-2"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
