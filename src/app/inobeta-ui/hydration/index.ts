import { MetaReducer } from "@ngrx/store";
import { HydrationEffects } from "./effects";
import { getIbHydrationMetaReducer } from "./reducer";

/**
 * Function to set up hydration for the application.
 *
 * @param ibSessionStorageKey The key to identify the storage in which the state is stored.
 * @param ibReduxPersistKeys The keys to other redux stores to include in the persisted state.
 * @returns Effects and metareducers to apply to your root `EffectsModule` and `StoreModule`.
 */
export const ibSetupHydration = (
  ibSessionStorageKey: string,
  ibReduxPersistKeys: string[]
) => {
  HydrationEffects.ibSessionStorageKey = ibSessionStorageKey;
  HydrationEffects.ibReduxPersistKeys = ibReduxPersistKeys;
  return {
    effects: [HydrationEffects],
    metareducers: getIbMetaReducers(ibSessionStorageKey, ibReduxPersistKeys),
  };
};

const getIbMetaReducers = (
  ibSessionStorageKey: string,
  ibReduxPersistKeys: string[]
): MetaReducer<any, any>[] => {
  return [getIbHydrationMetaReducer(ibSessionStorageKey, ibReduxPersistKeys)];
};