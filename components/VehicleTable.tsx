"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";

interface Detection {
  id: string;
  plateNumber: string;
  imageUrl: string | null;
  detectedAt: string;
  source: string;
}

interface VehicleTableProps {
  detections: Detection[];
}

type SortKey = "plateNumber" | "detectedAt" | "source";

export default function VehicleTable({ detections }: VehicleTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("detectedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const sortedDetections = [...detections].sort((a, b) => {
    let comparison = 0;
    if (sortKey === "plateNumber") {
      comparison = a.plateNumber.localeCompare(b.plateNumber);
    } else if (sortKey === "detectedAt") {
      comparison = new Date(a.detectedAt).getTime() - new Date(b.detectedAt).getTime();
    } else if (sortKey === "source") {
      comparison = a.source.localeCompare(b.source);
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <span className="text-gray-400">↕</span>;
    return sortOrder === "asc" ? <span>↑</span> : <span>↓</span>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
              S.N.
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("plateNumber")}
            >
              Plate Number <SortIcon column="plateNumber" />
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("detectedAt")}
            >
              Time <SortIcon column="detectedAt" />
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
              Image
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort("source")}
            >
              Camera <SortIcon column="source" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedDetections.map((detection, index) => (
            <tr key={detection.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {detection.plateNumber}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {formatDate(detection.detectedAt)}
              </td>
              <td className="px-4 py-3 text-sm">
                {detection.imageUrl ? (
                  <a
                    href={detection.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </a>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700 capitalize">
                {detection.source}
              </td>
            </tr>
          ))}
          {sortedDetections.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                No detections found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
