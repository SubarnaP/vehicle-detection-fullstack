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
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">🚗 Vehicle Monitor</h1>
        <nav className="flex items-center gap-4">
          <a href="/dashboard" className="hover:underline">
            Dashboard
          </a>
          <a href="/reports" className="hover:underline">
            Reports
          </a>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
