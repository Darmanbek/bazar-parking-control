// Brandmark: a parking "P" sign with a camera shutter tick — the lot, watched.

import type { FC } from "react"

export const Brandmark: FC<{ size?: number }> = ({ size = 36 }) => (
	<svg
		width={size}
		height={size}
		viewBox={"0 0 40 40"}
		fill={"none"}
		role={"img"}
		aria-label={"Bazar Avto Control"}
	>
		<rect
			x={"1"}
			y={"1"}
			width={"38"}
			height={"38"}
			rx={"10"}
			fill={"#1c2330"}
		/>
		<rect
			x={"4.5"}
			y={"4.5"}
			width={"31"}
			height={"31"}
			rx={"7"}
			stroke={"#f2b544"}
			strokeWidth={"1.6"}
			strokeDasharray={"4 3"}
		/>
		<path
			d={"M15 29V11h6.2c3.6 0 5.8 2.1 5.8 5.3s-2.2 5.4-5.8 5.4H18.6"}
			stroke={"#f2b544"}
			strokeWidth={"3.4"}
			strokeLinecap={"round"}
			strokeLinejoin={"round"}
		/>
		<circle
			cx={"30.5"}
			cy={"9.5"}
			r={"2.6"}
			fill={"#ef4444"}
		/>
	</svg>
)
