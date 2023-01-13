# Old ib-table deprecation "guide"

## Inputs

|Name|Previous Usage|Changes
|-|-|-|
customItemTemplate|custom cell template??|usa un componente custom in `columns.component`
titles|definizione colonne|usa `columns`
items|data|usa `MatTableDataSource` o compatibile
enableReduxStore|salva stato tabella su redux|**non supportato**
currentSort|inizializza sort|**non supportato**
selectableRows|righe selezionabili|**non supportato**
hasAdd|rende visibile pulsante per aggiungere righe|**non supportato**
hasEdit|aggiunge azione contestuale alle singole righe|usa `useContextColumn` per implementare azioni per le singole righe
hasDelete|idem|vedi sopra
hasExport|abilita esportazione dati in vari formati|**non supportato**
hasPaginator|mostra o nascodi il paginatore|usa `tableDef.paginator.hide`
hasFooter|mostra righe rollup|**non supportato**
hasConfig|salva e carica view tabella|**non supportato**
actions|azioni custom per tutta la tabella?|**non supportato**
stickyAreas|quali aree (es. header e footer) della tabella da rendere `position: sticky`|**non supportato**
structureTemplates|non ne ho idea|**non supportato?**
templateButtons|templates per azioni|usa `useContextColumn`
templateHeaders|templates per header|**non supportato**
pdfCustomStyles|nah|**non supportato**
pdfSetup|not a chance|**non supportato**
deleteConfirm|ah yes|**non supportato**
actionsPosition|posizione delle azioni custom|**non supportato**
iconSet|icone??|**non supportato**
tableName|nome tabella|**supportato**

## Differenze tra `titles` e `columns`

IbTableTitles property|IbColumnDef
|-|-|
`key`|`columnDef`
`value`|`cell` function renderer
`type`|**non supportato**
`filterable`|**non supportato**
`comboOptions`|**non supportato**
`format`|usa una pipe function in `cell`
`align`|**non supportato**
`width`|**non supportato**
`getClassByCondition`|**non supportato**
`sticky`|**non supportato**