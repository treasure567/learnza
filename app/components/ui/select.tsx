"use client";

import clsx from "clsx";
import { useState, useEffect } from "react";

type SelectProps = {
  value?: string;
  className?: string;
  placeholder?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: { label: string; value: string }[];
};

export default function Select({
  value,
  options,
  onChange,
  className,
  defaultValue,
  placeholder,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(
    value || defaultValue || options[0]?.value
  );

  useEffect(() => {
    if (value !== undefined) {
      setSelected(value);
    }
  }, [value]);

  const handleSelect = (newValue: string) => {
    setSelected(newValue);
    onChange?.(newValue);
    setIsOpen(false);
  };

  const selectedLabel =
    options.find((opt) => opt.value === selected)?.label || placeholder;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full px-4 py-3 rounded-xl",
          "bg-gray-50 border border-gray-200",
          "text-gray-700",
          "hover:border-green-500 hover:bg-gray-100",
          "focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500",
          "transition-all duration-300",
          "text-base md:text-lg font-medium",
          "flex items-center justify-between gap-2",
          className
        )}
      >
        <span className={clsx(!selected && "text-gray-500")}>
          {selectedLabel}
        </span>
        <svg
          className={clsx(
            "w-5 h-5 mr-2 text-gray-500 transition-transform duration-200",
            isOpen && "transform rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 py-1 bg-white rounded-xl border border-gray-200 shadow-lg backdrop-blur-sm">
          <div className="max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={clsx(
                  "w-full px-4 py-2.5 text-left transition-colors duration-200",
                  "text-base md:text-lg",
                  "hover:bg-gray-50",
                  option.value === selected
                    ? "text-green-700 font-medium bg-green-50"
                    : "text-gray-700"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
