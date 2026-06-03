import { type ReactNode, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Anchor,
  BarChart3,
  Bell,
  Home,
  LogOut,
  Settings,
  Shield,
  Ship,
  UserCog,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import type { Role } from "@smartpatrol/contracts";
import { useAuthStore } from "../../features/auth/model/authStore";

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

function navItems(role: Role | undefined): NavItem[] {
  const items: NavItem[] = [
    { to: "/", label: "Beranda", icon: <Home className="h-5 w-5" />, end: true },
  ];
  if (role === "ADMIN") {
    items.push(
      { to: "/ships", label: "Armada", icon: <Anchor className="h-5 w-5" /> },
      { to: "/admin/users", label: "User", icon: <Users className="h-5 w-5" /> },
      { to: "/admin/registrations", label: "Registrasi", icon: <Bell className="h-5 w-5" /> },
    );
  }
  return items;
}

const ROLE_BADGE: Record<Role, string> = {
  ADMIN: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30",
  PIC: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  PETUGAS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};

/** Stacked Shield+Ship monogram used across the app chrome. */
function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const wrap = size === "lg" ? "h-16 w-16" : size === "sm" ? "h-10 w-10" : "h-12 w-12";
  const shield = size === "lg" ? "h-16 w-16" : size === "sm" ? "h-10 w-10" : "h-12 w-12";
  const ship = size === "lg" ? "h-8 w-8" : size === "sm" ? "h-5 w-5" : "h-6 w-6";
  return (
    <div className={`relative flex items-center justify-center ${wrap}`}>
      <Shield className={`absolute ${shield} stroke-[1.5] text-cyan-400 opacity-20`} />
      <Shield className={`absolute ${shield} stroke-1 text-cyan-400`} />
      <Ship
        className={`relative z-10 ${ship} text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]`}
      />
    </div>
  );
}

function SideNav({ role }: { role: Role | undefined }) {
  return (
    <aside className="sticky top-0 z-50 hidden h-screen w-[100px] shrink-0 flex-col overflow-y-auto border-r border-cyan-800/50 bg-[#0b1229] py-6 lg:flex">
      <div className="flex flex-col items-center gap-6 px-2">
        <div className="mb-4">
          <Logo />
        </div>
        <nav className="flex w-full flex-col gap-2">
          {navItems(role).map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `group relative flex w-full flex-col items-center justify-center rounded-2xl py-4 transition-all duration-300 ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "text-cyan-700 hover:bg-cyan-900/40 hover:text-cyan-500"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 h-8 w-1 rounded-r-full bg-cyan-500 shadow-[0_0_10px_currentColor]" />
                  )}
                  <span
                    className={`mb-1.5 transition-transform duration-300 group-hover:scale-110 ${
                      isActive ? "scale-110" : ""
                    }`}
                  >
                    {tab.icon}
                  </span>
                  <span className="px-1 text-center text-[10px] font-bold uppercase tracking-widest">
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="mt-auto px-4 pb-4">
        <div className="flex flex-col items-center gap-1 rounded-xl border border-cyan-900/30 bg-cyan-950/10 p-3">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          <span className="text-[8px] font-black uppercase tracking-tighter text-cyan-600">
            Online
          </span>
        </div>
      </div>
    </aside>
  );
}

function BottomNav({ role }: { role: Role | undefined }) {
  return (
    <nav className="fixed bottom-0 z-40 w-full border-t border-cyan-800/50 bg-[#0b1229] pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="flex items-center justify-around px-2 pb-1 pt-2">
        {navItems(role).map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center justify-center rounded-xl p-2 transition-colors ${
                isActive
                  ? "text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]"
                  : "text-cyan-700 hover:text-cyan-500"
              }`
            }
          >
            {tab.icon}
            <span className="mt-0.5 line-clamp-1 text-[9px] font-bold uppercase tracking-widest">
              {tab.label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function Header() {
  const user = useAuthStore((s) => s.user);
  const authStatus = useAuthStore((s) => s.status);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const role = user?.role;
  const isOffline = authStatus === "offline";

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-cyan-800 bg-[#0b1229]/90 px-4 py-3 shadow-[0_4px_15px_rgba(6,182,212,0.1)] backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="lg:hidden">
          <Logo size="sm" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-cyan-50">SmartPatrol</h1>
            {role && (
              <span
                className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${ROLE_BADGE[role]}`}
              >
                {role}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[10px] text-cyan-500">{user?.fullName ?? user?.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 text-[10px] font-bold">
          {isOffline ? (
            <WifiOff className="h-5 w-5 text-[#ED1C24]" />
          ) : (
            <Wifi className="h-5 w-5 text-[#39B54A]" />
          )}
        </span>
        <div className="relative z-50">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center justify-center rounded-full border border-cyan-700 p-1.5 text-cyan-300 transition-colors hover:bg-cyan-900/40"
            aria-label="Pengaturan"
          >
            <Settings className="h-5 w-5" />
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
              <div className="absolute right-0 top-10 z-50 mt-2 w-48 rounded border border-cyan-800 bg-[#0b1229] py-1 shadow-xl">
                {role === "ADMIN" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/admin/users");
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-bold text-cyan-300 hover:bg-cyan-900/50"
                    >
                      <UserCog className="h-4 w-4" /> Menu User
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/ships");
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-bold text-cyan-300 hover:bg-cyan-900/50"
                    >
                      <BarChart3 className="h-4 w-4" /> Menu Armada
                    </button>
                    <div className="my-1 border-t border-cyan-900/50" />
                  </>
                )}
                <button
                  type="button"
                  onClick={() => {
                    void logout();
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-bold text-rose-400 hover:bg-cyan-900/50"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/** Authenticated app chrome: dark navy shell with side + bottom nav. */
export function AppLayout({ children }: { children: ReactNode }) {
  const role = useAuthStore((s) => s.user?.role);

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[1280px] flex-col bg-[#070b19] text-cyan-50 lg:h-screen lg:flex-row lg:overflow-hidden lg:border-x lg:border-cyan-900/50 lg:shadow-[0_0_60px_rgba(6,182,212,0.15)]">
      <SideNav role={role} />
      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        <Header />
        <main className="relative flex-1 overflow-y-auto pb-24 lg:pb-0">{children}</main>
        <BottomNav role={role} />
      </div>
    </div>
  );
}
