import { ProductImage } from "@/types/imageProps";

export default function ProductThumb({
  image,
  size = 36,
  emojiSize = 16,
  className = "",
}: {
  image?: ProductImage[];
  size?: number;
  emojiSize?: number;
  className?: string;
}) {
  const thumbnail =  image?.find((img) => img.is_thumbnail) ?? image?.[0];

  if (!thumbnail) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-cream-deep ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  const isEmoji = thumbnail.image_url.length <= 4;

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-cream-deep ${className}`}
      style={{ width: size, height: size }}
    >
      {isEmoji ? (
        <span style={{ fontSize: emojiSize }}>
          {thumbnail.image_url}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnail.image_url}
          alt="Product"
          className="h-full w-full object-cover"
        />
      )}
    </span>
  );
}