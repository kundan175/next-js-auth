"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { useEffect, useState } from "react";

export default function ProtectedPage() {
  const { data: session, status } = useSession();
  console.log(session, status);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <Loading />;
  }

  if (!session) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      setError("Failed to sign out. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Protected Area
          </h2>
          <p className="mt-3 text-gray-600">Welcome to your secure dashboard</p>
        </div>

        {error && (
          <div className="mb-8">
            <ErrorMessage message={error} />
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="px-6 py-8 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt="User avatar"
                  className="h-16 w-16 rounded-full ring-2 ring-indigo-100"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center text-white text-2xl font-bold">
                  {session.user?.name?.[0] || session.user?.email?.[0] || "?"}
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {session.user?.name || "Welcome"}
                </h3>
                <p className="text-gray-500">{session.user?.email}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Session Details
            </h4>
            <div className="space-y-4">
              <div className="flex items-center py-3 px-4 rounded-xl bg-gray-50">
                <span className="text-sm font-medium text-gray-500 w-1/3">
                  Email
                </span>
                <span className="text-sm text-gray-900">
                  {session.user?.email}
                </span>
              </div>
              <div className="flex items-center py-3 px-4 rounded-xl bg-gray-50">
                <span className="text-sm font-medium text-gray-500 w-1/3">
                  Name
                </span>
                <span className="text-sm text-gray-900">
                  {session.user?.name || "Not provided"}
                </span>
              </div>
              <div className="flex items-center py-3 px-4 rounded-xl bg-gray-50">
                <span className="text-sm font-medium text-gray-500 w-1/3">
                  Session ID
                </span>
                <span className="text-sm text-gray-900 font-mono">
                  {session.user?.id || "Not available"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center justify-center px-6 py-3 rounded-xl text-indigo-600 bg-white border border-indigo-100 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-[1.02]"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Return Home
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center px-6 py-3 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-[1.02]"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-3 text-gray-500 text-sm">
            <svg
              className="w-5 h-5 text-indigo-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p>
              This is a secure area. Your session is protected and all data
              transmissions are encrypted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
