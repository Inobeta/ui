# DEVK-1105 — Correggere l’export di selezione e pagina corrente

> Intervento incrementale sull’export di `IbKaiTable`, incluse sorgenti remote e rendering mobile.

## 1. Goal

L’export della tabella propone solo dataset realmente disponibili:

- “righe selezionate” compare solo quando il datasource supporta la selezione e la tabella contiene `ib-selection-column`;
- “pagina corrente” compare solo quando il paginator calcola più di una pagina;
- le due modalità esportano rispettivamente le righe selezionate e quelle della pagina visualizzata;
- un datasource remoto propone ed esporta solo la pagina corrente, senza offrire export completo o selezione;
- l’esempio “data from API” consente di verificare il comportamento remote.

## 2. Current State

- `src/app/inobeta-ui/ui/kai-table/table.component.ts` espone già:
  - `canExportAllRows`, basato su `FullExport`;
  - `canExportCurrentPage`, basato su `CurrentPageExport`;
  - `canSelectRows`, basato su `RowSelection`;
  - `selectionColumn`, ottenuto con `contentChild(IbSelectionColumn)`.
- La visibilità dell’opzione selezionata usa solo `canSelectRows()`. Non verifica che `ib-selection-column` sia proiettata nella tabella.
- `IbTable.doExport()` non passa `selectionColumn().selection.selected` a `IbDataExportService._exportFromTable()`.
- `src/app/inobeta-ui/ui/data-export/data-export.service.ts` sa già trasformare `selectedRows` e contiene uno slicing della pagina corrente quando il datasource espone un `MatPaginator`.
- L’integrazione resta difettosa perché `IbTableLocalDataSource` e `IbTableRemoteDataSource` non espongono il contratto Material completo assunto dal cast in `doExport()`. In particolare, il datasource locale moderno non espone `paginator`, mentre quello remoto non espone `sortedColumns`, `sortData` o `paginator`.
- `IbTableLocalDataSource` espone già dati distinti:
  - `filteredData`;
  - `orderedData`;
  - `currentPageData`;
  - i relativi getter difensivi.
- `IbTableRemoteDataSource.filteredData` contiene esclusivamente la pagina restituita dall’ultima richiesta server.
- `src/app/inobeta-ui/ui/data-export/table-data-export-dialog.component.ts` mostra sempre l’opzione `current` e inizializza il form con `all` oppure `current`, senza considerare tutte le combinazioni di opzioni visibili.
- `src/app/inobeta-ui/ui/data-export/table-data-export.component.ts` passa al dialog solo i flag per dataset completo e righe selezionate.
- `IbTableRemoteDataSource.capabilities` è attualmente un set vuoto. Di conseguenza l’export remote viene nascosto completamente.
- Il paginator riceve `length` da `totalCount$`, sia per datasource locali sia remoti. `MatPaginator.getNumberOfPages()` può quindi determinare correttamente la disponibilità della pagina corrente, ma `length` e `pageSize` non sono signal Angular: serve un aggiornamento esplicito della disponibilità.
- `src/app/inobeta-ui/ui/kai-table-mobile/` possiede input per le capability di export, ma `table.component.html` non li inoltra. I default `true` possono quindi proporre modalità non supportate.
- `src/app/examples/kai-table-example/server-side/kai-table-api-example.ts` contiene già un componente export, ma non usa il marker `ibTableAction` intercettato dalla logica capability-aware della tabella.
- I fatti sopra sono stati verificati leggendo il codice e gli spec esistenti. Non è stata ancora eseguita una verifica runtime del demo.

## 3. Assumptions / Open Questions

### Decisioni confermate

- Il ticket deve correggere sia la visibilità sia il funzionamento effettivo delle due modalità.
- L’opzione “righe selezionate” richiede contemporaneamente:
  - capability `RowSelection`;
  - presenza effettiva di `ib-selection-column`.
- Le righe selezionate vengono lette direttamente dal `SelectionModel` della `IbSelectionColumn` ottenuta tramite `contentChild`.
- La presenza di più pagine viene determinata tramite `MatPaginator.getNumberOfPages() > 1`.
- La pagina locale viene estratta prima dell’invocazione del servizio, usando ordine corrente, `pageIndex` e `pageSize`.
- Il datasource remoto supporta `CurrentPageExport`, ma non `FullExport` o `RowSelection`.
- L’esempio con dati API deve esporre l’azione export.

