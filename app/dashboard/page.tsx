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
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-green-50 to-blue-50">
        <Header />
        
        <main className="container mx-auto px-4 py-12">
          {/* Page Header */}
          <div className="mb-12">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-green-900 mb-2">
                  Wildlife Detection Dashboard
                </h1>
                <p className="text-green-700 text-lg">
                  Chitwan National Park - Real-time Vehicle & Wildlife Monitoring
                </p>
              </div>
              <button
                onClick={fetchDetections}
                className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md flex items-center gap-2"
              >
                <span>↻</span> Refresh Data
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Total Detections Card */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-600 p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-green-600 text-sm font-semibold tracking-wide mb-1">
                    TOTAL DETECTIONS
                  </p>
                  <h3 className="text-4xl font-bold text-gray-900">
                    {detections.length}
                  </h3>
                </div>
                <div className="text-4xl opacity-20">🌿</div>
              </div>
              <p className="text-gray-600 text-sm">
                All-time vehicle detection records in the park
              </p>
            </div>

            {/* Today's Count Card */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-600 p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-blue-600 text-sm font-semibold tracking-wide mb-1">
                    TODAY'S ACTIVITY
                  </p>
                  <h3 className="text-4xl font-bold text-gray-900">
                    {detections.filter(d => {
                      const today = new Date().toDateString();
                      return new Date(d.detectedAt).toDateString() === today;
                    }).length}
                  </h3>
                </div>
                <div className="text-4xl opacity-20">📍</div>
              </div>
              <p className="text-gray-600 text-sm">
                Current day monitoring activities
              </p>
            </div>

            {/* System Status Card */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-amber-600 p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-amber-600 text-sm font-semibold tracking-wide mb-1">
                    SYSTEM STATUS
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <h3 className="text-2xl font-bold text-green-700">Active</h3>
                  </div>
                </div>
                <div className="text-4xl opacity-20">✓</div>
              </div>
              <p className="text-gray-600 text-sm">
                All monitoring systems operational
              </p>
            </div>
          </div>

          {/* Detections Table Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-green-700 to-green-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white mb-1">
                Recent Vehicle Detections
              </h2>
              <p className="text-green-100 text-sm">
                Latest recorded vehicle movements across monitoring points
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-start gap-3">
                  <span className="text-xl mt-0.5">⚠</span>
                  <div>
                    <p className="font-semibold">Error Loading Data</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 border-4 border-green-200 border-t-green-700 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading detection records...</p>
                  <p className="text-gray-500 text-sm mt-1">Please wait while we fetch the latest data</p>
                </div>
              ) : detections.length > 0 ? (
                <div className="overflow-x-auto">
                  <VehicleTable detections={detections} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-6xl mb-4 opacity-30">🦏</div>
                  <p className="text-gray-600 font-medium">No detections yet</p>
                  <p className="text-gray-500 text-sm mt-1">Check back soon for vehicle monitoring data</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
            <p className="text-gray-700 text-sm text-center">
              <span className="font-semibold">Conservation Note:</span> This dashboard helps monitor vehicle movement to protect wildlife habitats in Chitwan National Park. Data is collected ethically and used for park management only.
            </p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
