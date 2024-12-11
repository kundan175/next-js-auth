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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Next.js Auth Demo
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Experience secure authentication with Next.js, NextAuth.js, and
            MongoDB
          </p>
        </div>

        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            {status === "authenticated" ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                  <p className="text-green-800 font-medium text-center">
                    Welcome back, {session.user?.email}! 👋
                  </p>
                </div>
                <div className="space-y-4">
                  <Link
                    href="/protected"
                    className="block w-full px-6 py-3 text-center font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Access Protected Area
                  </Link>
                  <Link
                    href="/test"
                    className="block w-full px-6 py-3 text-center font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Check System Status
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-xl border border-amber-100">
                  <p className="text-amber-800 font-medium text-center">
                    Please sign in to continue
                  </p>
                </div>
                <div className="space-y-4">
                  <Link
                    href="/login"
                    className="block w-full px-6 py-3 text-center font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="block w-full px-6 py-3 text-center font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create Account
                  </Link>
                  <Link
                    href="/test"
                    className="block w-full px-6 py-3 text-center font-medium text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    View System Status
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="px-8 pb-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Quick Navigation
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                href="/protected"
                className="text-center px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-200"
              >
                Protected Page
              </Link>
              <Link
                href="/test"
                className="text-center px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-200"
              >
                System Status
              </Link>
              <Link
                href="/login"
                className="text-center px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-200"
              >
                Login Page
              </Link>
              <Link
                href="/signup"
                className="text-center px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-200"
              >
                Signup Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
