"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { CldImage } from "next-cloudinary";

// Social media format configurations
const socialFormats = {
  "Instagram Square (1:1)": { width: 1080, height: 1080, aspectRatio: "1:1" },
  "Instagram Portrait (4:5)": { width: 1080, height: 1350, aspectRatio: "4:5" },
  "Twitter Post (16:9)": { width: 1200, height: 675, aspectRatio: "16:9" },
  "Twitter Header (3:1)": { width: 1500, height: 500, aspectRatio: "3:1" },
  "Facebook Cover (205:78)": { width: 820, height: 312, aspectRatio: "205:78" },
  "LinkedIn Post (1.91:1)": { width: 1200, height: 628, aspectRatio: "1.91:1" },
};

type SocialFormat = keyof typeof socialFormats;

function SocialShare() {
  const [file, setFile] = useState<File | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<SocialFormat>("Instagram Square (1:1)");
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Generate preview URL when file is selected
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please select an image file");
        setFile(null);
        return;
      }
      setError(null);
      setFile(selectedFile);
      setPublicId(null); // Reset publicId when new file selected
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image file first");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/image-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setPublicId(response.data.publicId);
    } catch (err) {
      console.error("Upload error:", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Failed to upload image");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!publicId) return;

    setIsDownloading(true);
    setError(null);

    try {
      const format = socialFormats[selectedFormat];

      // Construct the Cloudinary URL with transformations
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const transformedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,g_auto,w_${format.width},h_${format.height}/${publicId}`;

      // Fetch the image as a blob
      const response = await fetch(transformedUrl);
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedFormat.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_image.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      setError("Failed to download image");
    } finally {
      setIsDownloading(false);
    }
  };

  const currentFormat = socialFormats[selectedFormat];

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Social Media Image Creator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">1. Upload Image</h2>

              <div className="form-control">
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered w-full"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </div>

              {/* File Preview */}
              {previewUrl && !publicId && (
                <div className="mt-4">
                  <p className="text-sm text-base-content/70 mb-2">Preview:</p>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-48 rounded-lg object-contain mx-auto"
                  />
                </div>
              )}

              <button
                className="btn btn-primary mt-4"
                onClick={handleUpload}
                disabled={!file || isUploading || !!publicId}
              >
                {isUploading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Uploading...
                  </>
                ) : publicId ? (
                  "✓ Uploaded"
                ) : (
                  "Upload to Cloudinary"
                )}
              </button>

              {publicId && (
                <div className="alert alert-success mt-2">
                  <span>Image uploaded successfully!</span>
                </div>
              )}
            </div>
          </div>

          {/* Format Selection */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">2. Select Format</h2>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Social Media Format</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value as SocialFormat)}
                  disabled={!publicId}
                >
                  {Object.keys(socialFormats).map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </div>

              {publicId && (
                <div className="mt-4">
                  <p className="text-sm text-base-content/70">
                    Dimensions: {currentFormat.width} × {currentFormat.height}px
                  </p>
                  <p className="text-sm text-base-content/70">
                    Aspect Ratio: {currentFormat.aspectRatio}
                  </p>
                </div>
              )}

              <button
                className="btn btn-secondary mt-4"
                onClick={handleDownload}
                disabled={!publicId || isDownloading}
              >
                {isDownloading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Downloading...
                  </>
                ) : (
                  "Download Transformed Image"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error mt-6">
            <span>{error}</span>
          </div>
        )}

        {/* Transformed Image Preview */}
        {publicId && (
          <div className="card bg-base-100 shadow-xl mt-6">
            <div className="card-body">
              <h2 className="card-title">Preview: {selectedFormat}</h2>
              <div className="flex justify-center mt-4 overflow-hidden rounded-lg bg-base-200 p-4">
                <CldImage
                  ref={imageRef}
                  src={publicId}
                  width={currentFormat.width}
                  height={currentFormat.height}
                  crop="fill"
                  gravity="auto"
                  alt="Transformed image"
                  className="max-w-full h-auto rounded-lg shadow-lg"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SocialShare;