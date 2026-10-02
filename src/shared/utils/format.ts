/**
 * A plate as the API returns it (normalised, `^\d{2}[A-Z0-9]{6}$`, §5.3) split
 * into the region code and the rest, spaced as printed on the plate. Anything
 * else comes back whole in `body`.
 */
export const splitPlate = (raw: string): { region?: string; body: string } => {
	const plate = raw.replace(/\s+/g, "").toUpperCase()
	const legal = /^(\d{2})(\d{3})([A-Z]{3})$/.exec(plate)
	if (legal) return { region: legal[1], body: `${legal[2]} ${legal[3]}` }
	const personal = /^(\d{2})([A-Z])(\d{3})([A-Z]{2})$/.exec(plate)
	if (personal) return { region: personal[1], body: `${personal[2]} ${personal[3]} ${personal[4]}` }
	const any = /^(\d{2})([A-Z0-9]{6})$/.exec(plate)
	if (any) return { region: any[1], body: any[2] }
	return { body: raw }
}

export const formatPlate = (raw: string): string => {
	const { region, body } = splitPlate(raw)
	return region ? `${region} ${body}` : body
}

// Cyrillic look-alikes of Latin plate letters (§5.3).
const CYRILLIC_TWINS: Record<string, string> = {
	А: "A",
	В: "B",
	Е: "E",
	К: "K",
	М: "M",
	Н: "H",
	О: "O",
	Р: "P",
	С: "C",
	Т: "T",
	Х: "X",
	У: "Y",
}

/**
 * The normalisation the backend applies before comparing (§5.3), used here only
 * to filter lists on screen: uppercase, no spaces or dashes, Cyrillic twins to
 * Latin. Never sent as the plate — the API's `plate` is the identifier (A21).
 */
export const normalizePlate = (raw: string): string =>
	raw
		.toUpperCase()
		.replace(/[\s-]+/g, "")
		.replace(/[АВЕКМНОРСТХУ]/g, (c) => CYRILLIC_TWINS[c] ?? c)
