"use client";

import React, { useState } from "react";
import Image from "next/image";
import { User } from "@/types/user";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "@/lib/toast";

const CustomerAccount = ({ profile }: { profile: User }) => {
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPreviousPassword, setShowPreviousPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
 
  const [form, setForm] = useState({
    name: profile.name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    gender: profile.gender || "",
  });

  const [password, setPassword] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setPassword((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      // Call your profile update API here
      console.log(form);

      setEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordError("");

    if (!password.current) {
      setPasswordError("Current password is required.");
      return;
    }

    if (!password.newPassword) {
      setPasswordError("New password is required.");
      return;
    }

    if (password.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    if (!password.confirm) {
      setPasswordError("Please confirm your new password.");
      return;
    }

    if (password.newPassword !== password.confirm) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/user/auth/password-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: password.current,
          newPassword: password.newPassword,
          confirmPassword: password.confirm,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(
          data.message || "Failed to change password."
        );
        return;
      }

        toast({
        message:
          data.message ||
          "Password updated successfully. You are now logged in.",
        type: "success",
        position: "top-right",
      });

      setPassword({
        current: "",
        newPassword: "",
        confirm: "",
      });

      setShowPassword(false);
    } catch (error) {
      console.error("Update password error:", error);

      setPasswordError(
        "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="space-y-5">

      {/* ========================================================= */}
      {/* PROFILE */}
      {/* ========================================================= */}

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_4px_25px_rgba(0,0,0,0.03)]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EDE5DD] px-5 py-5 sm:px-7">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.25em] text-coral-400">
              Personal
            </p>

            <h2 className="mt-1 font-serif text-xl text-ink-900">
              Account Details
            </h2>
          </div>

          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="
                rounded-full
                border border-ink-200
                px-4 py-2
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.15em]
                text-ink-700
                transition-all
                hover:border-coral-400
                hover:bg-coral-50
                hover:text-coral-500
              "
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);

                  setForm({
                    name: profile.name || "",
                    email: profile.email || "",
                    phone: profile.phone || "",
                    gender: profile.gender || "",
                  });
                }}
                className="
                  rounded-full
                  px-4 py-2
                  text-[10px]
                  border border-ink-soft
                  font-semibold
                  uppercase
                  tracking-[0.15em]
                  text-ink-500
                  hover:text-ink-800
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveProfile}
                className="
                  rounded-full
                  bg-brand-pink
                  px-5 py-2
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.15em]
                  text-white
                  transition-all
                  hover:bg-coral-500
                "
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="p-5 sm:p-7">

          {/* Profile Image */}
          <div className="mb-7 flex items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-cream-100">

              {profile.profile_image ? (
                <Image
                  src={profile.profile_image}
                  alt={profile.name || "Profile"}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="font-serif text-xl text-coral-500">
                  {profile.name?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <p className="font-medium text-ink-800">
                {profile.name}
              </p>

              <p className="mt-1 text-xs text-ink-400">
                Member since{" "}
                {new Date(profile.created_at).toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Fields */}
          <div className="grid gap-5 sm:grid-cols-2">

            {/* Name */}
            <div>
              <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-400">
                Full Name
              </label>

              {editing ? (
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="
                    w-full rounded-xl
                    border border-ink-200
                    bg-white
                    px-4 py-3
                    text-sm text-ink-800
                    outline-none
                    transition
                    focus:border-coral-400
                  "
                />
              ) : (
                <p className="rounded-xl bg-cream-50 px-4 py-3 text-sm text-ink-800">
                  {profile.name || "Not provided"}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-400">
                Email Address
              </label>

              {editing ? (
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="
                    w-full rounded-xl
                    border border-ink-200
                    bg-white
                    px-4 py-3
                    text-sm text-ink-800
                    outline-none
                    transition
                    focus:border-coral-400
                  "
                />
              ) : (
                <p className="rounded-xl bg-cream-50 px-4 py-3 text-sm text-ink-800">
                  {profile.email || "Not provided"}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-400">
                Phone Number
              </label>

              <p className="rounded-xl bg-cream-50 px-4 py-3 text-sm text-ink-800">
                {profile.phone || "Not provided"}
              </p>

              {editing && (
                <p className="mt-1.5 text-[10px] text-ink-400">
                  Phone number cannot be changed here.
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-400">
                Gender
              </label>

              {editing ? (
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="
                    w-full appearance-none rounded-xl
                    border border-ink-200
                    bg-white
                    px-4 py-3
                    text-sm text-ink-800
                    outline-none
                    focus:border-coral-400
                  "
                >
                  <option value="">Prefer not to say</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              ) : (
                <p className="rounded-xl bg-cream-50 px-4 py-3 text-sm text-ink-800">
                  {profile.gender
                    ? profile.gender.charAt(0) +
                    profile.gender.slice(1).toLowerCase()
                    : "Not provided"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECURITY */}
      {/* ========================================================= */}

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_4px_25px_rgba(0,0,0,0.03)]">

        <div className="flex items-center justify-between border-b border-[#EDE5DD] px-5 py-5 sm:px-7">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.25em] text-coral-400">
              Security
            </p>

            <h2 className="mt-1 font-serif text-xl text-ink-900">
              Password
            </h2>
          </div>

          {!showPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(true)}
              className="rounded-full  border border-ink-200  px-4 py-2 text-[10px]  font-semibold  uppercase  tracking-[0.15em]  text-ink-700  transition-all  hover:border-coral-400  hover:bg-coral-50  hover:text-coral-500 ">
              Change Password
            </button>
          )}
        </div>

        <div className="p-5 sm:p-7">

          {!showPassword ? (
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream-100 text-ink-600">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect
                    x="4"
                    y="10"
                    width="16"
                    height="10"
                    rx="2"
                  />
                  <path
                    d="M8 10V7a4 4 0 018 0v3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div>
                <p className="text-sm font-medium text-ink-800">
                  Your password is secure
                </p>

                <p className="mt-1 text-xs text-ink-400">
                  We recommend using a strong, unique password.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-xl space-y-5">

              {/* Current */}
              <div>
                <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-400">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPreviousPassword ? "text" : "password"}
                    name="current"
                    value={password.current}
                    onChange={handlePasswordChange}
                    className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-coral-400" />
                  <button
                    type="button"
                    onClick={() => setShowPreviousPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                    aria-label={showPreviousPassword ? "Hide password" : "Show password"}
                  >
                    {showPreviousPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                 
                </div>
                 {passwordError && (
                    <div className="mb-4 mt-1 text-[12px] font-medium text-rose-600">
                      {passwordError}
                    </div>
                  )}
              </div>

              {/* New */}
              <div>
                <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-400">
                  New Password
                </label>

                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={password.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full rounded-xl border border-border px-4 py-3 pr-11 text-sm outline-none transition focus:border-coral-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
               
              </div>

              {/* Confirm */}
              <div>
                <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-400">
                  Confirm New Password
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirm"
                    value={password.confirm}
                    onChange={handlePasswordChange}
                    className="w-full rounded-xl border border-border px-4 py-3 pr-11 text-sm outline-none transition focus:border-coral-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>

                {/* Instant validation message */}
                {password.confirm &&
                  password.newPassword !== password.confirm && (
                    <p className="mt-1.5 text-[11px] text-red-500">
                      Passwords do not match.
                    </p>
                  )}

                {password.confirm &&
                  password.newPassword === password.confirm && (
                    <p className="mt-1.5 text-[11px] text-green-600">
                      Passwords match.
                    </p>
                  )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPassword(false)} className="rounded-full border border-ink-soft px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-500">
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleUpdatePassword}
                  className="rounded-full bg-brand-pink px-5 py-2.5  text-[10px] font-semibold uppercase  tracking-[0.15em]  text-white transition hover:bg-coral-500 ">
                  Update Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerAccount;