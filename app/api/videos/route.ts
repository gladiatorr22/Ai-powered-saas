import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const videos = await prisma.video.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(videos);
    } catch (error) {
        console.error("Error fetching videos:", error);
        return NextResponse.json(
            { error: "Error fetching videos" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
