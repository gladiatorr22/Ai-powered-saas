import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const images = await prisma.image.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(images);
    } catch (error) {
        console.error("Error fetching images:", error);
        return NextResponse.json({ error: "Error fetching images" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { title, publicId, format, width, height } = body;

        if (!publicId || typeof publicId !== "string") {
            return NextResponse.json({ error: "Public ID is required" }, { status: 400 });
        }

        const image = await prisma.image.create({
            data: {
                title: title?.trim() || "Untitled Image",
                publicId,
                format,
                width,
                height,
                userId
            }
        });

        return NextResponse.json(image);
    } catch (error) {
        console.error("Error saving image:", error);
        return NextResponse.json({ error: "Error saving image" }, { status: 500 });
    }
}
