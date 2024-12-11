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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            System Status
          </h2>
        </div>

        <div className="mt-8 space-y-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-gray-900">Auth Status</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Session Status: <span className="font-medium">{status}</span>
              </p>
              {session && (
                <p className="text-sm text-gray-500">
                  User:{" "}
                  <span className="font-medium">{session.user?.email}</span>
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-gray-900">
              Database Status
            </h3>
            <div className="mt-2">
              {dbStatus ? (
                <>
                  <p
                    className={`text-sm ${
                      dbStatus.status === "success"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    Status:{" "}
                    <span className="font-medium">{dbStatus.status}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Message:{" "}
                    <span className="font-medium">{dbStatus.message}</span>
                  </p>
                  {dbStatus.userCount !== undefined && (
                    <p className="text-sm text-gray-500">
                      User Count:{" "}
                      <span className="font-medium">{dbStatus.userCount}</span>
                    </p>
                  )}
                  {dbStatus.error && (
                    <p className="text-sm text-red-600">
                      Error:{" "}
                      <span className="font-medium">{dbStatus.error}</span>
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  Loading database status...
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
