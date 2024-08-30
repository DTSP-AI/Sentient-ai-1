//C:\AI_src\Companion_UI\SaaS-AI-Companion\src\components\image-upload.tsx

"use client";

import { useEffect, useState } from "react";
import { CldUploadButton, CldImage } from "next-cloudinary";

interface ImageUploadProps {
  value: string;
  onChange: (src: string) => void;
  disabled?: boolean;
}

export const ImageUpload = ({
  value,
  onChange,
  disabled = false
}: ImageUploadProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleUpload = (result: any) => {
    if (result.event === "success") {
      onChange(result.info.secure_url);
    }
  };

  return (
    <div className="space-y-4 w-full flex flex-col justify-center items-center">
      {disabled ? (
        <div className="p-4 border-4 border-dashed border-primary/10 rounded-lg flex flex-col space-y-2 items-center justify-center opacity-50">
          <p>Upload Disabled</p>
        </div>
      ) : (
        <CldUploadButton
          onUpload={handleUpload}
          options={{
            maxFiles: 1,
          }}
          uploadPreset="Companion-AI"
        >
          <div className="p-4 border-4 border-dashed border-primary/10 rounded-lg hover:opacity-75 transition flex flex-col space-y-2 items-center justify-center">
            <div className="relative h-40 w-40">
              {value ? (
                <CldImage
                  src={value}
                  width="160"
                  height="160"
                  alt="Uploaded Image"
                  crop={{ type: 'auto', source: true }}
                  className="rounded-lg object-cover"
                />
              ) : (
                <p>Upload</p>
              )}
            </div>
          </div>
        </CldUploadButton>
      )}
    </div>
  );
};
