import { BarChart3 } from "lucide-react";
import { PlaceholderPage } from "../../../shared/ui/PlaceholderPage";

export function DailyReportPage() {
  return (
    <PlaceholderPage
      icon={<BarChart3 className="h-7 w-7" />}
      eyebrow="Report"
      title="Daily Report"
      description="Dashboard ringkasan harian untuk Admin & PIC — metrik patroli, temuan, dan aktivitas armada. Fitur sedang disiapkan."
    />
  );
}
