# Table 

Questo modulo fornisce diverse funzionalità come il filtraggio dei dati, la creazione e l'esportazione di viste*, il rollup delle righe* e altro ancora per `ib-kai-table`

_*not yet implemented_

## Getting Started

```html
<ib-kai-table
  [columns]="columns"
  [dataSource]="dataSource">
</ib-kai-table>
```

```typescript
@Component({})
export class SimpleKaiTableExample {
  dataSource = new MatTableDataSource<any>(TABLE_DATA);
  columns = [
    useColumn('person.name', 'name'),
    useColumn('person.favouriteFruit', 'fruit'),
    useColumn('person.fruitStock', 'stock', true),
  ];
}
```

## Defining Columns

Le colonne vengono definite attraverso una notazione ad oggetti, delle funzioni di utility sono tuttavia disponibili.

|property name|usage
|-|-|
columnDef|nome univoco per la colonna, solitamente corrisponde al nome della proprietà da riflettere sulle singole celle
header|nome header, supporta chiave i18n
sort|flag per abilitare il sort sulla colonna
cell|`(element: Record<string, any>): string`
||funzione per proiettare contenuti sulle singole celle della colonna. riceve come parametro la riga (un elemento di `dataSource.data`) e ritorna una stringa
||*non esagerare, usa `component` se le cose si fanno complicate*
component|accetta un componente che estende `IbCell`

### IbColumnDef utility functions

Tutte le colonne accettano come parametri, *il nome*, *proprietà*, ed un flag possibilità per il *sorting* o meno.

```typescript
useColumn(
  // column's header label (i18n)
  columnName,
  // property name to map the column to
  propertyName,
  // whether or not to enable sorting
  sort,
)
```

|function name|usage|
|-|-|
|`useColumn`|`useColumn('firstName')`
||`useColumn('user.firstName', 'firstName', false)`
|`useDateColumn`|`useDateColumn('order.update_at', 'updated_at', true)` => 01/01/1970 16:59 GMT+1 (default)
||`useDateColumn('movie.release_date', 'release_date', true, 'dd MMMM yyyy')` => 23 February 2021

### Context Actions

```typescript
useContextColumn((element: Record<string, any>): IbContextAction): IbColumnDef
```

```typescript

@Component({})
export class KaiTableContextActionExample {
  dataSource = new MatTableDataSource<any>(TABLE_DATA);
  columns = [
    useColumn('person.name', 'name'),
    useColumn('person.favouriteFruit', 'fruit'),
    useColumn('person.fruitStock', 'stock', true),
    useContextColumn(() => [{
      type: 'view',
      icon: 'chevron_right'
    }, {
      type: 'delete',
      icon: 'trash',
    }])
  ];
}
```

```html
<ib-kai-table ... (ibRowClicked)="handleRowClicked($event)"></ib-kai-table>
```

```typescript
handleRowClicked(event: IbTableRowEvent) {
  if (event.type === 'view') {
    // your logic
  }

  if (event.type === 'delete') {
    // delete logic
  }
}
```