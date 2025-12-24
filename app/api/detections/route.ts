/**
 * Vehicle Detection API
 * 
 * Python Integration Notes:
 * -------------------------
 * Python script will POST data here:
 * - POST /api/detections
 * 
 * Headers: 
 *   Authorization: Bearer <API_KEY or JWT>
 *   Content-Type: application/json OR multipart/form-data
 * 
 * Body (JSON):
 * {
 *   "plateNumber": "BA-2-CHA-1234",
 *   "image": <optional base64 image string>,
 *   "metadata": { "frame": 123, "confidence": 0.98 }
 * }
 * 
 * Body (multipart/form-data):
 *   - plateNumber: string
 *   - image: File (optional)
 *   - metadata: JSON string
 * 
 * Response:
 * {
 *   "message": "Detection saved successfully",
 *   "detection": { ...detection data }
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { validateAuth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { Prisma } from "@prisma/client";

// Ensure uploads directory exists
async function ensureUploadDir() {
  const uploadDir = path.join(process.cwd(), "public/uploads");
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch {
    // Directory exists
  }
  return uploadDir;
}

// Save image file and return URL
async function saveImage(file: File): Promise<string> {
  const uploadDir = await ensureUploadDir();
  const timestamp = Date.now();
  const filename = `${timestamp}-${file.name}`;
  const filepath = path.join(uploadDir, filename);
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(filepath, buffer);
  
  return `/uploads/${filename}`;
}

// Save base64 image and return URL
async function saveBase64Image(base64: string): Promise<string> {
  const uploadDir = await ensureUploadDir();
  const timestamp = Date.now();
  const filename = `${timestamp}.jpg`;
  const filepath = path.join(uploadDir, filename);
  
  // Remove data URL prefix if present
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  await writeFile(filepath, buffer);
  
  return `/uploads/${filename}`;
}

// POST: Create new detection
export async function POST(request: NextRequest) {
  try {
    // Validate auth
    const auth = validateAuth(request);
    if (!auth) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    let plateNumber: string;
    let imageUrl: string | null = null;
    // keep metadata flexible locally, cast when sending to Prisma
    let metadata: unknown = {};

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // Handle multipart form data
      const formData = await request.formData();
      plateNumber = formData.get("plateNumber") as string;
      
      const imageFile = formData.get("image") as File | null;
      if (imageFile && imageFile.size > 0) {
        imageUrl = await saveImage(imageFile);
      }
      
      const metadataStr = formData.get("metadata") as string;
      if (metadataStr) {
        try {
          metadata = JSON.parse(metadataStr);
        } catch {
          metadata = {};
        }
      }
    } else {
      // Handle JSON body
      const body = await request.json();
      plateNumber = body.plateNumber;
      
      if (body.image && typeof body.image === "string") {
        imageUrl = await saveBase64Image(body.image);
      }
      
      metadata = body.metadata ?? {};
    }

    // Validate required fields
    if (!plateNumber) {
      return NextResponse.json(
        { message: "Plate number is required" },
        { status: 400 }
      );
    }

    // Save to database
    const detection = await prisma.vehicleDetection.create({
      data: {
        plateNumber,
        imageUrl,
        source: "camera",
        metadata: metadata as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({
      message: "Detection saved successfully",
      detection,
    }, { status: 201 });
  } catch (error) {
    console.error("Detection POST error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Retrieve all detections
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build where clause
    const where: Prisma.VehicleDetectionWhereInput = {};
    
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

    // Get detections with pagination
    const [detections, total] = await Promise.all([
      prisma.vehicleDetection.findMany({
        where,
        orderBy: { detectedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.vehicleDetection.count({ where }),
    ]);

    return NextResponse.json({
      detections,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Detection GET error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
