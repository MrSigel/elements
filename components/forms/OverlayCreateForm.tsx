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
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-4 gap-2 rounded-lg border border-panelMuted bg-panel p-3">
      <input {...register("name")} className="col-span-2 rounded bg-panelMuted px-3 py-2" placeholder="Overlay name" />
      <input {...register("width")} type="number" className="rounded bg-panelMuted px-3 py-2" />
      <input {...register("height")} type="number" className="rounded bg-panelMuted px-3 py-2" />
      <button disabled={isSubmitting} className="col-span-4 rounded bg-accent text-black px-3 py-2">Create Overlay</button>
      {errors.name ? <p className="col-span-4 text-danger text-sm">{errors.name.message}</p> : null}
    </form>
  );
}

