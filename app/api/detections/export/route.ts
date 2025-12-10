import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { validateAuth } from "@/lib/auth";
import { generateCSV, formatDate } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    // Validate auth
    const auth = validateAuth(request);
    if (!auth) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const plateNumber = searchParams.get("plateNumber");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (plateNumber) {
      where.plateNumber = { contains: plateNumber, mode: "insensitive" };
    }
    
    if (startDate || endDate) {
      where.detectedAt = {};
      if (startDate) {
        (where.detectedAt as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.detectedAt as Record<string, Date>).lte = new Date(endDate);
      }
    }

    // Get all matching detections
    const detections = await prisma.vehicleDetection.findMany({
      where,
      orderBy: { detectedAt: "desc" },
    });

    // Transform data for CSV
    const csvData = detections.map((d, index) => ({
      sn: index + 1,
      plateNumber: d.plateNumber,
      detectedAt: formatDate(d.detectedAt),
      source: d.source,
      imageUrl: d.imageUrl || "N/A",
    }));

    // Generate CSV
    const csv = generateCSV(csvData, [
      { key: "sn", label: "S.N." },
      { key: "plateNumber", label: "Plate Number" },
      { key: "detectedAt", label: "Detected At" },
      { key: "source", label: "Source" },
      { key: "imageUrl", label: "Image URL" },
    ]);

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="detections-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
