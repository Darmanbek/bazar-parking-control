import type { Schemas } from "src/shared/api"

export type CarEvent = Schemas["CarEventRead"]

/** A car's page opens on this many days, ending today. */
export const CAR_DEFAULT_DAYS = 30

export const CAR_KEY = ["get", "/api/v1/cars/{car_id}"]
export const CAR_HISTORY_KEY = ["get", "/api/v1/cars/{car_id}/history"]
