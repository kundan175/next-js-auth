"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Loading from "./components/Loading";

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Next.js Auth Demo
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            A demonstration of authentication with Next.js, NextAuth.js, and
            MongoDB
          </p>
        </div>

        <div className="mt-8">
          {status === "authenticated" ? (
            <div className="space-y-6">
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-green-800">
                  Signed in as {session.user?.email}
                </p>
              </div>
              <div className="space-y-3">
                <Link
                  href="/protected"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go to Protected Page
                </Link>
                <Link
                  href="/test"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 border-indigo-600"
                >
                  View System Status
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-yellow-50 p-4 rounded-md">
                <p className="text-yellow-800">Not signed in</p>
              </div>
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 border-indigo-600"
                >
                  Sign Up
                </Link>
                <Link
                  href="/test"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View System Status
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Available Pages
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <Link
              href="/protected"
              className="text-center px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Protected Page (requires auth)
            </Link>
            <Link
              href="/test"
              className="text-center px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              System Status
            </Link>
            <Link
              href="/login"
              className="text-center px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Login Page
            </Link>
            <Link
              href="/signup"
              className="text-center px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Signup Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
