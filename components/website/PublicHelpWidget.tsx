"use client";

import { useState } from "react";

export function PublicHelpWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-40">
      {open ? (
        <div className="mb-2 w-[320px] max-w-[calc(100vw-2rem)] rounded-xl border border-[#2a3142] bg-[#0d1320] p-3 text-xs text-slate-200 shadow-xl">
          <p className="mb-2 font-semibold text-white">Website Help</p>
          <ul className="space-y-1 text-slate-300">
            <li><span className="text-white">Startseite:</span> shows your casino deals table.</li>
            <li><span className="text-white">Hunt:</span> shows your active hunt/frontpage links.</li>
            <li><span className="text-white">Giveaway:</span> shows giveaways from your dashboard.</li>
            <li><span className="text-white">Frontpage:</span> lists all enabled viewer frontpages.</li>
            <li><span className="text-white">Deals fields:</span> casino, link, wager, bonus code, action after signup.</li>
            <li><span className="text-white">Link creation:</span> each enabled frontpage token creates a public URL automatically.</li>
          </ul>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid h-11 w-11 place-items-center rounded-full border border-[#2a3142] bg-[#111827] text-lg font-black text-white shadow-lg"
        aria-label="Open website help"
      >
        ?
      </button>
    </div>
  );
}

