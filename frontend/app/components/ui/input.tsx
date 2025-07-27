"use client";

import clsx from "clsx";
import { useState } from "react";
import { EyeIcon } from "../svgs";

export default function Input({
  id,
  error,
  placeholder,
  type = "text",
  multiline,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <fieldset>
      <div className="relative">
        {multiline ? (
          <textarea
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            placeholder={placeholder}
            className={clsx(
              "w-full bg-white p-4 rounded-lg border border-text/10 text-text placeholder:text-text/50 text-base leading-relaxed transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-text/20",
              error &&
                "border-red-500 focus:ring-red-500/20 focus:border-red-500"
            )}
          />
        ) : (
          <input
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            type={inputType}
            placeholder={placeholder}
            autoComplete="off"
            className={clsx(
              "w-full bg-white h-full p-4 rounded-lg border border-text/10 text-text placeholder:text-text/50 text-base leading-relaxed transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-text/20",
              error &&
                "border-red-500 focus:ring-red-500/20 focus:border-red-500",
              type === "password" && "pr-12"
            )}
          />
        )}
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text/40 hover:text-text/70 transition-colors"
          >
            <EyeIcon fill={showPassword ? "#333333" : "#55555580"} />
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1.5">{error}</p>}
    </fieldset>
  );
}
