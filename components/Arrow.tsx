import { ChevronLeft, ChevronRight } from "lucide-react";

interface ArrowProps {
  onClick?: () => void;
}

export function CustomLeftArrow({ onClick }: ArrowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full border bg-white shadow-lg transition hover:bg-black hover:text-white"
    >
      <ChevronLeft size={20} />
    </button>
  );
}

export function CustomRightArrow({ onClick }: ArrowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full border bg-white shadow-lg transition hover:bg-black hover:text-white"
    >
      <ChevronRight size={20} />
    </button>
  );
}