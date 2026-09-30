// Live polling of the dashboard and the car page. A store rather than local
// state because the control sits in the page header while the queries that
// honour it live in the tables and counters below.

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { DEFAULT_REFRESH_INTERVAL, type RefreshInterval } from "src/shared/config"

interface AutoRefreshState {
	enabled: boolean
	interval: RefreshInterval
	setEnabled: (enabled: boolean) => void
	setInterval: (interval: RefreshInterval) => void
}

export const useAutoRefreshStore = create<AutoRefreshState>()(
	persist(
		(set) => ({
			enabled: true,
			interval: DEFAULT_REFRESH_INTERVAL,
			setEnabled: (enabled) => set({ enabled }),
			setInterval: (interval) => set({ interval }),
		}),
		{ name: "bazar-avto-refresh" }
	)
)

/** `refetchInterval` for a live query: the chosen period, or `false` when paused. */
export const useRefetchInterval = (): number | false => useAutoRefreshStore((s) => (s.enabled ? s.interval : false))
