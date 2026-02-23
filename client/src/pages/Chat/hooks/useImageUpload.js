import { useState } from "react";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "../../../utils/config";

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = async (file) => {
    if (!file) return null;

    setIsUploading(true);
    setUploadProgress(10); // Start progress

    try {
      const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 500);

      const response = await fetch(url, { method: "POST", body: data });
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) throw new Error("Image upload failed");
      const json = await response.json();

      const optimizedUrl = json.secure_url.replace(
        "/upload/",
        "/upload/w_800,c_limit,q_auto,f_auto/",
      );

      return optimizedUrl;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  return { isUploading, uploadProgress, uploadImage };
};
