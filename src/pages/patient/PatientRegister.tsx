import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import img from "../../../Public/Screenshot 2024-11-21 160510_processed.png";
import statesWithCities from "../../constants/stateWithCities";

type PatientFormData = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dob: string;
    gender: string;
    bloodGroup: string;
    allergies: string;
    password: string;
    confirmPassword: string;
    aadharNo: string;
    fullAddress: {
        houseNumber: string;
        address: string;
        landmark?: string;
        city: string;
        state: string;
    };
};

import { API } from "@/config/api";

export default function PatientRegister() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const [stateValue, setStateValue] = useState<string>("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        trigger,
    } = useForm<PatientFormData>();
    //________________________________________________________________________________________________________________________________
    // Next step handler
    const handleNext = async () => {
        // const valid = await trigger([
        //     "firstName",
        //     "lastName",
        //     "email",
        //     "phone",
        //     "dob",
        //     "gender",
        //     "bloodGroup",
        //     "password",
        //     "confirmPassword",
        // ]);
        // if (valid) setStep(2);
        setStep(2);
    };

    // Final submit
    const onSubmit = async (data: PatientFormData) => {
        setIsSubmitting(true);
        try {
            const response = await axios.post(`${API}/register`, data, {
                withCredentials: true,
            });

            if (response.status === 201) {
                toast.success("Registration successful");
                navigate(`/otpVerify/patient/${encodeURIComponent(data.email)}`);
            }
        } catch (error: any) {
            if (error.response?.status === 409) {
                toast.error("User with this email/phone/Aadhar already exists!");
            } else {
                toast.error(error.response?.data?.message || "Registration failed");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Logo + Title */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2">
                        <img className="w-16 h-16" src={img} alt="logo" />
                        <h1 className="text-3xl font-bold text-gray-900">Medico</h1>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">Join Medico and take control of your health</p>
                </div>

                <div className="flex justify-center mb-6">
                    {[1, 2].map((s) => (
                        <div key={s} className="flex items-center">
                            <div
                                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-300 
        ${step === s ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "bg-gray-200 text-gray-600"}`}
                            >
                                {s}
                            </div>
                            {s < 2 && <div className={`w-10 h-1 transition-colors duration-300 ${step > s ? 'bg-teal-400' : 'bg-gray-200'}`}></div>}
                        </div>
                    ))}
                </div>
                <div className="bg-white py-8 px-4 shadow-lg sm:rounded-2xl sm:px-10 border border-gray-100">
                    <form
                        className="space-y-6"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        {step === 1 && (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {/* First Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        First Name
                                    </label>
                                    <input
                                        placeholder="First Name"
                                        {...register("firstName", { required: "First name is required" })}
                                        className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
                                    />
                                    {errors.firstName && (
                                        <p className="text-red-500 text-sm">{errors.firstName.message}</p>
                                    )}
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Last Name
                                    </label>
                                    <input
                                        placeholder="Last Name"
                                        {...register("lastName", { required: "Last name is required" })}
                                        className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
                                    />
                                    {errors.lastName && (
                                        <p className="text-red-500 text-sm">{errors.lastName.message}</p>
                                    )}
                                </div>

                                {/* Email */}
                                
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <div className="mt-1 relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            placeholder="Email"
                                            type="email"
                                            {...register("email", { required: "Email is required" })}
                                            className="block w-full pl-10 rounded-md border px-3 py-2 shadow-sm"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-red-500 text-sm">{errors.email.message}</p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Phone
                                    </label>
                                    <input
                                        placeholder="Phone Number"
                                        type="tel"
                                        {...register("phone", {
                                            required: "Phone is required",
                                            pattern: { value: /^[0-9]{10}$/, message: "Enter 10 digit number" },
                                        })}
                                        className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
                                    />
                                    {errors.phone && (
                                        <p className="text-red-500 text-sm">{errors.phone.message}</p>
                                    )}
                                </div>

                                {/* DOB */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        {...register("dob", { required: "Date of birth is required" })}
                                        className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
                                    />
                                    {errors.dob && (
                                        <p className="text-red-500 text-sm">{errors.dob.message}</p>
                                    )}
                                </div>

                                {/* Gender */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Gender
                                    </label>
                                    <select
                                        {...register("gender", { required: "Gender is required" })}
                                        className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
                                    >
                                        <option value="">Select gender</option>
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                    {errors.gender && (
                                        <p className="text-red-500 text-sm">{errors.gender.message}</p>
                                    )}
                                </div>

                                {/* Blood Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Blood Group
                                    </label>
                                    <select
                                        {...register("bloodGroup", { required: "Blood type is required" })}
                                        className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
                                    >
                                        <option value="">Select</option>
                                        <option>A+</option><option>A-</option>
                                        <option>B+</option><option>B-</option>
                                        <option>O+</option><option>O-</option>
                                        <option>AB+</option><option>AB-</option>
                                    </select>
                                    {errors.bloodGroup && (
                                        <p className="text-red-500 text-sm">{errors.bloodGroup.message}</p>
                                    )}
                                </div>

                                {/* Allergies */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Allergies
                                    </label>
                                    <input
                                        {...register("allergies")}
                                        placeholder="Separate with commas"
                                        className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
                                    />
                                    {errors.allergies && (
                                        <p className="text-red-500 text-sm">{errors.allergies.message}</p>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <div className="mt-1 relative">
                                        <input
                                            placeholder="Password"
                                            type={showPassword ? "text" : "password"}
                                            {...register("password", {
                                                required: "Password is required",
                                                minLength: { value: 6, message: "At least 6 characters" },
                                            })}
                                            className="block w-full rounded-md border px-3 py-2 pr-10 shadow-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Confirm Password
                                    </label>
                                    <div className="mt-1 relative">
                                        <input
                                            placeholder="Confirm Password"
                                            type={showConfirmPassword ? "text" : "password"}
                                            {...register("confirmPassword", {
                                                validate: (v) => v === watch("password") || "Passwords do not match",
                                            })}
                                            className="block w-full rounded-md border px-3 py-2 pr-10 shadow-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/*Form part 2 */}

                        {step === 2 && (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {/* Aadhar */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Aadhar Number
                                    </label>
                                    <input
                                        placeholder="Aadhar Number"
                                        type="text"
                                        maxLength={12}
                                        {...register("aadharNo", {
                                            required: "Aadhar number is required",
                                            pattern: { value: /^\d{12}$/, message: "Must be 12 digits" },
                                        })}
                                        onInput={(e) => {
                                            const target = e.target as HTMLInputElement;
                                            target.value = target.value.replace(/\D/g, "");
                                        }}
                                        className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
                                    />
                                    {errors.aadharNo && (
                                        <p className="text-red-500 text-sm">{errors.aadharNo.message}</p>
                                    )}

                                </div>
                                {/* Address */}
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">House Number</label>
                                        <input
                                            placeholder="House Number"
                                            {...register("fullAddress.houseNumber", { required: "Required" })}
                                            className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Street Address</label>
                                        <input
                                            placeholder="Street Address"
                                            {...register("fullAddress.address", { required: "Required" })}
                                            className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Landmark</label>
                                        <input
                                            placeholder="Landmark"
                                            {...register("fullAddress.landmark")}
                                            className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">State</label>
                                        <select
                                            {...register("fullAddress.state", { required: "Required" })}
                                            onChange={(e) => setStateValue(e.target.value)} // update selected state
                                            className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
                                        >
                                            <option value="">Select State</option>
                                            {statesWithCities.map((s) => (
                                                <option key={s.state} value={s.state}>
                                                    {s.state}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">City</label>
                                        <select
                                            {...register("fullAddress.city", { required: "Required" })}
                                            className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
                                            disabled={!stateValue} // disable until a state is selected
                                        >
                                            <option value="">Select City</option>
                                            {statesWithCities
                                                .find((s) => s.state === stateValue)
                                                ?.cities.map((c) => (
                                                    <option key={c} value={c}>
                                                        {c}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </>
                            </div>
                        )}

                        <div className="flex justify-between">
                            {step > 1 && (
                                <button
                                    type="button"
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                                    onClick={() => setStep(step - 1)}
                                >
                                    Back
                                </button>
                            )}
                            {step < 2 ? (
                                <button
                                    type="button"
                                    className="ml-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold hover:from-teal-600 hover:to-teal-700 transition-all shadow-md shadow-teal-100"
                                    onClick={handleNext}
                                >
                                    Next Step →
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="ml-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold hover:from-teal-600 hover:to-teal-700 transition-all shadow-md shadow-teal-100 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Submitting..." : "Register"}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
