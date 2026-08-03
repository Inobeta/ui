
# DEVK-1046-BIS — Esempi `tableHeight` per Kai Table

> Piano per `docs/plans/DEVK-1046-BIS-kai-table-height-examples.md`; intervento limitato alla demo app sulla stessa branch di DEVK-1046.

## 1. Goal

Rendere verificabile dagli examples il comportamento dell’input `tableHeight` di Kai Table:

- il menu e la breadcrumb restano fissi in alto;
- in modalità `tableHeight="parent"` la tabella desktop occupa tutto lo spazio verticale residuo;
- il layout si aggiorna anche al ridimensionamento verticale del browser;
- con poche righe rimane visibile lo spazio vuoto nel viewport della tabella;
- con molte righe o poco spazio compaiono le scrollbar interne della tabella, senza scrollbar annidate della pagina;
- rimane disponibile l’esempio sticky ad altezza fissa e viene aggiunto un equivalente sticky in modalità parent.

Il simple example dichiara esplicitamente la modalità parent. Due esempi dedicati permettono di alternare tra 5 e 1000 righe per osservare entrambi i comportamenti.

## 2. Current State

- `src/app/inobeta-ui/ui/kai-table/table.component.ts` espone già `tableHeight`, con default `"parent"`, e distingue parent mode da altezza CSS esplicita.
- `src/app/inobeta-ui/ui/kai-table/table.component.html` applica la modalità parent al wrapper desktop e mantiene `.ib-table__content` come viewport dei dati.
- `src/app/inobeta-ui/ui/kai-table/table.component.scss`:
  - assegna `height: 100%` al contenitore in parent mode;
  - usa un layout flex verticale;
  - mantiene toolbar, filtro e paginator fuori da `.ib-table__content`;
  - assegna a `.ib-table__content` `overflow: auto`;
  - usa `--ib-table-min-content-height`, con default `400px`, come altezza minima del contenuto.
- `src/app/examples/nav/nav.component.html` separa `.nav-header` e `.route-content`.
- `src/app/examples/nav/nav.component.css` usa già una catena flex a partire da `height: 100vh`: header non ridimensionabile e route content con `flex: 1 1 auto`, `min-height: 0` e `overflow: hidden`. Non è prevista una modifica a questo layout.
- `src/app/examples/kai-table-example/kai-table-example.html` contiene il simple example, ma omette `tableHeight` e quindi usa `"parent"` solo implicitamente.
- `src/app/examples/kai-table-example/kai-table-example.scss` rende il route host un flex container, ma `.table-wrapper` è soltanto un flex item con `display: block`. La catena di altezza non viene propagata in modo affidabile al custom element `ib-kai-table`.
- Il comportamento è stato osservato a runtime dall’utente: il simple example si dimensiona in base alle righe visualizzate e risponde al resize solo in larghezza. La diagnosi CSS deriva dall’ispezione dei file; non è stata ancora confermata con strumenti browser durante la pianificazione.
- `src/app/examples/kai-table-example/kai-table-sticky-example.ts` è l’unico example che dichiara attualmente `tableHeight`, usando il valore fisso `"500px"` e una larghezza massima di `600px`.
- `src/app/routing.module.ts` espone `/home/kai-table/simple` e `/home/kai-table/sticky`, ma non contiene route dedicate alla modalità parent.
- `src/app/examples/main-menu-example/main-menu-data.json` contiene le voci del menu Kai Table.
- `src/assets/i18n/it.json` è l’unico catalogo locale della demo app e contiene già i namespace `examples.ibMainMenu` ed `examples.kaiTable`.
- Il piano DEVK-1046 e la sua implementazione coprono già libreria, Storybook, documentazione e test unitari del contratto `tableHeight`.
- Non è stata verificata programmaticamente la branch Git corrente durante la pianificazione.

## 3. Assumptions / Open Questions

### Decisioni confermate

- Il lavoro deve proseguire sulla stessa branch usata per DEVK-1046.
- Il simple example deve dichiarare esplicitamente `tableHeight="parent"`.
- Oltre alla modifica del simple example deve essere aggiunto un example dedicato alla modalità parent.
- Devono esistere due esempi sticky distinti:
  - quello attuale con `tableHeight="500px"`;
  - uno nuovo con `tableHeight="parent"` e le stesse colonne sticky.
