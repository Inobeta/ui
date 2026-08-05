
# DEVK-908 — Supportare Angular 21 e rimuovere le API legacy v21

- Approved at: 2026-08-05T13:53:22.168Z

> Aggiornamento compatibile con Angular 21 e Storybook 10, senza modificare la logica funzionale dei componenti mantenuti.

## Plan lineage

- Ancestors:
  - `devk-1045-kai-table-examples`
  - `devk-1046-bis-ticket-short-descriptive-title`
  - `devk-1106-align-storybook-documentation-and-present-the-v20-release`

### Requirement changes from ancestors

- `devk-1045-kai-table-examples`
  - Previous requirement: esporre gli esempi Kai Table tramite `src/app/examples/main-menu-example/main-menu-data.json`.
  - New requirement: mantenere invariati gli URL degli esempi, ma trasferire link, gruppi e icone nel nuovo side menu applicativo ed eliminare `IbMainMenu`.
  - User confirmation: confirmed during planning interview.
- `devk-1046-bis-ticket-short-descriptive-title`
  - Previous requirement: registrare gli esempi parent-height nel Main Menu e associarvi breadcrumb di route.
  - New requirement: mantenere le route e i relativi link nel nuovo side menu, rimuovendo i metadati `breadcrumb` non più consumati.
  - User confirmation: confirmed during planning interview.
- `devk-1106-align-storybook-documentation-and-present-the-v20-release`
  - Previous requirement: mantenere disponibili documentazione e stories di Main Menu e Breadcrumbs, indicandone la rimozione pianificata per v21.
  - New requirement: con la release v21 rimuovere componenti, stories e documentazione dedicata, aggiornando i riferimenti generali per indicare che la rimozione è avvenuta.
  - User confirmation: confirmed during planning interview.

## 1. Goal

Rendere libreria, applicazione esempi e Storybook compatibili con Angular 21, Angular Material 21 e Storybook 10 con builder `@storybook/angular-vite`.

A lavoro concluso:

- libreria e applicazione compilano con Angular 21;
- ordinamento Kai Table continua a funzionare senza accessi ad API protette di Angular Material;
- `IbMainMenu`, `IbBreadcrumbs`, `IbUploaderComponentLegacy` e `IbUploaderModule` non fanno più parte della libreria;
- `IbUploaderComponent` signal-based diventa implementazione ufficiale nel file canonico;
- applicazione esempi usa un side menu locale, raggruppato, con icone, traduzioni e route invariate;
- Storybook 10 avvia e compila, incluso il version selector;
- tutti i test Karma/Jasmine e le soglie di coverage restano verdi.

## 2. Current State

- `package.json` dichiara già versione libreria `21.0.0`, Angular `21.2.x`, Angular Material/CDK `21.2.x`, NgRx `21.1.x`, TypeScript `5.9.x`, Storybook `10.5.5` e `@storybook/angular-vite`.
- `angular.json` usa già i builder `@storybook/angular-vite:start-storybook` e `@storybook/angular-vite:build-storybook`.
- Build e test falliscono, secondo output fornito dall’utente, con `TS2445` in `src/app/inobeta-ui/ui/kai-table/sort-header.ts`: `IbSortHeader` assegna direttamente `MatSortHeader._sort`, ora `protected`.
- L’ispezione del codice ha verificato che:
  - `<table mat-table matSort>` crea il `MatSort` canonico in `table.component.html`;
  - `IbTable.sort` legge la stessa istanza;
  - le colonne passano quella medesima istanza a `[ibSortHeaderFor]`;
  - il data source legacy riceve ancora la stessa istanza.
  Pertanto `IbSortHeader` sostituisce `_sort` con l’istanza già risolta da `MatSortHeader` ed è ridondante.
- `public_api.ts` esporta ancora `ui/main-menu`, `ui/breadcrumb` e `ui/uploader`.
- `src/app/inobeta-ui/ui/_index.scss` espone ancora i mixin Sass del Main Menu.
- `src/app/examples/nav/nav.component.*` usa `IbMainMenuExampleComponent` e `IbBreadcrumbModule`.
- `src/app/examples/main-menu-example/main-menu-data.json` contiene gruppi, icone e link degli esempi correnti.
- `src/app/routing.module.ts` contiene i metadati `data.breadcrumb`, consumati soltanto dal breadcrumb rimosso.
- `src/app/inobeta-ui/ui/uploader/uploader.component.ts` contiene `IbUploaderComponentLegacy`; `uploader-v20.component.ts` contiene già il nuovo `IbUploaderComponent` standalone e signal-based.
- `IbFilterPipe` è ancora richiesto da `IbKaiFilterModule`; la sua deprecazione in `core/filter.pipe.ts` è quindi errata.
- `IbToolTestModule` è usato da numerose suite. Deve restare disponibile e deprecato, spostando l’eventuale rimozione a dopo v22.
- Diciotto file MDX importano blocchi da `@storybook/blocks`, package non risolto dopo il passaggio a Storybook 10.
- Il version selector usa API manager e theming di Storybook e deve essere preservato.
- Non sono stati eseguiti comandi durante l’intervista: oltre agli errori riportati dall’utente, eventuali ulteriori incompatibilità saranno rilevate dalle validazioni del piano.

## 3. Assumptions / Open Questions

### Decisioni confermate

- Non modificare la logica funzionale dei componenti mantenuti.
- Rimuovere `IbMainMenu` e `IbBreadcrumbs` dalla libreria v21.
- Sostituirli nell’app esempi con un side menu locale basato su Angular Material.
- Mantenere invariati tutti gli URL esistenti.
- Il side menu deve avere link raggruppati, icone e testi tradotti.
- Usare nuove chiavi sotto `examples.sideMenu.*`, trasferendo i valori ancora necessari.
- Rimuovere `data.breadcrumb` perché nessun nuovo componente lo userà.
- Eliminare `IbSortHeader`, evitando qualsiasi nuovo accesso a membri interni o protetti di Angular Material.
- Rimuovere l’uploader legacy e rinominare `uploader-v20.component.ts` in `uploader.component.ts`.
- Conservare `IbFilterPipe` e rimuoverne la deprecazione.
- Conservare `IbToolTestModule`; aggiornare la deprecazione indicando che la rimozione è rimandata a dopo v22.
- Rimuovere gli import da `@storybook/blocks`, senza installare quel package.
- Conservare il version selector e aggiungere o migrare soltanto le dipendenze Storybook realmente necessarie.
- Migrare quanto necessario dei file MDX alla sintassi supportata da Storybook 10.
- Test unitari, build applicazione, package libreria e Storybook devono risultare verdi.

### Decisioni prese da me, con motivazione

- Il side menu sarà un componente standalone `AppSideMenuComponent` sotto `src/app/examples/nav/`, mentre `NavComponent` manterrà il `router-outlet` e il contenitore Material. Questo separa dati e rendering del menu dal layout di routing senza introdurre API di libreria.
- Il menu userà una configurazione TypeScript tipizzata invece del vecchio JSON. Evita il cast `any` oggi presente e mantiene template semplici e type-safe.
- Il sidenav sarà inizialmente semplice, sempre aperto e in modalità laterale. Comportamento responsive o persistenza dello stato non sono necessari per sostituire il menu degli esempi.
- I riferimenti MDX a `@storybook/blocks` saranno rimossi; saranno applicati ulteriori adattamenti MDX3 soltanto quando richiesti dal compilatore Storybook 10.
- Il custom addon userà gli entry point ufficiali Storybook 10 quando disponibili, invece di reintrodurre package legacy. Saranno aggiunte come dipendenze dirette soltanto le dipendenze ancora richieste dalla configurazione.
- `CHANGELOG.md` resterà storico e non sarà riscritto; le pagine correnti di Storybook saranno invece aggiornate allo stato v21.
- La rimozione delle API pubbliche e dei mixin Sass è accettata come breaking change perché coincide con la major v21 già annunciata.

