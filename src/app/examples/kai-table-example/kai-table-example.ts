import { Component } from "@angular/core";
import { IbTableDef } from "../../inobeta-ui/ui/kai-table/table.types";
import { createNewUser } from "./users";

@Component({
  selector: "ib-kai-table-example",
  templateUrl: "kai-table-example.html",
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        padding: 30px;
      }
    `,
  ],
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

  testClick(ev) {
    console.log("ev", ev);
  }
}
