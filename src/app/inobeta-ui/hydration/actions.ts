import { createAction, props } from "@ngrx/store";

export const ibHydrate = createAction("[IbHydration] Hydrate");

export const ibHydrateSuccess = createAction(
  "[IbHydration] Hydrate Success",
  props<{ state: any }>()
);

export const ibHydrateFailure = createAction("[IbHydration] Hydrate Failure");
