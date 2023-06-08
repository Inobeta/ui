import { ActionReducerMap } from '@ngrx/store';
import { IExampleState } from './example/interfaces';
import { exampleReducer } from './example/reducers';
import { ExampleEffects } from "./example/effects";

export const lazyLoadedFeatureKey = 'lazyLoaded';

export interface ILazyLoadedStore{
    example: IExampleState;
}

export const lazyLoadedReducers: ActionReducerMap<ILazyLoadedStore> = {
    example: exampleReducer,
};

export const lazyLoadedEffects = [
    ExampleEffects,
]
