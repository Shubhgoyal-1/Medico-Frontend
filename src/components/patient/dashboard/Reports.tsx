import React, { useEffect, useState } from "react";
import { X, ClipboardList, Upload, FileUp, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { ReportCard } from "../cards/ReportCard";
import { useReports } from "@/hooks/useReports";
import { useForm } from "react-hook-form";
import axios from "axios";

type ReportFormInputs = {
  name: string;
  date: string;
  file: FileList;
};

import { API } from "@/config/api";

export function Reports() {
  const {
    reports,
    loadingReport,
    errorReport,
    page,
    total,
    totalPages,
    nextPage,
    prevPage,
    refetch,
  } = useReports(1, 10);

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReportFormInputs>();

  const fileWatch = watch("file");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const onSubmit = async (data: ReportFormInputs) => {
    if (!data.file || data.file.length === 0) { alert("Please upload a file"); return; }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("reportName", data.name);
      formData.append("reportFile", data.file[0]);
      await axios.post(`${API}/addPatientReport`, formData, { withCredentials: true });
      setOpen(false);
      reset();
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Medical Reports</h2>
            <p className="text-xs text-gray-500">
              {total >= 0 ? `${total} report${total !== 1 ? 's' : ''}` : 'Loading...'}
            </p>
          </div>
        </div>
        {/* Blue upload button */}
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-all shadow-md shadow-blue-100 hover:shadow-blue-200 hover:-translate-y-0.5 duration-200"
        >
          <Upload className="w-4 h-4" /> Upload Report
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 gap-4">
        {loadingReport && (
          <>{[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}</>
        )}
        {errorReport && (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
            <p className="text-red-600 text-sm">Failed to load reports.</p>
          </div>
        )}
        {!loadingReport && reports && reports.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-blue-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-1">No Reports Yet</h3>
            <p className="text-sm text-gray-400 mb-5">Upload your medical reports to keep everything in one place.</p>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 shadow-md"
            >
              <Upload className="w-4 h-4" /> Upload First Report
            </button>
          </div>
        )}
        {reports?.map((report: any, index: number) => {
          const formattedDate = new Date(report.reportDate).toLocaleDateString("en-US", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          });
          return <ReportCard key={index} {...report} reportDate={formattedDate} />;
        })}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border border-gray-100 rounded-2xl bg-white shadow-sm mt-2">
            <span className="text-xs text-gray-500 font-medium">
              Showing Page <span className="font-bold text-gray-800">{page}</span> of <span className="font-bold text-gray-800">{totalPages}</span> ({total} Reports)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={prevPage}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={nextPage}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {open && (
        <div className="fixed inset-0 z-50" aria-modal="true" role="dialog" aria-labelledby="add-report-title">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative z-10 mx-auto mt-16 w-[90%] max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <FileUp className="w-4 h-4 text-white" />
                </div>
                <h3 id="add-report-title" className="text-lg font-semibold text-white">Upload Report</h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Report Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("name", { required: "Report name is required" })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  placeholder="e.g., CBC, X-Ray Chest, MRI Brain"
                />
                {errors.name && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-xs">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.name.message}
                  </div>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Report Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("date", { required: "Report date is required" })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                />
                {errors.date && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-xs">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.date.message}
                  </div>
                )}
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Upload File <span className="text-red-500">*</span>
                </label>
                <div className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  fileWatch?.length > 0
                    ? 'border-teal-300 bg-teal-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                }`}>
                  <input
                    type="file"
                    {...register("file", { required: true })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  {fileWatch?.length > 0 ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                        <FileUp className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-teal-700">{fileWatch[0].name}</p>
                        <p className="text-xs text-teal-500">{(fileWatch[0].size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold text-blue-500">Click to upload</span> or drag & drop
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                    </div>
                  )}
                </div>
                {errors.file && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-xs">
                    <AlertCircle className="w-3.5 h-3.5" /> File is required
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setOpen(false); reset(); }}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Uploading...' : 'Save Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
