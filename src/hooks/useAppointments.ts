import { useEffect, useState } from "react";
import axios from "axios";

import { API } from "@/config/api";
import { Appointment } from "@/types";
import { AUTH_CHANGED_EVENT } from "@/lib/auth";

const appointmentsCache: Record<number, { data: Appointment[]; total: number; totalPages: number }> = {};

export const APPOINTMENTS_INVALIDATED_EVENT = "appointments-invalidated";

export function invalidateAppointments() {
  window.dispatchEvent(new Event(APPOINTMENTS_INVALIDATED_EVENT));
}

window.addEventListener(AUTH_CHANGED_EVENT, () => {
  Object.keys(appointmentsCache).forEach((k) => delete appointmentsCache[Number(k)]);
});

export const useAppointments = (initialPage: number = 1, limit: number = 10) => {
  const [page, setPage] = useState(initialPage);
  const [appointments, setAppointments] = useState<Appointment[]>(appointmentsCache[initialPage]?.data || []);
  const [total, setTotal] = useState<number>(appointmentsCache[initialPage]?.total || 0);
  const [totalPages, setTotalPages] = useState<number>(appointmentsCache[initialPage]?.totalPages || 1);
  const [loadingAppointment, setLoadingAppointment] = useState<boolean>(!appointmentsCache[initialPage]);
  const [errorAppointment, setErrorAppointment] = useState<string | null>(null);

  const fetchAppointments = async (targetPage: number, force: boolean = false) => {
    if (!force && appointmentsCache[targetPage]) {
      setAppointments(appointmentsCache[targetPage].data);
      setTotal(appointmentsCache[targetPage].total);
      setTotalPages(appointmentsCache[targetPage].totalPages);
      setLoadingAppointment(false);
      return;
    }

    try {
      setLoadingAppointment(true);
      setErrorAppointment(null);
      const res = await axios.get(`${API}/getPatientAppointments`, {
        params: { page: targetPage, limit },
        withCredentials: true,
      });

      let items: Appointment[] = [];
      let totalCount = 0;
      let pagesCount = 1;

      if (Array.isArray(res.data?.data)) {
        items = res.data.data;
        totalCount = items.length;
        pagesCount = Math.ceil(totalCount / limit) || 1;
      } else if (res.data?.data?.appointments) {
        items = res.data.data.appointments;
        totalCount = res.data.data.pagination?.total ?? items.length;
        pagesCount = res.data.data.pagination?.totalPages ?? (Math.ceil(totalCount / limit) || 1);
      }

      appointmentsCache[targetPage] = { data: items, total: totalCount, totalPages: pagesCount };
      setAppointments(items);
      setTotal(totalCount);
      setTotalPages(pagesCount);
    } catch (err: any) {
      setErrorAppointment(err.response?.data?.message || "Failed to fetch appointments");
    } finally {
      setLoadingAppointment(false);
    }
  };

  useEffect(() => {
    fetchAppointments(page);
  }, [page]);

  const clearCache = () => {
    Object.keys(appointmentsCache).forEach((k) => delete appointmentsCache[Number(k)]);
  };

  useEffect(() => {
    const handleInvalidated = () => {
      clearCache();
      fetchAppointments(page, true);
    };
    window.addEventListener(APPOINTMENTS_INVALIDATED_EVENT, handleInvalidated);
    return () => window.removeEventListener(APPOINTMENTS_INVALIDATED_EVENT, handleInvalidated);
  }, [page]);

  return {
    appointments,
    loadingAppointment,
    errorAppointment,
    page,
    total,
    totalPages,
    setPage,
    nextPage: () => setPage((p) => Math.min(totalPages, p + 1)),
    prevPage: () => setPage((p) => Math.max(1, p - 1)),
    refetch: () => {
      clearCache();
      fetchAppointments(page, true);
    },
  };
};
