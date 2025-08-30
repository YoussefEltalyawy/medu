"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import AuthLayout from "@/components/Shared/AuthLayout";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // Redirect to onboarding after successful signup
      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      variant="signup"
      title="Join the Journey"
      subtitle="Start your educational adventure with Old Medu. Discover, learn, and grow with our personalized learning platform."
    >
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-sm animate-scale-in">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            Create Account
          </CardTitle>
          <CardDescription className="text-gray-600">
            Join thousands of learners and start your educational journey
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
                  placeholder="Enter your email address"
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
                    placeholder="Create a strong password"
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
                <p className="text-xs text-gray-500">
                  Password must be at least 6 characters long
                </p>
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
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>

            <div className="text-center pt-4 animate-fade-in delay-600">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#11434E] hover:text-[#082408] transition-colors duration-200 underline decoration-2 underline-offset-2"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            <div className="text-center pt-2 animate-fade-in delay-700">
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-[#11434E] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#11434E] hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
