"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import VehicleTable from "@/components/VehicleTable";
import { api } from "@/lib/api";

interface Detection {
  id: string;
  plateNumber: string;
  imageUrl: string | null;
  detectedAt: string;
  source: string;
}

interface DetectionsResponse {
  detections: Detection[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function DashboardPage() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDetections = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<DetectionsResponse>("/detections");
      setDetections(response.detections);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch detections");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetections();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDetections, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Dashboard
            </h2>
            <button
              onClick={fetchDetections}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Total Detections</h3>
              <p className="text-3xl font-bold text-gray-800">
                {detections.length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Today</h3>
              <p className="text-3xl font-bold text-blue-600">
                {detections.filter(d => {
                  const today = new Date().toDateString();
                  return new Date(d.detectedAt).toDateString() === today;
                }).length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Status</h3>
              <p className="text-xl font-bold text-green-600">● Online</p>
            </div>
          </div>

          {/* Detections Table */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Recent Detections
            </h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <VehicleTable detections={detections} />
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