- Gli esempi parent devono consentire di alternare tra pochi e molti dati.
- I dataset selezionabili conterranno rispettivamente 5 e 1000 righe.
- I nuovi esempi devono essere raggiungibili tramite route e voci del menu.
- I bug di layout individuati negli examples rientrano nel ticket.
- Non devono essere modificati i sorgenti sotto `src/app/inobeta-ui/ui/kai-table/`, salvo scoperta di un bug chiaro che renda impossibile la soluzione negli examples.
- Il piano corrente non prevede alcuna modifica alla libreria Kai Table.

### Decisioni prese da me, con motivazione

- Le nuove route saranno `/home/kai-table/parent-height` e `/home/kai-table/sticky-parent`: distinguono il caso generale dal caso sticky senza cambiare URL esistenti.
- Il dataset iniziale dei nuovi esempi sarà quello da 5 righe, così lo spazio vuoto del viewport risulta immediatamente visibile su schermi grandi.
- Il selettore dati userà Angular Material button toggles con due opzioni mutuamente esclusive. Rende visibile lo stato corrente e non richiede testo o logica complessa nel template.
- Ogni nuovo example sarà un componente autonomo, invece di aggiungere modalità multiple al componente sticky esistente. Le route restano isolate e il caso fisso non rischia regressioni.
- Gli esempi parent imposteranno localmente `--ib-table-min-content-height: 0px`. Il default di libreria pari a `400px` impedirebbe al viewport dati di ridursi sotto quella soglia e renderebbe ambiguo il test del resize verticale.
- Il nuovo sticky-parent userà tutta la larghezza disponibile. Le colonne produrranno overflow orizzontale quando il browser diventa stretto, invece di imporre sempre il `max-width: 600px` dell’esempio fisso.
- Ogni tabella nuova avrà un `tableName` distinto, evitando collisioni con stato o configurazioni persistenti degli esempi esistenti.
- Tutti i nuovi testi visibili, inclusi menu, controlli, breadcrumb e intestazioni esplicite, useranno chiavi ngx-translate in `src/assets/i18n/it.json`.
- Non verrà introdotta un’astrazione condivisa per il selettore dati: due piccole implementazioni locali sono meno rischiose di un nuovo componente generico per la demo app.

### Questioni aperte, non bloccanti

- Il nome esatto della branch DEVK-1046 non è stato verificato. Non blocca il piano perché l’input è presente nel checkout analizzato; l’esecutore deve comunque controllare la branch prima delle modifiche.
- La comparsa grafica delle scrollbar dipende da browser e sistema operativo. La validazione si basa sul fatto che `.ib-table__content` sia l’unico elemento scrollabile e che il suo `scrollHeight` superi il `clientHeight` nel caso ridotto.
- La causa CSS del simple example deve essere confermata nel browser dopo la modifica. Se una catena flex completa non risolve il problema, l’esecutore deve fermarsi prima di modificare la libreria.

## 4. Proposed Approach

La soluzione mantiene separati i quattro casi dimostrativi:

| Route | Componente | `tableHeight` | Dati selezionabili | Scopo |
|---|---|---:|---:|---|
| `/home/kai-table/simple` | `IbKaiTableExamplePage` | `"parent"` esplicito | comportamento esistente | Correggere e rendere esplicito il caso base |
| `/home/kai-table/parent-height` | nuovo parent-height example | `"parent"` | 5 / 1000 | Dimostrare spazio vuoto, resize verticale e scroll interno |
| `/home/kai-table/sticky` | `IbKaiTableStickyExamplePage` | `"500px"` | 30 | Conservare il caso sticky ad altezza fissa |
| `/home/kai-table/sticky-parent` | nuovo sticky-parent example | `"parent"` | 5 / 1000 | Dimostrare sticky columns dentro un contenitore adattivo |

La catena CSS adottata dagli esempi parent sarà:

```text
NavComponent 100vh
└── .route-content: flex column, min-height: 0, overflow: hidden
    └── example :host: flex column, min-height: 0, overflow: hidden
        ├── controlli: flex-shrink: 0
        └── table wrapper: flex column, flex: 1, min-height: 0, overflow: hidden
            └── ib-kai-table: flex: 1, min-height: 0, tableHeight="parent"
```

`--ib-table-min-content-height: 0px` sarà limitata ai nuovi esempi parent e al simple example corretto. Nessun ancestor aggiungerà `overflow: auto`: lo scroll deve restare di proprietà di `.ib-table__content`.

## 5. Step-by-Step Plan

