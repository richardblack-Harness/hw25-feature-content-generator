"use client";

import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "@react-hook/window-size";
import FeatureForm from "@/components/feature-form";
import Navbar from "@/components/navbar";

export default function Home() {
  const [showConfetti, setShowConfetti] = useState(true);
  const [width] = useWindowSize();
  const [canaryHeight, setCanaryHeight] = useState(600);
  const canaryRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [formWidth, setFormWidth] = useState(1024);

  useEffect(() => {
    if (canaryRef.current) {
      setCanaryHeight(canaryRef.current.offsetHeight);
    }
    if (wrapperRef.current) {
      setFormWidth(wrapperRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    const updateWidth = () => {
      if (wrapperRef.current) {
        setFormWidth(wrapperRef.current.offsetWidth);
      }
    };
    updateWidth(); // initial
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (canaryRef.current) {
      setCanaryHeight(canaryRef.current.offsetHeight);
    }
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      {showConfetti && (
        <Confetti
          width={formWidth}
          height={canaryHeight +60}
          numberOfPieces={180}
          recycle={false}
          style={{
            top: 64,
            left: `calc(50% - ${formWidth / 2}px)`,
            position: "fixed",
            pointerEvents: "none",
            zIndex: 50,
          }}
        />
      )}
      <Navbar />
      <div
        ref={wrapperRef}
        className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center"
      >
        <div
          ref={canaryRef}
          className="w-full flex flex-col md:flex-row items-center justify-center gap-8 mb-12"
        >
          <img
            src="/Canary.png"
            alt="Our-lucky-purple-shirt-canary"
            width={200}
            height={200}
            className="text-blue-500"
          />
          <div className="flex flex-col w-full md:w-auto items-center justify-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4">
              Harness Content Catapult
            </h1>
            <p className="text-lg text-center text-gray-400 max-w-3xl">
              Create compelling content for upcoming Harness features using
              AI-powered templates
            </p>
          </div>
        </div>
        <FeatureForm />
      </div>
    </main>
  );
}
