import { useEffect, useState } from "react";
import { Report } from "@/components/patient/dashboard/types";
import axios from "axios";

import { API } from "@/config/api";

const reportsCache: Record<number, { data: Report[]; total: number; totalPages: number }> = {};

export const useReports = (initialPage: number = 1, limit: number = 10) => {
    const [page, setPage] = useState(initialPage);
    const [reports, setReports] = useState<Report[]>(reportsCache[initialPage]?.data || []);
    const [total, setTotal] = useState<number>(reportsCache[initialPage]?.total || 0);
    const [totalPages, setTotalPages] = useState<number>(reportsCache[initialPage]?.totalPages || 1);
    const [loadingReport, setLoadingReport] = useState<boolean>(!reportsCache[initialPage]);
    const [errorReport, setErrorReport] = useState<string | null>(null);

    const fetchReports = async (targetPage: number, force: boolean = false) => {
        if (!force && reportsCache[targetPage]) {
            setReports(reportsCache[targetPage].data);
            setTotal(reportsCache[targetPage].total);
            setTotalPages(reportsCache[targetPage].totalPages);
            setLoadingReport(false);
            return;
        }

        try {
            setLoadingReport(true);
            setErrorReport(null);
            const res = await axios.get(`${API}/getPatientReport`, {
                params: { page: targetPage, limit },
                withCredentials: true
            });

            let items: Report[] = [];
            let totalCount = 0;
            let pagesCount = 1;

            if (Array.isArray(res.data?.data)) {
                items = res.data.data;
                totalCount = items.length;
                pagesCount = Math.ceil(totalCount / limit) || 1;
            } else if (res.data?.data?.reports) {
                items = res.data.data.reports;
                totalCount = res.data.data.pagination?.total ?? items.length;
                pagesCount = res.data.data.pagination?.totalPages ?? (Math.ceil(totalCount / limit) || 1);
            }

            reportsCache[targetPage] = { data: items, total: totalCount, totalPages: pagesCount };
            setReports(items);
            setTotal(totalCount);
            setTotalPages(pagesCount);
        } catch (error: any) {
            setErrorReport(error.response?.data?.message || "Failed to fetch medical reports");
        } finally {
            setLoadingReport(false);
        }
    };

    useEffect(() => {
        fetchReports(page);
    }, [page]);

    const clearCache = () => {
        Object.keys(reportsCache).forEach((k) => delete reportsCache[Number(k)]);
    };

    return {
        reports,
        loadingReport,
        errorReport,
        page,
        total,
        totalPages,
        setPage,
        nextPage: () => setPage((p) => Math.min(totalPages, p + 1)),
        prevPage: () => setPage((p) => Math.max(1, p - 1)),
        refetch: () => {
            clearCache();
            fetchReports(page, true);
        }
    };
};