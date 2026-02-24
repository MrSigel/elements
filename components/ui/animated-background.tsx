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
        @keyframes grid3dScroll {
          0%   { background-position: 0 0; }
          100% { background-position: 0 90px; }
        }
        @keyframes diamondSpin {
          0%   { transform: rotate(0deg) rotateY(0deg); }
          100% { transform: rotate(360deg) rotateY(360deg); }
        }
        @keyframes diamondFloat {
          0%,100% { transform: translateY(0px) rotate(45deg); }
          50%     { transform: translateY(-18px) rotate(45deg); }
        }
        .abg-wrap  { position:fixed;inset:0;z-index:-1;overflow:hidden;pointer-events:none; }
        .abg-base  { position:absolute;inset:0;
          background: radial-gradient(1600px circle at 15% 10%, #1a1200 0%, #0a0f14 60%); }
        .abg-grid  { position:absolute;inset:0;
          background-image:
            linear-gradient(rgba(245,196,81,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,196,81,.025) 1px, transparent 1px);
          background-size: 48px 48px; }

        /* 3D perspective floor grid */
        .abg-grid3d-wrap {
          position:absolute; bottom:0; left:-30%; right:-30%; height:52vh;
          perspective:420px; overflow:hidden; }
        .abg-grid3d {
          position:absolute; inset:0;
          transform: rotateX(72deg);
          transform-origin: center bottom;
          background-image:
            linear-gradient(rgba(245,196,81,.09) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,196,81,.06) 1px, transparent 1px);
          background-size: 90px 90px;
          animation: grid3dScroll 5s linear infinite; }
        .abg-grid3d-fade {
          position:absolute; bottom:0; left:0; right:0; height:100%;
          background: linear-gradient(to top, rgba(10,15,20,0) 0%, rgba(10,15,20,0) 20%, rgba(10,15,20,.85) 75%, rgba(10,15,20,1) 100%); }
        .abg-grid3d-sides {
          position:absolute; bottom:0; left:0; right:0; height:100%;
          background: linear-gradient(to right, rgba(10,15,20,.9) 0%, transparent 20%, transparent 80%, rgba(10,15,20,.9) 100%); }

        /* Floating 3D diamonds */
        .abg-diamond {
          position:absolute; border:1px solid rgba(245,196,81,.22);
          background: linear-gradient(135deg, rgba(245,196,81,.07), rgba(178,34,52,.05));
          box-shadow: 0 0 24px rgba(245,196,81,.08), inset 0 0 12px rgba(245,196,81,.04);
          transform: rotate(45deg); will-change: transform; }
        .abg-d1 { width:64px; height:64px; top:12%; left:6%; animation: diamondFloat 7s ease-in-out infinite; opacity:.55; }
        .abg-d2 { width:44px; height:44px; top:28%; right:8%; animation: diamondFloat 9s ease-in-out 1.5s infinite; opacity:.4; }
        .abg-d3 { width:80px; height:80px; top:60%; left:3%;  animation: diamondFloat 11s ease-in-out 3s infinite; opacity:.3; }
        .abg-d4 { width:36px; height:36px; top:18%; right:18%; animation: diamondFloat 8s ease-in-out 0.7s infinite; opacity:.45; }
        .abg-d5 { width:52px; height:52px; top:75%; right:5%; animation: diamondFloat 10s ease-in-out 2s infinite; opacity:.35; }
        .abg-d6 { width:28px; height:28px; top:45%; left:14%; animation: diamondFloat 6.5s ease-in-out 1s infinite; opacity:.5; }

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

        {/* 3D perspective grid floor */}
        {!reduced && (
          <div className="abg-grid3d-wrap">
            <div className="abg-grid3d" />
            <div className="abg-grid3d-sides" />
            <div className="abg-grid3d-fade" />
          </div>
        )}

        {/* Floating 3D diamonds */}
        {!reduced && (
          <>
            <div className="abg-diamond abg-d1" />
            <div className="abg-diamond abg-d2" />
            <div className="abg-diamond abg-d3" />
            <div className="abg-diamond abg-d4" />
            <div className="abg-diamond abg-d5" />
            <div className="abg-diamond abg-d6" />
          </>
        )}

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
