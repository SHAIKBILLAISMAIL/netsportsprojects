"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Shield, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/admin",
      });

      if (error?.code) {
        toast.error("Invalid admin credentials. Please check your email and password.");
        return;
      }

      // Verify admin role by fetching user balance
      const token = localStorage.getItem("bearer_token");
      const balanceRes = await fetch("/api/user/balance", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        
        if (balanceData.role !== "admin") {
          // Not an admin, sign out
          await authClient.signOut();
          toast.error("Access denied. Admin privileges required.");
          return;
        }

        toast.success("Admin login successful!");
        router.push("/admin");
      } else {
        await authClient.signOut();
        toast.error("Failed to verify admin access");
      }
    } catch (error: any) {
      toast.error(error?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Admin Portal</h1>
          <p className="text-muted-foreground">
            Secure access for administrators only
          </p>
        </div>

        {/* Login Form */}
        <div className="rounded-lg border border-border bg-card p-8 shadow-lg">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail size={16} />
                Admin Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nicebet.com"
                disabled={loading}
                className="h-11"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock size={16} />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your admin password"
                  disabled={loading}
                  className="h-11 pr-10"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-base font-semibold"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Shield size={18} />
                  Sign In as Admin
                </span>
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="rounded-md bg-muted/30 p-4 text-sm">
              <p className="font-semibold mb-2 flex items-center gap-2 text-primary">
                <Shield size={14} />
                Demo Admin Credentials:
              </p>
              <div className="space-y-1 text-muted-foreground">
                <p>Email: <span className="font-mono text-foreground">admin@nicebet.com</span></p>
                <p>Password: <span className="font-mono text-foreground">admin123</span></p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              🔒 This is a secure admin area. All activities are logged.
            </p>
          </div>
        </div>

        {/* Back to Main Site */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            ← Back to Main Site
          </button>
        </div>
      </div>
    </div>
  );
}