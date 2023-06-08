import { lazyLoadedFeatureKey, lazyLoadedReducers, lazyLoadedEffects } from './store';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LazyLoadedComponent } from './lazy-loaded.component';
import { LazyLoadedRoutingModule } from './lazy-loaded.routing';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';


@NgModule({
  imports: [
    CommonModule,
    LazyLoadedRoutingModule,
    StoreModule.forFeature(lazyLoadedFeatureKey, lazyLoadedReducers),
    EffectsModule.forFeature([...lazyLoadedEffects])
  ],
  exports: [],
  declarations: [
    LazyLoadedComponent
  ],
  providers: [],
})
export class LazyLoadedModule { }
