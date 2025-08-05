"use client";

import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import {
  Hero,
  DemoVideo,
  Stats,
  Features,
  Benefits,
  Testimonials,
  CTA,
  FAQ,
} from "./components/landing";

export default function LandingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Hero />
        <DemoVideo />
        <Stats />
        <Features />
        <Benefits />
        <Testimonials />
        <CTA />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
