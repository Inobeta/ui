# Old ib-table deprecation "guide"

## Inputs

|Name|Previous Usage|Changes
|-|-|-|
customItemTemplate|custom cell template??|usa un componente custom in `columns.component`
titles|definizione colonne|usa `columns`
items|data|usa `MatTableDataSource` o compatibile
enableReduxStore|salva stato tabella su redux|**non supportato** deprecato, va sostituito con hasConfig
currentSort|inizializza sort|**non supportato**, serve
selectableRows|righe selezionabili|**non supportato**, serve
hasAdd|rende visibile pulsante per aggiungere righe|**non supportato** deprecato, va sostituito con action
hasEdit|aggiunge azione contestuale alle singole righe|usa `useContextColumn` per implementare azioni per le singole righe
hasDelete|idem|vedi sopra
hasExport|abilita esportazione dati in vari formati|**non supportato**, serve
hasPaginator|mostra o nascodi il paginatore|usa `tableDef.paginator.hide`
hasFooter|mostra righe rollup|**non supportato**, serve
hasConfig|salva e carica view tabella|**non supportato**, serve
actions|azioni custom per tutta la tabella?|**non supportato**, serve o questo o un modo "standard" per eseguire azioni sulle righe selezionate
stickyAreas|quali aree (es. header e footer) della tabella da rendere `position: sticky`|**non supportato**, serve
structureTemplates|non ne ho idea|**non supportato?**, si tratta di un modo per sostituire di netto parti importanti della tabella (es paginatore), andrebbe cercata una soluzione alternativa
templateButtons|templates per azioni|usa `useContextColumn`
templateHeaders|templates per header|**non supportato**, vedi structureTemplates
pdfCustomStyles|nah|**non supportato**, serve
pdfSetup|not a chance|**non supportato**, serve
deleteConfirm|ah yes|**non supportato**, deprechiamo e sarà da gestire via `useContextColumn`
actionsPosition|posizione delle azioni custom|**non supportato**, vedi actions
iconSet|icone??|**non supportato**, deprechiamo e sarà da gestire via `useContextColumn`
tableName|nome tabella|**supportato**

## Outputs
|Name|Previous Usage|Changes
|-|-|-|
|sortChange|avvisare il parent component che è cambiato il sort|**non supportato**, vedi input `currentSort`, andrà disegnato qualcosa
|add/edit/delete|avvisare il parent component che l'utente ha cliccato su add, edit o delete| **non supportato**, deprecati in favore di `actions` e `useContextColumns`
|rowClicked|click su riga|rinominato in `ibRowClicked`
|rowChecked|una riga è stata selezionata|**non supportato**, vedi input `selectableRows`

## Differenze tra `titles` e `columns`

IbTableTitles property|IbColumnDef
|-|-|
`key`|`columnDef`
`value`|**non supportato**, è la label della colonna, credo si sostituisca con `columnName` o `columnDef`
`type`|**non supportato** deprechiamo: useremo `cell` per il render della cella, va trovata un'altra soluzione per il controllo dei filtri
`filterable`|**non supportato**, serve
`comboOptions`|**non supportato**, vedi considerazione su `type`
`format`|**non supportato**, deprechiamo: usa una pipe function in `cell`
`align`|**non supportato**, deprechiamo: usa una css class in `cell`
`width`|**non supportato** serviva a impostare una larghezza di massima delle colonne
`getClassByCondition`|**non supportato**, deprechiamo: usa una css class in `cell`
`sticky`|**non supportato**, vedi input `stickyAreas`
