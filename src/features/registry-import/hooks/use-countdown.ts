// Time left until a preview disappears (`expires_at`, at most an hour and never
// past the end of the Tashkent day). Ticks once a second, locally — no request.

import { useEffect, useState } from "react"

export const useCountdown = (expiresAt: string | null | undefined) => {
	const [now, setNow] = useState(() => Date.now())

	useEffect(() => {
		if (!expiresAt) return
		const timer = setInterval(() => setNow(Date.now()), 1000)
		return () => clearInterval(timer)
	}, [expiresAt])

	const end = expiresAt ? Date.parse(expiresAt) : NaN
	const left = Number.isFinite(end) ? Math.max(0, end - now) : 0
	const minutes = Math.floor(left / 60_000)
	const seconds = Math.floor((left % 60_000) / 1000)

	return {
		expired: !Number.isFinite(end) || left === 0,
		label: `${minutes}:${String(seconds).padStart(2, "0")}`,
	}
}
