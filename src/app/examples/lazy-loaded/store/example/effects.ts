import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { UPDATE } from '@ngrx/store';
import { of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { exampleActions } from './actions';

@Injectable({providedIn: 'root'})
export class ExampleEffects {
  private actions$ = inject(Actions);
  sampleAction$ = createEffect(():any => {
    return this.actions$.pipe(
      ofType(UPDATE),
      mergeMap((action) => {
        console.log('DIO FROM FEATURE')
        return of({}) //a service call
      })).pipe(
        map(() => {

        })
      )
  }, {
    dispatch: false
  });
}
