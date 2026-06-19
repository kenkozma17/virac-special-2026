"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError("Unable to sign in. Check your email and password.");
      setIsSubmitting(false);
      return;
    }

    router.push("/admin");
  }

  return (
    <main className="min-h-screen bg-white py-24">
      <div className="mx-auto max-w-3xl px-6 pt-[120px]">
        <div className="flex justify-center">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
            <p className="mt-2 text-sm text-slate-600">
              Enter your email and password to access the admin dashboard.
            </p>

            <form onSubmit={handleSignIn} className="mt-6 space-y-4">
              <div>
                <label htmlFor="signin-email" className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  required
                />
              </div>

              <div>
                <label htmlFor="signin-password" className="block text-sm font-medium text-slate-700">Password</label>
                <input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
              </button>
            </form>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
