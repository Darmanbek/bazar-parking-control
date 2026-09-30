// Animated integer. Eases from the previously shown value to the new one, so a
// counter that ticks up on a poll visibly moves instead of snapping. Writes the
// text straight into the node on each frame: no React state per frame, and it
// honours reduced motion.

import type { FC } from "react"
import { useEffect, useRef } from "react"

const format = (n: number) => Math.round(n).toLocaleString("ru-RU")

export const CountUp: FC<{ value: number; duration?: number }> = ({ value, duration = 900 }) => {
	const ref = useRef<HTMLSpanElement>(null)
	const shown = useRef(0)

	useEffect(() => {
		const node = ref.current
		if (!node) return
		const from = shown.current
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
		if (reduce || from === value) {
			shown.current = value
			node.textContent = format(value)
			return
		}

		const start = performance.now()
		let frame = 0
		const tick = (now: number) => {
			const p = Math.min((now - start) / duration, 1)
			const eased = 1 - Math.pow(1 - p, 3)
			shown.current = from + (value - from) * eased
			node.textContent = format(shown.current)
			if (p < 1) frame = requestAnimationFrame(tick)
		}
		frame = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(frame)
	}, [value, duration])

	// The child is a constant, so React never re-diffs the text the effect writes.
	return <span ref={ref}>0</span>
}