### Questioni aperte, non bloccanti

- Potrebbero emergere ulteriori errori Angular 21 oltre a `MatSortHeader._sort`. Build e test finali li rileveranno; correzioni che richiedano logica di produzione non prevista dovranno essere pianificate separatamente.
- L’elenco completo degli errori Storybook 10 non è ancora disponibile. La migrazione parte dai problemi verificati (`@storybook/blocks`, addon e custom manager API) e usa `build-storybook` come verifica esaustiva.
- È presente una sola lingua applicativa, `src/assets/i18n/it.json`; non sono richiesti file di traduzione aggiuntivi.

## 4. Proposed Approach

L’intervento resta incrementale e diviso per responsabilità:

1. stabilizzare configurazione e dipendenze Angular 21 già aggiornate;
2. rimuovere il workaround Kai Table incompatibile e verificarne l’ordinamento;
3. rimuovere le feature pubbliche legacy e i loro test;
4. promuovere l’uploader signal-based a implementazione ufficiale;
5. sostituire la navigazione degli esempi mantenendo le route;
6. correggere i metadati di deprecazione rimasti;
7. completare la migrazione Storybook 10 e MDX3;
8. eseguire test e validazione integrata senza ridurre coverage o disabilitare controlli.

Flusso di navigazione finale:

```text
NavComponent
└── mat-sidenav-container
    ├── mat-sidenav
    │   └── AppSideMenuComponent
    │       └── gruppi tipizzati → icona + chiave i18n + routerLink
    └── mat-sidenav-content
        └── router-outlet → route esistenti
```

Flusso ordinamento finale:

```text
<table matSort>
  └── MatSort canonico via DI
      ├── MatSortHeader standard
      ├── IbTable.sort
      └── data source / store integration esistente
```

Nessuna direttiva intermedia accederà a `_sort`.

## 5. Step-by-Step Plan

### Dependencies between steps

`1 → 2 → 3`; `1 → 4 → 5`; `1 → 6 → 7`; `4 → 8 → 9`; `1 → 10`; `1 → 11`; `2+4+11 → 12`; `3+5+7+9+10+12 → 13`; `13 → 14`

---

### Step 1 — Normalizzare la configurazione Angular 21 ✅ DONE [2026-08-05T13:56:45.506Z]

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `package.json`, `package-lock.json`, `angular.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json`, `ng-package.json`
- **Obiettivo**: ottenere una baseline coerente di dipendenze e configurazione Angular 21 senza aggiornamenti estranei.
- **Requisiti**:
  1. Verificare l’allineamento delle versioni Angular, Material/CDK, NgRx, ng-packagr, TypeScript e Zone.js già portate alla major 21.
  2. Rigenerare o correggere `package-lock.json` se non riflette `package.json`.
  3. Rimuovere solo opzioni Angular/TypeScript obsolete o non più accettate in v21, incluso `enableIvy`, senza allargare la strictness.
  4. Verificare che target applicazione, test, package e Storybook restino registrati.
  5. Non modificare ancora configurazione o dipendenze specifiche del version selector Storybook.
- **Vincoli**: nessun aggiornamento di major non richiesto; nessuna modifica a codice applicativo o libreria; non abbassare controlli del compilatore.
- **Validazione**: `npm install && npx ng version` deve terminare con exit code `0` e mostrare Angular CLI/Core 21.
- **Stop condition**: fermarsi se npm richiede downgrade di Angular 21 o una major diversa per risolvere i peer dependency.

**Executor Input**:

~~~
## TASK:
Normalize the already-upgraded Angular 21 workspace configuration and dependency lock.

## CONTEXT:
The repository already declares Angular 21.2.x, Angular Material/CDK 21.2.x, NgRx 21.1.x, ng-packagr 21.2.x, TypeScript 5.9.x, and Zone.js 0.16.x. Source compilation is handled by later steps. `tsconfig.app.json` still contains obsolete Angular compiler options such as `enableIvy`.

## OBJECTIVE:
Produce a coherent Angular 21 package and workspace baseline without changing application behavior.

## REQUIREMENTS:
1. Verify and align the existing Angular 21 package family and compatible peer versions.
2. Synchronize `package-lock.json` with `package.json`.
3. Remove only options rejected or obsolete in Angular 21, including `enableIvy`.
4. Preserve the application, unit-test, ng-packagr, and Storybook targets.
5. Leave Storybook version-selector dependency migration to its dedicated step.

## CONSTRAINTS:
- Do not upgrade unrelated dependencies or change package major versions.
- Do not weaken compiler, lint, test, or coverage settings.
- Do not modify files outside the allowed list.

## OUTPUT:
Report modified configuration files, dependency alignment decisions, and any unresolved peer dependency.

## ACCEPTANCE CRITERIA:
- `npm install && npx ng version` exits with code 0.
- Angular CLI and Angular Core are both version 21.
- The lockfile contains no unresolved merge or stale package state.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 2 — Rimuovere il workaround `IbSortHeader` ✅ DONE [2026-08-05T13:58:13.214Z]

- **Executor**: `kai-table-executor`
- **Modelli suggeriti**: gruppo R
- **File consentiti**: `src/app/inobeta-ui/ui/kai-table/sort-header.ts`, `src/app/inobeta-ui/ui/kai-table/index.ts`, `src/app/inobeta-ui/ui/kai-table/table.module.ts`, `src/app/inobeta-ui/ui/kai-table/columns/column.ts`, `src/app/inobeta-ui/ui/kai-table/columns/text-column.ts`, `src/app/inobeta-ui/ui/kai-table/columns/number-column.ts`, `src/app/inobeta-ui/ui/kai-table/columns/date-column.ts`
- **Obiettivo**: usare esclusivamente il `MatSort` standard risolto da Angular Material, eliminando l’accesso incompatibile a `_sort`.
- **Requisiti**:
  1. Eliminare `IbSortHeader` e la sua esportazione pubblica.
  2. Rimuovere import, dichiarazioni e binding `[ibSortHeaderFor]` da modulo e colonne.
  3. Conservare `mat-sort-header`, input di abilitazione, identificatori, sorting state e integrazione data source/store esistenti.
  4. Non introdurre cast, accessi riflessivi o altre dipendenze da API private/protected di Angular Material.
  5. Non modificare filtering, pagination, selection, grouping o URL state.
- **Vincoli**: nessuna riscrittura del sorting; nessuna modifica ai data source; nessuna modifica a stories, MDX o spec in questo step.
- **Validazione**: `npm run packagr` deve terminare senza `TS2445` né altri errori relativi a `MatSortHeader._sort`.
- **Stop condition**: fermarsi se una colonna viene renderizzata fuori dall’albero DI del `<table matSort>` e richiede realmente un `MatSort` distinto.

**Executor Input**:

~~~
## TASK:
Remove the redundant IbSortHeader directive and use Angular Material's standard MatSortHeader wiring.

