import { ActionReducerMap } from '@ngrx/store';
import { IUrlStateState } from './url-state/interfaces';
import { urlStateReducer } from './url-state/reducers';
import { UrlStateEffects } from "./url-state/effects";

export interface IKaiTableStore{
    urlState: IUrlStateState;
}

export const kaiTableReducers: ActionReducerMap<IKaiTableStore> = {
    urlState: urlStateReducer,
};

export const kaiTableEffects = [
    UrlStateEffects,
]
