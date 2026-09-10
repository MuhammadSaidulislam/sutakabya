"use client";

import React, { useEffect, useRef, useState } from "react";

interface OtpCodeProps {
  otp: string[];
  setOtp: React.Dispatch<React.SetStateAction<string[]>>;
  otpError: string;
  resetOtp: () => void;
}

const OtpCode = ({ otp, setOtp, otpError, resetOtp }: OtpCodeProps) => {

  const [otpTimer, setOtpTimer] = useState(60);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (otpTimer <= 0) return;

    const timer = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [otpTimer]);

  return (
    <>
      {/* OTP Inputs */}
      <div className="flex w-full gap-2 sm:gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              otpRefs.current[index] = el;
            }}
            value={digit}
            maxLength={1}
            inputMode="numeric"
            autoComplete="one-time-code"
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");

              const nextOtp = [...otp];
              nextOtp[index] = value.slice(-1);

              setOtp(nextOtp);

              if (value && index < otp.length - 1) {
                otpRefs.current[index + 1]?.focus();
              }
            }}
            onKeyDown={(e) => {
              if (
                e.key === "Backspace" &&
                !otp[index] &&
                index > 0
              ) {
                otpRefs.current[index - 1]?.focus();
              }
            }}
            className="
        h-10
        min-w-0
        flex-1
        rounded-md
        border border-border
        bg-cream-50
        text-center
        font-serif
        text-lg
        font-semibold
        text-ink-900
        outline-none
        transition-all
        duration-200
        sm:text-xl
      "
          />
        ))}
      </div>
      <p className="text-xs mt-1 text-left font-semibold text-rose-500 hover:text-rose-600">{otpError && otpError}</p>
      {/* Timer */}
      <div className="mt-4 text-center">
        {otpTimer > 0 ? (
          <p className="text-sm text-gray-500">
           Resend available in{" "}
            <span className="font-semibold text-coral-500">
              {otpTimer}s
            </span>
          </p>
        ) : (
          <button
            type="button"
            onClick={() => {
              setOtpTimer(60);
              resetOtp();
            }}
            className="text-sm font-semibold text-gray-800 hover:text-gray-900"
          >
             Didn’t receive the code?
          </button>
        )}
      </div>
    </>
  );
};

export default OtpCode;