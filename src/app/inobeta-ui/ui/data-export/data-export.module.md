# Data export

# Basic usage with IbTable

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

# Add a custom format

Viene fornita la classe astratta `IbDataExportProvider` per realizzare facilmente exporter di altri formati.

Attraverso il token `OVERRIDE_EXPORT_FORMATS` è possibile **sostituire** i formati disponibili durante l'esportazione dati, ad esempio nel dialog "Esporta dati" di `ib-table-data-export-action`.

> Utilizzare questo token svuota la lista di default di formati disponibili, composta da `IbXLXSExportProvider`, `IbPDFExportProvider`, ed `IbCSVExportProvider`.

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

# PDF customization

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