### Dependencies between steps

`1 → 2`; `1 → 3`; `2+3 → 4`

---

### Step 1 — Correggere il simple example in modalità parent ✅ DONE

- **Executor**: `examples-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/app/examples/kai-table-example/kai-table-example.html`, `src/app/examples/kai-table-example/kai-table-example.scss`
- **Obiettivo**: rendere il simple example un caso funzionante ed esplicito di `tableHeight="parent"`, capace di riempire lo spazio verticale residuo.
- **Requisiti**:
  1. Aggiungere `tableHeight="parent"` al `ib-kai-table` esistente senza cambiare `tableName`, colonne, dati o comportamento del paginator.
  2. Rendere `.table-wrapper` un flex container verticale che occupa lo spazio residuo, con `min-height: 0` e `overflow: hidden`.
  3. Fare in modo che `ib-kai-table` sia il figlio flex espandibile del wrapper, con `min-height: 0`, senza usare `::ng-deep`.
  4. Impostare localmente `--ib-table-min-content-height: 0px` per consentire il resize verticale sotto il minimo predefinito della libreria.
  5. Conservare il pulsante esistente per mostrare o nascondere il paginator.
- **Vincoli**: non modificare TypeScript, NavComponent, libreria Kai Table, API pubbliche o stili globali; non aggiungere un secondo proprietario dello scroll.
- **Validazione**: `npm run lint` deve terminare con exit code `0`; aprendo `/home/kai-table/simple`, la tabella deve riempire lo spazio sotto i controlli e cambiare altezza durante il resize verticale.
- **Stop condition**: fermarsi e riportare il problema se la catena flex completa non funziona senza modificare file sotto `src/app/inobeta-ui/`.

**Executor Input**:

~~~
## TASK:
Fix the simple Kai Table example so it explicitly and correctly demonstrates `tableHeight="parent"`.

## CONTEXT:
`src/app/examples/nav/nav.component.css` already supplies a 100vh flex layout with a fixed header and a constrained route-content area. The current `src/app/examples/kai-table-example/kai-table-example.scss` makes `.table-wrapper` a flex item but not a flex container. Runtime observation shows the table follows rendered row height instead of filling the remaining viewport. Kai Table parent mode relies on a complete constrained-height chain and defaults `--ib-table-min-content-height` to 400px.

## OBJECTIVE:
Make the existing simple example fill and resize with its available vertical container while preserving its current table and paginator demo.

## REQUIREMENTS:
1. Add the literal `tableHeight="parent"` input to the existing `ib-kai-table` without changing its table name, columns, data, or paginator behavior.
2. Make `.table-wrapper` a vertical flex container that fills remaining space and has `min-height: 0` and `overflow: hidden`.
3. Make `ib-kai-table` the growing flex child of that wrapper with `min-height: 0`, without `::ng-deep`.
4. Set `--ib-table-min-content-height: 0px` only within this example so vertical resize can go below the library default.
5. Preserve the existing paginator visibility control.

## CONSTRAINTS:
- Modify only the two allowed example files.
- Do not modify NavComponent, Kai Table library sources, public API files, or global styles.
- Do not add `overflow: auto` outside Kai Table; `.ib-table__content` must remain the scroll owner.
- Do not refactor unrelated formatting or behavior.

## OUTPUT:
Report modified files, the final flex-chain structure, and the result of lint and manual vertical-resize verification.

## ACCEPTANCE CRITERIA:
- `npm run lint` exits successfully.
- `kai-table-example.html` contains an explicit `tableHeight="parent"`.
- The table fills the wrapper rather than sizing only to visible rows.
- Vertical browser resize changes the table viewport height.
- The existing paginator toggle still works.
- The page does not gain a second vertical scrollbar.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 2 — Aggiungere l’esempio parent-height dedicato ✅ DONE

