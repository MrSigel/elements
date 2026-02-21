"use client";

import { useEffect, useState } from "react";

export function AnimatedBackground() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  return (
    <>
      <style>{`
        @keyframes blobDrift1 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.08;
          }
          25% {
            transform: translate(120px, -80px) scale(1.1);
            opacity: 0.12;
          }
          50% {
            transform: translate(80px, 120px) scale(0.95);
            opacity: 0.08;
          }
          75% {
            transform: translate(-100px, 60px) scale(1.05);
            opacity: 0.1;
          }
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.08;
          }
        }

        @keyframes blobDrift2 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.06;
          }
          25% {
            transform: translate(-140px, 100px) scale(1.08);
            opacity: 0.1;
          }
          50% {
            transform: translate(-60px, -140px) scale(0.98);
            opacity: 0.06;
          }
          75% {
            transform: translate(110px, -90px) scale(1.03);
            opacity: 0.08;
          }
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.06;
          }
        }

        @keyframes blobDrift3 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.07;
          }
          25% {
            transform: translate(100px, 120px) scale(1.06);
            opacity: 0.11;
          }
          50% {
            transform: translate(-120px, -100px) scale(0.96);
            opacity: 0.07;
          }
          75% {
            transform: translate(-80px, 130px) scale(1.04);
            opacity: 0.09;
          }
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.07;
          }
        }

        @keyframes blobDrift4 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.05;
          }
          25% {
            transform: translate(-110px, -120px) scale(1.09);
            opacity: 0.1;
          }
          50% {
            transform: translate(130px, 80px) scale(0.97);
            opacity: 0.05;
          }
          75% {
            transform: translate(60px, -110px) scale(1.02);
            opacity: 0.08;
          }
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.05;
          }
        }

        @keyframes morphBlob {
          0%, 100% {
            border-radius: 42% 58% 65% 35% / 28% 65% 35% 72%;
          }
          20% {
            border-radius: 68% 32% 45% 55% / 62% 28% 72% 38%;
          }
          40% {
            border-radius: 35% 65% 52% 48% / 35% 62% 38% 65%;
          }
          60% {
            border-radius: 58% 42% 38% 62% / 48% 35% 65% 52%;
          }
          80% {
            border-radius: 45% 55% 62% 38% / 72% 45% 55% 28%;
          }
        }

        .animated-bg-container {
          position: fixed;
          inset: 0;
          z-index: -1;
          overflow: hidden;
          pointer-events: none;
        }

        .animated-bg-base {
          position: absolute;
          inset: 0;
          background: radial-gradient(1400px circle at 0% 0%, #172432 0%, #0f1419 55%);
          z-index: 0;
        }

        .animated-bg-blob {
          position: absolute;
          filter: blur(120px);
          mix-blend-mode: screen;
          will-change: transform;
        }

        .animated-bg-blob--primary {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(68, 179, 255, 0.12), rgba(68, 179, 255, 0));
          top: -200px;
          left: 10%;
          animation: blobDrift1 45s cubic-bezier(0.4, 0.2, 0.2, 0.4) infinite;
        }

        .animated-bg-blob--secondary {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(45, 212, 212, 0.1), rgba(45, 212, 212, 0));
          top: 20%;
          right: 5%;
          animation: blobDrift2 55s cubic-bezier(0.4, 0.2, 0.2, 0.4) infinite;
        }

        .animated-bg-blob--tertiary {
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(68, 179, 255, 0.08), rgba(68, 179, 255, 0));
          bottom: 10%;
          left: 30%;
          animation: blobDrift3 50s cubic-bezier(0.4, 0.2, 0.2, 0.4) infinite;
        }

        .animated-bg-blob--accent {
          width: 550px;
          height: 550px;
          background: radial-gradient(circle, rgba(68, 179, 255, 0.06), rgba(68, 179, 255, 0));
          bottom: 20%;
          right: 15%;
          animation: blobDrift4 60s cubic-bezier(0.4, 0.2, 0.2, 0.4) infinite;
        }

        .animated-bg-blob::before {
          content: "";
          position: absolute;
          inset: 0;
          background: inherit;
          border-radius: inherit;
          animation: morphBlob 8s ease-in-out infinite;
        }

        .animated-bg-overlay {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse 800px 600px at 20% 30%, transparent 0%, rgba(10, 15, 20, 0.3) 100%),
            radial-gradient(ellipse 600px 800px at 80% 70%, transparent 0%, rgba(10, 15, 20, 0.2) 100%);
          z-index: 1;
          pointer-events: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .animated-bg-blob {
            animation: none !important;
          }

          .animated-bg-blob::before {
            animation: none !important;
          }
        }
      `}</style>

      <div className="animated-bg-container">
        <div className="animated-bg-base" />
        
        {!prefersReducedMotion && (
          <>
            <div className="animated-bg-blob animated-bg-blob--primary" />
            <div className="animated-bg-blob animated-bg-blob--secondary" />
            <div className="animated-bg-blob animated-bg-blob--tertiary" />
            <div className="animated-bg-blob animated-bg-blob--accent" />
          </>
        )}
        
        <div className="animated-bg-overlay" />
      </div>
    </>
  );
}
