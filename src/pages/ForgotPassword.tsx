import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { User, Lock, Stethoscope, Eye, EyeOff, Mail, KeyRound } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import img from "../../Public/Screenshot 2024-11-21 160510_processed.png";
import { PATIENT_API, DOCTOR_API } from "@/config/api";

type UserType = "patient" | "doctor";

interface EmailFormData {
  email: string;
}

interface ResetFormData {
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

function apiMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === "doctor" ? "doctor" : "patient";

  const [userType, setUserType] = useState<UserType>(initialRole);
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const emailForm = useForm<EmailFormData>();
  const resetForm = useForm<ResetFormData>();

  const requestOtp = async (targetEmail: string) => {
    const endpoint =
      userType === "patient"
        ? `${PATIENT_API}/forgotPatientPassword`
        : `${DOCTOR_API}/forgotDoctorPassword`;

    await axios.post(endpoint, { email: targetEmail });
  };

  const onRequestOtp = async (data: EmailFormData) => {
    setSending(true);
    try {
      await requestOtp(data.email.trim());
      setEmail(data.email.trim());
      setStep("reset");
      resetForm.reset();
      toast.success("Reset code sent to your email");
    } catch (error) {
      toast.error(apiMessage(error, "Could not send reset code"));
    } finally {
      setSending(false);
    }
  };

  const onResend = async () => {
    if (!email) return;
    setSending(true);
    try {
      await requestOtp(email);
      toast.success("A new reset code was sent");
    } catch (error) {
      toast.error(apiMessage(error, "Could not resend reset code"));
    } finally {
      setSending(false);
    }
  };

  const onResetPassword = async (data: ResetFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      resetForm.setError("confirmPassword", { message: "Passwords do not match" });
      return;
    }
    resetForm.clearErrors("confirmPassword");

    setResetting(true);
    try {
      const endpoint =
        userType === "patient"
          ? `${PATIENT_API}/changePassword`
          : `${DOCTOR_API}/changeDoctorPassword`;

      await axios.post(endpoint, {
        email,
        otp: data.otp.trim(),
        newPassword: data.newPassword,
      });

      toast.success("Password updated. Sign in with your new password.");
      navigate("/signin", { replace: true });
    } catch (error) {
      toast.error(apiMessage(error, "Could not reset password"));
    } finally {
      setResetting(false);
    }
  };

  const switchRole = (role: UserType) => {
    setUserType(role);
    setStep("email");
    setEmail("");
    emailForm.reset();
    resetForm.reset();
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center gap-2">
          <img className="w-16 h-16 text-blue-500" src={img} alt="Medico" />
          <h1 className="text-3xl font-bold text-gray-900">Medico</h1>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === "email"
            ? "We'll email a 6-digit code to this account."
            : `Enter the code sent to ${email}`}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => switchRole("patient")}
              className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center gap-2 ${
                userType === "patient"
                  ? "bg-blue-50 text-blue-700 border-2 border-blue-500"
                  : "bg-gray-50 text-gray-500 border-2 border-transparent"
              }`}
            >
              <User className="w-5 h-5" />
              Patient
            </button>
            <button
              type="button"
              onClick={() => switchRole("doctor")}
              className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center gap-2 ${
                userType === "doctor"
                  ? "bg-blue-50 text-blue-700 border-2 border-blue-500"
                  : "bg-gray-50 text-gray-500 border-2 border-transparent"
              }`}
            >
              <Stethoscope className="w-5 h-5" />
              Doctor
            </button>
          </div>

          {step === "email" ? (
            <form className="space-y-6" onSubmit={emailForm.handleSubmit(onRequestOtp)}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {userType === "patient" ? "Patient email" : "Doctor email"}
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder={userType === "patient" ? "patient@email.com" : "doctor@email.com"}
                    {...emailForm.register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email",
                      },
                    })}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {emailForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60"
              >
                {sending ? "Sending code..." : "Send reset code"}
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={resetForm.handleSubmit(onResetPassword)}>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Reset code
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit code"
                    {...resetForm.register("otp", {
                      required: "Reset code is required",
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message: "Code must be 6 digits",
                      },
                    })}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {resetForm.formState.errors.otp && (
                  <p className="mt-1 text-sm text-red-500">{resetForm.formState.errors.otp.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    {...resetForm.register("newPassword", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                    className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {resetForm.formState.errors.newPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {resetForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repeat new password"
                    {...resetForm.register("confirmPassword", {
                      required: "Confirm your password",
                    })}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {resetForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">
                    {resetForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={resetting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60"
              >
                {resetting ? "Updating password..." : "Update password"}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="font-medium text-gray-600 hover:text-gray-800"
                >
                  Use a different email
                </button>
                <button
                  type="button"
                  onClick={onResend}
                  disabled={sending}
                  className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-60"
                >
                  {sending ? "Sending..." : "Resend code"}
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            Remembered it?{" "}
            <Link to="/signin" className="font-medium text-blue-600 hover:text-blue-500">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
