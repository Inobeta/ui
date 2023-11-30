import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LazyLoadedComponent } from "./lazy-loaded.component";

const routes: Routes = [
  {
    path: '',
    component: LazyLoadedComponent,
    data: { breadcrumb: '' },
  },
  {
    path: '',
    redirectTo: 'all',
    pathMatch: 'full'
  },
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [],
  declarations: [],
  providers: [],
})
export class LazyLoadedRoutingModule {}