- **Executor**: `examples-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/app/examples/kai-table-example/kai-table-parent-height-example.ts`, `src/app/examples/kai-table-example/kai-table-parent-height-example.html`, `src/app/examples/kai-table-example/kai-table-parent-height-example.scss`
- **Obiettivo**: creare un example focalizzato su `tableHeight="parent"` che permetta di osservare spazio vuoto e overflow alternando tra 5 e 1000 righe.
- **Requisiti**:
  1. Creare un componente standalone `IbKaiTableParentHeightExamplePage` con `tableName="parentHeightExample"` e `tableHeight="parent"` esplicito.
  2. Generare una sola collezione tipizzata di 1000 `IbUserExample` tramite `createNewUser` e derivare da essa il dataset da 5 righe.
  3. Aggiungere un `mat-button-toggle-group` con modalità small e large; small deve essere il default e la selezione deve aggiornare la proprietà dati senza introdurre `any`.
  4. Usare chiavi `examples.kaiTable.dataset.small` e `examples.kaiTable.dataset.large` tramite `TranslatePipe`, senza testo visibile hardcoded.
  5. Mostrare almeno le colonne `name`, `fruit`, `number` e `created_at`, usando chiavi di traduzione per eventuali header espliciti.
  6. Applicare la catena flex completa, `overflow: hidden`, `min-height: 0` e `--ib-table-min-content-height: 0px`, lasciando `.ib-table__content` come unico scroll owner.
  7. Mantenere i controlli fuori dalla tabella e non ridimensionabili, così solo il viewport dati usa lo spazio residuo.
- **Vincoli**: non modificare file esistenti, routing, menu, traduzioni o libreria; non creare helper condivisi e non usare `::ng-deep`.
- **Validazione**: `npm run build` deve compilare il nuovo componente senza errori Angular o TypeScript.
- **Stop condition**: fermarsi se il componente richiede una modifica alla libreria per ottenere il parent-height oppure se le API pubbliche necessarie non sono disponibili da `public_api`.

**Executor Input**:

~~~
## TASK:
Create a dedicated Kai Table parent-height example with selectable small and large datasets.

## CONTEXT:
The example will later be routed at `/home/kai-table/parent-height`. Follow the corrected flex-chain pattern from `kai-table-example.scss`. Kai Table uses `tableHeight="parent"` and has a default 400px content minimum, so this demo must locally set `--ib-table-min-content-height: 0px`. User-visible strings must use ngx-translate keys that Step 4 will add to `src/assets/i18n/it.json`.

## OBJECTIVE:
Provide a focused demo where five rows leave visible empty viewport space and one thousand rows create internal table overflow while the table always fills available height.

## REQUIREMENTS:
1. Create standalone `IbKaiTableParentHeightExamplePage` with `tableName="parentHeightExample"` and explicit `tableHeight="parent"`.
2. Build one typed collection of 1000 `IbUserExample` rows with `createNewUser`, then derive the five-row dataset from it.
3. Add a `mat-button-toggle-group` for small and large modes; default to small and update data without `any`.
4. Render translation keys `examples.kaiTable.dataset.small` and `examples.kaiTable.dataset.large` through `TranslatePipe`; hardcode no visible labels.
5. Include at least `name`, `fruit`, `number`, and `created_at` columns, using translation keys for explicit headers.
6. Implement the complete flex chain with `overflow: hidden`, `min-height: 0`, and local `--ib-table-min-content-height: 0px`; keep Kai Table content as the sole scroll owner.
7. Keep dataset controls outside the growing table area and prevent them from shrinking.

## CONSTRAINTS:
- Modify only the three allowed new files.
- Import library symbols through `public_api`.
- Do not modify routing, menus, translations, existing examples, or library sources.
- Do not introduce `any`, `::ng-deep`, global styles, or a shared abstraction.
- Keep template expressions simple; move dataset logic into typed component properties or methods.

## OUTPUT:
Report files created, component selector and class name, dataset-mode implementation, and build result.

## ACCEPTANCE CRITERIA:
- `npm run build` exits successfully.
- The new component uses explicit `tableHeight="parent"` and unique `tableName="parentHeightExample"`.
- Small mode supplies exactly 5 rows.
- Large mode supplies exactly 1000 rows.
- Small mode is selected initially.
- All new visible labels use translation keys.
- No ancestor outside Kai Table owns scrolling.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 3 — Aggiungere l’esempio sticky in modalità parent ✅ DONE

