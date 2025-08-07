"use client";

export default function Loader({
  size = "medium",
  className = "",
}: {
  size?: "small" | "medium" | "large";
  className?: string;
}) {
  const getSize = () => {
    switch (size) {
      case "small":
        return "w-16";
      case "large":
        return "w-24";
      default:
        return "w-20";
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`relative ${getSize()}`}>
        {/* Logo */}
        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
          <img
            src="/images/logo.png"
            alt="Learnza Logo"
            className="w-10 h-10 object-contain"
          />
        </div>

        {/* Circular Progress */}
        <svg className="w-full h-full animate-spin" viewBox="0 0 100 100">
          <circle
            className="stroke-green-500"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="283"
            strokeDashoffset="283"
            style={{
              animation: "dash 1.5s ease-in-out infinite",
            }}
          />
        </svg>
      </div>
      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
