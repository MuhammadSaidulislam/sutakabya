'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock } from 'lucide-react'
import { toast } from '@/lib/toast'
import { useRouter } from "next/navigation";
import OtpCode from '@/components/OtpCode'

export default function Page() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({ emailOrPhone: '', password: '' })
  const [otpRequired, setOtpRequired] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState(true);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpToken, setOtpToken] = useState('');

  const sendOtp = async (phone: string) => {
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          purpose: "password_reset",
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        toast({
          message:
            result.message ||
            "We couldn't send the OTP. Please check your mobile number and try again.",
          type: "error",
          position: "top-right",
        });

        return false;
      }
      setEmailOrPhone(false);
      setOtpRequired(true);
      setOtpToken(result.token);

      toast({
        message: result.message || "OTP sent successfully.",
        type: "success",
        position: "top-right",
      });

      return true;
    } catch (error) {
      console.error("Send OTP error:", error);

      toast({
        message: "Something went wrong while sending the OTP. Please try again.",
        type: "error",
        position: "top-right",
      });

      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};

    // =====================================================
    // 1. Validate login
    // =====================================================
    if (!form.emailOrPhone.trim()) {
      errors.login = "Email or mobile number is required";
    } else {
      const value = form.emailOrPhone.trim();

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const isPhone = /^\+?\d{10,15}$/.test(value);

      if (!isEmail && !isPhone) {
        errors.login = "Enter a valid email or mobile number";
      }
    }

    setErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    await sendOtp(form.emailOrPhone);
  };

  const resetOtp = async () => {

    await sendOtp(form.emailOrPhone);
  }

  const handleOtpSubmit = async () => {
    setOtpError("");

    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      setOtpError("Please enter all 6 digits.");
      return;
    }

    try {
      const verifyRes = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp: enteredOtp,
          token: otpToken,
        }),
      });

      const verifyResult = await verifyRes.json();

      if (!verifyRes.ok || !verifyResult.success) {
        setOtpError(
          verifyResult.message || "Invalid or expired verification code."
        );
        return;
      }

      // ============================================
      // OTP VERIFIED SUCCESSFULLY
      // ============================================

      setResetToken(verifyResult.resetToken);

      setEmailOrPhone(false);
      setOtpRequired(false);
      setPasswordRequired(true);

    } catch (error) {
      console.error("OTP verification error:", error);

      setOtpError(
        "Something went wrong while verifying the code. Please try again."
      );
    }
  };


  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};

    // Validate email / phone
    if (!form.emailOrPhone.trim()) {
      errors.emailOrPhone = "Email or mobile number is required";
    } else {
      const value = form.emailOrPhone.trim();

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const isPhone = /^[0-9]{10,15}$/.test(value);

      if (!isEmail && !isPhone) {
        errors.emailOrPhone =
          "Enter a valid email or mobile number";
      }
    }

    // Validate password
    if (!form.password) {
      errors.password = "Password is required";
    } else if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setErrors(errors);

    // Don't call API if validation failed
    if (Object.keys(errors).length > 0) {
      return;
    }

    const value = form.emailOrPhone.trim();
    const isEmail = value.includes("@");



    try {
      const res = await fetch("/api/user/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
           email: isEmail ? form.emailOrPhone : null,
      phone: isEmail ? null : form.emailOrPhone,
          resetToken,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast({
          message: data.message || "Failed to reset password.",
          type: "error",
          position: "top-right",
        });

        return;
      }

      toast({
        message:
          data.message ||
          "Password updated successfully. You are now logged in.",
        type: "success",
        position: "top-right",
      });

      router.push("/account");
      router.refresh();

    } catch (error) {
      console.error("Reset password error:", error);

      toast({
        message: "Something went wrong. Please try again.",
        type: "error",
        position: "top-right",
      });
    }
  };

  return (
    <div className='w-full min-h-screen bg-cover bg-center bg-no-repeat' style={{ backgroundImage: "url('/images/login.png')" }}>
      <div className="mx-auto max-w-md px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-cream-50 rounded-3xl shadow-soft p-8 sm:p-10">
          <h1 className="font-serif text-3xl text-ink-900 mb-2 text-center">Forget Password</h1>
          <p className="text-ink-400 text-sm text-center mb-8">Sign in to your Kids &amp; Mom account</p>
          {otpRequired && <div className="px-6 py-7 sm:px-8 sm:py-8">
            <label className="mb-3 block text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">
              Enter verification code
            </label>

            <OtpCode resetOtp={resetOtp} otp={otp} otpError={otpError} setOtp={setOtp} />
            <button onClick={handleOtpSubmit} type="button" className="w-full py-3.5 rounded-full bg-brand-pink hover:bg-blush-500 text-white font-medium btn-magnetic shadow-glow mt-2">
              Verify the account
            </button>
          </div>}
          {emailOrPhone && <form onSubmit={handleSubmit} className="space-y-4">
            {/* Login */}
            <div>
              <label className="text-sm font-medium text-ink-700 mb-1.5 block">Email or Mobile Number</label>

              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />

                <input value={form.emailOrPhone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      emailOrPhone: e.target.value,
                    })
                  }
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-cream-50 outline-none ${errors.login ? "border-blush-500" : "border-ink-100 focus:border-sage-400"}`}
                  placeholder="you@example.com or 01XXXXXXXXX"
                />
              </div>

              {errors.login && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.login}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-brand-pink hover:bg-blush-500 text-white font-medium btn-magnetic shadow-glow mt-2"
            >
              {passwordRequired ? "Send" : "Send recovery code"}
            </button>
          </form>}

          {passwordRequired && <form onSubmit={handlePassword} className="space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-ink-700 mb-1.5 block">Password</label>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />

                <input type="password" value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-cream-50 outline-none ${errors.password
                    ? "border-blush-500"
                    : "border-ink-100 focus:border-sage-400"
                    }`}
                  placeholder="••••••••"
                />
              </div>

              {errors.password && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.password}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-brand-pink hover:bg-blush-500 text-white font-medium btn-magnetic shadow-glow mt-2"
              >
                Change the password
              </button>
            </div>

          </form>}

          <p className="text-center text-sm text-ink-500 mt-6">
            Don&apos;t have an account? <Link href="/login" className="text-rose-danger font-medium">Back to sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
