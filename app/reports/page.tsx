"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import VehicleTable from "@/components/VehicleTable";
import { api } from "@/lib/api";
import { TOKEN_NAME, API_BASE } from "@/config/constants";

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

export default function ReportsPage() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Filters
  const [plateNumber, setPlateNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchDetections = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const params: Record<string, string> = {};
      if (plateNumber) params.plateNumber = plateNumber;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/detections?${queryString}` : "/detections";
      
      const response = await api.get<DetectionsResponse>(endpoint);
      setDetections(response.detections);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch detections");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (plateNumber) params.append("plateNumber", plateNumber);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const token = localStorage.getItem(TOKEN_NAME);
    const queryString = params.toString();
    const url = `${API_BASE}/detections/export${queryString ? `?${queryString}` : ""}`;

    // Create a temporary link to download
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `detections-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
      })
      .catch((err) => {
        setError("Failed to export: " + err.message);
      });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDetections();
  };

  const handleReset = () => {
    setPlateNumber("");
    setStartDate("");
    setEndDate("");
  };

  useEffect(() => {
    fetchDetections();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-green-50 to-blue-50">
        <Header />
        
        <main className="container mx-auto px-4 py-12">
          {/* Page Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-green-900 mb-2">
              Detection Reports
            </h1>
            <p className="text-green-700 text-lg">
              Search and analyze vehicle detection data across Chitwan National Park
            </p>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-md border-t-4 border-green-600 p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🔍</span>
              <h2 className="text-2xl font-bold text-gray-900">
                Search & Filter
              </h2>
            </div>
            
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Plate Number Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Vehicle Plate Number
                  </label>
                  <input
                    type="text"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors"
                    placeholder="e.g., BA-1234"
                  />
                </div>
                
                {/* Start Date Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors"
                  />
                </div>
                
                {/* End Date Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-green-700 hover:bg-green-800 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors shadow-md"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2.5 rounded-lg font-semibold transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-8 py-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Detection Results
                </h2>
                <p className="text-blue-100 text-sm">
                  {detections.length} record{detections.length !== 1 ? "s" : ""} found
                </p>
              </div>
              <button
                onClick={handleExport}
                className="bg-white hover:bg-gray-100 text-blue-700 px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-md flex items-center gap-2"
              >
                <span>📥</span> Export CSV
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-900 rounded-lg flex items-start gap-3">
                  <span className="text-xl mt-0.5">⚠</span>
                  <div>
                    <p className="font-semibold">Unable to Load Data</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600 font-medium">Processing your search...</p>
                  <p className="text-gray-500 text-sm mt-1">This may take a moment while we scan the database</p>
                </div>
              ) : detections.length > 0 ? (
                <div className="overflow-x-auto">
                  <VehicleTable detections={detections} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-6xl mb-4 opacity-20">📋</div>
                  <p className="text-gray-600 font-medium">No results found</p>
                  <p className="text-gray-500 text-sm mt-1">Try adjusting your search filters</p>
                </div>
              )}
            </div>
          </div>

          {/* Information Box */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
            <div className="flex gap-4">
              <div className="text-3xl flex-shrink-0">ℹ</div>
              <div>
                <p className="text-gray-800 font-semibold mb-1">About These Reports</p>
                <p className="text-gray-700 text-sm">
                  This report system helps track vehicle movement patterns for park management and conservation planning. All data is handled securely and used strictly for wildlife protection purposes.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