- **Executor**: `examples-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/app/examples/kai-table-example/kai-table-sticky-parent-example.ts`, `src/app/examples/kai-table-example/kai-table-sticky-parent-example.html`, `src/app/examples/kai-table-example/kai-table-sticky-parent-example.scss`
- **Obiettivo**: creare una variante parent-height dell’esempio sticky esistente, mantenendo le stesse colonne sticky e aggiungendo il selettore 5/1000 righe.
- **Requisiti**:
  1. Creare un componente standalone `IbKaiTableStickyParentExamplePage` con `tableName="stickyParentExample"` e `tableHeight="parent"` esplicito.
  2. Replicare l’ordine delle colonne di `kai-table-sticky-example.ts`: `id`, `name`, `fruit`, `amount`, `number`, `created_at`, `subscribed`.
  3. Conservare `name` sticky a sinistra e `subscribed` stickyEnd a destra.
  4. Generare 1000 righe tipizzate e offrire modalità small da 5 righe e large da 1000, con small selezionata inizialmente.
  5. Usare lo stesso selettore Material e le stesse chiavi di traduzione del parent-height example; gli header espliciti devono usare chiavi sotto `examples.kaiTable.columns`.
  6. Applicare una catena flex parent-height completa e `--ib-table-min-content-height: 0px`.
  7. Lasciare che la tabella occupi tutta la larghezza disponibile, producendo overflow orizzontale durante il restringimento del browser invece di imporre `max-width: 600px`.
  8. Non modificare l’esempio sticky fisso esistente.
- **Vincoli**: non modificare routing, menu, traduzioni, example sticky fisso o libreria; non usare `any`, `::ng-deep` o overflow su un ancestor della tabella.
- **Validazione**: `npm run lint` deve terminare con exit code `0` e il componente deve essere compilabile senza import profondi.
- **Stop condition**: fermarsi se sticky e stickyEnd non funzionano nel contenitore parent senza una modifica alla libreria.

**Executor Input**:

~~~
## TASK:
Create a parent-height variant of the existing sticky-columns Kai Table example.

## CONTEXT:
Use `src/app/examples/kai-table-example/kai-table-sticky-example.ts` as a read-only behavioral reference. Keep its column order and sticky assignments, but do not copy its fixed `tableHeight="500px"` or `max-width: 600px`. Follow the parent-height flex pattern established by Steps 1 and 2. Translation keys will be integrated in Step 4.

## OBJECTIVE:
Provide a full-height sticky table that switches between five and one thousand rows, resizes with the browser, and exposes horizontal and vertical table scrolling when space is constrained.

## REQUIREMENTS:
1. Create standalone `IbKaiTableStickyParentExamplePage` with `tableName="stickyParentExample"` and explicit `tableHeight="parent"`.
2. Preserve column order: `id`, `name`, `fruit`, `amount`, `number`, `created_at`, `subscribed`.
3. Keep `name` sticky on the left and `subscribed` stickyEnd on the right.
4. Generate 1000 typed rows and expose small mode with 5 rows and large mode with 1000 rows; default to small.
5. Reuse the parent example’s Material dataset selector and translation keys; bind explicit headers to keys under `examples.kaiTable.columns`.
6. Implement a complete parent-height flex chain and local `--ib-table-min-content-height: 0px`.
7. Fill available width and rely on browser narrowing to create horizontal table overflow; do not impose the fixed example’s 600px maximum width.
8. Leave the existing fixed-height sticky example unchanged.

## CONSTRAINTS:
- Modify only the three allowed new files.
- Treat `kai-table-sticky-example.ts` as read-only.
- Import library symbols through `public_api`.
- Do not modify routes, menus, translations, library sources, or global styles.
- Do not use `any`, `::ng-deep`, or an outer scrolling container.
- Keep template expressions simple and typed logic in the component class.

## OUTPUT:
Report created files, sticky assignments, dataset selector behavior, and lint result.

## ACCEPTANCE CRITERIA:
- `npm run lint` exits successfully.
- The component has a unique table name and explicit parent-height input.
- The `name` column remains sticky and `subscribed` remains stickyEnd.
- Small and large modes provide exactly 5 and 1000 rows.
- Small mode is initially active.
- The component has no fixed 500px height or 600px maximum width.
- All newly introduced visible labels use translation keys.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 4 — Collegare route, menu e traduzioni ✅ DONE

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo F
- **File consentiti**: `src/app/routing.module.ts`, `src/app/examples/main-menu-example/main-menu-data.json`, `src/assets/i18n/it.json`
- **Obiettivo**: rendere raggiungibili e comprensibili i nuovi esempi tramite routing, menu, breadcrumb e traduzioni.
- **Requisiti**:
  1. Importare i due nuovi componenti e aggiungere le route figlie `parent-height` e `sticky-parent` sotto `home/kai-table`.
  2. Usare breadcrumb basate su chiavi di traduzione, senza nuove stringhe visibili hardcoded.
  3. Aggiungere nel menu una voce Parent Height vicino a Simple e una voce Sticky Parent vicino allo sticky fisso.
  4. Mantenere `/home/kai-table/sticky` invariata, ma distinguere la sua etichetta come variante ad altezza fissa.
  5. Aggiungere soltanto le chiavi necessarie sotto `examples.ibMainMenu`, `examples.kaiTable.dataset` ed `examples.kaiTable.columns`.
  6. Garantire che menu, route e breadcrumb usino gli stessi identificatori e che il JSON rimanga valido.