### Decisioni prese da me, con motivazione

- Il datasource remoto non riceverà finti `MatSort` o `MatPaginator`: deve restare indipendente dai controlli Material e la sua pagina è già ordinata e paginata dal server.
- `IbTable` normalizzerà i diversi datasource in un `IbExportableSource` tipizzato prima di chiamare il servizio. Questo elimina il cast non sicuro senza rompere il metodo pubblico esistente.
- Per il dataset `current`, le sorgenti locali useranno righe ordinate e slicing client-side; la sorgente remota userà direttamente `filteredData`, perché applicare nuovamente `pageIndex` alla risposta server produrrebbe una pagina vuota dopo la prima.
- `showCurrentPageOption` avrà un default retrocompatibile a `true`, così i consumatori diretti del dialog o dell’action non cambieranno comportamento se non passano il nuovo flag.
- Il dataset iniziale del dialog sarà la prima opzione visibile tra `all`, `selected` e `current`. Evita che il form conservi un valore relativo a un radio button nascosto.
- Se nessun dataset è disponibile, l’azione export verrà soppressa interamente. È necessario soprattutto per un remote con una sola pagina.
- Le capability remote resteranno esposte come `ReadonlySet` sovrascrivibile dalle sottoclassi, senza API mutabili `add/remove`. Evita variazioni runtime e mantiene esplicito il contratto della sottoclasse.
- Il rendering mobile riceverà gli stessi flag calcolati da `IbTable`; la selezione resterà esclusa dal mobile perché non esiste una selection column mobile.
- Non sono necessarie nuove traduzioni: tutte le etichette esistono già.

### Questioni aperte, non bloccanti

- Il comportamento UX quando l’utente sceglie “righe selezionate” senza aver selezionato righe non viene modificato: il servizio mantiene la validazione esistente sulle selezioni vuote. Non blocca il ticket perché non è stato segnalato come problema.
- L’esempio remoto dipende dalle API GitHub e può essere soggetto a rate limiting. I test automatici useranno datasource controllati e non dipenderanno dalla rete.
- Il componente export già presente nell’esempio API potrebbe risultare visibile in alcune configurazioni di content projection; verrà comunque sostituito con il marker capability-aware canonico.

## 4. Proposed Approach

Il flusso viene separato in tre responsabilità:

1. **Dialog condiviso**
   - riceve tre flag espliciti;
   - mostra solo i dataset consentiti;
   - seleziona sempre un valore visibile.

2. **Orchestrazione in `IbTable`**
   - combina capability, presenza della selection column e stato reale del paginator;
   - estrae le righe corrette in modo source-aware;
   - costruisce un adapter `IbExportableSource` tipizzato;
   - inoltra i flag anche al renderer mobile.

3. **Datasource remoto**
   - dichiara esclusivamente `CurrentPageExport`;
   - continua a fornire al client solo la pagina già caricata;
   - non effettua richieste aggiuntive durante l’export.

| Dataset | Locale moderno | Legacy locale | Remoto |
|---|---|---|---|
| `all` | Tutte le righe filtrate e ordinate | Tutte le righe filtrate e ordinate | Non proposto |
| `selected` | `selectionColumn().selection.selected`, ordinate | Stessa regola | Non proposto |
| `current` | Slice delle righe ordinate con paginator corrente | Stessa regola | `filteredData` già paginata dal server |

## 5. Step-by-Step Plan

### Dependencies between steps

`1 → 3`; `1+2+3 → 4`; `1 → 5`; `2+4 → 6`; `3+4 → 7`; `4 → 8`

---

