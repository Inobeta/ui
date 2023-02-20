import { MetaReducer } from "@ngrx/store";
import { HydrationEffects } from "./effects";
import { getIbHydrationMetaReducer } from "./reducer";

const getIbMetaReducers = (ibSessionStorageKey: string, ibReduxPersistKeys: string[]): MetaReducer<any, any>[] => {
   return [
    getIbHydrationMetaReducer(ibSessionStorageKey, ibReduxPersistKeys)
  ]
}

export const ibSetupHydration = (ibSessionStorageKey: string, ibReduxPersistKeys: string[]) => {
  HydrationEffects.ibSessionStorageKey = ibSessionStorageKey;
  HydrationEffects.ibReduxPersistKeys = ibReduxPersistKeys;
  return {
    effects: [
      HydrationEffects
    ],
    metareducers: getIbMetaReducers(ibSessionStorageKey, ibReduxPersistKeys)
  }
}
