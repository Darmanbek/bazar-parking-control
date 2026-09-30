import dayjs from "dayjs"

export const DATE_FORMAT = "DD.MM.YYYY"
export const API_DATE_FORMAT = "YYYY-MM-DD"

/** `30.12.2026`; empty or unparseable reads as an em dash, not "Invalid Date". */
export const formatDate = (value: string | null | undefined): string => {
	if (!value) return "—"
	const parsed = dayjs(value)
	return parsed.isValid() ? parsed.format(DATE_FORMAT) : "—"
}

/** `30.12.2026, 14:05:09` — for detections, where the exact moment matters. */
export const formatDateTime = (value: string | null | undefined): string => {
	if (!value) return "—"
	const parsed = dayjs(value)
	return parsed.isValid() ? parsed.format(`${DATE_FORMAT}, HH:mm:ss`) : "—"
}

export const formatTime = (value: string | null | undefined): string => {
	if (!value) return "—"
	const parsed = dayjs(value)
	return parsed.isValid() ? parsed.format("HH:mm:ss") : "—"
}

/**
 * An Uzbek plate as recognised (`95A123BC`, `95123ABC`) split into its region
 * code and the rest, spaced the way the plate itself is printed. Anything that
 * does not look like a UZ plate comes back whole in `body`.
 */
export const splitPlate = (raw: string): { region?: string; body: string } => {
	const plate = raw.replace(/\s+/g, "").toUpperCase()
	const legal = /^(\d{2})(\d{3})([A-Z]{3})$/.exec(plate)
	if (legal) return { region: legal[1], body: `${legal[2]} ${legal[3]}` }
	const personal = /^(\d{2})([A-Z])(\d{3})([A-Z]{2})$/.exec(plate)
	if (personal) return { region: personal[1], body: `${personal[2]} ${personal[3]} ${personal[4]}` }
	return { body: raw }
}

export const formatPlate = (raw: string): string => {
	const { region, body } = splitPlate(raw)
	return region ? `${region} ${body}` : body
}
