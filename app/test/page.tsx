"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Loading from "../components/Loading";

interface TestResponse {
  status: string;
  message: string;
  userCount?: number;
  error?: string;
}

type AuthStatus = "authenticated" | "unauthenticated" | "loading";

export default function TestPage() {
  const { data: session, status } = useSession();
  const [dbStatus, setDbStatus] = useState<TestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkDatabase() {
      try {
        const res = await fetch("/api/test");
        const data = await res.json();
        setDbStatus(data);
      } catch (error) {
        setDbStatus({
          status: "error",
          message: "Failed to fetch database status",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        setIsLoading(false);
      }
    }

    checkDatabase();
  }, []);

  if (status === "loading" || isLoading) {
    return <Loading />;
  }

  const getStatusColor = (authStatus: AuthStatus) => {
    switch (authStatus) {
      case "authenticated":
        return "bg-green-100 text-green-800";
      case "loading":
        return "bg-yellow-100 text-yellow-800";
      case "unauthenticated":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            System Status
          </h2>
          <p className="mt-3 text-gray-600">
            Monitor your system's health and performance
          </p>
        </div>

        <div className="grid gap-6">
          {/* Auth Status Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <svg
                  className="h-6 w-6 text-indigo-500"
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
                <h3 className="text-lg font-semibold text-gray-900">
                  Authentication Status
                </h3>
              </div>
            </div>
            <div className="px-6 py-6 bg-gradient-to-b from-white to-gray-50">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Session Status
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      status as AuthStatus
                    )}`}
                  >
                    {status}
                  </span>
                </div>
                {session && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      User Email
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {session.user?.email}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Database Status Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <svg
                  className="h-6 w-6 text-indigo-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">
                  Database Status
                </h3>
              </div>
            </div>
            <div className="px-6 py-6 bg-gradient-to-b from-white to-gray-50">
              {dbStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Status
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        dbStatus.status === "success"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {dbStatus.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Message
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {dbStatus.message}
                    </span>
                  </div>
                  {dbStatus.userCount !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        User Count
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {dbStatus.userCount}
                      </span>
                    </div>
                  )}
                  {dbStatus.error && (
                    <div className="mt-4 p-4 bg-red-50 rounded-xl">
                      <p className="text-sm text-red-600">
                        <span className="font-medium">Error: </span>
                        {dbStatus.error}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">
                    Loading database status...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center px-6 py-3 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-[1.02]"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
