import { useEffect, useState } from "react";
import axios from "axios";

import { API } from "@/config/api";
import { PatientMedication } from "@/types";
import { AUTH_CHANGED_EVENT } from "@/lib/auth";

type MedicationStatus = "all" | "active";

const medicationsCache: Record<string, { data: PatientMedication[]; total: number; totalPages: number }> = {};

window.addEventListener(AUTH_CHANGED_EVENT, () => {
    Object.keys(medicationsCache).forEach((k) => delete medicationsCache[k]);
});

function cacheKey(status: MedicationStatus, page: number) {
    return `${status}:${page}`;
}

export function useMedications(initialPage: number = 1, limit: number = 10, status: MedicationStatus = "all") {
    const initialKey = cacheKey(status, initialPage);
    const [page, setPage] = useState(initialPage);
    const [medications, setMedications] = useState<PatientMedication[]>(medicationsCache[initialKey]?.data || []);
    const [total, setTotal] = useState<number>(medicationsCache[initialKey]?.total || 0);
    const [totalPages, setTotalPages] = useState<number>(medicationsCache[initialKey]?.totalPages || 1);
    const [loadingMedication, setLoadingMedication] = useState<boolean>(!medicationsCache[initialKey]);
    const [errorMedication, setErrorMedication] = useState<string | null>(null);

    const fetchMedications = async (targetPage: number, force: boolean = false) => {
        const key = cacheKey(status, targetPage);
        if (!force && medicationsCache[key]) {
            setMedications(medicationsCache[key].data);
            setTotal(medicationsCache[key].total);
            setTotalPages(medicationsCache[key].totalPages);
            setLoadingMedication(false);
            return;
        }

        try {
            setLoadingMedication(true);
            setErrorMedication(null);
            const res = await axios.get(`${API}/getPatientMedications`, {
                params: { page: targetPage, limit, status },
                withCredentials: true
            });

            let items: PatientMedication[] = [];
            let totalCount = 0;
            let pagesCount = 1;

            if (Array.isArray(res.data?.data)) {
                items = res.data.data;
                totalCount = items.length;
                pagesCount = Math.ceil(totalCount / limit) || 1;
            } else if (res.data?.data?.medications) {
                items = res.data.data.medications;
                totalCount = res.data.data.pagination?.total ?? items.length;
                pagesCount = res.data.data.pagination?.totalPages ?? (Math.ceil(totalCount / limit) || 1);
            }

            medicationsCache[key] = { data: items, total: totalCount, totalPages: pagesCount };
            setMedications(items);
            setTotal(totalCount);
            setTotalPages(pagesCount);
        } catch (err: any) {
            setErrorMedication(err.response?.data?.message || "Failed to fetch medications");
        } finally {
            setLoadingMedication(false);
        }
    };

    useEffect(() => {
        fetchMedications(page);
    }, [page, status]);

    const clearCache = () => {
        Object.keys(medicationsCache).forEach((k) => delete medicationsCache[k]);
    };

    return {
        medications,
        loadingMedication,
        errorMedication,
        page,
        total,
        totalPages,
        setPage,
        nextPage: () => setPage((p) => Math.min(totalPages, p + 1)),
        prevPage: () => setPage((p) => Math.max(1, p - 1)),
        refetch: () => {
            clearCache();
            fetchMedications(page, true);
        }
    };
}
