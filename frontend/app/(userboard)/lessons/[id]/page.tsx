"use client";

import { useParams } from "next/navigation";
import React from "react";

export default function LessonPage() {
  const { id } = useParams();

  return <div>this is unique with different data from the backend {id}</div>;
}
