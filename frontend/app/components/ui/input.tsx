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
              "w-full bg-dark p-4 rounded-[12px] text-light placeholder:text-light/60 font-aloe text-base leading-[22.4px] focus:outline-none focus:ring-0 focus:ring-primary/20 focus:bg-dark-100",
              error && "border-1 border-red-500"
            )}
          />
        ) : (
          <input
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            type={inputType}
            placeholder={placeholder}
            autoComplete="off"
            className={clsx(
              "w-full bg-dark h-full p-4 rounded-[12px] text-light placeholder:text-light/60 font-aloe text-base leading-[22.4px] focus:outline-none focus:ring-0 focus:ring-primary/20 focus:bg-dark-100",
              error && "border-1 border-red-500",
              type === "password" && "pr-12"
            )}
          />
        )}
        {type === "password" && (
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-light/60 hover:text-light transition-colors"
          >
            <EyeIcon fill={showPassword ? "#F1FAEE" : "#F1FAEE80"} />
          </span>
        )}
      </div>
      {error && (
        <p className="text-red-500 font-aloe text-xs leading-[22.4px] mt-1">
          {error}
        </p>
      )}
    </fieldset>
  );
}
