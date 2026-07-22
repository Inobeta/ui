import { Component } from "@angular/core";
import { IbTableDef } from "public_api";
import { createNewUser } from "./users";
import { JsonPipe } from "@angular/common";
import { IbKaiTableModule } from "public_api";
import { MatButtonModule } from "@angular/material/button";
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: "ib-kai-table-example",
    templateUrl: "kai-table-example.html",
    styleUrl: "./kai-table-example.scss",
  imports: [
      JsonPipe, IbKaiTableModule, MatButtonModule, TranslatePipe
    ]
})
export class IbKaiTableExamplePage {
  data: any[];

  tableDef: IbTableDef = {
    // paginator is absent by default so the paginator is visible
    initialSort: {
      active: "fruit",
      direction: "asc",
    },
  };

  // Tracks the UI state for the paginator button
  paginatorHidden = false;

  get paginatorToggleKey() {
    return this.paginatorHidden ? 'examples.kaiTable.showPaginator' : 'examples.kaiTable.hidePaginator';
  }

  toggle() {
    // immutable update so change detection picks up the new tableDef
    this.tableDef = {
      ...this.tableDef,
      paginator: { ...this.tableDef.paginator, hide: !this.paginatorHidden },
    };
    this.paginatorHidden = !this.paginatorHidden;
  }

  ngOnInit() {
    this.data = Array.from({ length: 1000 }, (_, k) => createNewUser(k + 1));
  }
}
