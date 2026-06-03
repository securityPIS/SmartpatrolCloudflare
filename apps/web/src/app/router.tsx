import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DashboardPage } from "../features/dashboard/ui/DashboardPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="*" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
