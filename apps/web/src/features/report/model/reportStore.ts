import { create } from "zustand";
import type { DailyReport } from "@smartpatrol/contracts";
import { useAuthStore } from "../../auth/model/authStore";
import { reportApi } from "../api/reportApi";

interface ReportState {
  report: DailyReport | null;
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  load: (date: string) => Promise<void>;
}

export const useReportStore = create<ReportState>((set) => ({
  report: null,
  status: "idle",
  error: null,

  load: async (date) => {
    set({ status: "loading", error: null });
    try {
      const report = await useAuthStore.getState().authedRequest((at) => reportApi.daily(at, date));
      set({ report, status: "ready" });
    } catch (err) {
      set({
        status: "error",
        error: err instanceof Error ? err.message : "Gagal memuat laporan",
      });
    }
  },
}));
