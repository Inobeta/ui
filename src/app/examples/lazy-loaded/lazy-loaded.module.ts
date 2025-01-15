import { exampleLazyFeature, lazyLoadedEffects } from './store';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LazyLoadedComponent } from './lazy-loaded.component';
import { LazyLoadedRoutingModule } from './lazy-loaded.routing';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';


@NgModule({
  imports: [
    CommonModule,
    LazyLoadedRoutingModule
  ],
  exports: [],
  declarations: [
    LazyLoadedComponent
  ],
  providers: [
    provideState(exampleLazyFeature),
    provideEffects(lazyLoadedEffects)
  ],
})
export class LazyLoadedModule { }
