import type { Schemas } from "src/shared/api"

export type Car = Schemas["CarRead"]

export const CARS_KEY = ["get", "/api/v1/cars"]
export const CARS_STATS_KEY = ["get", "/api/v1/cars/stats"]
