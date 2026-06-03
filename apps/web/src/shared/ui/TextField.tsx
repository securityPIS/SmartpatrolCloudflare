import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

export function TextField({ label, id, className, ...props }: TextFieldProps) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block pl-1 font-mono text-[10px] uppercase tracking-widest text-cyan-500">
        {label}
      </span>
      <input
        id={id}
        className={`w-full rounded-xl border border-cyan-800/50 bg-[#0b1229] p-3.5 text-sm text-cyan-50 shadow-sm outline-none transition-all focus:border-cyan-400${
          className ? ` ${className}` : ""
        }`}
        {...props}
      />
    </label>
  );
}
