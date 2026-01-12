import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const drafts = await prisma.socialDraft.findMany({
            where: { userId },
            include: { video: true },
            orderBy: { updatedAt: "desc" },
        });

        return NextResponse.json(drafts);
    } catch (error) {
        console.error("Error fetching drafts:", error);
        return NextResponse.json({ error: "Failed to fetch drafts" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { id, caption, format, videoId, imagePublicId, thumbnailPublicId } = body;

        // If 'id' is provided, update existing draft
        if (id) {
            const updatedDraft = await prisma.socialDraft.update({
                where: { id },
                data: {
                    caption,
                    format,
                    videoId,
                    imagePublicId,
                    thumbnailPublicId
                }
            });
            return NextResponse.json(updatedDraft);
        }

        // Create new draft
        const draft = await prisma.socialDraft.create({
            data: {
                userId,
                caption,
                format,
                videoId,
                imagePublicId,
                thumbnailPublicId,
            },
        });

        return NextResponse.json(draft);
    } catch (error) {
        console.error("Error saving draft:", error);
        return NextResponse.json({ error: "Failed to save draft" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing draft ID" }, { status: 400 });
        }

        // Verify ownership
        const draft = await prisma.socialDraft.findUnique({
            where: { id }
        });

        if (!draft || draft.userId !== userId) {
            return NextResponse.json({ error: "Draft not found or unauthorized" }, { status: 404 });
        }

        await prisma.socialDraft.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting draft:", error);
        return NextResponse.json({ error: "Failed to delete draft" }, { status: 500 });
    }
}