- **Vincoli**: modifica meccanica limitata ai tre file consentiti; non cambiare componenti, redirect, route esistenti non correlate, libreria o API pubbliche.
- **Validazione**: `npm run build` deve terminare con exit code `0` e compilare entrambe le nuove route.
- **Stop condition**: fermarsi se i nomi dei componenti creati negli step 2 o 3 non corrispondono al piano oppure se una route richiede modifiche fuori dai file consentiti.

**Executor Input**:

~~~
## TASK:
Wire the two new parent-height examples into application routing, the main menu, breadcrumbs, and Italian translations.

## CONTEXT:
Step 2 creates `IbKaiTableParentHeightExamplePage`; Step 3 creates `IbKaiTableStickyParentExamplePage`. Routes live in `src/app/routing.module.ts`, menu entries in `src/app/examples/main-menu-example/main-menu-data.json`, and the demo app has one translation catalog at `src/assets/i18n/it.json`. Existing route `/home/kai-table/sticky` must remain valid.

## OBJECTIVE:
Make both examples navigable and ensure every newly introduced label is translated and distinguishes fixed-height from parent-height behavior.

## REQUIREMENTS:
1. Import both new components and add child routes `parent-height` and `sticky-parent` below `home/kai-table`.
2. Use translation keys for both new breadcrumb values; add no new hardcoded visible breadcrumb strings.
3. Add a Parent Height menu item next to Simple and a Sticky Parent item next to the existing Sticky item.
4. Keep `/home/kai-table/sticky` unchanged, but make its menu and breadcrumb label clearly identify the fixed-height variant.
5. Add only required keys under `examples.ibMainMenu`, `examples.kaiTable.dataset`, and `examples.kaiTable.columns`, covering dataset options and all explicit headers used by the new examples.
6. Keep route paths, menu links, breadcrumb keys, and translation identifiers exactly aligned and preserve valid JSON.

## CONSTRAINTS:
- Modify only the three allowed integration files.
- Do not edit the newly created components in this step.
- Do not change unrelated routes, redirects, translations, library sources, or `public_api.ts`.
- Preserve existing menu ordering except for inserting the two related entries.
- Keep JSON formatting valid and avoid unrelated translation cleanup.

## OUTPUT:
Report imports, route paths, menu links, translation keys added or changed, and build result.

## ACCEPTANCE CRITERIA:
- `npm run build` exits successfully.
- `/home/kai-table/parent-height` resolves to `IbKaiTableParentHeightExamplePage`.
- `/home/kai-table/sticky-parent` resolves to `IbKaiTableStickyParentExamplePage`.
- `/home/kai-table/sticky` still resolves to the fixed 500px example.
- Both new routes appear in the Kai Table menu.
- New breadcrumb, menu, selector, and header labels resolve through `it.json`.
- `main-menu-data.json` and `it.json` remain valid JSON.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

## 6. Impacted Areas

### Nuovo

- `src/app/examples/kai-table-example/kai-table-parent-height-example.ts`
- `src/app/examples/kai-table-example/kai-table-parent-height-example.html`
- `src/app/examples/kai-table-example/kai-table-parent-height-example.scss`
- `src/app/examples/kai-table-example/kai-table-sticky-parent-example.ts`
- `src/app/examples/kai-table-example/kai-table-sticky-parent-example.html`
- `src/app/examples/kai-table-example/kai-table-sticky-parent-example.scss`
- Route `/home/kai-table/parent-height`
- Route `/home/kai-table/sticky-parent`
- Classi demo `IbKaiTableParentHeightExamplePage` e `IbKaiTableStickyParentExamplePage`
- Chiavi di traduzione per menu, dataset e intestazioni.

### Esteso

- `src/app/examples/kai-table-example/kai-table-example.html`
- `src/app/examples/kai-table-example/kai-table-example.scss`
- `src/app/routing.module.ts`
- `src/app/examples/main-menu-example/main-menu-data.json`
- `src/assets/i18n/it.json`

