import { FileText } from "lucide-react";
import { PlaceholderPage } from "../../../shared/ui/PlaceholderPage";

export function HistoryPage() {
  return (
    <PlaceholderPage
      icon={<FileText className="h-7 w-7" />}
      eyebrow="Laporan"
      title="Riwayat Patroli"
      description="Rekap hasil patroli per shift (aman, temuan, terlewat) akan tersedia di sini. Fitur sedang disiapkan."
    />
  );
}
