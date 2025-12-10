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
      <div className="min-h-screen bg-gray-100">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Reports
          </h2>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Filters
            </h3>
            
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plate Number
                </label>
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search plate..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Results */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Results ({detections.length})
              </h3>
              <button
                onClick={handleExport}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Export CSV
              </button>
            </div>
            
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
