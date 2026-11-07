import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import img from "../../../Public/Screenshot 2024-11-21 160510_processed.png";
import statesWithCities from "../../constants/stateWithCities";
import { useHospitals } from "../../hooks/useHospitals";

type DoctorFormData = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gender: string;
    password: string;
    confirmPassword: string;
    aadharNo: string;
    specialization: string;
    experience: number;
    feePerVisit: number;
    licenseNumber: string;
    patientLimit: number;
    hospitalState?: string;
    hospitalCity?: string;
    hospitalName?: string;
    clinicState?: string;
    clinicCity?: string;
    clinicName?: string;
    clinicAddress?: string;
    workplaceType: "hospital" | "clinic";

    workplace: {
        type: "hospital" | "clinic";
        hospitalId?: string;
        name?: string;
        address?: string;
        city?: string;
        state?: string;
    };
};

import { DOCTOR_API as API } from "@/config/api";

export default function DoctorRegister() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const [workplaceType, setWorkplaceType] = useState<"hospital" | "clinic">("hospital");
    const [stateValue, setStateValue] = useState<string>("");
    const [cityValue, setCityValue] = useState<string>("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // const [hospitals, setHospitals] = useState<string[]>([]);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        trigger,
    } = useForm<DoctorFormData>({
        defaultValues: {
            workplace: { type: "hospital" },
        },
    });
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
    const state = watch('hospitalState') || ""
    const city = watch('hospitalCity') || ""

    const { hospitals, error, loading } = useHospitals(state, city)
    console.log("called")
    console.log(hospitals)

    // Final submit
    const onSubmit = async (data: DoctorFormData) => {
        setIsSubmitting(true);
        try {
            console.log(data)
            if (data.workplace.type == "clinic") {
                delete data.workplace.hospitalId
                delete data.hospitalState
                delete data.hospitalCity
            } else if (data.workplace.type == "hospital") {
                delete data.workplace.city
                delete data.workplace.name
                delete data.workplace.state
                delete data.workplace.address
            }
            const response = await axios.post(`${API}/registerDoctor`, data, {
                withCredentials: true,
            });
            console.log(response)

            if (response.status === 201) {
                toast.success("Registration successful");
                navigate(`/otpVerify/doctor/${encodeURIComponent(data.email)}`);
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
                </div>

                <div className="flex justify-center mb-6">
                    {[1, 2].map((s) => (
                        <div key={s} className="flex items-center">
                            <div
                                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium 
        ${step === s ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700"}`}
                            >
                                {s}
                            </div>
                            {s < 2 && <div className="w-10 h-1 bg-gray-300"></div>}
                        </div>
                    ))}
                </div>
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
                                {/* Specialization */}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Specialization
                                    </label>
                                    <input
                                        placeholder="Specialization"
                                        type="text"
                                        {...register("specialization", {
                                            required: "Specialization is required",
                                        })}
                                        className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
                                    />
                                    {errors.specialization && (
                                        <p className="text-red-500 text-sm">{errors.specialization.message}</p>
                                    )}
                                </div>
                                {/* Experience */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Experience
                                    </label>
                                    <input
                                        placeholder="in Years"
                                        type="number"
                                        {...register("experience", {
                                            required: "Experience is required",
                                        })}
                                        className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
                                    />
                                    {errors.experience && (
                                        <p className="text-red-500 text-sm">{errors.experience.message}</p>
                                    )}
                                </div>
                                {/* fees Per Visit */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Fees per Visit
                                    </label>
                                    <input
                                        placeholder="in Rupees"
                                        type="number"
                                        {...register("feePerVisit", {
                                            required: "Fees is required",
                                        })}
                                        className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
                                    />
                                    {errors.feePerVisit && (
                                        <p className="text-red-500 text-sm">{errors.feePerVisit.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Max No. of Patients per day
                                    </label>
                                    <input
                                        placeholder="Patients Limit"
                                        type="number"
                                        {...register("patientLimit", {
                                            required: "Fees is required",
                                        })}
                                        className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
                                    />
                                    {errors.patientLimit && (
                                        <p className="text-red-500 text-sm">{errors.patientLimit.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        License Number
                                    </label>
                                    <input
                                        placeholder="License Number"
                                        type="text"
                                        {...register("licenseNumber", {
                                            required: "Fees is required",
                                        })}
                                        className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
                                    />
                                    {errors.licenseNumber && (
                                        <p className="text-red-500 text-sm">{errors.licenseNumber.message}</p>
                                    )}
                                </div>

                                {/* WorkPlace Address */}
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Hospital or Clinic</label>
                                        <select
                                            {...register("workplace.type", { required: "Required" })}
                                            onChange={(e) => {
                                                register("workplace.type").onChange(e);
                                                setWorkplaceType(e.target.value as "hospital" | "clinic");
                                                setStateValue("");
                                            }}
                                            className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
                                        >
                                            <option value="hospital">Hospital</option>
                                            <option value="clinic">Clinic</option>
                                        </select>
                                    </div>

                                    {workplaceType === "clinic" && (
                                        <>

                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700">Clinic Address</label>
                                                <input
                                                    placeholder="Clinic Address"
                                                    {...register("workplace.address", { required: "Required" })}
                                                    className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Clinic Name</label>
                                                <input
                                                    placeholder="Clinic Name"
                                                    {...register("workplace.name")}
                                                    className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">State</label>
                                                <select
                                                    {...register("workplace.state", { required: "Required" })}
                                                    onChange={(e) => {
                                                        register("workplace.state").onChange(e);
                                                        setStateValue(e.target.value);
                                                    }}
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
                                                    {...register("workplace.city", { required: "Required" })}
                                                    className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
                                                    disabled={!stateValue}
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
                                    )}

                                    {workplaceType === "hospital" && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">State</label>
                                                <select
                                                    {...register("hospitalState", { required: "Required" })}
                                                    onChange={(e) => {
                                                        register("hospitalState").onChange(e);
                                                        setStateValue(e.target.value);
                                                    }}
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
                                                    {...register("hospitalCity", { required: "Required" })}
                                                    className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
                                                    disabled={!stateValue}
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
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700">Hospitals</label>
                                                <select
                                                    {...register("workplace.hospitalId", { required: "Required" })}
                                                    className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm"
                                                >
                                                    <option value="">Select Hospital</option>
                                                    {hospitals.map((h) => (
                                                        <option key={h._id} value={h._id}>
                                                            {h.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </>
                                    )}

                                </>
                            </div>
                        )}

                        <div className="flex justify-between">
                            {step > 1 && (
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded-md bg-gray-200 text-gray-700"
                                    onClick={() => setStep(step - 1)}
                                >
                                    Back
                                </button>
                            )}
                            {step < 2 ? (
                                <button
                                    type="button"
                                    className="ml-auto px-4 py-2 rounded-md bg-blue-600 text-white"
                                    onClick={handleNext}
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="ml-auto px-4 py-2 rounded-md bg-blue-600 text-white"
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
