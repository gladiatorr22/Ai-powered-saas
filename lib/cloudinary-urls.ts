// lib/cloudinary-urls.ts - Client-safe Cloudinary URL utilities
// Can be imported in both client and server components

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

// Utility functions for generating Cloudinary URLs
export function getVideoThumbnailUrl(
    publicId: string,
    options: { width?: number; height?: number } = {}
): string {
    if (!publicId) return "";
    const { width = 400, height = 225 } = options;
    return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/c_fill,w_${width},h_${height},so_0/${publicId}.jpg`;
}

export function getImageUrl(
    publicId: string,
    options: { width?: number; height?: number } = {}
): string {
    if (!publicId) return "";
    const { width = 400, height = 400 } = options;
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_${width},h_${height}/${publicId}`;
}

export function getVideoUrl(publicId: string): string {
    if (!publicId) return "";
    return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${publicId}`;
}

export function getCloudName(): string {
    return CLOUD_NAME || "";
}
