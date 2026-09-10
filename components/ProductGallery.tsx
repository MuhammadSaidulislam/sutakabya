"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductImage } from "@/types/imageProps";

interface ProductGalleryProps {
  images?: ProductImage[];
  name?: string;
}

export default function ProductGallery({
  images = [],
  name = "Product",
}: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [zoomStyle, setZoomStyle] = useState<CSSProperties>({
    transform: "scale(1)",
  });
  const [isHovered, setIsHovered] = useState(false);

  // Auto play
  useEffect(() => {
    if (images.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [images.length, isHovered]);

  const nextImage = () => {
    setActive((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActive((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();

    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(1.08)",
    });
  };

  const resetZoom = () => {
    setZoomStyle({
      transformOrigin: "center center",
      transform: "scale(1)",
    });
  };

  if (!images.length) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-3xl border border-gray-200 bg-[#f8f8f6] text-sm text-gray-400">
        No Image
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* =========================
          MAIN IMAGE
      ========================= */}
      <div
        className="
          group relative
          aspect-square
          overflow-hidden
          rounded-3xl
          border border-gray-100
          bg-[#f8f8f6]
        "
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          resetZoom();
        }}
        onMouseMove={handleMouseMove}
      >
        {/* Image container */}
        <div className="absolute inset-0 flex items-center justify-center p-5 sm:p-8 lg:p-10">
          <Image
            key={images[active].id}
            src={images[active].image_url}
            alt={`${name} - Image ${active + 1}`}
            fill
            priority={active === 0}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="
              object-contain
              transition-transform
              duration-500
              ease-out
            "
            style={zoomStyle}
          />
        </div>

        {/* Image counter */}
        {images.length > 1 && (
          <div
            className="
              absolute
              bottom-4
              right-4
              z-10
              rounded-full
              border
              border-white/20
              bg-black/55
              px-3
              py-1.5
              text-[11px]
              font-medium
              tracking-wide
              text-white
              backdrop-blur-md
            "
          >
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(images.length).padStart(2, "0")}
          </div>
        )}

        {/* Previous */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={prevImage}
            aria-label="Previous image"
            className="
              absolute
              left-4
              top-1/2
              z-20
              flex
              h-11
              w-11
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              border
              border-black/5
              bg-white/90
              text-gray-700
              shadow-md
              opacity-0
              backdrop-blur
              transition-all
              duration-300
              group-hover:opacity-100
              hover:scale-105
              hover:bg-white
            "
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.8} />
          </button>
        )}

        {/* Next */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={nextImage}
            aria-label="Next image"
            className="
              absolute
              right-4
              top-1/2
              z-20
              flex
              h-11
              w-11
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              border
              border-black/5
              bg-white/90
              text-gray-700
              shadow-md
              opacity-0
              backdrop-blur
              transition-all
              duration-300
              group-hover:opacity-100
              hover:scale-105
              hover:bg-white
            "
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.8} />
          </button>
        )}

        {/* Bottom image indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`View image ${index + 1}`}
                onClick={() => setActive(index)}
                className={`
                  h-1.5
                  rounded-full
                  transition-all
                  duration-300
                  ${
                    active === index
                      ? "w-6 bg-gray-900"
                      : "w-1.5 bg-gray-400/70"
                  }
                `}
              />
            ))}
          </div>
        )}
      </div>

      {/* =========================
          THUMBNAILS
      ========================= */}
      {images.length > 1 && (
        <div className="relative">
          <div
            className="
              flex
              gap-3
              overflow-x-auto
              px-1
              py-2
              scrollbar-hide
            "
          >
            {images.map((img, index) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`View ${name} image ${index + 1}`}
                className={`
                  group/thumb
                  relative
                  h-[82px]
                  w-[82px]
                  flex-shrink-0
                  overflow-hidden
                  rounded-xl
                  border
                  bg-[#f8f8f6]
                  transition-all
                  duration-300
                  ${
                    active === index
                      ? "border-gray-900 ring-1 ring-gray-900"
                      : "border-gray-200 hover:border-gray-400"
                  }
                `}
              >
                <Image
                  src={img.image_url}
                  alt={`${name} thumbnail ${index + 1}`}
                  fill
                  sizes="82px"
                  className="
                    object-contain
                    p-1
                    transition-transform
                    duration-300
                    group-hover/thumb:scale-105
                  "
                />

                {/* Active overlay */}
                {active === index && (
                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
