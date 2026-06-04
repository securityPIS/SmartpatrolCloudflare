import { useEffect } from "react";
import { AlertOctagon, Bell, CheckCheck, ClipboardCheck, MapPin, Siren } from "lucide-react";
import type { Notification } from "@smartpatrol/contracts";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { useNotificationStore } from "../model/notificationStore";
import { formatTimeAgo, kindMeta, type KindMeta } from "../lib/notificationView";

function KindIcon({ icon }: { icon: KindMeta["icon"] }) {
  const cls = "h-5 w-5";
  switch (icon) {
    case "siren":
      return <Siren className={cls} />;
    case "alert":
      return <AlertOctagon className={cls} />;
    case "map-pin":
      return <MapPin className={cls} />;
    case "clipboard":
      return <ClipboardCheck className={cls} />;
    case "bell":
      return <Bell className={cls} />;
  }
}

function NotificationCard({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (id: string) => void;
}) {
  const meta = kindMeta(notification.kind);
  const unread = notification.readAt === null;

  return (
    <button
      type="button"
      onClick={() => unread && onRead(notification.id)}
      className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
        unread
          ? "border-cyan-500/30 bg-cyan-950/30 hover:bg-cyan-900/30"
          : "border-cyan-900/40 bg-[#0b1229] hover:bg-cyan-950/20"
      }`}
    >
      <span
        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${meta.className}`}
      >
        <KindIcon icon={meta.icon} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${meta.className}`}
          >
            {meta.label}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-cyan-600">
            {formatTimeAgo(notification.createdAt)}
          </span>
        </div>
        <p className={`mt-1 truncate font-bold ${unread ? "text-cyan-50" : "text-cyan-200/80"}`}>
          {notification.title}
        </p>
        {notification.body && (
          <p className="mt-0.5 line-clamp-2 text-sm text-cyan-300/70">{notification.body}</p>
        )}
      </div>
      {unread && (
        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
      )}
    </button>
  );
}

export function NotificationsPage() {
  const { notifications, unreadCount, status, error, load, markRead, markAllRead } =
    useNotificationStore();

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-2xl p-4">
      <PageHeader
        eyebrow="Notifikasi"
        title="Pusat Notifikasi"
        subtitle={unreadCount > 0 ? `${unreadCount} belum dibaca` : "Semua sudah dibaca"}
        action={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-700 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-cyan-300 transition hover:bg-cyan-900/40"
            >
              <CheckCheck className="h-4 w-4" /> Tandai semua
            </button>
          ) : undefined
        }
      />

      {status === "loading" && notifications.length === 0 && (
        <p className="animate-pulse text-sm font-bold uppercase tracking-widest text-cyan-500">
          Memuat…
        </p>
      )}
      {status === "error" && <p className="text-sm text-rose-300">{error}</p>}
      {status === "ready" && notifications.length === 0 && (
        <div className="rounded-2xl border border-cyan-900/40 bg-[#0b1229] p-8 text-center">
          <Bell className="mx-auto h-8 w-8 text-cyan-700" />
          <p className="mt-3 text-sm text-cyan-600">Belum ada notifikasi.</p>
        </div>
      )}

      <div className="space-y-2.5">
        {notifications.map((n) => (
          <NotificationCard key={n.id} notification={n} onRead={markRead} />
        ))}
      </div>
    </div>
  );
}
