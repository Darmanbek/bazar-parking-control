// Where an assignment or a contract stands on a given day. The two use
// DIFFERENT boundaries (§3.5): an assignment's `until` is exclusive (the first
// day it no longer applies), a contract's `valid_until` is inclusive (its last day).

export type AssignmentState = "future" | "active" | "closing" | "closed" | "empty"

export const assignmentState = (a: { from: string; until: string | null }, today: string): AssignmentState => {
	// from = until: an empty interval — closed before it ever started (§7.3).
	if (a.until !== null && a.until <= a.from) return "empty"
	if (a.until !== null && a.until <= today) return "closed"
	if (a.from > today) return "future"
	return a.until === null ? "active" : "closing"
}

export type ContractState = "current" | "future" | "past"

export const contractState = (c: { valid_from: string; valid_until: string }, today: string): ContractState => {
	if (c.valid_from > today) return "future"
	if (c.valid_until < today) return "past"
	return "current"
}
