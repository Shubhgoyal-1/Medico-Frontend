import React, { useState } from 'react'
import { HealthRecord } from '../../HealthRecord'
import { useRecords } from '@/hooks/useRecords';
import { FileText, Download, Filter, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const RECORD_TYPES = ['All Records', 'Consultations', 'Lab Results', 'Procedures'];

export function Records() {
    const {
        records,
        loadingRecord,
        errorRecord,
        page,
        total,
        totalPages,
        nextPage,
        prevPage,
    } = useRecords(1, 10);

    const [selectedType, setSelectedType] = useState('All Records');
    const [filterOpen, setFilterOpen] = useState(false);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
                        <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Health Records</h2>
                        <p className="text-xs text-gray-500">
                            {total >= 0 ? `${total} record${total !== 1 ? 's' : ''}` : 'Loading...'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Filter Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setFilterOpen(!filterOpen)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 font-medium hover:border-teal-300 hover:text-teal-700 transition-colors shadow-sm"
                        >
                            <Filter className="w-4 h-4" />
                            {selectedType}
                            <ChevronDown className={`w-4 h-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {filterOpen && (
                            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                                {RECORD_TYPES.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => { setSelectedType(type); setFilterOpen(false); }}
                                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                            selectedType === type
                                                ? 'bg-teal-50 text-teal-700 font-medium'
                                                : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Download */}
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-all shadow-md shadow-blue-100 hover:-translate-y-0.5 duration-200">
                        <Download className="w-4 h-4" /> Download
                    </button>
                </div>
            </div>

            {/* Records List */}
            <div className="space-y-4">
                {loadingRecord && (
                    <>{[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}</>
                )}
                {errorRecord && (
                    <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                        <p className="text-red-500 text-sm">{errorRecord}</p>
                    </div>
                )}
                {!loadingRecord && records && records.length === 0 && (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-blue-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-600 mb-1">No Health Records</h3>
                        <p className="text-sm text-gray-400">Your health records will appear here once added by your doctor.</p>
                    </div>
                )}
                {records?.map((record: any, index: number) => {
                    const formattedDate = new Date(record.diagnosisDate).toLocaleDateString("en-US", {
                        weekday: "long", year: "numeric", month: "long", day: "numeric",
                    });
                    return <HealthRecord key={index} {...record} diagnosisDate={formattedDate} />;
                })}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
                        <span className="text-xs text-gray-500 font-medium">
                            Showing Page <span className="font-bold text-gray-800">{page}</span> of <span className="font-bold text-gray-800">{totalPages}</span> ({total} Records)
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
        </div>
    )
}
