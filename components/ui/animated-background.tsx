"use client";

import { useEffect, useState } from "react";

export function AnimatedBackground() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <>
      <style>{`
        @keyframes goldDrift1 {
          0%   { transform: translate(0,0) scale(1);    opacity: .14; }
          25%  { transform: translate(110px,-90px) scale(1.12); opacity: .20; }
          50%  { transform: translate(70px,110px) scale(.96); opacity: .13; }
          75%  { transform: translate(-90px,60px) scale(1.06); opacity: .17; }
          100% { transform: translate(0,0) scale(1);    opacity: .14; }
        }
        @keyframes goldDrift2 {
          0%   { transform: translate(0,0) scale(1);    opacity: .10; }
          25%  { transform: translate(-130px,100px) scale(1.09); opacity: .15; }
          50%  { transform: translate(-50px,-130px) scale(.97); opacity: .09; }
          75%  { transform: translate(100px,-80px) scale(1.04); opacity: .12; }
          100% { transform: translate(0,0) scale(1);    opacity: .10; }
        }
        @keyframes goldDrift3 {
          0%   { transform: translate(0,0) scale(1);    opacity: .09; }
          33%  { transform: translate(80px,120px) scale(1.07); opacity: .13; }
          66%  { transform: translate(-100px,-80px) scale(.94); opacity: .08; }
          100% { transform: translate(0,0) scale(1);    opacity: .09; }
        }
        @keyframes goldDrift4 {
          0%   { transform: translate(0,0) scale(1);    opacity: .07; }
          40%  { transform: translate(-80px,-100px) scale(1.1); opacity: .11; }
          70%  { transform: translate(110px,70px) scale(.96); opacity: .06; }
          100% { transform: translate(0,0) scale(1);    opacity: .07; }
        }
        @keyframes morphGold {
          0%,100% { border-radius: 42% 58% 65% 35% / 28% 65% 35% 72%; }
          20%     { border-radius: 68% 32% 45% 55% / 62% 28% 72% 38%; }
          40%     { border-radius: 35% 65% 52% 48% / 35% 62% 38% 65%; }
          60%     { border-radius: 58% 42% 38% 62% / 48% 35% 65% 52%; }
          80%     { border-radius: 45% 55% 62% 38% / 72% 45% 55% 28%; }
        }
        .abg-wrap  { position:fixed;inset:0;z-index:-1;overflow:hidden;pointer-events:none; }
        .abg-base  { position:absolute;inset:0;
          background: radial-gradient(1600px circle at 15% 10%, #1a1200 0%, #0a0f14 60%); }
        .abg-grid  { position:absolute;inset:0;
          background-image:
            linear-gradient(rgba(245,196,81,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,196,81,.025) 1px, transparent 1px);
          background-size: 48px 48px; }
        .abg-blob  { position:absolute;filter:blur(130px);mix-blend-mode:screen;will-change:transform; }
        .abg-blob::before {
          content:"";position:absolute;inset:0;background:inherit;
          border-radius:inherit;animation:morphGold 9s ease-in-out infinite; }

        .abg-b1 {
          width:700px;height:700px;
          background: radial-gradient(circle, rgba(245,196,81,.18), rgba(245,196,81,0));
          top:-200px;left:5%;
          animation: goldDrift1 48s cubic-bezier(.4,.2,.2,.4) infinite; }
        .abg-b2 {
          width:580px;height:580px;
          background: radial-gradient(circle, rgba(178,34,52,.14), rgba(178,34,52,0));
          top:15%;right:3%;
          animation: goldDrift2 58s cubic-bezier(.4,.2,.2,.4) infinite; }
        .abg-b3 {
          width:750px;height:750px;
          background: radial-gradient(circle, rgba(245,196,81,.10), rgba(245,196,81,0));
          bottom:5%;left:25%;
          animation: goldDrift3 53s cubic-bezier(.4,.2,.2,.4) infinite; }
        .abg-b4 {
          width:580px;height:580px;
          background: radial-gradient(circle, rgba(255,140,66,.09), rgba(255,140,66,0));
          bottom:15%;right:10%;
          animation: goldDrift4 63s cubic-bezier(.4,.2,.2,.4) infinite; }
        .abg-over { position:absolute;inset:0;
          background:
            radial-gradient(ellipse 900px 700px at 20% 30%, transparent 0%, rgba(10,15,20,.35) 100%),
            radial-gradient(ellipse 700px 900px at 80% 70%, transparent 0%, rgba(10,15,20,.25) 100%);
          z-index:1; }
        @media (prefers-reduced-motion: reduce) {
          .abg-blob,.abg-blob::before { animation:none!important; }
        }
      `}</style>
      <div className="abg-wrap">
        <div className="abg-base" />
        <div className="abg-grid" />
        {!reduced && (
          <>
            <div className="abg-blob abg-b1" />
            <div className="abg-blob abg-b2" />
            <div className="abg-blob abg-b3" />
            <div className="abg-blob abg-b4" />
          </>
        )}
        <div className="abg-over" />
      </div>
    </>
  );
}
