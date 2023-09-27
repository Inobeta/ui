import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { useColumn, useContextColumn } from 'src/app/inobeta-ui/ui/kai-table/cells';
import { IbColumnDef, IbTableRowEvent } from 'src/app/inobeta-ui/ui/kai-table/table.types';
import { createNewUser, IbUserExample } from './users';

@Component({
  selector: 'ib-kai-table-context-action-example',
  template: `

  <section class="mat-typografy">
    <h1>
      <mat-icon>warning</mat-icon>
      Deprecation warning!
    </h1>
    <p>
      Al completamento di Kai Table l'attuale implementazione delle azioni
      per riga verrà deprecato (o comunque sia sconsigliato.)
    </p>
  </section>

  <ib-kai-table
    [dataSource]="dataSource"
    (ibRowClicked)="handleRowClicked($event)"
    class="mat-elevation-z8"
  ></ib-kai-table>
  `,
  styles: [`
  :host {
    display: flex;
    flex-direction: column;
    padding: 30px;
  }
  `]
})

export class IbKaiTableContextActionExamplePage implements OnInit {
  dataSource = new MatTableDataSource<IbUserExample>();
  columns: IbColumnDef<IbUserExample>[] = [
    useColumn('name'),
    useColumn('fruit'),
    useColumn('number', 'number', true),
    useContextColumn(() => [{type: 'view', icon: 'chevron_right'}])
  ];

  ngOnInit() {
    const users = Array.from({ length: 1000 }, (_, k) => createNewUser(k + 1))
    this.dataSource.data = users;
  }

  handleRowClicked(event: IbTableRowEvent<IbUserExample>) {
    if (event.type === 'view') {
      alert(`${event.row.name} has ${event.row.number} ${event.row.fruit}(s)`);
      // do the thing
    }
  }
}
