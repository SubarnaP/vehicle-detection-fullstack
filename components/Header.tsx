"use client";

import { useRouter } from "next/navigation";
import { TOKEN_NAME } from "@/config/constants";

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_NAME);
    router.push("/login");
  };

  return (
    <header className="bg-emerald-900 text-emerald-50 shadow-sm border-b border-emerald-800">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 bg-emerald-800/80 rounded-full flex items-center justify-center shadow-inner">
            {/* leaf emblem */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M4 20c6-6 12-8 16-8-1-4-5-8-9-8-4 0-6 6-7 12z"
                fill="currentColor"
                className="text-emerald-200"
              />
            </svg>
          </span>
          <div>
            <h1 className="text-lg md:text-xl font-semibold tracking-tight">
              Vehicle Monitor
            </h1>
            <p className="text-xs text-emerald-200">
              Sustainable tourism fleet • Conservation-first
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-6">
          <a
            href="/dashboard"
            className="text-emerald-100 hover:text-white transition-colors duration-200 text-sm font-medium"
          >
            Dashboard
          </a>
          <a
            href="/reports"
            className="text-emerald-100 hover:text-white transition-colors duration-200 text-sm font-medium"
          >
            Reports
          </a>
          <button
            onClick={handleLogout}
            className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors duration-150"
            aria-label="Logout"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
