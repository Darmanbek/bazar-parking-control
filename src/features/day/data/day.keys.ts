import type { Schemas } from "src/shared/api"

export type Pass = Schemas["Pass"]
export type RouteSummary = Schemas["RouteSummaryItem"]

export const PASSES_KEY = ["get", "/passes"]
export const SUMMARY_KEY = ["get", "/summary/routes"]