## CONTEXT:
`sort-header.ts` writes to protected `MatSortHeader._sort`, causing Angular Material 21 error TS2445. Repository inspection established that the table directive, `IbTable.sort`, column input, and legacy data source all use the same MatSort instance created by `<table matSort>`.

## OBJECTIVE:
Compile Kai Table against Angular Material 21 without private/protected API access and without changing sorting behavior.

## REQUIREMENTS:
1. Delete `sort-header.ts` and remove its barrel export.
2. Remove IbSortHeader imports and module declarations/exports.
3. Remove every `[ibSortHeaderFor]` binding from production column templates.
4. Keep standard `mat-sort-header`, sort ids, disabled behavior, and existing sort propagation unchanged.
5. Make no changes to filtering, pagination, selection, grouping, data sources, store, or URL state.

## CONSTRAINTS:
- Do not access `_sort` through a cast, bracket notation, reflection, or subclass workaround.
- Do not modify Storybook or Jasmine files.
- Do not introduce `any`.
- Preserve public APIs unrelated to IbSortHeader.

## OUTPUT:
Report deleted/modified files and confirm how MatSortHeader now receives MatSort.

## ACCEPTANCE CRITERIA:
- `npm run packagr` exits with code 0.
- No production reference to `IbSortHeader`, `ibSortHeaderFor`, or `ib-sort-header-for` remains.
- No access to `MatSortHeader._sort` remains.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 3 — Riallineare i test dell’ordinamento Kai Table ✅ DONE [2026-08-05T14:20:08.060Z]

- **Executor**: `unit-jasmine-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/app/inobeta-ui/ui/kai-table/sort-header.spec.ts`, `src/app/inobeta-ui/ui/kai-table/columns/action-column.spec.ts`, `src/app/inobeta-ui/ui/kai-table/columns/column.spec.ts`, `src/app/inobeta-ui/ui/kai-table/columns/text-column.spec.ts`, `src/app/inobeta-ui/ui/kai-table/columns/number-column.spec.ts`, `src/app/inobeta-ui/ui/kai-table/columns/date-column.spec.ts`
- **Obiettivo**: sostituire i test della direttiva rimossa con copertura verificabile del sorting Material standard.
- **Requisiti**:
  1. Eliminare `sort-header.spec.ts`.
  2. Rimuovere `IbSortHeader` dagli import e dai setup delle spec delle colonne.
  3. Conservare le asserzioni esistenti non legate alla direttiva.
  4. Aggiungere o mantenere almeno un test che attivi un header ordinabile e verifichi `active` e `direction` del `MatSort` del table host.
  5. Non verificare proprietà private o protette di Angular Material.
- **Vincoli**: modificare solo spec; non usare `fdescribe`, `fit`, `xdescribe` o `xit`; non ridurre copertura.
- **Validazione**: `ng test --include='src/app/inobeta-ui/ui/kai-table/**/*.spec.ts' --watch=false` deve terminare con exit code `0`.
- **Stop condition**: fermarsi se il comportamento osservabile richiede una modifica al codice di produzione oltre lo Step 2.

**Executor Input**:

~~~
## TASK:
Update Kai Table Jasmine tests after removal of IbSortHeader.

## CONTEXT:
The production directive and `[ibSortHeaderFor]` bindings were removed because Angular Material now rejects access to protected `_sort`. Standard `mat-sort-header` must register with the MatSort on the table ancestor.

## OBJECTIVE:
Keep Kai Table sorting coverage focused on observable Material behavior rather than the removed workaround.

## REQUIREMENTS:
1. Delete `sort-header.spec.ts`.
2. Remove IbSortHeader imports and TestBed entries from all allowed column specs.
3. Preserve unrelated column assertions.
4. Ensure at least one test activates a sortable header and asserts the host MatSort `active` and `direction`.
5. Use public APIs or CDK harnesses only.

## CONSTRAINTS:
- Modify spec files only.
- Do not inspect Angular Material private or protected fields.
- Do not skip, focus, or weaken tests.
- Keep NoopAnimationsModule where Material tests require it.

## OUTPUT:
Report deleted and modified specs, the observable sort assertions retained or added, and test results.

## ACCEPTANCE CRITERIA:
- `ng test --include='src/app/inobeta-ui/ui/kai-table/**/*.spec.ts' --watch=false` exits with code 0.
- A test individually verifies active sort id and direction.
- No spec references IbSortHeader or ibSortHeaderFor.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 4 — Rimuovere Main Menu e Breadcrumbs dalla libreria ✅ DONE [2026-08-05T14:21:52.314Z]

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `public_api.ts`, `src/app/inobeta-ui/ui/_index.scss`, `src/app/inobeta-ui/ui/main-menu/index.ts`, `src/app/inobeta-ui/ui/main-menu/main-menu.module.ts`, `src/app/inobeta-ui/ui/main-menu/main-menu-test.module.ts`, `src/app/inobeta-ui/ui/main-menu/_main-menu-theme.scss`, `src/app/inobeta-ui/ui/main-menu/models/`, `src/app/inobeta-ui/ui/main-menu/components/`, `src/app/inobeta-ui/ui/breadcrumb/index.ts`, `src/app/inobeta-ui/ui/breadcrumb/breadcrumb.module.ts`, `src/app/inobeta-ui/ui/breadcrumb/breadcrumb.component.ts`, `src/app/inobeta-ui/ui/breadcrumb/breadcrumb.component.html`, `src/app/inobeta-ui/ui/breadcrumb/material-breadcrumb/material-breadcrumb.component.ts`, `src/app/inobeta-ui/ui/breadcrumb/material-breadcrumb/material-breadcrumb.component.html`, `src/app/inobeta-ui/ui/breadcrumb/material-breadcrumb/material-breadcrumb.component.css`
- **Obiettivo**: eliminare dalla v21 le API pubbliche, implementazioni e mixin Sass di Main Menu e Breadcrumbs.
- **Requisiti**:
  1. Rimuovere gli export `breadcrumb` e `main-menu` da `public_api.ts`.
  2. Eliminare moduli, componenti, modelli, test module e template/stili di produzione delle due feature.
  3. Rimuovere `@use`, `@forward` e include del tema Main Menu da `ui/_index.scss`.
  4. Non modificare altri export o mixin pubblici.
  5. Lasciare spec, stories e MDX ai rispettivi step specializzati.
- **Vincoli**: nessuna sostituzione dentro la libreria; non modificare componenti mantenuti; non rimuovere altri simboli deprecati.
- **Validazione**: `npm run packagr` deve terminare con exit code `0` e il package generato non deve esportare simboli Main Menu o Breadcrumb.
- **Stop condition**: fermarsi se un componente di libreria mantenuto, non appartenente alle feature rimosse, dipende da uno dei simboli eliminati.

**Executor Input**:

~~~
## TASK:
Remove deprecated Main Menu and Breadcrumb production APIs from the Angular 21 library.

## CONTEXT:
These features were announced for removal in v21. They are still exported by `public_api.ts`; Main Menu Sass is also forwarded by `src/app/inobeta-ui/ui/_index.scss`. The demo application replacement is handled separately.

## OBJECTIVE:
Ensure the packaged v21 library no longer contains or exports Main Menu or Breadcrumb implementations.

## REQUIREMENTS:
1. Remove the main-menu and breadcrumb exports from `public_api.ts`.
2. Delete their production modules, components, models, templates, styles, barrels, and Main Menu test module.
3. Remove all Main Menu Sass use/forward/include entries from `ui/_index.scss`.
4. Preserve every unrelated TypeScript and Sass export.
5. Leave spec, story, and MDX cleanup to later specialized steps.

