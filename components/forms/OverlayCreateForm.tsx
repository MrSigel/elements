"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  width: z.coerce.number().int().min(320),
  height: z.coerce.number().int().min(240)
});

type FormData = z.infer<typeof schema>;

export function OverlayCreateForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "Main Overlay", width: 1920, height: 1080 }
  });

  async function onSubmit(data: FormData) {
    const res = await fetch("/api/overlays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      reset();
      location.reload();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-panelMuted bg-panel p-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-subtle">Overlay Name</label>
          <input
            {...register("name")}
            className="w-full rounded bg-panelMuted px-3 py-2 text-sm"
            placeholder="e.g. Main Overlay"
          />
          {errors.name && <p className="text-danger text-xs">{errors.name.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-subtle">Width (px)</label>
          <input {...register("width")} type="number" className="w-full rounded bg-panelMuted px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-subtle">Height (px)</label>
          <input {...register("height")} type="number" className="w-full rounded bg-panelMuted px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-subtle/50">Standard OBS BrowserSource: 1920 × 1080</p>
        <button disabled={isSubmitting} className="rounded bg-accent text-black px-4 py-2 text-sm font-semibold disabled:opacity-70 flex-shrink-0">
          {isSubmitting ? "Creating…" : "Create Overlay"}
        </button>
      </div>
    </form>
  );
}

