"use client";

import type { Deal } from "./pipeline";

const key = "truthlayer.pipelineDeals";

export function saveDeals(deals: Deal[]) {
  window.localStorage.setItem(key, JSON.stringify(deals));
}

export function loadDeals() {
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Deal[];
  } catch {
    return null;
  }
}