## CONSTRAINTS:
- Do not create replacement library components.
- Do not remove uploader, filter, forms, or other deprecated APIs.
- Do not modify maintained component logic.
- Do not modify spec, story, or MDX files.

## OUTPUT:
Report removed public symbols, deleted files, Sass surface changes, and any remaining production reference.

## ACCEPTANCE CRITERIA:
- `npm run packagr` exits with code 0.
- `public_api.ts` has no breadcrumb or main-menu export.
- `ui/_index.scss` has no Main Menu theme reference.
- No maintained library production source imports either removed feature.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 5 — Eliminare i test delle feature di navigazione rimosse ✅ DONE [2026-08-05T14:23:10.340Z]

- **Executor**: `unit-jasmine-executor`
- **Modelli suggeriti**: gruppo F
- **File consentiti**: `src/app/inobeta-ui/ui/main-menu/components/main-menu-dialog/main-menu-dialog.component.spec.ts`, `src/app/inobeta-ui/ui/main-menu/components/main-menu-expanded/main-menu-expanded.component.spec.ts`, `src/app/inobeta-ui/ui/main-menu/components/main-menu-bar/main-menu-bar.component.spec.ts`, `src/app/inobeta-ui/ui/main-menu/components/main-menu-bar/main-menu-bar.stub.spec.ts`, `src/app/inobeta-ui/ui/breadcrumb/breadcrumb.component.spec.ts`, `src/app/inobeta-ui/ui/breadcrumb/material-breadcrumb/material-breadcrumb.component.spec.ts`
- **Obiettivo**: rimuovere suite e stub che testano esclusivamente componenti non più presenti.
- **Requisiti**:
  1. Eliminare tutte le spec e gli stub elencati.
  2. Non spostare tali test su altri componenti.
  3. Verificare che nessuna spec mantenuta importi Main Menu o Breadcrumb.
- **Vincoli**: non modificare codice di produzione; non eliminare test di feature mantenute.
- **Validazione**: `npm run lint && ! rg 'IbMainMenu|IbBreadcrumb|ib-main-menu|ib-material-breadcrumb' src/app/inobeta-ui --glob '*.spec.ts'` deve terminare con exit code `0`.
- **Stop condition**: fermarsi se uno dei file contiene test condivisi con feature mantenute.

**Executor Input**:

~~~
## TASK:
Delete Jasmine tests and stubs belonging only to removed Main Menu and Breadcrumb features.

## CONTEXT:
Production Main Menu and Breadcrumb source has been removed for v21. Their co-located tests now target nonexistent symbols.

## OBJECTIVE:
Remove obsolete navigation-feature tests without affecting maintained test coverage.

## REQUIREMENTS:
1. Delete every allowed Main Menu and Breadcrumb spec/stub.
2. Do not transplant obsolete assertions into unrelated suites.
3. Confirm no maintained spec imports or renders the removed symbols.

## CONSTRAINTS:
- Do not modify production files.
- Do not delete tests outside the allowed list.
- Do not disable any maintained suite.

## OUTPUT:
Report deleted test files and any remaining test reference discovered.

