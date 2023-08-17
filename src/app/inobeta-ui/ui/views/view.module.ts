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
import { IbDefaultTableView } from "./components/default-table-view/default-table-view.component";
import { IbTableViewGroup } from "./components/table-view-group/table-view-group.component";
import { IbTableView } from "./components/table-view/table-view.component";
import { IbTableViewDialog } from "./components/view-dialog/view-dialog.component";
import { IbViewList } from "./components/view-list/view-list.component";
import { reducers } from "./store/reducer";
import { IbViewService } from "./view.service";

@NgModule({
  declarations: [
    IbTableViewGroup,
    IbTableView,
    IbDefaultTableView,
    IbTableViewDialog,
    IbViewList,
  ],
  exports: [
    IbTableViewGroup,
    IbTableView,
    IbDefaultTableView,
    IbTableViewDialog,
    IbViewList,
  ],
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
    StoreModule.forFeature("ibViews", reducers),
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  providers: [IbViewService],
})
export class IbViewModule {}
