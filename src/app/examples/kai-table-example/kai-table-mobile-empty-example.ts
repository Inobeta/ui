import { Component } from '@angular/core';
import { IbKaiTableModule } from 'public_api';

@Component({
  selector: 'ib-kai-table-mobile-empty-example',
  standalone: true,
  imports: [IbKaiTableModule],
  template: `
    <div style="padding: 16px; max-width: 720px; margin: 0 auto;">
      <h2>Empty Tables - Example 1</h2>
      <ib-kai-table [data]="[]" [state]="'idle'" tableName="emptyTable1">
        <ib-text-column name="name"></ib-text-column>
        <ib-text-column name="fruit"></ib-text-column>
      </ib-kai-table>

      <h2 style="margin-top: 24px">Empty Tables - Example 2</h2>
      <ib-kai-table [data]="[]" [state]="'idle'" tableName="emptyTable2">
        <ib-text-column name="name"></ib-text-column>
        <ib-text-column name="fruit"></ib-text-column>
      </ib-kai-table>

      <h2 style="margin-top: 24px">Empty Tables - Example 3</h2>
      <ib-kai-table [data]="[]" [state]="'idle'" tableName="emptyTable3">
        <ib-text-column name="name"></ib-text-column>
        <ib-text-column name="fruit"></ib-text-column>
      </ib-kai-table>

      <h2 style="margin-top: 24px">Empty Tables - Example 4</h2>
      <ib-kai-table [data]="[]" [state]="'idle'" tableName="emptyTable4">
        <ib-text-column name="name"></ib-text-column>
        <ib-text-column name="fruit"></ib-text-column>
      </ib-kai-table>
    </div>
  `,
  styles: [':host { display: block; }']
})
export class IbKaiTableMobileEmptyExamplePage {}