## ACCEPTANCE CRITERIA:
- `npm run lint` exits with code 0.
- No spec under `src/app/inobeta-ui` references Main Menu or Breadcrumb symbols/selectors.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 6 — Promuovere il nuovo uploader a implementazione ufficiale ✅ DONE [2026-08-05T14:24:15.193Z]

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/app/inobeta-ui/ui/uploader/uploader.component.ts`, `src/app/inobeta-ui/ui/uploader/uploader-v20.component.ts`, `src/app/inobeta-ui/ui/uploader/uploader.module.ts`, `src/app/inobeta-ui/ui/uploader/index.ts`
- **Obiettivo**: mantenere un solo `IbUploaderComponent` standalone e signal-based nel percorso canonico.
- **Requisiti**:
  1. Rimuovere `IbUploaderComponentLegacy` e `IbUploaderModule`.
  2. Rinominare `uploader-v20.component.ts` in `uploader.component.ts`, preservandone comportamento e selector `ib-uploader`.
  3. Aggiornare il barrel per esportare soltanto il componente ufficiale.
  4. Conservare `textKey`, `fileSelected`, selezione file e reset dell’input come implementati nella versione nuova.
  5. Non reintrodurre gli alias legacy `onFileSelected` o input decorator-based.
- **Vincoli**: nessun cambiamento funzionale al nuovo uploader; nessun `any`; nessuna modifica alla spec in questo step.
- **Validazione**: `npm run packagr` deve terminare con exit code `0` e produrre un solo export `IbUploaderComponent`.
- **Stop condition**: fermarsi se sorgenti mantenute della libreria importano ancora `IbUploaderModule` o `IbUploaderComponentLegacy`.

**Executor Input**:

~~~
## TASK:
Replace the legacy uploader with the existing signal-based uploader under the canonical file name.

## CONTEXT:
`uploader.component.ts` currently contains deprecated `IbUploaderComponentLegacy`. `uploader-v20.component.ts` already contains the maintained standalone `IbUploaderComponent` with signal input/output and selector `ib-uploader`.

## OBJECTIVE:
Expose one official standalone IbUploaderComponent from `uploader.component.ts`.

## REQUIREMENTS:
1. Remove IbUploaderComponentLegacy and IbUploaderModule.
2. Rename the maintained v20 source to `uploader.component.ts`.
3. Export only the canonical component from `uploader/index.ts`.
4. Preserve `textKey`, `fileSelected`, file selection, click forwarding, and input reset behavior.
5. Do not add legacy compatibility aliases.

## CONSTRAINTS:
- Do not redesign the component or its template.
- Do not introduce `any`.
- Do not modify tests in this step.
- Preserve selector `ib-uploader`.

## OUTPUT:
Report renamed/deleted files, final public symbols, and any remaining legacy consumer.

## ACCEPTANCE CRITERIA:
- `npm run packagr` exits with code 0.
- Exactly one IbUploaderComponent source remains.
- IbUploaderModule and IbUploaderComponentLegacy are no longer exported.
- `uploader-v20.component.ts` no longer exists.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 7 — Aggiornare i test dell’uploader ufficiale ✅ DONE [2026-08-05T14:25:36.983Z]

- **Executor**: `unit-jasmine-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/app/inobeta-ui/ui/uploader/uploader.component.spec.ts`
- **Obiettivo**: verificare il contratto observable del nuovo uploader standalone.
- **Requisiti**:
  1. Importare il componente dal barrel della feature.
  2. Rimuovere setup Material Dialog e `IbToolTestModule` non necessari.
  3. Verificare creazione, click delegato all’input file, emissione di `fileSelected` e reset del valore dopo una selezione valida.
  4. Verificare che nessun evento venga emesso quando non ci sono file.
  5. Usare tipi DOM espliciti e nessun accesso legacy.
- **Vincoli**: non modificare il componente; non usare `any`, test focused o skipped.
- **Validazione**: `ng test --include='src/app/inobeta-ui/ui/uploader/uploader.component.spec.ts' --watch=false` deve terminare con exit code `0`.
- **Stop condition**: fermarsi se il contratto verificato differisce dall’implementazione già presente in `uploader-v20.component.ts`.

**Executor Input**:

~~~
## TASK:
Rewrite the uploader Jasmine spec for the canonical standalone signal-based component.

## CONTEXT:
The legacy NgModule component has been removed. The official component uses signal input `textKey`, output `fileSelected`, a required file input viewChild, and resets the native input after emitting a selected file.

## OBJECTIVE:
Provide focused coverage of the maintained uploader's public and DOM-observable behavior.

## REQUIREMENTS:
1. Import IbUploaderComponent through the uploader feature barrel.
2. Remove unrelated dialog and IbToolTestModule setup.
3. Test component creation and delegation from the button to the hidden file input.
4. Test individual `fileSelected` emission and native input reset for one selected file.
5. Test that no output is emitted when no file is present.

## CONSTRAINTS:
- Modify the spec only.
- Do not access legacy outputs or modules.
- Do not use `any`, focused tests, or skipped tests.
- Keep Material animation setup only if required.

## OUTPUT:
Report assertions added, obsolete setup removed, and the test result.

## ACCEPTANCE CRITERIA:
- `ng test --include='src/app/inobeta-ui/ui/uploader/uploader.component.spec.ts' --watch=false` exits with code 0.
- Tests individually cover click delegation, file emission, reset, and empty selection.
- The spec has no IbUploaderModule, IbUploaderComponentLegacy, or onFileSelected reference.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 8 — Creare il side menu degli esempi ✅ DONE [2026-08-05T14:27:39.525Z]

- **Executor**: `examples-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/app/examples/nav/nav.component.ts`, `src/app/examples/nav/nav.component.html`, `src/app/examples/nav/nav.component.css`, `src/app/examples/nav/side-menu.component.ts`, `src/app/examples/nav/side-menu.component.html`, `src/app/examples/nav/side-menu.component.css`, `src/app/examples/main-menu-example/`
- **Obiettivo**: sostituire Main Menu e Breadcrumb con una navigazione laterale locale agli esempi.
- **Requisiti**:
  1. Eliminare `src/app/examples/main-menu-example/`.
  2. Creare `AppSideMenuComponent` standalone con configurazione TypeScript tipizzata per gruppi e link.
  3. Trasferire tutti i link correnti, mantenendo esattamente gli URL e le icone utili del vecchio JSON.
  4. Usare `MatSidenavModule`, `MatListModule`, `MatIconModule`, router link/active e `TranslatePipe`.
  5. Usare esclusivamente chiavi `examples.sideMenu.*` per testi visibili.
  6. Aggiornare `NavComponent` affinché mostri sidenav laterale sempre aperto e `router-outlet` nel contenuto.
  7. Preservare la catena flex, `min-height: 0` e l’area di contenuto necessaria agli esempi Kai Table parent-height.
  8. Non aggiungere responsive behavior, persistenza o logica di autenticazione.
- **Vincoli**: nessuna modifica alle route o alle traduzioni in questo step; nessuna dipendenza dalle feature rimosse; nessun testo visibile hardcoded.
- **Validazione**: `npm run lint` deve terminare con exit code `0` senza riferimenti a `IbMainMenuExampleComponent` o `IbBreadcrumbModule` negli esempi.
- **Stop condition**: fermarsi se un URL presente nel vecchio menu non corrisponde a una route esistente.

**Executor Input**:

~~~
## TASK:
Replace the demo Main Menu and Breadcrumb UI with a local grouped Angular Material side menu.

## CONTEXT:
`NavComponent` currently renders `IbMainMenuExampleComponent`, `IbMaterialBreadcrumb`, and a router outlet. The old JSON contains the canonical current links and icons. Route changes and Italian translations are handled in the next step. Parent-height Kai Table examples require an unbroken flex/min-height layout chain.

## OBJECTIVE:
Create a simple always-open side navigation for examples while preserving every existing route URL.

## REQUIREMENTS:
1. Delete the old `main-menu-example` folder.
2. Create standalone `AppSideMenuComponent` with strongly typed group/link configuration.
3. Transfer every current route link and useful icon from `main-menu-data.json` without changing URLs.
4. Render grouped links with Material sidenav/list/icon APIs, RouterLink, RouterLinkActive, and TranslatePipe.
5. Use only `examples.sideMenu.*` translation keys for visible menu labels.
6. Update NavComponent to place the side menu beside the existing router outlet.
7. Preserve full-height flex behavior, `min-height: 0`, and hidden overflow where needed for child table examples.
8. Keep the side menu always open and avoid extra responsive or persistent state.

## CONSTRAINTS:
- Do not modify `routing.module.ts` or translation JSON.
- Do not import any removed Main Menu or Breadcrumb symbol.
- Do not hardcode visible labels.
- Do not introduce `any` or complex template expressions.
- Do not modify example page logic.

## OUTPUT:
Report files created/deleted, final menu groups and routes, and layout choices.

## ACCEPTANCE CRITERIA:
- `npm run lint` exits with code 0.
- Every route formerly present in `main-menu-data.json` is present exactly once in the new menu configuration.
- No example source references IbMainMenuExampleComponent, IbMainMenuModule, IbBreadcrumbModule, or ib-material-breadcrumb.
- Templates contain no hardcoded visible menu labels.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 9 — Allineare route e traduzioni del side menu ✅ DONE [2026-08-05T14:31:00.731Z]

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo F
- **File consentiti**: `src/app/routing.module.ts`, `src/assets/i18n/it.json`
- **Obiettivo**: completare l’integrazione del side menu senza cambiare il routing.
- **Requisiti**:
  1. Rimuovere soltanto i metadati `data.breadcrumb` non più consumati.
  2. Non aggiungere, eliminare, rinominare o riordinare semanticamente route e redirect.
  3. Aggiungere tutte le chiavi `examples.sideMenu.*` richieste dal nuovo componente.
  4. Riutilizzare i valori italiani pertinenti del vecchio gruppo `examples.ibMainMenu`.
  5. Rimuovere chiavi Main Menu rimaste senza utilizzi, dopo una ricerca globale.
  6. Mantenere JSON valido e non modificare traduzioni estranee.
- **Vincoli**: nessuna stringa visibile hardcoded nelle route; nessuna modifica ai componenti; URL invariati.
- **Validazione**: `npm run build` deve terminare con exit code `0`; `routing.module.ts` non deve contenere `breadcrumb:`.
- **Stop condition**: fermarsi se una vecchia chiave Main Menu risulta ancora consumata da una feature mantenuta.

**Executor Input**:

~~~
## TASK:
Remove obsolete breadcrumb metadata and add translations for the new demo side menu.

## CONTEXT:
The side menu component already references `examples.sideMenu.*`. Breadcrumb components have been removed. Existing route URLs and redirects are an invariant. Italian values can be migrated from `examples.ibMainMenu`.

## OBJECTIVE:
Make the new navigation fully translated while preserving routing behavior.

## REQUIREMENTS:
1. Remove only `data.breadcrumb` metadata from route definitions.
2. Preserve every path, redirect, component, child relationship, and pathMatch.
3. Add all `examples.sideMenu.*` keys referenced by the side menu.
4. Reuse relevant Italian values from the old menu key group.
5. Remove old Main Menu translation keys only after confirming no remaining consumer.
6. Keep `it.json` valid and avoid unrelated translation changes.

## CONSTRAINTS:
- Do not modify component files.
- Do not change route URLs or redirect behavior.
- Do not add hardcoded visible labels to routing metadata.
- Do not alter unrelated translations.

## OUTPUT:
Report removed route metadata, added/removed translation keys, and route invariants checked.

## ACCEPTANCE CRITERIA:
- `npm run build` exits with code 0.
- `routing.module.ts` contains no `breadcrumb:` metadata.
- Every `examples.sideMenu.*` key used by the component exists in `it.json`.
- Existing route paths and redirects are unchanged.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 10 — Correggere i metadati di deprecazione residui ✅ DONE [2026-08-05T14:31:55.297Z]

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo F
- **File consentiti**: `src/app/inobeta-ui/core/filter.pipe.ts`, `src/app/inobeta-ui/tools/tools-test.module.ts`
- **Obiettivo**: allineare i commenti di lifecycle alle decisioni v21 senza cambiare comportamento.
- **Requisiti**:
  1. Rimuovere la deprecazione da `IbFilterPipe`.
  2. Conservare invariati pipe name, standalone status e implementazione.
  3. Conservare `IbToolTestModule` e la sua deprecazione.
  4. Modificare il commento di `IbToolTestModule` affinché non prometta rimozione in v21 o v22, ma indichi che è rimandata a dopo v22.
  5. Non modificare stub, provider o test consumer del modulo.
- **Vincoli**: sole modifiche JSDoc; nessuna rimozione o rinomina di simboli.
- **Validazione**: `npm run lint` deve terminare con exit code `0`.
- **Stop condition**: nessuna.

**Executor Input**:

~~~
## TASK:
Correct the deprecation metadata for IbFilterPipe and IbToolTestModule.

## CONTEXT:
IbFilterPipe is still required by IbKaiFilterModule, so its v21 deprecation is incorrect. IbToolTestModule has many active test consumers and must remain deprecated, with removal postponed until after v22.

## OBJECTIVE:
Make lifecycle comments accurate without changing runtime or test behavior.

## REQUIREMENTS:
1. Remove the deprecation annotation from IbFilterPipe.
2. Leave the pipe implementation and metadata unchanged.
3. Keep IbToolTestModule deprecated.
4. Change its JSDoc so removal is explicitly postponed until after v22, not promised for v22.
5. Leave all declarations, exports, providers, and stubs unchanged.

## CONSTRAINTS:
- JSDoc changes only.
- Do not rename or remove either symbol.
- Do not modify consumers or tests.

## OUTPUT:
Report the exact lifecycle wording applied.

## ACCEPTANCE CRITERIA:
- `npm run lint` exits with code 0.
- IbFilterPipe has no `@deprecated` annotation.
- IbToolTestModule remains marked `@deprecated` and does not mention removal in v21 or v22.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 11 — Migrare configurazione e addon a Storybook 10 ✅ DONE [2026-08-05T14:36:27.028Z]

- **Executor**: `storybook-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `package.json`, `package-lock.json`, `angular.json`, `.storybook/main.ts`, `.storybook/preview.ts`, `.storybook/tsconfig.json`, `.storybook/typings.d.ts`, `.storybook/version-selector/`
- **Obiettivo**: rendere configurazione, dipendenze e version selector compatibili con Storybook 10 e `@storybook/angular-vite`.
- **Requisiti**:
  1. Conservare `@storybook/angular-vite` come framework e builder.
  2. Verificare ogni addon configurato; aggiungere come devDependency diretta ogni package Storybook 10 ancora necessario.
  3. Rimuovere dalla configurazione addon non più esistenti soltanto se la funzione è integrata nel core o sostituita ufficialmente in v10.
  4. Migrare version selector a entry point ufficiali Storybook 10 per manager API e theming.
  5. Preservare visualizzazione e link della versione.
  6. Allineare `.storybook/tsconfig.json` affinché includa configurazione e file TSX del custom addon.
  7. Non aggiungere `@storybook/blocks`.
  8. Mantenere allineate tutte le dipendenze Storybook alla stessa release compatibile.
