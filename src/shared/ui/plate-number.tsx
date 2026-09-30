// An Uzbek licence plate, drawn the way it hangs on the car: region code boxed
// off on the left, the number in the middle, the UZ flag strip on the right.
// Plates are what the guard reads all day, so they read as plates, not text.

import type { FC } from "react"
import { splitPlate } from "src/shared/utils"

interface PlateNumberProps {
	number: string
	size?: "small" | "default" | "large"
}

const SIZES = {
	small: { font: 13, pad: "1px 6px", flag: 14 },
	default: { font: 15, pad: "3px 8px", flag: 16 },
	large: { font: 26, pad: "6px 14px", flag: 26 },
} as const

export const PlateNumber: FC<PlateNumberProps> = ({ number, size = "default" }) => {
	const { region, body } = splitPlate(number)
	const s = SIZES[size]

	return (
		<span
			className={"plate"}
			style={{ fontSize: s.font }}
			aria-label={number}
		>
			{region ? <span style={{ padding: s.pad, borderRight: "2px solid #111" }}>{region}</span> : null}
			<span style={{ padding: s.pad, whiteSpace: "nowrap" }}>{body}</span>
			<span
				className={"plate-flag"}
				style={{ width: s.flag }}
			>
				<i style={{ background: "#1eb4e6" }} />
				<i style={{ background: "#ffffff" }} />
				<i style={{ background: "#1eb53a" }} />
				<b>UZ</b>
			</span>
		</span>
	)
}