### Step 1 — Controllare esplicitamente l’opzione pagina corrente nel dialog ✅ DONE

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/app/inobeta-ui/ui/data-export/data-export.service.ts`, `src/app/inobeta-ui/ui/data-export/table-data-export.component.ts`, `src/app/inobeta-ui/ui/data-export/table-data-export-dialog.component.ts`
- **Obiettivo**: consentire ai chiamanti di mostrare o nascondere `current` senza produrre un valore form nascosto o rompere i consumatori esistenti.
- **Requisiti**:
  1. Aggiungere `showCurrentPageOption` al contratto del dialog e all’input di `IbTableDataExportAction`.
  2. Inoltrare il flag dall’action a `openExportDialog()`.
  3. Mostrare il radio `current` solo quando il flag è attivo.
  4. Mantenere `current` visibile per i chiamanti esistenti che omettono il nuovo flag.
  5. Inizializzare `dataset` con la prima opzione visibile nell’ordine `all`, `selected`, `current`.
  6. Non aggiungere testo visibile o chiavi di traduzione.
- **Vincoli**: non cambiare i valori pubblici `all`, `selected`, `current`; non modificare provider o formati di export; non cambiare `public_api.ts`.
- **Validazione**: `npm run packagr` deve completare senza errori Angular o TypeScript.
- **Stop condition**: fermarsi se il default retrocompatibile richiede una modifica incompatibile a `IDataExportSettings`.

**Executor Input**:

~~~
## TASK:
Add explicit current-page option control to the shared table export action and dialog.

## CONTEXT:
`IbTableDataExportAction` opens `IbTableDataExportDialog` through `IbDataExportService`. The dialog currently gates `all` and `selected`, always renders `current`, and defaults to `all` or `current`. Existing direct callers must retain current-page visibility when they omit the new flag.

## OBJECTIVE:
Allow callers to hide the current-page dataset while ensuring the form always selects a visible option.

## REQUIREMENTS:
1. Add `showCurrentPageOption` to the dialog data contract and to `IbTableDataExportAction`.
2. Forward the flag through `openExportDialog()`.
3. Render the `current` radio only when the flag is enabled.
4. Preserve current-page visibility for callers that omit the new flag.
5. Initialize `dataset` to the first visible option in this order: `all`, `selected`, `current`.
6. Reuse existing translation keys and add no visible strings.

## CONSTRAINTS:
- Do not rename or change the values `all`, `selected`, or `current`.
- Do not modify export providers, formats, or `public_api.ts`.
- Keep Angular template expressions simple and null-safe.
- Do not introduce `any`.

## OUTPUT:
Report modified files, the backward-compatibility default chosen, and the dataset fallback logic.

## ACCEPTANCE CRITERIA:
- `npm run packagr` passes.
- The dialog can hide `current`.
- Existing callers that omit the new flag still see `current`.
- The form never defaults to a hidden dataset when at least one option is visible.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 2 — Abilitare l’export della pagina nel datasource remoto ✅ DONE

- **Executor**: `kai-table-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/app/inobeta-ui/ui/kai-table/remote-data-source.ts`
- **Obiettivo**: dichiarare che ogni datasource remoto può esportare la pagina già caricata, senza dichiarare modalità non implementate.
- **Requisiti**:
  1. Impostare `CurrentPageExport` come unica capability predefinita.
  2. Non includere `FullExport`, `RowSelection` o `GlobalAggregation`.
  3. Mantenere il set readonly e sovrascrivibile da una sottoclasse che implementi capability aggiuntive.
  4. Documentare che una capability aggiuntiva deve corrispondere a un comportamento realmente implementato dalla sottoclasse.
  5. Non aggiungere controlli Material o richieste HTTP dedicate all’export.
- **Vincoli**: non modificare pipeline, debounce, cancellazione, conteggio consumatori o forma di `IbRemoteDataSourceRequest`.
- **Validazione**: `npm run packagr` deve completare senza errori.
- **Stop condition**: fermarsi se l’estendibilità richiede una modifica incompatibile al costruttore pubblico.

**Executor Input**:

~~~
## TASK:
Declare current-page export support on `IbTableRemoteDataSource`.

## CONTEXT:
The remote source already exposes only the currently fetched page through `filteredData`. Its capability set is empty, so table export is entirely disabled. Full export and row selection remain unsupported.

## OBJECTIVE:
Make current-page export available by default while keeping all unsupported capabilities absent.

## REQUIREMENTS:
1. Make `CurrentPageExport` the only default capability.
2. Do not include `FullExport`, `RowSelection`, or `GlobalAggregation`.
3. Keep the capability set readonly and explicitly overridable by subclasses.
4. Document that overrides must only advertise behavior implemented by the subclass.
5. Do not add Material paginator/sort controls or export-specific HTTP requests.

## CONSTRAINTS:
- Do not change request, debounce, cancellation, refresh, or connection behavior.
- Do not add mutable capability APIs.
- Do not modify files outside `remote-data-source.ts`.

## OUTPUT:
Report the resulting default capability set and how subclasses can extend it.

## ACCEPTANCE CRITERIA:
- `npm run packagr` passes.
- A base remote source advertises only `CurrentPageExport`.
- Existing request behavior remains unchanged.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 3 — Allineare il renderer mobile alle opzioni disponibili ✅ DONE

- **Executor**: `kai-table-mobile-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.ts`, `src/app/inobeta-ui/ui/kai-table-mobile/table-mobile-toolbar.component.ts`
- **Obiettivo**: fare in modo che il mobile mostri l’azione e le opzioni export solo quando almeno un dataset è disponibile.
- **Requisiti**:
  1. Inoltrare al dialog mobile il nuovo flag `showCurrentPageOption`.
  2. Mostrare il pulsante export quando è disponibile `all` oppure `current`, non soltanto quando è disponibile `current`.
  3. Nascondere interamente il pulsante quando entrambi i flag sono falsi.
  4. Continuare a impostare `showSelectedRowsOption` a `false`.
  5. Conservare i default pubblici esistenti per l’uso standalone del componente mobile.
- **Vincoli**: non modificare infinite scroll, filtri, sorting, card rendering o file desktop.
- **Validazione**: `npm run packagr` deve completare senza errori.
- **Stop condition**: fermarsi se il dialog condiviso non espone `showCurrentPageOption` dopo Step 1.

**Executor Input**:

~~~
## TASK:
Make mobile export controls honor the available all/current dataset options.

## CONTEXT:
The mobile toolbar currently gates the export button only with `canExportCurrentPage` and opens the shared dialog without a current-page visibility flag. Row selection is not supported by the mobile renderer.

## OBJECTIVE:
Render a mobile export action only when at least one supported dataset exists and pass exact option visibility to the dialog.

## REQUIREMENTS:
1. Forward `showCurrentPageOption` to the shared export dialog.
2. Render the export button when either all-row or current-page export is available.
3. Hide the export button when both options are unavailable.
4. Keep selected-row export disabled on mobile.
5. Preserve existing public defaults for standalone mobile consumers.

## CONSTRAINTS:
- Do not modify infinite scroll, filters, sorting, or card rendering.
- Do not touch desktop kai-table files.
- Do not add visible strings or translation keys.

## OUTPUT:
Report modified inputs, gating logic, and dialog flags.

## ACCEPTANCE CRITERIA:
- `npm run packagr` passes.
- All-only mode renders an export button.
- Current-only mode renders an export button.
- No-option mode renders no export button.
- Selected-row mode remains unavailable.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 4 — Normalizzare ed eseguire l’export in IbTable ✅ DONE

- **Executor**: `kai-table-executor`
- **Modelli suggeriti**: gruppo R
- **File consentiti**: `src/app/inobeta-ui/ui/kai-table/table.component.ts`, `src/app/inobeta-ui/ui/kai-table/table.component.html`
- **Obiettivo**: calcolare opzioni export corrette e fornire al servizio esattamente le righe richieste per datasource locale, legacy e remoto.
- **Requisiti**:
  1. Rendere disponibile `selected` solo quando `RowSelection` è supportata e `selectionColumn()` esiste.
  2. Rendere disponibile `current` solo quando `CurrentPageExport` è supportata e `paginator.getNumberOfPages() > 1`.
  3. Aggiornare la disponibilità di `current` dopo variazioni di `totalCount`, `pageSize`, snapshot del paginator e sostituzione del datasource.
  4. Nascondere l’intera azione export quando nessun dataset è disponibile, senza renderizzare come fallback il template di un’azione export non supportata.
  5. Passare i tre flag corretti all’action desktop e i flag `all/current` al componente mobile.
  6. Per `selected`, leggere e passare direttamente `selectionColumn().selection.selected`.
  7. Per `current` locale o legacy, ordinare i dati e applicare lo slice con `pageIndex` e `pageSize` prima di chiamare il servizio.
  8. Per `current` remoto, usare direttamente `filteredData`, senza un secondo slice e senza nuova richiesta server.
  9. Per `all`, conservare export completo, filtri, ordinamento e trasformazioni solo quando `FullExport` è presente.
  10. Costruire un adapter `IbExportableSource` tipizzato con colonne, capability e righe normalizzate; rimuovere il cast a `IbTableDataSource<unknown>`.
  11. Mantenere i guard runtime contro richieste di dataset non supportati.
- **Vincoli**: non aggiungere `MatPaginator` o `MatSort` al datasource remoto; non modificare il servizio export; non cambiare NgRx, URL state, filtri o aggregazioni; non introdurre nuove API pubbliche o traduzioni.
- **Validazione**: `npm run packagr` deve completare senza errori e senza cast non sicuro del datasource nel percorso export.
- **Stop condition**: fermarsi se ottenere le colonne remote richiede una modifica pubblica a `IbColumn` o a `public_api.ts`.

**Executor Input**:

~~~
## TASK:
Normalize kai-table export availability and row extraction across local, legacy, and remote sources.

## CONTEXT:
`IbTable.doExport()` currently casts every active source to `IbTableDataSource`, does not pass selected rows, and relies on Material paginator fields missing from modern local and remote sources. `IbTableLocalDataSource` exposes ordered/current-page getters. Remote `filteredData` already contains the server page. The shared dialog and mobile renderer are updated by Steps 1 and 3.

## OBJECTIVE:
Ensure each visible export mode exports exactly the dataset it names, with capability-safe desktop and mobile UI.

## REQUIREMENTS:
1. Expose selected-row export only when `RowSelection` exists and `selectionColumn()` is present.
2. Expose current-page export only when `CurrentPageExport` exists and `paginator.getNumberOfPages() > 1`.
3. Refresh current-page availability after total count, page size, paginator snapshot, and datasource changes.
4. Suppress an export action completely when no dataset is available; do not fall back to its unsupported template.
5. Pass exact option flags to the desktop export action and mobile table.
6. Read selected rows directly from `selectionColumn().selection.selected`.
7. For modern local and legacy local sources, order rows and slice with current `pageIndex` and `pageSize` before service invocation.
8. For remote sources, use current `filteredData` without slicing it again or fetching data.
9. Preserve full filtered/ordered export only for sources with `FullExport`.
10. Build a typed `IbExportableSource` adapter and remove the `IbTableDataSource` export cast.
11. Retain runtime capability guards for all dataset values.

## CONSTRAINTS:
- Do not add Material controls to the remote source.
- Do not modify the shared export service.
- Do not change NgRx state, URL persistence, filtering, aggregation, or translations.
- Do not introduce `any` or modify `public_api.ts`.
- Preserve column transformations and internal `ib-` column exclusion.

## OUTPUT:
Report availability signals, re-evaluation triggers, extraction rules per source type, and removal of unsafe casts.

## ACCEPTANCE CRITERIA:
- `npm run packagr` passes.
- Selected export receives exactly the selection model rows.
- Local current export receives the ordered current-page slice.
- Remote current export receives exactly the already fetched page.
- Unsupported export modes never reach the service.
- Desktop and mobile receive consistent option flags.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 5 — Coprire il dialog export con test unitari ✅ DONE

- **Executor**: `unit-jasmine-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/app/inobeta-ui/ui/data-export/table-data-export.component.spec.ts`, `src/app/inobeta-ui/ui/data-export/table-data-export-dialog.component.spec.ts`
- **Obiettivo**: verificare visibilità, inoltro dei flag e valore iniziale del nuovo contratto del dialog.
- **Requisiti**:
  1. Verificare che l’action inoltri tutti e tre i flag a `openExportDialog()`.
  2. Verificare che `current` sia presente quando abilitato e assente quando disabilitato.
  3. Verificare il default retrocompatibile quando `showCurrentPageOption` viene omesso.
  4. Verificare i dataset iniziali per configurazioni `all`, `selected-only` e `current-only`.
  5. Usare TestBed, `NoopAnimationsModule`, `TranslateModule` e harness Material dove applicabili.
- **Vincoli**: modificare solo spec co-locati; non indebolire assertion esistenti e non usare `fdescribe` o `fit`.
- **Validazione**: `ng test --include='src/app/inobeta-ui/ui/data-export/table-data-export.component.spec.ts' --include='src/app/inobeta-ui/ui/data-export/table-data-export-dialog.component.spec.ts' --watch=false` deve passare.
- **Stop condition**: fermarsi se i componenti non sono compilabili con il contratto prodotto da Step 1.

**Executor Input**:

~~~
## TASK:
Add Jasmine coverage for shared export action and dialog option gating.

## CONTEXT:
Step 1 adds `showCurrentPageOption`, backward-compatible defaults, and first-visible dataset initialization. There are currently no co-located specs for these two components.

## OBJECTIVE:
Prove that option flags and form defaults remain correct for every supported combination.

## REQUIREMENTS:
1. Verify that the action forwards all three option flags to `openExportDialog()`.
2. Verify that the current-page radio is rendered only when enabled.
3. Verify backward-compatible current-page visibility when the new flag is omitted.
4. Verify initial datasets for all-enabled, selected-only, and current-only configurations.
5. Use TestBed, `NoopAnimationsModule`, `TranslateModule`, and Material harnesses where appropriate.

## CONSTRAINTS:
- Modify only the allowed spec files.
- Do not use `fdescribe`, `fit`, or brittle CSS tied to Material internals.
- Do not weaken production typing to simplify tests.

## OUTPUT:
Report created specs, covered combinations, and test command result.

## ACCEPTANCE CRITERIA:
- `ng test --include='src/app/inobeta-ui/ui/data-export/table-data-export.component.spec.ts' --include='src/app/inobeta-ui/ui/data-export/table-data-export-dialog.component.spec.ts' --watch=false` passes.
- Assertions individually cover flag forwarding, current visibility, backward default, selected-only default, and current-only default.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 6 — Coprire export desktop e datasource remoto ✅ DONE

- **Executor**: `unit-jasmine-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/app/inobeta-ui/ui/kai-table/table.component.spec.ts`, `src/app/inobeta-ui/ui/kai-table/remote-data-source.spec.ts`
- **Obiettivo**: dimostrare che capability, visibilità e righe esportate sono corrette nei flussi desktop locale e remoto.
- **Requisiti**:
  1. Aggiornare l’aspettativa capability remote a `CurrentPageExport` soltanto.
  2. Verificare che `selected` sia nascosto senza selection column e visibile con selection column.
  3. Verificare che l’export selezionato produca esattamente le righe presenti nel `SelectionModel`.
  4. Verificare che `current` sia nascosto con una pagina e visibile con più pagine.
  5. Verificare che la disponibilità si aggiorni dopo una modifica del `pageSize`.
  6. Verificare che una pagina locale non iniziale esporti soltanto il relativo slice ordinato.
  7. Verificare che un remote proponga solo `current`, esporti la risposta caricata e non effettui richieste aggiuntive.
  8. Verificare che `all` e `selected` remote non raggiungano il servizio.
- **Vincoli**: non modificare file di produzione; usare datasource controllati, senza rete; non usare `fdescribe` o `fit`.
- **Validazione**: `ng test --include='src/app/inobeta-ui/ui/kai-table/table.component.spec.ts' --include='src/app/inobeta-ui/ui/kai-table/remote-data-source.spec.ts' --watch=false` deve passare.
- **Stop condition**: fermarsi se un’assertion richiede accesso a dettagli privati invece di output, harness o spy pubblici.

**Executor Input**:

~~~
## TASK:
Add desktop integration and remote capability tests for DEVK-1105.

## CONTEXT:
Step 2 enables only current-page export on remote sources. Step 4 combines datasource capabilities, selection-column presence, paginator page count, and source-aware row extraction.

## OBJECTIVE:
Prove that desktop users see only valid export modes and receive exactly the requested rows.

## REQUIREMENTS:
1. Assert that a base remote source exposes only `CurrentPageExport`.
2. Assert that selected export is hidden without a selection column and visible with one.
3. Assert that selected export outputs exactly the rows in the selection model.
4. Assert that current-page export is hidden for one page and visible for multiple pages.
5. Assert that changing page size updates current-page option visibility.
6. Assert that a non-first local page exports only its ordered page slice.
7. Assert that remote export offers only current page, exports loaded rows, and performs no extra fetch.
8. Assert that remote all/selected requests never reach the export service.

## CONSTRAINTS:
- Modify only the allowed spec files.
- Use controlled local/remote fixtures; do not call external APIs.
- Prefer Material harnesses and public outputs over implementation-private state.
- Do not use `fdescribe` or `fit`.

## OUTPUT:
Report updated tests, fixture changes, and exact command result.

## ACCEPTANCE CRITERIA:
- `ng test --include='src/app/inobeta-ui/ui/kai-table/table.component.spec.ts' --include='src/app/inobeta-ui/ui/kai-table/remote-data-source.spec.ts' --watch=false` passes.
- Each requirement has a dedicated assertion.
- Existing table and remote datasource tests remain green.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 7 — Coprire il gating export mobile ✅ DONE

- **Executor**: `unit-jasmine-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.spec.ts`
- **Obiettivo**: verificare che il renderer mobile rispetti le combinazioni `all`, `current` e nessuna opzione.
- **Requisiti**:
  1. Verificare che `all=true/current=false` mostri il pulsante e nasconda il radio `current`.
  2. Verificare che `all=false/current=true` mostri il pulsante e proponga soltanto `current`.
  3. Verificare che entrambi falsi nascondano il pulsante.
  4. Verificare che `selected` non venga mai proposto dal mobile.
  5. Conservare le coperture esistenti su sorting e rendering.
- **Vincoli**: non modificare produzione; non usare `fdescribe` o `fit`; usare harness Material per il dialog.
- **Validazione**: `ng test --include='src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.spec.ts' --watch=false` deve passare.
- **Stop condition**: fermarsi se gli input prodotti da Step 3 non consentono di rappresentare separatamente `all` e `current`.

**Executor Input**:

~~~
## TASK:
Add mobile export capability-gating tests.

## CONTEXT:
Step 3 changes mobile toolbar gating so all-only and current-only modes are valid, no-option mode is hidden, and selected export remains unsupported.

## OBJECTIVE:
Prove that mobile export UI exactly matches the received capability flags.

## REQUIREMENTS:
1. Verify all-only mode renders the button and hides the current-page radio.
2. Verify current-only mode renders the button and offers only current page.
3. Verify no-option mode renders no export button.
4. Verify selected rows are never offered.
5. Preserve existing sorting and rendering coverage.

## CONSTRAINTS:
- Modify only the allowed spec file.
- Use Material dialog/radio/button harnesses.
- Do not use `fdescribe`, `fit`, or external network calls.

## OUTPUT:
Report added scenarios and test command result.

## ACCEPTANCE CRITERIA:
- `ng test --include='src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.spec.ts' --watch=false` passes.
- All-only, current-only, no-option, and selected-hidden assertions pass independently.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 8 — Rendere verificabile l’export nell’esempio API ✅ DONE

- **Executor**: `examples-executor`
- **Modelli suggeriti**: gruppo F
- **File consentiti**: `src/app/examples/kai-table-example/server-side/kai-table-api-example.ts`
- **Obiettivo**: esporre nell’esempio remoto l’azione export capability-aware usata dalla tabella.
- **Requisiti**:
  1. Sostituire il componente export diretto con un’azione `ibTableAction` di kind `export`, seguendo il pattern già usato dagli esempi funzionanti.
  2. Conservare `IbDataExportModule` e `IbTableActionModule` necessari.
  3. Non aggiungere selection column o modalità full export.
  4. Non modificare fetch, filtri, sorting, gestione errori o refresh.
  5. Non aggiungere nuove stringhe visibili.
- **Vincoli**: non modificare sorgenti della libreria, datasource GitHub o altri esempi.
- **Validazione**: `npm run build` deve completare senza errori.
- **Stop condition**: fermarsi se il marker export richiede modifiche fuori dal file consentito.

**Executor Input**:

~~~
## TASK:
Expose the capability-aware export action in the server-side kai-table example.

## CONTEXT:
The API example currently includes a direct export component, while `IbTable` capability gating intercepts an `ibTableAction` whose kind is `export`. Remote sources support current-page export only after DEVK-1105.

## OBJECTIVE:
Make the API example exercise the same gated remote export path used by consumers.

## REQUIREMENTS:
1. Replace the direct export component with an `ibTableAction` export marker matching existing working examples.
2. Keep required export and table-action modules imported.
3. Do not add selection or full-export UI.
4. Preserve API fetching, filters, sorting, simulated errors, and refresh behavior.
5. Add no new visible strings.

## CONSTRAINTS:
- Modify only `kai-table-api-example.ts`.
- Do not modify the GitHub datasource or library source.
- Do not add unrelated formatting or refactors.

## OUTPUT:
Report the template change and build result.

## ACCEPTANCE CRITERIA:
- `npm run build` passes.
- The example declares an `ibTableAction` with export kind.
- No selection column or full-export override is introduced.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

## 6. Impacted Areas

### Estensioni pubbliche

- `IbTableDataExportDialogData`
  - nuovo flag `showCurrentPageOption`.
- `IbTableDataExportAction`
  - nuovo input `showCurrentPageOption`.
- `IbTableRemoteDataSource.capabilities`
  - default modificato da set vuoto a `CurrentPageExport`;
  - set readonly sovrascrivibile dalle sottoclassi.
- Gli input export del renderer mobile continuano a esistere, ma vengono alimentati dal parent con valori effettivi.

### Implementazione interna

- `IbTable`
  - nuovi predicati distinti per capability e visibilità;
  - sincronizzazione del numero di pagine;
  - adapter tipizzato `IbExportableSource`;
  - estrazione source-aware dei dataset;
  - passaggio delle righe selezionate.
- Template desktop e mobile
  - azione nascosta quando nessun dataset è disponibile;
  - flag coerenti tra renderer.

### Aree deliberatamente escluse

- Nessuna modifica ai provider CSV, PDF o XLSX.
- Nessuna modifica al protocollo HTTP del datasource remoto.
- Nessun supporto remote per export completo o selezione.
- Nessuna modifica a NgRx, URL state, filtri, aggregazioni o traduzioni.
- Nessuna modifica a `public_api.ts`.
- Nessuna Storybook story richiesta.

## 7. Risks

- **Stato paginator non reattivo**: `length` e `pageSize` non sono signal. Mitigazione: aggiornamento esplicito dopo total count, eventi paginator, snapshot e cambio datasource, coperto da test.
- **Doppia paginazione remote**: applicare lo slice locale alla risposta remota svuoterebbe pagine successive. Mitigazione: ramo esplicito che usa direttamente `filteredData`.
- **Regressione dei datasource legacy**: il nuovo adapter potrebbe cambiare ordinamento o colonne. Mitigazione: conservare gli extension point legacy e aggiungere test su pagina ordinata.
- **Valore form nascosto**: nascondere `current` può lasciare il form su `current`. Mitigazione: selezione iniziale della prima opzione visibile.
- **Nessuna modalità remote con una sola pagina**: il remote supporta solo `current`, che deve essere nascosto con una pagina. Mitigazione: nascondere l’intera azione quando non resta alcun dataset.
- **Capability remote sovradichiarate da sottoclassi**: una sottoclasse potrebbe annunciare `FullExport` senza implementarlo. Mitigazione: set readonly, documentazione esplicita e nessuna capability aggiuntiva nel base.
- **Selezione basata su reference identity**: `SelectionModel` conserva riferimenti alle righe renderizzate. Mitigazione: leggere direttamente il modello al momento dell’export, evitando copie sincronizzate tramite eventi.
- **Differenze desktop/mobile**: i default mobile attuali possono divergere dalle capability reali. Mitigazione: inoltro esplicito dei flag dal parent e test dedicati.
- **Esempio API dipendente dalla rete**: possibile rate limiting GitHub. Rischio accettato per la verifica manuale; i test automatici restano offline.

## 8. Validation Checklist

- `npm run lint`
- `npm run packagr`
- `npm run build`
- `npm run test-ci`
- In una tabella locale senza `ib-selection-column`, il dialog non mostra “righe selezionate”.
- Nella stessa tabella con `ib-selection-column`, il dialog mostra “righe selezionate”.
- Selezionando due righe, l’export contiene esattamente quelle due righe.
- Con una sola pagina, il dialog non mostra “pagina corrente”.
- Con più pagine, il dialog mostra “pagina corrente”.
- Cambiando `pageSize` fino a ottenere una sola pagina, l’opzione scompare senza ricaricare la tabella.
- Esportando una pagina locale successiva alla prima, il file contiene soltanto le righe di quella pagina nell’ordine corrente.
- Nell’esempio API con più pagine, il dialog propone soltanto “pagina corrente”.
- L’export remote contiene soltanto le righe già caricate e non genera una richiesta HTTP aggiuntiva.
- Nel remote non compaiono “tutte le righe” o “righe selezionate”.
- Se il remote ha una sola pagina, il pulsante export non compare.
- Su mobile, le stesse capability producono le stesse opzioni applicabili.
- CSV, PDF e XLSX continuano ad applicare trasformazioni e ad escludere colonne interne `ib-`.