- **Vincoli**: nessuna rimozione del version selector; nessun downgrade a Storybook 9 o builder Webpack; nessuna modifica a stories/MDX.
- **Validazione**: `npx tsc -p .storybook/tsconfig.json --noEmit` deve terminare con exit code `0` e risolvere manager API, theming e addon.
- **Stop condition**: fermarsi se il version selector richiede un package senza release compatibile con Storybook 10 e senza entry point ufficiale sostitutivo.

**Executor Input**:

~~~
## TASK:
Migrate Storybook configuration, direct dependencies, and the custom version selector to Storybook 10.

## CONTEXT:
The repository already uses `@storybook/angular-vite` 10.5.5 and matching Angular builders. `main.ts` references addons not all declared directly. The version selector imports manager API and theming through package paths that may no longer match Storybook 10. The selector must be preserved.

## OBJECTIVE:
Produce a resolvable Storybook 10 configuration with a working custom version selector.

## REQUIREMENTS:
1. Keep `@storybook/angular-vite` as framework and builder.
2. Audit configured addons and add compatible direct devDependencies for every addon still used.
3. Remove an obsolete addon entry only when Storybook 10 officially integrates or replaces its function.
4. Migrate version-selector manager and theming imports to official Storybook 10 entry points.
5. Preserve version text, styling parameter, and link behavior.
6. Include Storybook config and TSX addon files in `.storybook/tsconfig.json`.
7. Do not add `@storybook/blocks`.
8. Keep all Storybook packages on one compatible 10.x release family.

## CONSTRAINTS:
- Do not remove or disable the version selector.
- Do not downgrade Storybook or switch away from Vite.
- Do not modify MDX or story content in this step.
- Do not add obsolete compatibility packages when an official v10 entry point exists.

## OUTPUT:
Report dependency changes, migrated imports, retained/removed addons with reasons, and TypeScript validation.

## ACCEPTANCE CRITERIA:
- `npx tsc -p .storybook/tsconfig.json --noEmit` exits with code 0.
- Version selector source resolves manager API and theming.
- Every configured external addon is a direct compatible dependency or documented Storybook 10 core feature.
- No dependency or import references `@storybook/blocks`.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 12 — Migrare stories e MDX a Storybook 10 ✅ DONE [2026-08-05T15:23:25.552Z]

- **Executor**: `storybook-executor`
- **Modelli suggeriti**: gruppo F
- **File consentiti**: `src/getting_started.mdx`, `src/whats_new.mdx`, `src/app/inobeta-ui/hydration/hydration.mdx`, `src/app/inobeta-ui/http/auth/login.service.mdx`, `src/app/inobeta-ui/http/http-api.mdx`, `src/app/inobeta-ui/http/http.mdx`, `src/app/inobeta-ui/translate/translate.mdx`, `src/app/inobeta-ui/translate/how_to_translate.mdx`, `src/app/inobeta-ui/storage/storage.mdx`, `src/app/inobeta-ui/ui/forms-utilities/forms.mdx`, `src/app/inobeta-ui/ui/kai-table/table.mdx`, `src/app/inobeta-ui/ui/kai-table/table.stories.ts`, `src/app/inobeta-ui/ui/material-forms/material-form.mdx`, `src/app/inobeta-ui/ui/material-forms/controls/controls.mdx`, `src/app/inobeta-ui/ui/kai-filter/filters.mdx`, `src/app/inobeta-ui/ui/toast/toast.mdx`, `src/app/inobeta-ui/ui/modal/modal.mdx`, `src/app/inobeta-ui/ui/main-menu/main-menu.module.mdx`, `src/app/inobeta-ui/ui/breadcrumb/breadcrumb.mdx`, `src/app/inobeta-ui/ui/breadcrumb/breadcrumb.stories.ts`
- **Obiettivo**: compilare tutta la documentazione con Storybook 10, eliminando contenuti delle feature rimosse e workaround obsoleti.
- **Requisiti**:
  1. Eliminare MDX e story dedicate a Main Menu e Breadcrumb.
  2. Rimuovere tutti gli import da `@storybook/blocks`.
  3. Applicare solo gli adattamenti MDX3 richiesti dal compilatore, mantenendo contenuti e organizzazione non coinvolti.
  4. Rimuovere da Kai Table docs e stories import, binding e spiegazioni di `IbSortHeader`/`ibSortHeaderFor`; mostrare il normale `mat-sort-header`.
  5. Aggiornare Getting Started e What’s New affinché non presentino Main Menu o Breadcrumb come ancora disponibili nella v21.
  6. Non installare package per conservare sintassi MDX legacy.
  7. Mantenere funzionanti link, Canvas, Story, Meta, ArgTypes, Description, Markdown e Source ancora usati.
