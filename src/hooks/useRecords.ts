import { useEffect, useState } from "react";
import { Record as MedicalRecord } from "@/components/patient/dashboard/types";
import axios from "axios";

import { API } from "@/config/api";

const recordsCache: Record<number, { data: MedicalRecord[]; total: number; totalPages: number }> = {};

export const useRecords = (initialPage: number = 1, limit: number = 10) => {
    const [page, setPage] = useState(initialPage);
    const [records, setRecords] = useState<MedicalRecord[]>(recordsCache[initialPage]?.data || []);
    const [total, setTotal] = useState<number>(recordsCache[initialPage]?.total || 0);
    const [totalPages, setTotalPages] = useState<number>(recordsCache[initialPage]?.totalPages || 1);
    const [loadingRecord, setLoadingRecord] = useState<boolean>(!recordsCache[initialPage]);
    const [errorRecord, setErrorRecord] = useState<string | null>(null);

    const fetchRecords = async (targetPage: number, force: boolean = false) => {
        if (!force && recordsCache[targetPage]) {
            setRecords(recordsCache[targetPage].data);
            setTotal(recordsCache[targetPage].total);
            setTotalPages(recordsCache[targetPage].totalPages);
            setLoadingRecord(false);
            return;
        }

        try {
            setLoadingRecord(true);
            setErrorRecord(null);
            const res = await axios.get(`${API}/getPatientHistory`, {
                params: { page: targetPage, limit },
                withCredentials: true
            });

            let items: MedicalRecord[] = [];
            let totalCount = 0;
            let pagesCount = 1;

            if (Array.isArray(res.data?.data)) {
                items = res.data.data;
                totalCount = items.length;
                pagesCount = Math.ceil(totalCount / limit) || 1;
            } else if (res.data?.data?.records) {
                items = res.data.data.records;
                totalCount = res.data.data.pagination?.total ?? items.length;
                pagesCount = res.data.data.pagination?.totalPages ?? (Math.ceil(totalCount / limit) || 1);
            }

            recordsCache[targetPage] = { data: items, total: totalCount, totalPages: pagesCount };
            setRecords(items);
            setTotal(totalCount);
            setTotalPages(pagesCount);
        } catch (error: any) {
            setErrorRecord(error.response?.data?.message || "Failed to fetch health records");
        } finally {
            setLoadingRecord(false);
        }
    };

    useEffect(() => {
        fetchRecords(page);
    }, [page]);

    const clearCache = () => {
        Object.keys(recordsCache).forEach((k) => delete recordsCache[Number(k)]);
    };

    return {
        records,
        loadingRecord,
        errorRecord,
        page,
        total,
        totalPages,
        setPage,
        nextPage: () => setPage((p) => Math.min(totalPages, p + 1)),
        prevPage: () => setPage((p) => Math.max(1, p - 1)),
        refetch: () => {
            clearCache();
            fetchRecords(page, true);
        }
    };
};