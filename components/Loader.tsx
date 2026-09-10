"use client";

type MovingCircleLoaderProps = {
  /** Text shown under the animation. Pass "" to hide it. */
  message?: string;
  /** Renders as a fixed, full-viewport overlay with a soft cream backdrop. */
  fullScreen?: boolean;
  /** Pixel size of the loader. Defaults to 64. */
  size?: number;
  /** Extra classes on the outer wrapper. */
  className?: string;
};

export default function Loader({
  message = "Loading…",
  fullScreen = false,
  size = 64,
  className = "",
}: MovingCircleLoaderProps) {
  const content = (
    <div
      role="status"
      aria-live="polite"
      aria-label={message || "Loading"}
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* faint static track */}
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="#FFE1D3"
          strokeWidth="4"
        />
        {/* the moving circle, orbiting the track */}
        <g className="mcl-orbit" style={{ transformOrigin: "50px 50px" }}>
          <circle cx="50" cy="12" r="7" fill="#FF8C7A" />
        </g>
      </svg>

      {message ? (
        <p className="text-sm font-medium text-[#5B4B49]">{message}</p>
      ) : null}

      <style>{`
        @keyframes mcl-orbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .mcl-orbit {
          animation: mcl-orbit 1.4s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .mcl-orbit {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );

  if (!fullScreen) return content;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FFF9F2]/95 backdrop-blur-sm">
      {content}
    </div>
  );
}