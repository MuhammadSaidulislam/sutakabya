export type SendOtpParams = {
  phone?: string;
  email?: string;
  purpose?: "registration" | "password_reset";
};

export type SendOtpResult = {
  success: boolean;
  message: string;
  token?: string;
};

export const sendOtp = async ({
  phone,
  email,
  purpose = "password_reset",
}: SendOtpParams): Promise<SendOtpResult> => {
  try {
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: phone || null,
        email: email || null,
        purpose,
      }),
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      return {
        success: false,
        message:
          result.message ||
          "We couldn't send the OTP. Please check your information and try again.",
      };
    }

    return {
      success: true,
      message: result.message || "OTP sent successfully.",
      token: result.token,
    };
  } catch (error) {
    console.error("Send OTP error:", error);

    return {
      success: false,
      message:
        "Something went wrong while sending the OTP. Please try again.",
    };
  }
};