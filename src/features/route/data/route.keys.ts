import type { Schemas } from "src/shared/api"

export type RouteContract = Schemas["ContractWithAssignments"]
export type AssignmentItem = Schemas["AssignmentHistoryItem"]

export const ROUTE_KEY = ["get", "/routes/{id}"]
export const ROUTES_KEY = ["get", "/routes"]

/** Form-modal keys: three forms live on one page. */
export const ASSIGNMENT_ADD_FORM = "assignment-add"
export const ASSIGNMENT_CLOSE_FORM = "assignment-close"
export const ASSIGNMENT_CORRECT_FORM = "assignment-correct"

export interface AssignmentAddParams {
	contract: RouteContract
	routeNumber: string
}

export interface AssignmentEditParams {
	assignment: AssignmentItem
	routeNumber: string
}
