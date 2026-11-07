import axios from "axios";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/auth";

interface FormData {
    otp: string;
}

import { API } from "@/config/api";

const RESEND_COOLDOWN_SECONDS = 60;

function VerifyOtp() {
    const navigate = useNavigate();
    const { user, email } = useParams<{ email: string, user: string }>();
    const decodedEmail = email ? decodeURIComponent(email) : "";
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(decodedEmail);
    const isDoctor = user === "doctor";

    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>();

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    if (!decodedEmail || !isValidEmail || (user !== "patient" && user !== "doctor")) {
        return <div>Invalid verification link</div>
    }

    const onSubmit = async (data: FormData) => {
        try {
            const endpoint = isDoctor ? `${API}/doctor/verifyOtpDoctor` : `${API}/verifyOtp`;
            await axios.post(endpoint, { email: decodedEmail, otp: data.otp.trim() });
            toast.success("Account verified. You can sign in now.");
            navigate('/signin');
        } catch (error: any) {
            toast.error(apiErrorMessage(error, "OTP verification failed"));
        }
    };

    const onResend = async () => {
        setResending(true);
        try {
            const endpoint = isDoctor ? `${API}/doctor/resendOtpDoctor` : `${API}/resendOtp`;
            await axios.post(endpoint, { email: decodedEmail });
            toast.success("A new code is on its way to your email");
            setCooldown(RESEND_COOLDOWN_SECONDS);
        } catch (error: any) {
            toast.error(apiErrorMessage(error, "Could not resend the code"));
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-transparent">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Verify OTP</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* OTP Input */}
                    <div>
                        <label className="block text-gray-700 mb-2">OTP</label>
                        <input
                            type="text"
                            maxLength={6}
                            placeholder="Enter 6-digit OTP"
                            {...register("otp", {
                                required: "OTP is required",
                                pattern: {
                                    value: /^[0-9]{6}$/,
                                    message: "OTP must be 6 digits",
                                },
                            })}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.otp && (
                            <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
                    >
                        {isSubmitting ? "Verifying..." : "Verify"}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-4">
                    Didn’t receive OTP?{" "}
                    <button
                        type="button"
                        onClick={onResend}
                        disabled={resending || cooldown > 0}
                        className="text-blue-600 font-semibold hover:underline disabled:text-gray-400 disabled:no-underline"
                    >
                        {resending ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend"}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default VerifyOtp;
