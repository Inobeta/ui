import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { TableEffects } from './table.effects';

describe('TableEffects', () => {
  let actions$: Observable<any>;
  let effects: TableEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TableEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(TableEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
