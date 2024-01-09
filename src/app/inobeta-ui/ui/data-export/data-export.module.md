# Data export

## Basic usage with IbTable

```typescript
// example.module.ts
@NgModule({
  declarations: [
    ...
  ],
  imports: [
    IbKaiTableModule,
    IbDataExportModule,
    IbTableActionModule,
  ],
})
export class IbExampleModule {}
```

```html
<!-- example.component.html --->
<ib-kai-table tableName="fullExample" [columns]="columns" [dataSource]="dataSource">
  <ib-table-action-group>
    <ib-table-data-export-action></ib-table-data-export-action>
  </ib-table-action-group>
</ib-kai-table>
```

### Override a data accessor during export

Use `ibDataTransformer` directive to return a different value derived from the one present in the original dataset.

By default it accepts a function passing a single parameter, the value of a cell.

In the example below,
a boolean value is evaluated to string, “SUBSCRIBED” if true, “NOT SUBSCRIBED” if not.

This transformer function will be applied to **all** formats available.

```typescript
@Component({
  /* ... */
})
class IbTableWithExportTransformer {
  data = [
    { name: "alice", subscribed: true },
    { name: "rabbit", subscribed: false },
  ];

  subscribedTransformer = (isSubscribed: boolean) => date.getTime();
}
```

```html
<ib-kai-table tableName="users" [data]="data" [displayedColumns]="['name', 'subscribed']">
  <ib-table-action-group>
    <ib-table-data-export-action></ib-table-data-export-action>
  </ib-table-action-group>
  <ib-text-column name="name" />
  <ib-column
    name="subscribed"
    [ibDataTransformer]="subscribedTransformer"
  >
    <ng-container *ibCellDef="let element">
      <mat-icon [color]="element.subscribed ? 'accent' : ''">{{ element.subscribed ? "done" : "close" }}</mat-icon>
    </ng-container>
  </ib-column>
</ib-kai-table>
```

Use `ibDataTransformerFor` to apply the transformer function **only** to the format provided.

```html
<ib-column name="subscribed" [ibDataTransformer]="subscribedTransformer" ibDataTransformerFor="pdf">
  <ng-container *ibCellDef="let element">
    <mat-icon [color]="element.subscribed ? 'accent' : ''">{{ element.subscribed ? "done" : "close" }}</mat-icon>
  </ng-container>
</ib-column>
```

To change behaviour across multiple formats, specify a dictionary with where keys represent file formats and values are functions, each function will be assigned to the corresponding format.

```html
<ib-column
  name="subscribed"
  [ibDataTransformer]="{
    pdf: pdfTransformer,
    xlsx: xlsxTransformer
  }"
>
  <ng-container *ibCellDef="let element">
    <mat-icon [color]="element.subscribed ? 'accent' : ''">{{ element.subscribed ? "done" : "close" }}</mat-icon>
  </ng-container>
</ib-column>
```

## Add a custom format

The abstract class `IbDataExportProvider` can be extended to easily implement file exporters for various formats.

Using the token `OVERRIDE_EXPORT_FORMATS`, it is possible to **override** the available formats during data export, for example, in the "Export Data" dialog of `ib-table-data-export-action`

> Using this token empties the default list of available formats  
> `IbXLXSExportProvider`, `IbPDFExportProvider`, and `IbCSVExportProvider`

```typescript
// txt-export.service.ts
@Injectable()
export class IbTextExportService implements IbDataExportProvider {
  format = "txt";
  label = "Text (.txt)";

  export(data: any[], filename: string): void {
    // your code
  }
}

export const IbTextExportProvider = {
  provide: OVERRIDE_EXPORT_FORMATS,
  useClass: IbTextExportService,
  multi: true,
};
```

```typescript
// example.module.ts
@NgModule({
  imports: [IbKaiTableModule, IbDataExportModule, IbTableActionModule],
  providers: [
    IbDataExportService,
    // import anything you need from the library
    IbXLXSExportProvider,
    IbPDFExportProvider,
    IbCSVExportProvider,

    // and then yours
    IbTextExportProvider,
  ],
})
export class IbExampleModule {}
```

## PDF customization

```typescript
// example.module.ts
@NgModule({
  imports: [
    // ...
    IbDataExportModule,
  ],
  providers: [
    {
      provide: IB_DATA_JSPDF_OPTIONS,
      useValue: {
        orientation: "p",
        unit: "mm",
        format: "a4",
        putOnlyUsedFonts: true,
      },
    },
    {
      provide: IB_DATA_JSPDF_AUTOTABLE_USER_OPTIONS,
      useValue: {
        // see more at
        // https://github.com/simonbengtsson/jsPDF-AutoTable#styling-options
      },
    },
  ],
})
export class IbExampleModule {}
```
