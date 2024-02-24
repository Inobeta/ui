import { Component } from "@angular/core";
import { IbTableDef } from "../../inobeta-ui/ui/kai-table/table.types";
import { createNewUser } from "./users";

@Component({
  selector: "ib-kai-table-example",
  templateUrl: "kai-table-example.html",
  styleUrl: "./kai-table-example.scss",
})
export class IbKaiTableExamplePage {
  data: any[];

  tableDef: IbTableDef = {
    /*paginator: {
      hide: true
    },*/
    initialSort: {
      active: "fruit",
      direction: "asc",
    },
  };

  ngOnInit() {
    this.data = Array.from({ length: 1000 }, (_, k) => createNewUser(k + 1));
  }
}