- **Vincoli**: niente riscritture editoriali estranee; nessuna modifica a sorgenti di componenti; non alterare esempi API non coinvolti.
- **Validazione**: `npm run build-storybook` deve terminare con exit code `0` senza errori MDX, import mancanti o story riferite a simboli rimossi.
- **Stop condition**: fermarsi se la migrazione richiede eliminare una pagina di una feature mantenuta anziché adattarne la sintassi.

**Executor Input**:

~~~
## TASK:
Migrate Storybook MDX content to Storybook 10 and remove documentation for deleted v21 features.

## CONTEXT:
Eighteen MDX files import blocks from missing `@storybook/blocks`. Storybook 10 configuration is handled in the preceding step. Main Menu and Breadcrumb are removed in v21. Kai Table no longer exports IbSortHeader and uses standard `mat-sort-header`.

## OBJECTIVE:
Build all remaining stories and documentation with Storybook 10 without legacy block imports or removed APIs.

## REQUIREMENTS:
1. Delete Main Menu MDX, Breadcrumb MDX, and Breadcrumb stories.
2. Remove every import from `@storybook/blocks`.
3. Apply only compiler-required MDX3 syntax adaptations to retained pages.
4. Remove IbSortHeader imports, `[ibSortHeaderFor]` bindings, and workaround explanations from Kai Table docs/stories.
5. Show standard `mat-sort-header` in retained examples.
6. Update Getting Started and What's New so v21 navigation removals are stated as completed.
7. Preserve all unaffected documentation content, titles, links, and story coverage.

## CONSTRAINTS:
- Do not install `@storybook/blocks`.
- Do not rewrite unrelated documentation.
- Do not modify component implementation files.
- Do not delete retained feature pages to bypass MDX errors.

## OUTPUT:
Report deleted pages/stories, migrated MDX files, Kai Table documentation changes, and Storybook build result.

## ACCEPTANCE CRITERIA:
- `npm run build-storybook` exits with code 0.
- No repository MDX file imports `@storybook/blocks`.
- No Storybook content references Main Menu, Breadcrumb, IbSortHeader, or ibSortHeaderFor as available v21 APIs.
- All retained docs blocks render through Storybook 10-supported syntax.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 13 — Stabilizzare l’intera suite Angular 21 ✅ DONE [2026-08-05T15:31:29.826Z]

- **Executor**: `unit-jasmine-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/**/*.spec.ts`, `src/**/*.stub.spec.ts`
- **Obiettivo**: portare l’intera suite Karma/Jasmine a verde dopo le rimozioni e l’upgrade Angular 21.
- **Requisiti**:
  1. Eseguire `npm run test-ci` e correggere soltanto incompatibilità di setup, import, tipi, harness o aspettative causate dagli step precedenti o da Angular 21.
  2. Non alterare aspettative funzionali ancora valide per far passare i test.
  3. Non aggiungere API private/protected Angular o Material nei test.
  4. Mantenere coverage almeno all’80% per statements, lines, branches e functions.
  5. Non modificare sorgenti di produzione.
  6. Segnalare separatamente ogni failure che richieda una modifica funzionale.
- **Vincoli**: nessun `fdescribe`, `fit`, `xdescribe`, `xit`; nessuna riduzione delle soglie; nessuna suite eliminata salvo quelle già previste per feature rimosse.
- **Validazione**: `npm run test-ci` deve terminare con exit code `0` e tutte le soglie di coverage devono essere rispettate.
- **Stop condition**: fermarsi se una failure richiede modifiche a codice di produzione o se emergono più di tre famiglie indipendenti di regressioni non riconducibili all’upgrade.

**Executor Input**:

~~~
## TASK:
Stabilize the full Karma/Jasmine suite after the Angular 21 migration and planned API removals.

## CONTEXT:
Dedicated steps already updated Kai Table sorting tests, deleted removed navigation tests, and rewrote uploader tests. Remaining failures should be Angular 21 TestBed, typing, harness, or import compatibility issues. Production logic must remain unchanged.

## OBJECTIVE:
Make `npm run test-ci` pass with the existing 80% coverage thresholds.

## REQUIREMENTS:
1. Run the complete CI test suite and classify remaining failures.
2. Fix only spec/stub setup, imports, types, harness usage, timing, or assertions invalidated by Angular 21/API removal.
3. Preserve valid functional expectations.
4. Use public Angular and Material APIs only.
5. Keep all four coverage metrics at or above 80%.
6. Report failures that require production changes instead of editing production source.

## CONSTRAINTS:
- Modify spec and stub files only.
- Do not skip or focus tests.
- Do not lower coverage thresholds.
- Do not delete maintained feature suites.
- Stop rather than changing production behavior.

## OUTPUT:
Report modified specs, failure classes fixed, remaining blockers, and final coverage percentages.

## ACCEPTANCE CRITERIA:
- `npm run test-ci` exits with code 0.
- Statements, lines, branches, and functions each meet or exceed 80%.
- No focused or skipped test was introduced.
- No production file was modified.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 14 — Verificare la release candidate v21 ✅ DONE [2026-08-05T15:40:54.650Z]

- **Executor**: `code-reviewer`
- **Modelli suggeriti**: gruppo R
- **File consentiti**: `package.json`, `package-lock.json`, `angular.json`, `public_api.ts`, `src/`, `.storybook/`, `ng-package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json`
- **Obiettivo**: verificare che il risultato integrato soddisfi lo scope DEVK-908 senza regressioni o modifiche fuori perimetro.
- **Requisiti**:
  1. Eseguire lint, package libreria, build applicazione, test CI e build Storybook.
  2. Verificare assenza di Main Menu, Breadcrumb, uploader legacy, `IbSortHeader`, `@storybook/blocks` e accessi a `MatSortHeader._sort`.
  3. Verificare presenza del solo uploader ufficiale e mantenimento di `IbFilterPipe` e `IbToolTestModule`.
  4. Verificare route invariate e side menu completo tramite confronto con il vecchio elenco conservato nella history Git.
  5. Controllare che nessun componente mantenuto abbia subito modifiche funzionali non richieste.
  6. Produrre un report PASS/FAIL senza modificare file.
- **Vincoli**: step read-only; non correggere direttamente problemi; nessuna approvazione implicita in caso di comando rosso.
- **Validazione**: `npm run lint && npm run packagr && npm run build && npm run test-ci && npm run build-storybook` deve terminare con exit code `0`.
- **Stop condition**: nessuna; ogni failure deve produrre esito FAIL con file e comando coinvolti.

