# Old ib-table deprecation "guide"

## Inputs

|Name|Previous Usage|Changes
|-|-|
customItemTemplate|custom cell template??|✅ estendi `IbColumn`
titles|definizione colonne|✅ usa `displayedColumns`
items|data|✅ (diventa `dataSource`) usa `MatTableDataSource` o compatibile
enableReduxStore|salva stato tabella su redux|**non supportato**. solo le view vengono automaticamente salvate nello store.
currentSort|inizializza sort|✅ usa `tableDef.initialSort`
selectableRows|righe selezionabili|✅ supportato, usa `ib-selection-column`
hasAdd|rende visibile pulsante per aggiungere righe|✅ utilizza `ib-table-action-group` in `IbTableActionModule`
hasEdit|aggiunge azione contestuale alle singole righe|✅ usa `<ib-column ib-action-column>...</ib-column>`
hasDelete|idem|✅ utilizza `ib-table-action-group` in `IbTableActionModule`
hasExport|abilita esportazione dati in vari formati|✅ `ib-table-data-export-action` in `IbDataExportModule`
hasPaginator|mostra o nascodi il paginatore|✅ usa `tableDef.paginator.hide`
hasFooter|mostra righe rollup|✅ usa `aggregate` nelle colonne supportate
hasConfig|salva e carica view tabella|✅ usa `ib-table-view-group` in `IbViewModule`
actions|azioni custom per tutta la tabella|✅ utilizza `ib-table-action-group` in `IbTableActionModule`
stickyAreas|quali aree (es. header e footer) della tabella da rendere `position: sticky`|✅ usa gli input `sticky` o `stickyEnd` di una colonna (header e footer sono già sticky)
structureTemplates|sostituisce parti strutturali|**non supportato**, si tratta di un modo per sostituire di netto parti importanti della tabella (es paginatore), andrebbe cercata una soluzione alternativa
templateButtons|templates per azioni|✅ usa `ib-action-column`
templateHeaders|templates per header|**non supportato**, vedi structureTemplates
pdfCustomStyles|nah|✅ token `IB_DATA_JSPDF_AUTOTABLE_USER_OPTIONS` in `IbDataExportModule`
pdfSetup|not a chance|✅ token `IB_DATA_JSPDF_OPTIONS` in `IbDataExportModule`
deleteConfirm|ah yes|**deprecato**, da gestire via `ib-action-column`
actionsPosition|posizione delle azioni custom|**deprecato**, la posizione delle azioni è fissa
iconSet|icone per inline actions|✅ usa `ib-action-column`, inserisci (ad esempio) un `mat-icon-button`
tableName|nome tabella|✅ **supportato**


## Outputs
|Name|Previous Usage|Changes
|-|-|-|
|sortChange|avvisare il parent component che è cambiato il sort|✅ usa `dataSource.sort.sortChange`
|add/edit/delete|avvisare il parent component che l'utente ha cliccato su add, edit o delete|✅ utilizza `ib-table-action-group` in `IbTableActionModule`
|rowClicked|click su riga|✅ rinominato in `ibRowClicked`
|rowChecked|una riga è stata selezionata|✅ usa output `ibRowSelectionChange` nel componente `ib-selection-column`