### Deliberatamente invariato

- `src/app/examples/kai-table-example/kai-table-sticky-example.ts`, salvo l’etichetta esterna di menu e breadcrumb.
- `src/app/examples/nav/`
- `src/app/inobeta-ui/ui/kai-table/`
- `public_api.ts`
- Contratto pubblico di `tableHeight`
- Rendering mobile
- NgRx, data source, filtri, viste, export e persistenza URL.

Non viene aggiunta o modificata alcuna API pubblica della libreria.

## 7. Risks

- **La catena flex potrebbe restare incompleta su un host Angular custom element.** Mitigazione: rendere esplicitamente flex sia il wrapper sia `ib-kai-table`, usare `min-height: 0` a ogni livello e verificare il resize nel browser. Se richiede modifiche alla libreria, interrompere il lavoro.
- **Il minimo predefinito di 400px può impedire il resize verticale desiderato.** Mitigazione: override locale `--ib-table-min-content-height: 0px`, senza cambiare il default pubblico.
- **Un ancestor scrollabile potrebbe creare doppie scrollbar.** Mitigazione: usare `overflow: hidden` negli examples e lasciare `overflow: auto` solo alla content area interna di Kai Table.
- **I dataset da 1000 righe possono rendere il demo più pesante.** Rischio accettato perché la quantità è stata richiesta e il componente dispone già del paginator; la collezione viene generata una sola volta.
- **Il cambio da 1000 a 5 righe può lasciare il paginator su una pagina non valida.** Mitigazione: verificare manualmente anche il cambio dopo aver navigato oltre la prima pagina; la modalità small deve mostrare le righe disponibili.
- **Sticky columns e scrollbar possono comportarsi diversamente tra browser.** Mitigazione: verificare almeno Chrome, usato dalla suite Karma, e controllare che le colonne sticky restino ferme durante entrambi gli assi di scroll.
- **Le nuove route possono divergere dai link del menu o dalle breadcrumb.** Mitigazione: integrare route, menu e traduzioni nello stesso step meccanico e validare entrambe le URL direttamente.
- **La branch corrente potrebbe non essere quella di DEVK-1046.** Mitigazione: verificare `git branch --show-current` prima dell’esecuzione; non fare checkout o porting automatico senza conferma.

## 8. Validation Checklist

- `git branch --show-current` conferma la branch usata per DEVK-1046.
- `npm run lint` termina senza errori.
- `npm run build` termina senza errori e include le nuove route.
- `npm run test-ci` termina senza regressioni e mantiene le soglie di coverage.
- Avviare `npm start` e aprire `/home/kai-table/simple`:
  - menu e breadcrumb restano visibili in alto;
  - la tabella occupa tutta l’altezza residua;
  - il resize verticale modifica il viewport della tabella;
  - il pulsante paginator continua a funzionare;
  - la pagina non mostra una seconda scrollbar verticale.
- Aprire `/home/kai-table/parent-height`:
  - small è selezionato inizialmente;
  - small mostra esattamente 5 righe e spazio vuoto sotto le righe su viewport alto;
  - large usa 1000 elementi;
  - riducendo l’altezza compare lo scroll interno della tabella;
  - aumentando l’altezza la tabella continua a riempire il contenitore;
  - passando da large a small dopo aver cambiato pagina, le righe small restano visibili.
- Aprire `/home/kai-table/sticky`:
  - la route esistente funziona ancora;
  - l’area dati mantiene altezza fissa di `500px`;
  - il menu la identifica come variante ad altezza fissa.
- Aprire `/home/kai-table/sticky-parent`:
  - small e large corrispondono a 5 e 1000 righe;
  - la tabella riempie altezza e larghezza disponibili;
  - `name` resta sticky a sinistra durante lo scroll orizzontale;
  - `subscribed` resta sticky a destra;
  - header e colonne sticky restano corretti durante lo scroll verticale;
  - restringendo il browser compare lo scroll orizzontale interno;
  - non compaiono scrollbar annidate della pagina.
- Le voci Parent Height, Sticky Fixed Height e Sticky Parent sono presenti nel menu e aprono le route corrette.
- Menu, breadcrumb, selettori e nuovi header non mostrano chiavi di traduzione non risolte.
- Nessun file sotto `src/app/inobeta-ui/` e nessuna esportazione di `public_api.ts` risultano modificati.
