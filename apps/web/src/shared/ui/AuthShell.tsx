import type { ReactNode } from "react";
import { Shield, Ship } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="relative w-full min-h-screen overflow-hidden bg-[#070b19] text-cyan-50 sm:mx-auto sm:max-w-md sm:border-x sm:border-cyan-900/50 sm:shadow-[0_0_40px_rgba(6,182,212,0.1)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_42%),radial-gradient(circle_at_bottom,_rgba(250,204,21,0.08),_transparent_35%)]" />
      <div className="relative flex min-h-screen flex-col justify-center px-5 py-8">
        <div className="mb-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <Shield className="absolute h-16 w-16 stroke-[1.5] text-cyan-300 opacity-20" />
              <Shield className="absolute h-16 w-16 stroke-1 text-cyan-300" />
              <Ship className="relative z-10 h-8 w-8 text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-500">
                SMARTPATROL BY ANTISLEK
              </p>
              <h1 className="mt-1 text-3xl font-black leading-none text-white">{title}</h1>
              {subtitle && <p className="mt-2 text-sm leading-relaxed text-cyan-500">{subtitle}</p>}
            </div>
          </div>
        </div>

        {children}

        <div className="mt-8 text-center">
          <p className="text-[10px] text-cyan-700">SmartPatrol By HSSE - Security III</p>
          <p className="text-[10px] text-cyan-700">PT Pertamina Patra Niaga</p>
        </div>
      </div>
    </main>
  );
}
