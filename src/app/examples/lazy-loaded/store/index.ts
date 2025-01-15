import { createFeature } from '@ngrx/store';
import { IExampleState } from './example/interfaces';
import { exampleMainReducer } from './example/reducers';
import { ExampleEffects } from "./example/effects";

export interface ILazyLoadedStore{
    example: IExampleState;
}

export const lazyLoadedEffects = [
    ExampleEffects,
]


export const exampleLazyFeature = createFeature({
  name: 'exampleLazyFeature',
  reducer: exampleMainReducer
})


export const {
  selectValue
} = exampleLazyFeature
