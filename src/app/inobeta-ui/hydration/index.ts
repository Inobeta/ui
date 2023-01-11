import { ActionReducerMap, MetaReducer } from "@ngrx/store";
import { HydrationEffects } from "./effects";
import { IbHydrationMetaReducer } from "./reducer";


export const reducers: ActionReducerMap<any> = {
};

export const ibEffects = [
  HydrationEffects
]

export const ibMetaReducers: MetaReducer<any, any>[] = [
  IbHydrationMetaReducer
];
