'use client';

import { useState } from 'react';
import { signIn, signInWithMagicLink } from '@/lib/actions/auth';
import Link from 'next/link';

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handlePasswordLogin(formData: FormData) {
    setError(null);
    setLoading(true);

    try {
      const result = await signIn(formData);
      // If we get a result back (no redirect), it means there was an error
      if (result?.error) {
        setError(result.error);
      }
    } catch {
      // redirect() throws a NEXT_REDIRECT error, which is expected
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink(formData: FormData) {
    setError(null);
    setMagicLinkSent(false);
    setLoading(true);

    try {
      const result = await signInWithMagicLink(formData);
      if (result?.error) {
        setError(result.error);
      } else if ('success' in result) {
        setMagicLinkSent(true);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-center text-2xl font-semibold text-gray-900">
        Welcome back
      </h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        Sign in to your account to continue
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {magicLinkSent && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600">
          Check your email for a magic link to sign in.
        </div>
      )}

      {!showMagicLink ? (
        <>
          <form action={handlePasswordLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowMagicLink(true)}
              className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700"
            >
              Sign in with magic link instead
            </button>
          </div>
        </>
      ) : (
        <>
          <form action={handleMagicLink} className="space-y-4">
            <div>
              <label
                htmlFor="magic-email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="magic-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send magic link'}
            </button>
          </form>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                setShowMagicLink(false);
                setMagicLinkSent(false);
              }}
              className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700"
            >
              Sign in with password instead
            </button>
          </div>
        </>
      )}

      <div className="mt-6 border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="font-medium text-indigo-600 hover:text-indigo-700"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
