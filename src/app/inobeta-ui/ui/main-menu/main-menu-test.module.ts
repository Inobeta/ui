import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { IbMainMenuBarStubComponent } from "./components/main-menu-bar/main-menu-bar.stub.spec";


@NgModule({
  declarations: [
    IbMainMenuBarStubComponent,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    IbMainMenuBarStubComponent
  ]
})
export class IbMainMenuTestModule { }
