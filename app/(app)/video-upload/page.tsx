"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUpload } from "@/context/UploadContext";

export default function VideoUploadPage() {
  const { openUpload } = useUpload();
  const router = useRouter();

  useEffect(() => {
    openUpload();
    router.replace("/home");
  }, []);
  return null;
}