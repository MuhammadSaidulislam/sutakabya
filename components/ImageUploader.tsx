"use client";

import { useRef } from "react";
import { Upload, Star, X, ImageOff } from "lucide-react";
import { ProductImage } from "@/types/imageProps";

export default function ImageUploader({
  images,
  onChange,
}: {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList).slice(0, 8 - images.length);

    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;

            reader.readAsDataURL(file);
          })
      )
    ).then((newImages) => {
      const uploadedImages: ProductImage[] = newImages.map((url, index) => ({
        image_url: url,
        is_thumbnail: images.length === 0 && index === 0,
      }));

      onChange([...images, ...uploadedImages]);
    });
  };

  const setThumbnail = (url: string) => {
    onChange(
      images.map((image) => ({
        ...image,
        is_thumbnail: image.image_url === url,
      }))
    );
  };

  const removeImage = (url: string) => {
    let updated = images.filter(
      (image) => image.image_url !== url
    );

    if (
      updated.length > 0 &&
      !updated.some((image) => image.is_thumbnail)
    ) {
      updated = updated.map((image, index) => ({
        ...image,
        is_thumbnail: index === 0,
      }));
    }

    onChange(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="block text-[13px] font-medium text-ink">
          Product Images
        </label>

        <span className="text-[12px] text-ink-soft">
          {images.length}/8 uploaded
        </span>
      </div>

      <div className="mt-2 grid grid-cols-4 gap-2.5">
        {images.map((image) => (
          <div
            key={image.image_url}
            className={`group relative aspect-square overflow-hidden rounded-xl border-2 ${image.is_thumbnail
              ? "border-blush-deep"
              : "border-border"
              }`}
          >
            <img
              src={image.image_url}
              alt="Product"
              className="h-full w-full object-cover"
            />

            {/* Set Thumbnail */}
            <button
              type="button"
              onClick={() => setThumbnail(image.image_url)}
              className={`absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full ${image.is_thumbnail
                ? "bg-blush-deep text-white"
                : "bg-black/60 text-white opacity-0 group-hover:opacity-100"
                }`}
            >
              <Star
                size={12}
                fill={image.is_thumbnail ? "currentColor" : "none"}
              />
            </button>

            {/* Remove */}
            <button
              type="button"
              onClick={() => removeImage(image.image_url)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100"
            >
              <X size={12} />
            </button>

            {image.is_thumbnail && (
              <span className="absolute inset-x-0 bottom-0 bg-blush-deep py-0.5 text-center text-[10px] font-semibold uppercase text-white">
                Thumbnail
              </span>
            )}
          </div>
        ))}

        {images.length < 8 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-ink-soft hover:border-blush-deep hover:text-blush-deep"
          >
            <Upload size={16} />
            <span className="text-[11px] font-medium">
              Upload
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {images.length === 0 && (
        <div className="mt-2 flex items-center gap-1.5 text-[12px] text-ink-soft">
          <ImageOff size={13} />
          Upload at least one image. Click the ⭐ to mark the thumbnail.
        </div>
      )}
    </div>
  );
}