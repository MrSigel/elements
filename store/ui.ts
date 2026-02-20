"use client";

import { create } from "zustand";

type UiState = {
  selectedWidgetInstanceId: string | null;
  setSelectedWidgetInstanceId: (id: string | null) => void;
};

export const useUiStore = create<UiState>((set) => ({
  selectedWidgetInstanceId: null,
  setSelectedWidgetInstanceId: (id) => set({ selectedWidgetInstanceId: id })
}));

