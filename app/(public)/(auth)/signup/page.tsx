'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, User } from 'lucide-react'
import { useRouter } from "next/navigation";
import { toast } from '@/lib/toast'
import OtpCode from '@/components/OtpCode'




export default function SignupPage() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({ name: '', emailOrPhone: '', password: '' })
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpToken, setOtpToken] = useState('');

  const router = useRouter();
  const sendOtp = async (phone: string) => {
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
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

      setPasswordRequired(true);
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

    await sendOtp(form.emailOrPhone);
  };

  const resetOtp = async () => {
    
    await sendOtp(form.emailOrPhone);
  }

  const handleOtpSubmit = async () => {

    const errors: Record<string, string> = {};

    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      setOtpError("Enter all 6 digits");
      return;
    }

    const verifyRes = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp: enteredOtp, token: otpToken }),
    });
    const verifyResult = await verifyRes.json();


    if (!verifyRes.ok || !verifyResult.success) {
      setOtpError(verifyResult.message || "Invalid or expired code");
      return; // 🚫 stop here — don't create the account
    }

    if (!form.name.trim()) {
      errors.name = "Name is required";
    }

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

    if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setErrors(errors);

    if (Object.keys(errors).length > 0) return;

    const isEmail = form.emailOrPhone.includes("@");

    const payload = {
      name: form.name,
      email: isEmail ? form.emailOrPhone : null,
      phone: isEmail ? null : form.emailOrPhone,
      password: form.password,
    };
    try {
      const res = await fetch("/api/user/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast({
          message: data.message || "Failed to create account.",
          type: "error",
          position: "top-right",
        });
        return;
      }

      toast({
        message: data.message || "Account created successfully.",
        type: "success",
        position: "top-right",
      });
      router.back();
      // Redirect or update UI here
      //  router.replace(callbackUrl);
    } catch (error) {
      console.error("Registration error:", error);

      toast({
        message: "Something went wrong. Please try again.",
        type: "error",
        position: "top-right",
      });
    }
  }

  return (
    <div className='w-full min-h-screen bg-cover bg-center bg-no-repeat' style={{ backgroundImage: "url('/images/login.png')" }}>
      <div className="mx-auto max-w-md px-5 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-cream-50 rounded-3xl shadow-soft p-8 sm:p-10">
          <h1 className="font-serif text-3xl text-ink-900 mb-2 text-center">Create Account</h1>
          <p className="text-ink-400 text-sm text-center mb-8">Join our community of mindful parents</p>
         {/* <OtpCode resetOtp={resetOtp} otp={otp} otpError={otpError} setOtp={setOtp} /> */}
          {passwordRequired && <div className="px-6 py-7 sm:px-8 sm:py-8">
            <label className="mb-3 block text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">
              Enter verification code
            </label>

            <OtpCode resetOtp={resetOtp} otp={otp} otpError={otpError} setOtp={setOtp} />
            <button onClick={handleOtpSubmit} type="button" className="w-full py-3.5 rounded-full bg-brand-pink hover:bg-blush-500 text-white font-medium btn-magnetic shadow-glow mt-2">
              Verify the account
            </button>
          </div>}
          {!passwordRequired && <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-ink-700 mb-1.5 block">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-cream-50 outline-none ${errors.name ? 'border-blush-500' : 'border-ink-100 focus:border-sage-400'}`}
                  placeholder="Jane Doe"
                />
              </div>
              {errors.name && <p className="text-xs text-blush-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-ink-700 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  value={form.emailOrPhone}
                  onChange={(e) => setForm({ ...form, emailOrPhone: e.target.value })}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-cream-50 outline-none ${errors.email ? 'border-blush-500' : 'border-ink-100 focus:border-sage-400'}`}
                  placeholder="Enter Email or Phone Number"
                />
              </div>
              {errors.emailOrPhone && <p className="text-xs text-blush-500 mt-1">{errors.emailOrPhone}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-ink-700 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-cream-50 outline-none ${errors.password ? 'border-blush-500' : 'border-ink-100 focus:border-sage-400'}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-xs text-blush-500 mt-1">{errors.password}</p>}
            </div>

            <button type="submit" className="w-full py-3.5 rounded-full bg-brand-pink hover:bg-blush-500 text-white font-medium btn-magnetic shadow-glow mt-2">
              Create Account
            </button>
          </form>}

          <p className="text-center text-sm text-ink-500 mt-6">
            Already have an account? <Link href="/login" className="text-brand-pink font-medium">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
