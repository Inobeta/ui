import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable } from 'rxjs';

import { TableEffects } from './table.effects';
import {initialState} from '../reducers/table.reducer';
import { IbHttpTestModule } from '../../../../http/http-test.module';
import { IbStorageTestModule } from '../../../../storage/storage-test.module';

describe('TableEffects', () => {
  let actions$: Observable<any>;
  let effects: TableEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TableEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState }),
        IbHttpTestModule,
        IbStorageTestModule
      ]
    });

    effects = TestBed.inject(TableEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
