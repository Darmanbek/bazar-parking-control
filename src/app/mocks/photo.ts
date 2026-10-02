// A stand-in camera frame: the rear of a car under the gate camera, with the
// plate and the timestamp burned in like a real ANPR snapshot.

import { formatPlate } from "src/shared/utils"

const PALETTE = ["#3b4252", "#8a1c1c", "#d1d5db", "#1e3a5f", "#2f4f3a", "#6b7280", "#111827", "#b45309"]

export const renderPhoto = (plate: string, seed: number, stamp: string): string => {
	const body = PALETTE[seed % PALETTE.length]
	const gate = "ВЪЕЗД"
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="320" height="200">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2b2f36"/><stop offset="1" stop-color="#15181d"/>
    </linearGradient>
  </defs>
  <rect width="320" height="200" fill="url(#g)"/>
  <path d="M0 200 L120 110 L200 110 L320 200 Z" fill="#23272e"/>
  <path d="M158 200 L160 120" stroke="#f2b544" stroke-width="3" stroke-dasharray="10 10"/>
  <rect x="78" y="70" width="164" height="96" rx="16" fill="${body}"/>
  <rect x="96" y="54" width="128" height="40" rx="12" fill="${body}"/>
  <rect x="104" y="60" width="112" height="28" rx="8" fill="#9fb4c7" opacity="0.55"/>
  <rect x="84" y="104" width="30" height="12" rx="4" fill="#ef4444"/>
  <rect x="206" y="104" width="30" height="12" rx="4" fill="#ef4444"/>
  <rect x="104" y="126" width="112" height="22" rx="3" fill="#fff" stroke="#111" stroke-width="2"/>
  <text x="160" y="142" font-family="monospace" font-weight="700" font-size="13" text-anchor="middle" fill="#111">${formatPlate(plate)}</text>
  <rect x="82" y="166" width="34" height="14" rx="4" fill="#0b0d10"/>
  <rect x="204" y="166" width="34" height="14" rx="4" fill="#0b0d10"/>
  <rect x="0" y="0" width="320" height="18" fill="rgba(0,0,0,0.55)"/>
  <text x="8" y="13" font-family="monospace" font-size="10" fill="#f2b544">CAM-01 · ${gate}</text>
  <text x="312" y="13" font-family="monospace" font-size="10" fill="#e5e7eb" text-anchor="end">${stamp}</text>
</svg>`
}
