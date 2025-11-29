"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const { error } = await authClient.signUp.email({
      email,
      name,
      password,
    });
    setLoading(false);

    if (error) {
      if (error.code === "USER_ALREADY_EXISTS") {
        setError("Email already registered. Please login instead.");
      } else if (error.message?.includes("Password")) {
        setError(error.message);
      } else {
        setError("Registration failed. Please try again.");
      }
      return;
    }

    // Clear announcement flag so popup shows after registration
    localStorage.removeItem("announcement_last_seen");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-12">
        <div className="mx-auto w-full max-w-md rounded-lg border border-border bg-card p-6 shadow">
          <h1 className="mb-6 text-center text-2xl font-bold">Create account</h1>
          {error && (
            <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm">Name</label>
              <input
                type="text"
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm">Email</label>
              <input
                type="email"
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm">Password</label>
              <input
                type="password"
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="off"
              />
              <p className="mt-1 text-xs text-muted-foreground">Minimum 6 characters</p>
            </div>
            <div>
              <label className="mb-1 block text-sm">Confirm Password</label>
              <input
                type="password"
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Register"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}