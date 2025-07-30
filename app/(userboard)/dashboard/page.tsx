import React from "react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">COOKING</h1>
      <p className="text-lg mt-4">
        update your profile while you wait{" "}
        <span className="text-primary">
          <Link href="/profile">here</Link>
        </span>
      </p>
    </div>
  );
}
