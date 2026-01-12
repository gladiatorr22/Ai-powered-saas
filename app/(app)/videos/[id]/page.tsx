import React from "react";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import VideoEditor from "@/components/video/VideoEditor";

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) redirect("/");

    const video = await prisma.video.findUnique({
        where: {
            id: id,
            userId: userId // Security: Ensure ownership
        },
    });

    if (!video) {
        return (
            <div className="min-h-screen bg-lumina-black flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Video Not Found</h1>
                    <p className="text-gray-400">The video you requested does not exist or you don't have permission to view it.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <VideoEditor video={video} />
        </div>
    );
}
