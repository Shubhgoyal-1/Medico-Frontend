import React from 'react';
import { Building2, MapPin, ArrowRight } from 'lucide-react';

export function HospitalCard({ name, address, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className="w-72 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 p-5 flex flex-col justify-between group cursor-pointer flex-shrink-0"
        >
            <div>
                {/* Hospital Header Icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-105 transition-transform">
                    <Building2 className="w-7 h-7 text-white" />
                </div>

                {/* Info */}
                <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-teal-600 transition-colors line-clamp-1">
                    {name}
                </h3>
                <div className="flex items-start gap-1.5 text-xs text-gray-500 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="line-clamp-2 text-gray-600 font-medium leading-relaxed">
                        {address || 'Medical Complex Center'}
                    </p>
                </div>
            </div>

            {/* Action */}
            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs font-semibold text-teal-600 group-hover:text-teal-700">
                <span>View Details & Doctors</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
    );
}