**Executor Input**:

~~~
## TASK:
Perform a read-only final review of the DEVK-908 Angular 21 release candidate.

## CONTEXT:
All implementation and test steps are complete. This review must verify Angular 21 library packaging, demo routing/navigation, Storybook 10, public API removals, sorting behavior coverage, and unit-test coverage.

## OBJECTIVE:
Return a PASS only when every required command and scope invariant succeeds.

## REQUIREMENTS:
1. Run lint, ng-packagr, production app build, CI tests, and Storybook build.
2. Confirm removed Main Menu, Breadcrumb, uploader legacy, IbSortHeader, `@storybook/blocks`, and `_sort` access are absent.
3. Confirm canonical IbUploaderComponent, IbFilterPipe, and deprecated IbToolTestModule remain.
4. Compare current routes and side-menu links with the pre-change Git version to verify URL preservation.
5. Review the diff for unrelated production-logic changes.
6. Return a concise PASS/FAIL report with exact failing commands and file references.

## CONSTRAINTS:
- Read-only review: do not modify any file.
- Do not accept warnings that represent compile, test, missing-route, or missing-story failures.
- Do not infer success when a command was not run.

## OUTPUT:
Return verdict, command results, invariant checks, regression risks, and any required remediation.

## ACCEPTANCE CRITERIA:
- `npm run lint && npm run packagr && npm run build && npm run test-ci && npm run build-storybook` exits with code 0.
- All removal and preservation checks pass.
- Route URLs remain unchanged.
- Review finds no unrelated component-logic modification.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

## 6. Impacted Areas

### Public API rimosse

- `IbMainMenuModule`
- `IbMainMenuBarComponent`
- `IbMainMenuDialogComponent`
- `IbMainMenuExpandedComponent`
- `IbMainMenuHeaderFooterButtonsComponent`
- modelli `IbMainMenu*`
- `IbMainMenuTestModule`
- `IbBreadcrumbModule`
- `IbBreadcrumbComponent`
- `IbMaterialBreadcrumbComponent`
- `IbSortHeader`
- `IbUploaderComponentLegacy`
- `IbUploaderModule`
- mixin Sass pubblici del Main Menu

### Public API mantenute o promosse

- `IbUploaderComponent` diventa unico uploader ufficiale, standalone e signal-based.
- `IbFilterPipe` resta pubblico e non deprecato.
- `IbToolTestModule` resta disponibile e deprecato, con rimozione rinviata a dopo v22.
- Tutti gli altri export di `public_api.ts` e `ui/_index.scss` restano invariati.

### Nuovo codice applicativo

- `AppSideMenuComponent` sotto `src/app/examples/nav/`.
- Chiavi `examples.sideMenu.*` in `src/assets/i18n/it.json`.
- Layout sidenav locale all’app esempi; nessuna nuova API di libreria.

### Aree estese

- configurazione Angular 21 e lockfile;
- configurazione Storybook 10/Vite;
- custom version selector;
- MDX Storybook;
- test Kai Table e uploader;
- route metadata e traduzioni.

### Deliberatamente non toccato

- logica dei componenti mantenuti;
- `IbFilterPipe`;
- implementazione e consumer di `IbToolTestModule`;
- moduli Forms/Material Forms e HTTP deprecati;
- route URL e redirect;
- logica Kai Table diversa dal collegamento standard di `MatSort`;
- contenuto storico di `CHANGELOG.md`.

## 7. Risks

- **Regressione sorting Kai Table**: la direttiva rimossa era pubblica e documentata. Mitigazione: verifica strutturale della singola istanza `MatSort`, test observable su active/direction, package build e test completi.
- **Breaking change per consumer esterni**: Main Menu, Breadcrumb, uploader legacy, modulo uploader, `IbSortHeader` e mixin Sass vengono rimossi. Rischio accettato perché sono rimozioni annunciate per la major v21; documentazione corrente aggiornata.
- **Perdita di link negli esempi**: migrazione da JSON a configurazione TypeScript potrebbe omettere route. Mitigazione: requisito di parità esatta, confronto finale con history Git e URL invariati.
- **Regressioni layout parent-height**: introduzione del sidenav può interrompere la catena flex. Mitigazione: mantenere `height`, `min-height: 0` e overflow, più verifica manuale sugli esempi parent-height.
- **MDX3 incompatibile**: rimuovere `@storybook/blocks` può esporre sintassi legacy aggiuntiva. Mitigazione: adattare solo i costrutti segnalati dal compilatore e validare l’intera build Storybook.
- **Dipendenze Storybook duplicate o obsolete**: installare package legacy può creare conflitti. Mitigazione: preferire entry point ufficiali v10 e aggiungere solo dipendenze dirette realmente necessarie.
- **Coverage ridotta dalle rimozioni**: eliminare sorgenti e spec cambia il denominatore. Mitigazione: test dedicati per sorting/uploader e verifica finale di tutte le soglie all’80%.
- **Ulteriori rotture Angular 21 non note**: accettato come rischio residuo. Build, package, lint, test e Storybook completi fungeranno da gate; modifiche funzionali impreviste richiederanno remediation separata.
- **Version selector React/TSX**: API manager/theming possono avere entry point diversi in v10. Mitigazione: migrazione dedicata e type-check della configurazione completa.

## 8. Validation Checklist

- [ ] `npm install` completa senza peer dependency irrisolte.
- [ ] `npx ng version` mostra Angular CLI/Core 21.
- [ ] `npm run lint` termina con exit code `0`.
- [ ] `npm run packagr` termina con exit code `0`.
- [ ] `npm run build` termina con exit code `0`.
- [ ] `npm run test-ci` termina con exit code `0`.
- [ ] Statements, lines, branches e functions restano almeno all’80%.
- [ ] `npm run build-storybook` termina con exit code `0`.
- [ ] `npm run storybook` avvia Storybook e non mostra errori di package mancanti.
- [ ] Version selector mostra la versione `21.0.0` e il link configurato funziona.
- [ ] Nessun file importa `@storybook/blocks`.
- [ ] Nessun sorgente accede a `MatSortHeader._sort`.
- [ ] Nessun riferimento a `IbSortHeader` o `[ibSortHeaderFor]` rimane.
- [ ] Il click su ogni header ordinabile Kai Table aggiorna colonna attiva e direzione.
- [ ] Main Menu e Breadcrumb non compaiono nel package, Storybook o app esempi.
- [ ] Il side menu mostra gruppi, icone e testi tradotti.
- [ ] Ogni link del vecchio menu è presente e raggiunge lo stesso URL.
- [ ] Route `/home/dialog`, `/home/toast` e tutte le route `/home/kai-table/*` restano raggiungibili.
- [ ] Gli esempi `parent-height` e `sticky-parent` mantengono altezza residua, scroll e resize verticale corretti.
- [ ] Il nuovo uploader apre il file picker, emette un solo `File` e resetta l’input.
- [ ] `IbUploaderModule` e `IbUploaderComponentLegacy` non sono esportati.
- [ ] `IbFilterPipe` resta disponibile e non deprecato.
- [ ] `IbToolTestModule` resta disponibile, deprecato e senza promessa di rimozione entro v22.
- [ ] Nessun `fdescribe`, `fit`, `xdescribe` o `xit` è stato introdotto.
- [ ] Diff finale non contiene modifiche funzionali estranee allo scope DEVK-908.
PLAN>>>
