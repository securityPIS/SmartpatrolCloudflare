import { Bell } from "lucide-react";
import { PlaceholderPage } from "../../../shared/ui/PlaceholderPage";

export function NotificationsPage() {
  return (
    <PlaceholderPage
      icon={<Bell className="h-7 w-7" />}
      eyebrow="Notifikasi"
      title="Pusat Notifikasi"
      description="Pemberitahuan checkpoint, temuan, dan SOS akan tampil di sini secara realtime. Fitur sedang disiapkan."
    />
  );
}
