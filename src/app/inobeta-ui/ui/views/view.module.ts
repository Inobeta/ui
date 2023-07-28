import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { StoreModule } from "@ngrx/store";
import { TranslateModule } from "@ngx-translate/core";
import { IbTableViewGroup } from "./components/table-view-group/table-view-group.component";
import { IbTableView } from "./components/table-view/table-view.component";
import { IbTableViewDialog } from "./components/view-dialog/view-dialog.component";
import { viewsReducer } from "./store/views/reducer";
import { IbTableViewService } from "./table-view.service";

@NgModule({
  declarations: [IbTableViewGroup, IbTableView, IbTableViewDialog],
  exports: [IbTableViewGroup, IbTableView, IbTableViewDialog],
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatMenuModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    StoreModule.forFeature("ibTableViews", viewsReducer),
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  providers: [IbTableViewService],
})
export class IbTableViewModule {}
