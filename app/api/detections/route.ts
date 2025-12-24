import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { validateAuth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { Prisma } from "@prisma/client";

// Ensure uploads directory exists
async function ensureUploadDir() {
  const uploadDir = path.join(process.cwd(), "public/uploads");
  await mkdir(uploadDir, { recursive: true });
  return uploadDir;
}

// Save image file and return URL
async function saveImage(file: File): Promise<string> {
  const uploadDir = await ensureUploadDir();
  const filename = `${Date.now()}-${file.name}`;
  const filepath = path.join(uploadDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return `/uploads/${filename}`;
}

// Save base64 image and return URL
async function saveBase64Image(base64: string): Promise<string> {
  const uploadDir = await ensureUploadDir();
  const filename = `${Date.now()}.jpg`;
  const filepath = path.join(uploadDir, filename);

  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  await writeFile(filepath, Buffer.from(base64Data, "base64"));

  return `/uploads/${filename}`;
}

// POST: Create new detection
export async function POST(request: NextRequest) {
  try {
    const auth = validateAuth(request);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let plateNumber = "";
    let imageUrl: string | null = null;
    let metadata: Prisma.InputJsonValue | null = null;

    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      plateNumber = String(formData.get("plateNumber") ?? "");

      const imageFile = formData.get("image");
      if (imageFile instanceof File && imageFile.size > 0) {
        imageUrl = await saveImage(imageFile);
      }

      const metadataStr = formData.get("metadata");
      if (typeof metadataStr === "string") {
        try {
          metadata = JSON.parse(metadataStr) as Prisma.InputJsonValue;
        } catch {
          metadata = null;
        }
      }
    } else {
      const body = await request.json();
      plateNumber = body.plateNumber;

      if (typeof body.image === "string") {
        imageUrl = await saveBase64Image(body.image);
      }

      if (body.metadata !== undefined) {
        metadata = JSON.parse(
          JSON.stringify(body.metadata)
        ) as Prisma.InputJsonValue;
      }
    }

    if (!plateNumber) {
      return NextResponse.json(
        { message: "Plate number is required" },
        { status: 400 }
      );
    }

    const detection = await prisma.vehicleDetection.create({
      data: {
        plateNumber,
        imageUrl,
        source: "camera",
        metadata: metadata ?? undefined,
      },
    });

    return NextResponse.json(
      { message: "Detection saved successfully", detection },
      { status: 201 }
    );
  } catch (error) {
    console.error("Detection POST error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Retrieve detections
export async function GET(request: NextRequest) {
  try {
    const auth = validateAuth(request);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const plateNumber = searchParams.get("plateNumber");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 20);

    const where: Prisma.VehicleDetectionWhereInput = {};

    if (plateNumber) {
      where.plateNumber = { contains: plateNumber, mode: "insensitive" };
    }

    if (startDate || endDate) {
      where.detectedAt = {};
      if (startDate) where.detectedAt.gte = new Date(startDate);
      if (endDate) where.detectedAt.lte = new Date(endDate);
    }

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
