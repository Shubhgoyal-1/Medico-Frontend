import React, { useEffect, useState } from 'react'
import { MedicationCard } from '../cards/MedicationCard'
import { useMedications } from '../../../hooks/useMedications';
import { Search, Pill, X, ChevronLeft, ChevronRight } from "lucide-react";

export function Medication() {
    const {
        medications,
        loadingMedication,
        errorMedication,
        page,
        total,
        totalPages,
        nextPage,
        prevPage,
    } = useMedications(1, 10);

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedTerm(searchTerm), 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const filteredMeds = medications?.filter((med) => {
        const matchesSearch = med.medicationId?.name.toLowerCase().includes(debouncedTerm.toLowerCase());
        const matchesFilter =
            filter === 'all'      ? true :
            filter === 'active'   ? med.active !== false :
            med.active === false;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
                    <Pill className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Medications</h2>
                    <p className="text-xs text-gray-500">
                        {total >= 0 ? `${total} Meds Currently` : 'Loading...'}
                    </p>
                </div>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all shadow-sm"
                        type="text"
                        placeholder="Search medications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Filter pills — blue active, teal hover */}
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                    {(['all', 'active', 'inactive'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                                filter === f
                                    ? 'bg-blue-500 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-teal-700 hover:bg-teal-50'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[350px]">
                <div>
                    {loadingMedication && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}
                        </div>
                    )}
                    {errorMedication && <p className="text-red-500 text-sm text-center py-8">{errorMedication}</p>}

                    {!loadingMedication && filteredMeds && filteredMeds.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                                <Pill className="w-8 h-8 text-blue-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-600 mb-1">No medications found</h3>
                            <p className="text-sm text-gray-400">
                                {searchTerm ? `No results for "${searchTerm}"` : 'No medications in this category'}
                            </p>
                        </div>
                    )}

                    {filteredMeds && filteredMeds.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredMeds.map((med) => (
                                <div key={med._id} className="cursor-pointer">
                                    <MedicationCard {...med} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
                        <span className="text-xs text-gray-500 font-medium">
                            Page <span className="font-bold text-gray-800">{page}</span> of <span className="font-bold text-gray-800">{totalPages}</span> ({total} Medications)
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
