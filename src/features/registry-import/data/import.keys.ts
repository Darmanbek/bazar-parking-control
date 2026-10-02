import type { Schemas } from "src/shared/api"

export type Import = Schemas["Import"]
export type ImportRow = Schemas["ImportRow"]
export type ImportAction = Schemas["ImportAction"]

export const IMPORT_KEY = ["get", "/registry/imports/{id}"]

export const ACTION_COLOR: Record<ImportAction, string> = {
	new_route: "geekblue",
	new_contract: "blue",
	add_assignment: "green",
	close_assignment: "volcano",
	move_assignment: "orange",
	reopen_assignment: "cyan",
	unchanged: "default",
	error: "red",
}

/** Errors first, then warnings, then the rest in file order (§7.3: "ошибки первыми"). */
export const issueRank = (row: ImportRow): number => (row.errors.length ? 0 : row.warnings.length ? 1 : 2)

/** Every summary counter, in the order the preview lists them. */
export const SUMMARY_FIELDS: (keyof Schemas["ImportSummary"])[] = [
	"errors_count",
	"warnings_count",
	"routes_new",
	"contracts_new",
	"contracts_changed",
	"assignments_add",
	"assignments_close",
	"assignments_move",
	"assignments_reopen",
	"unchanged",
]
