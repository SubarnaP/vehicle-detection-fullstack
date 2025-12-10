"use client";

import { formatDate } from "@/lib/utils";

interface Detection {
  id: string;
  plateNumber: string;
  imageUrl: string | null;
  detectedAt: string;
  source: string;
  metadata?: Record<string, unknown>;
}

interface DetectionCardProps {
  detection: Detection;
}

export default function DetectionCard({ detection }: DetectionCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      {/* Image section */}
      <div className="h-40 bg-gray-100 flex items-center justify-center">
        {detection.imageUrl ? (
          <img
            src={detection.imageUrl}
            alt={`Plate: ${detection.plateNumber}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-gray-400 text-sm">No Image</div>
        )}
      </div>

      {/* Content section */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {detection.plateNumber}
        </h3>
        <div className="space-y-1 text-sm text-gray-600">
          <p>
            <span className="font-medium">Time:</span>{" "}
            {formatDate(detection.detectedAt)}
          </p>
          <p>
            <span className="font-medium">Source:</span>{" "}
            <span className="capitalize">{detection.source}</span>
          </p>
          {detection.metadata && Object.keys(detection.metadata).length > 0 && (
            <p>
              <span className="font-medium">Confidence:</span>{" "}
              {(detection.metadata as { confidence?: number }).confidence
                ? `${((detection.metadata as { confidence: number }).confidence * 100).toFixed(1)}%`
                : "N/A"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
