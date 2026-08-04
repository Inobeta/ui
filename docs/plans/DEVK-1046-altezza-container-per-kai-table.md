# DEVK-1046 — Altezza container per Kai Table

> Piano destinato a `docs/plans/DEVK-1046-kai-table-container-height.md`; il cambiamento riguarda solo il rendering desktop ed è intenzionalmente breaking.

## 1. Goal

Aggiungere a `IbTable` l’input pubblico `tableHeight`, con due comportamenti:

- valore `"parent"`: la tabella desktop occupa l’altezza del contenitore e l’area dati usa lo spazio rimasto dopo toolbar, filtro e paginator;
- qualsiasi altra stringa CSS non vuota: rappresenta l’altezza esatta dell’area scrollabile, che mantiene quello spazio anche con poche righe.

Se l’input è omesso, il default diventa `"parent"`. Se il parent non fornisce spazio sufficiente, l’area scrollabile mantiene un minimo configurabile tramite `--ib-table-min-content-height`, con default `400px`.

Toolbar, filtro e paginator restano fuori dall’unica area scrollabile. Header, footer e colonne Material restano sticky. La vista mobile conserva workflow e layout attuali.

La documentazione deve fornire un percorso di migrazione per consumer diretti e adapter, inclusi seed project e kaiboard.

## 2. Current State

- `src/app/inobeta-ui/ui/kai-table/table.component.ts` espone input signal per stato, dati, data source, `tableName`, `tableDef`, colonne e opzioni visuali, ma non contiene un input per l’altezza.
- `src/app/inobeta-ui/ui/kai-table/table.component.scss` calcola oggi il `max-height` di `.ib-table__content` tramite:
  - `--ib-table-minimum-rows`, default 10;
  - token Material per altezza header e righe;
  - `--ib-table-content-max-height`;
  - sottrazione dell’altezza massima del filtro.
- `.ib-table__content` è già l’area scrollabile con `overflow-y: auto`; il contenitore esterno usa `overflow: hidden`.
- `src/app/inobeta-ui/ui/kai-table/table.component.html` mantiene:
  - toolbar e filtro sopra `.ib-table__content`;
  - tabella Material dentro `.ib-table__content`;
  - paginator fuori dall’area scrollabile;
  - header e footer dichiarati `sticky: true`;
  - colonne sticky tramite gli input Material esistenti.
- Il wrapper `.ib-table-desktop` separa il layout desktop da `.ib-table-mobile`; la catena flex dovrà quindi comprendere host, wrapper desktop e content.
- `tableDef.paginator.hide` controlla già la visibilità del paginator e non deve cambiare.
- `docs/plans/DEVK-1066-kai-table-refactoring.md` e il relativo feedback confermano che Kai Table è stata recentemente migrata a signal API e nuovi data source. DEVK-1046 deve evitare modifiche a stato NgRx, URL, filtri, viste, data source, capability ed export.
- La ricerca nel repository non ha trovato il Simple Table adapter: è esterno a questo repository. Seed project e kaiboard sono consumer noti, ma i relativi percorsi e contratti non sono verificabili qui.
- Durante la pianificazione sono stati letti sorgenti, template, SCSS, piano DEVK-1066 e feedback. Non è stata eseguita una validazione runtime del layout.

## 3. Assumptions / Open Questions

### Decisioni confermate

- L’input pubblico si chiama `tableHeight`.
- `tableHeight` accetta `"parent"` oppure una semplice stringa CSS; non è richiesto un parser limitato ai pixel.
- Se omesso, `tableHeight` usa `"parent"`.
- Il nuovo default è intenzionalmente breaking rispetto al calcolo basato sul numero minimo di righe.
- In modalità `"parent"` il layout usa flexbox e conserva toolbar, filtro e paginator fuori dall’area scrollabile.
- In modalità `"parent"` il contenitore desktop usa l’altezza del parent e `.ib-table__content` prende lo spazio residuo.
- L’area scrollabile ha altezza minima configurabile tramite variabile CSS, con default `400px`.
- I `400px` riguardano solo `.ib-table__content`; toolbar, filtro e paginator si sommano all’altezza totale.
- Con un valore CSS esplicito, `.ib-table__content` ha altezza esatta, non `max-height`, e mantiene spazio vuoto quando le righe sono poche.
- `--ib-table-content-max-height` e `--ib-table-minimum-rows` vengono sostituite dal nuovo contratto.
- Il paginator resta gestito da `tableDef.paginator.hide`.
- La versione mobile non è oggetto del ticket.

### Decisioni prese da me, con motivazione

- Una stringa omessa, vuota o composta solo da spazi viene normalizzata a `"parent"`, per mantenere un fallback deterministico senza introdurre validazione rigida delle unità CSS.
- Solo il valore normalizzato esattamente uguale a `"parent"` attiva la modalità parent; ogni altra stringa non vuota viene passata a un binding Angular di stile. Questo conserva la flessibilità richiesta e lascia al browser la validazione CSS.
- La logica di normalizzazione e selezione modalità vive in signal/computed TypeScript; il template usa solo binding semplici, evitando espressioni complesse.
- `.ib-table__content` diventa l’unico contenitore con `overflow: auto`, così scroll verticale e orizzontale condividono la stessa area e le colonne sticky hanno un unico riferimento.
- La variabile pubblica sarà `--ib-table-min-content-height`, default `400px`. Non viene aggiunto un secondo input Angular per il fallback.
- Non viene introdotto un nuovo tipo pubblico: `tableHeight` resta un input `string` dell’esistente `IbTable`, quindi non servono modifiche a `index.ts` o `public_api.ts`.
- La migrazione viene documentata in `table.mdx`, già documentazione pubblica del componente, includendo istruzioni specifiche per wrapper e consumer esterni.
- Nessuno step richiede `gpt-5.6-sol`: il perimetro è ristretto e i file sono già individuati. Lo step production usa `gpt-5.6-terra` per gestire insieme signal, template e layout sticky; le spec usano `deepseek-v4-pro`; esempi e documentazione usano `gpt-5.6-luna`, adeguato per modifiche locali con comandi di build espliciti.

### Questioni aperte, non bloccanti

- Non sono disponibili in questo repository i sorgenti del Simple Table adapter, seed project o kaiboard. Il piano può dichiarare modifiche e verifiche richieste, ma l’applicazione concreta dovrà avvenire nei relativi repository.
- Una stringa CSS sintatticamente invalida verrà ignorata dal browser. Il rischio è accettato perché è stata richiesta una stringa libera e non una validazione strict.
- Un parent più basso del minimo necessario può essere superato dal `min-height` del content più toolbar/filtro/paginator. Il comportamento è coerente con il fallback confermato e deve essere documentato.

## 4. Proposed Approach

Il componente espone un input signal:

| Valore effettivo | Host desktop | `.ib-table-desktop` | `.ib-table__content` |
|---|---|---|---|
| `"parent"` | `height: 100%`, `overflow: hidden` | flex column, `height: 100%` | flex-grow, `min-height: var(--ib-table-min-content-height, 400px)`, `overflow: auto` |
| Stringa CSS | altezza naturale, `overflow: hidden` | flex column | `height` esatta dalla stringa, niente `max-height`, `overflow: auto` |
| Omesso/vuoto | normalizzato a `"parent"` | come `"parent"` | come `"parent"` |

La catena desktop sarà:

```text
ib-kai-table.ib-table__container
└── .ib-table-desktop (flex column)
    ├── toolbar
    ├── filtro opzionale
    ├── .ib-table__content (unico scroll container)
    │   └── mat-table con header/footer/colonne sticky
    └── paginator
```

In modalità parent, toolbar, filtro e paginator consumano il loro spazio naturale; il content prende il residuo. In modalità esplicita, `tableHeight` misura solo il content e gli elementi esterni si sommano all’altezza totale.

Il vecchio calcolo basato su header, numero minimo di righe, footer e altezza filtro viene rimosso. Le dichiarazioni sticky Material non cambiano.

## 5. Step-by-Step Plan

### Dependencies between steps

`1 → 2`; `1 → 3`; `1 → 4`.

---

### Step 1 — Implementare il contratto desktop `tableHeight` ✅ DONE

- **Executor**: `kai-table-executor`
- **Modelli suggeriti**: gruppo R — `opencode/gpt-5.6-terra`
- **File consentiti**: `src/app/inobeta-ui/ui/kai-table/table.component.ts`, `src/app/inobeta-ui/ui/kai-table/table.component.html`, `src/app/inobeta-ui/ui/kai-table/table.component.scss`
- **Obiettivo**: introdurre `tableHeight` e sostituire il vecchio calcolo statico con un layout desktop flex a singola area scrollabile.
- **Requisiti**:
  1. Aggiungere a `IbTable` l’input signal pubblico `tableHeight`, tipizzato `string` e con default `"parent"`.
  2. Normalizzare valori vuoti o whitespace a `"parent"` senza limitare le altre stringhe a un elenco di unità.
  3. Esporre computed/classi semplici per distinguere modalità parent e valore CSS esplicito.
  4. In modalità parent applicare `height: 100%` alla catena host/wrapper desktop e usare un layout flex column.
  5. Far occupare a `.ib-table__content` lo spazio residuo in modalità parent.
  6. Applicare alle stringhe CSS esplicite l’altezza esatta di `.ib-table__content`, mantenendo spazio vuoto con poche righe.
  7. Definire `--ib-table-min-content-height` con fallback `400px` e applicarla come `min-height` del content in modalità parent.
  8. Mantenere `.ib-table__content` come unica area `overflow: auto`; host e wrapper non devono introdurre un secondo scroll.
  9. Rimuovere il calcolo e i selettori non più necessari basati su `--ib-table-minimum-rows`, `--ib-table-content-max-height`, altezza filtro e presenza footer.
  10. Conservare invariati sticky header, sticky footer, sticky columns, toolbar, filtro e `tableDef.paginator.hide`.
  11. Non inoltrare `tableHeight` al componente mobile e non modificare il suo layout.
- **Vincoli**: non modificare NgRx, URL, facade, data source, filtri, viste, export, colonne, `public_api.ts` o file sotto `ui/kai-table-mobile`; non aggiungere testo visibile; non usare logica complessa o cast nel template.
- **Validazione**: `npm run packagr` deve completare senza errori Angular, TypeScript o SCSS.
- **Stop condition**: fermarsi con `NEED CLARIFICATION` se preservare una sola area scrollabile richiede modifiche a componenti mobile, Material internals o file fuori da quelli consentiti.

**Executor Input**:

~~~
## TASK:
Add the public `tableHeight` input and replace the desktop row-count max-height calculation with the agreed flex layout.

## CONTEXT:
`IbTable` is implemented in `src/app/inobeta-ui/ui/kai-table/table.component.ts`. Its desktop DOM is in `table.component.html`, with toolbar and filter above `.ib-table__content` and paginator below it. The current SCSS computes a content `max-height` from Material row tokens and CSS variables. Header, footer, and columns already use Angular Material sticky behavior. DEVK-1066 recently changed table signals, state, and data sources; those areas are out of scope.

## OBJECTIVE:
Make desktop Kai Table use either parent-filling height or an exact CSS content height while retaining one scroll container and all existing sticky behavior.

## REQUIREMENTS:
1. Add a public `string` input signal named `tableHeight` with default `"parent"`.
2. Normalize omitted, empty, and whitespace-only values to `"parent"`; forward every other non-empty CSS string without unit whitelisting.
3. Keep mode selection and normalization in typed component signals/computed values, leaving only simple bindings in the template.
4. For parent mode, make the desktop host/wrapper chain fill the parent and use a column flex layout.
5. Make `.ib-table__content` consume remaining parent-mode space after toolbar, filter, and paginator.
6. For a non-parent CSS value, apply that value as the exact `.ib-table__content` height, not as max-height.
7. Add public CSS variable `--ib-table-min-content-height` with a `400px` fallback for parent mode.
8. Keep `.ib-table__content` as the only `overflow: auto` scroll area and retain outer overflow clipping.
9. Remove obsolete minimum-row, content-max-height, filter-subtraction, and footer-height calculation rules.
10. Preserve Material sticky header/footer/column declarations and current paginator visibility behavior.
11. Do not pass the input to or change the mobile component.

## CONSTRAINTS:
- Modify only the three allowed table component files.
- Do not modify store, URL, facade, data-source, filter, views, export, column, public API barrel, or mobile files.
- Do not introduce visible text, TypeScript syntax in templates, casts, or repeated complex template expressions.
- Do not replace Angular Material sticky behavior with custom JavaScript positioning.
- Preserve `.ib-table__content` as the sole table scroll owner.

## OUTPUT:
Report the changed files, the normalization rule, the classes/style bindings introduced, and the obsolete CSS variables/rules removed.

## ACCEPTANCE CRITERIA:
- `npm run packagr` passes.
- `IbTable` exposes `tableHeight` with default `"parent"`.
- Parent mode uses the host/wrapper/content flex chain and the `400px` CSS-variable fallback.
- Explicit CSS values set exact content height and do not use max-height.
- `--ib-table-minimum-rows` and `--ib-table-content-max-height` no longer occur in the changed production files.
- Header/footer sticky declarations and projected sticky-column behavior remain intact.
- No file under `ui/kai-table-mobile` is changed.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 2 — Coprire altezza, fallback e scroll con Jasmine ✅ DONE

- **Executor**: `unit-jasmine-executor`
- **Modelli suggeriti**: gruppo R — `opencode/deepseek-v4-pro`
- **File consentiti**: `src/app/inobeta-ui/ui/kai-table/table.component.spec.ts`
- **Obiettivo**: rendere verificabili il default breaking, l’altezza esatta, il fallback CSS e l’invariante di una sola area scrollabile.
- **Requisiti**:
  1. Aggiungere un host di test che permetta di impostare `tableHeight` e l’altezza del parent.
  2. Verificare che input omesso, stringa vuota e whitespace attivino la modalità parent.
  3. Verificare che un parent con altezza definita venga occupato dalla tabella desktop.
  4. Verificare che `tableHeight="500px"` produca un content di altezza esatta anche con poche righe.
  5. Verificare il fallback computato `400px` e l’override di `--ib-table-min-content-height` con un valore vicino, ad esempio `420px`.
  6. Verificare che toolbar/filtro/paginator restino fuori da `.ib-table__content`.
  7. Verificare che `.ib-table__content` sia l’unico elemento interno alla table con overflow scrollabile.
  8. Conservare o aggiungere assertion sul rendering sticky di header e colonne; coprire il footer sticky quando la fixture di aggregazione esistente lo consente.
  9. Non rimuovere o indebolire test DEVK-1066 esistenti e non introdurre test disabilitati.
- **Vincoli**: non modificare production code; usare `NoopAnimationsModule` e fixture Material già presenti; evitare timeout arbitrari e assertion dipendenti da dettagli privati Material.
- **Validazione**: `npx ng test --include='src/app/inobeta-ui/ui/kai-table/table.component.spec.ts' --watch=false` deve passare.
- **Stop condition**: fermarsi se il focused test richiede modifiche production o correzioni NgRx/URL non legate a `tableHeight`.

**Executor Input**:

~~~
## TASK:
Add focused Jasmine coverage for `tableHeight`, its CSS fallback, and the single-scroll sticky layout.

## CONTEXT:
Production support is implemented by Step 1 in the table component files. The test must distinguish the parent-filling mode from an explicit exact content height. Toolbar, filter, and paginator remain siblings outside `.ib-table__content`; Material sticky rows and columns remain inside it. Existing DEVK-1066 tests may cover unrelated state and data-source behavior and must not be rewritten.

## OBJECTIVE:
Prove the new height contract and guard against double-scroll or sticky regressions.

## REQUIREMENTS:
1. Add or adapt a host fixture that controls the parent height and `tableHeight` binding.
2. Assert that omitted, empty, and whitespace-only values select parent mode.
3. Assert that a table inside a definitively sized parent fills the desktop parent layout.
4. Assert that `"500px"` produces an exact 500px content viewport with a short dataset.
5. Assert the default computed minimum content height is 400px and that overriding `--ib-table-min-content-height` to 420px is honored.
6. Assert toolbar, projected filter when available, and paginator are not descendants of `.ib-table__content`.
7. Assert `.ib-table__content` is the only table-owned element with scrollable overflow.
8. Assert sticky header and sticky columns still render as sticky; cover the sticky footer when supported by the existing aggregation fixture.
9. Preserve unrelated existing tests and add no disabled or focused Jasmine declarations.

## CONSTRAINTS:
- Modify only `table.component.spec.ts`.
- Do not change production files or weaken DEVK-1066 assertions.
- Use Angular/Material test setup and `NoopAnimationsModule`; do not use arbitrary sleeps.
- Avoid assertions against undocumented Material private fields when DOM classes or computed styles are sufficient.

## OUTPUT:
Report the tests added, which dimensions/styles are asserted, and the exact focused test result.

## ACCEPTANCE CRITERIA:
- `npx ng test --include='src/app/inobeta-ui/ui/kai-table/table.component.spec.ts' --watch=false` passes.
- Separate assertions cover default parent, blank fallback, exact 500px, default 400px, and CSS-variable override.
- The DOM test proves paginator and toolbar remain outside the scroll viewport.
- Sticky header and column behavior remains covered.
- No new `xit`, `xdescribe`, `fit`, or `fdescribe` is introduced.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 3 — Aggiornare gli esempi desktop rappresentativi ✅ DONE

- **Executor**: `examples-executor`
- **Modelli suggeriti**: gruppo R — `opencode/gpt-5.6-luna`
- **File consentiti**: `src/app/examples/kai-table-example/kai-table-example.html`, `src/app/examples/kai-table-example/kai-table-example.scss`, `src/app/examples/kai-table-example/kai-table-sticky-example.ts`
- **Obiettivo**: mostrare in demo sia la modalità parent sia l’altezza esatta, verificando sticky e singolo scroll senza modificare il mobile.
- **Requisiti**:
  1. Usare l’esempio base per dimostrare `"parent"` dentro un wrapper con altezza esplicita.
  2. Usare l’esempio sticky per dimostrare un valore CSS esatto di `tableHeight`.
  3. Rimuovere dall’esempio sticky eventuale overflow esterno che introdurrebbe un secondo scroll attorno alla tabella.
  4. Mantenere dataset, colonne, sort, sticky start/end, routing e paginator esistenti.
  5. Non modificare l’esempio mobile empty o altri esempi fuori dai file consentiti.
  6. Non aggiungere nuove stringhe UI o traduzioni.
- **Vincoli**: non modificare libreria, routing, menu, mobile, dataset o public API; non usare vecchie variabili CSS per l’altezza.
- **Validazione**: `npm run build` deve compilare la demo con entrambi i binding `tableHeight`.
- **Stop condition**: fermarsi se la dimostrazione richiede cambi di routing, componenti libreria o layout mobile.

**Executor Input**:

~~~
## TASK:
Update representative desktop examples to demonstrate parent height and exact CSS height modes.

## CONTEXT:
Step 1 adds `tableHeight` to `ib-kai-table`. The basic example has an external SCSS file and can provide a definitively sized parent. The sticky example has inline styles and currently owns external horizontal overflow, which would obscure the single-scroll requirement. Mobile examples are out of scope.

## OBJECTIVE:
Provide compilable demos for both modes without introducing nested table scrolling.

## REQUIREMENTS:
1. Make the basic example demonstrate parent mode inside a wrapper with an explicit height.
2. Make the sticky example demonstrate an exact `tableHeight` CSS value.
3. Remove table-surrounding overflow from the sticky example so `.ib-table__content` remains the scroll owner.
4. Preserve existing data, columns, sorting, sticky start/end columns, paginator, and routing behavior.
5. Do not modify mobile-empty or unrelated examples.
6. Add no new visible labels or translation keys.

## CONSTRAINTS:
- Modify only the three allowed example files.
- Do not modify library source, routes, menus, datasets, or mobile files.
- Do not use removed `--ib-table-minimum-rows` or `--ib-table-content-max-height` variables.
- Do not redesign the examples beyond the wrappers/styles needed to demonstrate height behavior.

## OUTPUT:
Report which example demonstrates each mode, the selected dimensions, and the build result.

## ACCEPTANCE CRITERIA:
- `npm run build` passes.
- The basic example contains a parent-mode table inside a definitively sized wrapper.
- The sticky example uses an explicit exact `tableHeight`.
- The sticky example does not add an outer scroll container around Kai Table.
- No mobile example file is changed.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 4 — Documentare API e migrazione consumer ✅ DONE

- **Executor**: `storybook-executor`
- **Modelli suggeriti**: gruppo R — `opencode/gpt-5.6-luna`
- **File consentiti**: `src/app/inobeta-ui/ui/kai-table/table.stories.ts`, `src/app/inobeta-ui/ui/kai-table/table.mdx`
- **Obiettivo**: rendere `tableHeight` provabile in Storybook e dichiarare il percorso di migrazione per consumer diretti e adapter.
- **Requisiti**:
  1. Esporre `tableHeight` nei controlli Storybook come stringa.
  2. Aggiungere o adattare story per mostrare modalità parent con parent dimensionato.
  3. Aggiungere o adattare story per mostrare altezza CSS esatta e sticky start/end nello stesso scroll container.
  4. Documentare che il default omesso o vuoto è `"parent"` e costituisce una breaking change.
  5. Documentare che un valore CSS rappresenta l’altezza esatta del content, non l’altezza totale del componente.
  6. Documentare `--ib-table-min-content-height`, default `400px`, e un esempio di override.
  7. Documentare che toolbar, filtro e paginator si sommano al valore esplicito e restano fuori dallo scroll.
  8. Documentare la rimozione di `--ib-table-minimum-rows` e `--ib-table-content-max-height`.
  9. Fornire una checklist di migrazione per consumer e wrapper: scegliere parent o altezza esplicita, definire l’altezza dell’antenato per parent, propagare `tableHeight` negli adapter, rimuovere vecchi override CSS.
  10. Citare seed project, kaiboard e Simple Table adapter come consumer esterni da aggiornare in repository separati.
  11. Dichiarare esplicitamente che la modalità mobile non cambia.
- **Vincoli**: non modificare implementation, esempi applicativi, Storybook config o mobile; non promettere validazione strict delle unità CSS; non documentare `tableHeight` come altezza totale.
- **Validazione**: `npm run build-storybook` deve completare senza errori.
- **Stop condition**: fermarsi se Storybook richiede modifiche production o configurazione globale non legate alla nuova API.

**Executor Input**:

~~~
## TASK:
Expose `tableHeight` in Storybook and document the complete breaking migration path.

## CONTEXT:
Step 1 adds a public string input to `IbTable`. Omitted, empty, and whitespace-only values mean `"parent"`. Other non-empty values are forwarded as exact CSS heights for `.ib-table__content`. The parent mode uses a configurable `--ib-table-min-content-height` fallback of 400px. Seed project, kaiboard, and a Simple Table adapter are known external consumers but are not present in this repository.

## OBJECTIVE:
Provide executable Storybook examples and migration documentation that external consumers can follow without guessing layout semantics.

## REQUIREMENTS:
1. Add `tableHeight` as a string Storybook control and pass it through relevant story templates.
2. Demonstrate parent mode inside a definitively sized story wrapper.
3. Demonstrate exact CSS height with sticky start/end behavior and no outer scroll owner.
4. State that omitted or blank input defaults to `"parent"` and that this changes existing consumer behavior.
5. State that explicit CSS values set exact scroll-content height, not total component height.
6. Document `--ib-table-min-content-height`, its 400px default, and an override example.
7. Explain that toolbar, filter, and paginator remain outside the content height and scroll area.
8. Mark `--ib-table-minimum-rows` and `--ib-table-content-max-height` as removed.
9. Add a migration checklist covering direct templates and wrapper/adaptor components.
10. Name seed project, kaiboard, and Simple Table adapter as external follow-up consumers.
11. State that mobile behavior is unchanged.

## CONSTRAINTS:
- Modify only `table.stories.ts` and `table.mdx`.
- Do not modify production code, example app files, Storybook configuration, or mobile files.
- Do not claim that arbitrary CSS strings receive strict runtime validation.
- Do not describe `tableHeight` as total host height.
- Keep code snippets valid against the signal-based public API.

## OUTPUT:
Report stories changed or added, documentation sections added, external migration actions listed, and the Storybook build result.

## ACCEPTANCE CRITERIA:
- `npm run build-storybook` passes.
- Storybook controls expose `tableHeight`.
- Parent and exact-height modes are both represented.
- The MDX states default, exact-content semantics, 400px fallback, CSS override, removed variables, and mobile exclusion.
- The migration checklist explicitly covers seed project, kaiboard, and Simple Table adapter.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

## 6. Impacted Areas

### Modifiche alla libreria

- `IbTable` acquisisce il nuovo input signal pubblico `tableHeight: string`.
- Il default di `tableHeight` è `"parent"`.
- `src/app/inobeta-ui/ui/kai-table/table.component.html` riceve classi e binding di stile per la sola vista desktop.
- `src/app/inobeta-ui/ui/kai-table/table.component.scss` passa dal `max-height` calcolato a flex layout e altezza esatta.
- `.ib-table__content` resta l’unico scroll container.
- Viene introdotta la variabile CSS pubblica `--ib-table-min-content-height`, default `400px`.

### Contratti rimossi o sostituiti

- `--ib-table-minimum-rows` non controlla più l’altezza.
- `--ib-table-content-max-height` non controlla più l’altezza.
- Il calcolo implicito basato su header, numero righe e footer viene rimosso.
- La sottrazione statica dell’altezza filtro dal vecchio `max-height` viene rimossa.

### Consumer interni

- Gli esempi desktop base e sticky mostrano le due modalità.
- Storybook espone il nuovo input e la relativa migrazione.
- Non sono richiesti nuovi export da `index.ts` o `public_api.ts`.

### Consumer esterni

- Seed project e kaiboard devono scegliere intenzionalmente fra parent e altezza CSS.
- Il Simple Table adapter deve propagare `tableHeight` se vuole consentire configurazione ai propri consumer.
- Gli override delle vecchie variabili CSS devono essere rimossi o convertiti.
- Le modifiche ai repository esterni restano fuori dal perimetro eseguibile di questo piano.

### Aree deliberatamente escluse

- `src/app/inobeta-ui/ui/kai-table-mobile/`.
- Stato NgRx, URL, viste, filtri e data source.
- Export e capability.
- Paginazione e infinite scroll mobile.
- Validazione strict o parser delle unità CSS.

## 7. Risks

- **Breaking default:** tabelle senza input passano dal vecchio limite basato sulle righe a `"parent"`. Mitigazione: documentazione, Storybook ed esempi espliciti.
- **Consumer basati sulle vecchie CSS variables:** gli override smettono di avere effetto. Mitigazione: migration checklist con sostituzione tramite `tableHeight` o `--ib-table-min-content-height`.
- **Parent senza altezza definita:** `height: 100%` non produce uno spazio utile. Mitigazione: `min-height` del content con default `400px`.
- **Parent più basso del minimo:** il content può superare lo spazio disponibile. Rischio accettato perché il fallback minimo è stato richiesto; deve essere segnalato nella documentazione.
- **Stringa CSS invalida:** il browser può ignorarla e produrre layout inatteso. Rischio accettato per mantenere il contratto stringa non strict; valori vuoti vengono comunque normalizzati a `"parent"`.
- **Doppio scroll introdotto dal consumer:** wrapper con `overflow: auto` possono aggiungere un secondo scroll. Mitigazione: content come unico scroll owner, esempio sticky senza overflow esterno e documentazione.
- **Regressione sticky:** cambiare il contenitore di overflow può alterare il riferimento di sticky header/footer/columns. Mitigazione: mantenere `.ib-table__content` come scroll ancestor e aggiungere test/manual check per scroll verticale e orizzontale.
- **Filtro e toolbar dinamici:** in parent mode riducono naturalmente lo spazio dati; in modalità esplicita aumentano l’altezza totale. Mitigazione: documentare chiaramente che `tableHeight` misura il content.
- **Refactoring DEVK-1066 recente:** modifiche collaterali al componente possono riaprire problemi di stato o data source. Mitigazione: file scope stretto e divieto di toccare facade, store, URL e data source.
- **Consumer esterni non verificati:** il Simple Table adapter non è disponibile nel repository. Mitigazione: checklist esplicita; aggiornamento e build devono essere eseguiti nei repository esterni prima del rilascio.
- **Modelli più leggeri:** Luna potrebbe non risolvere un errore Storybook o demo causato indirettamente dal contratto production. Mitigazione: gli executor devono fermarsi invece di ampliare lo scope; l’eventuale retry può essere assegnato a `deepseek-v4-pro` o `gpt-5.6-terra` senza richiedere `gpt-5.6-sol`.

## 8. Validation Checklist

### Automatica

- [ ] `npm run packagr`
- [ ] `npx ng test --include='src/app/inobeta-ui/ui/kai-table/table.component.spec.ts' --watch=false`
- [ ] `npm run test-ci`
- [ ] `npm run build`
- [ ] `npm run build-storybook`
- [ ] `npm run lint`; se il repository continua a non avere un target lint, registrare il limite infrastrutturale senza sostituirlo con una falsa validazione.
- [ ] Nessuna nuova occorrenza production di `--ib-table-minimum-rows` o `--ib-table-content-max-height`.
- [ ] Nessun nuovo `fdescribe`, `fit`, `xdescribe` o `xit`.
- [ ] Nessun file sotto `src/app/inobeta-ui/ui/kai-table-mobile/` modificato.

### Manuale — modalità parent

- [ ] Con parent desktop di altezza definita, il componente occupa esattamente tale altezza.
- [ ] Toolbar, filtro e paginator restano visibili fuori dall’area dati.
- [ ] Solo `.ib-table__content` scorre.
- [ ] Header e footer restano sticky durante lo scroll verticale.
- [ ] Colonne sticky start/end restano ferme durante lo scroll orizzontale.
- [ ] Con parent senza altezza definita, il content misura almeno 400px.
- [ ] Impostando `--ib-table-min-content-height: 420px`, il fallback diventa 420px.

### Manuale — altezza CSS esplicita

- [ ] Con `tableHeight="500px"`, `.ib-table__content` misura esattamente 500px.
- [ ] Con poche righe rimane spazio vuoto fino ai 500px.
- [ ] Con molte righe compare un solo scroll nell’area content.
- [ ] Toolbar, filtro e paginator si sommano ai 500px e non entrano nello scroll.
- [ ] Un valore CSS non-pixel valido, ad esempio `50vh`, viene applicato senza parser custom.

### Manuale — regressioni e migrazione

- [ ] `tableDef.paginator.hide` continua a mostrare/nascondere il paginator come prima.
- [ ] Vista mobile invariata alle larghezze previste.
- [ ] Storybook permette di cambiare `tableHeight` tramite control.
- [ ] La documentazione distingue altezza content e altezza totale.
- [ ] Seed project compila dopo l’aggiornamento dei template o adapter.
- [ ] Kaiboard compila dopo l’aggiornamento dei template o adapter.
- [ ] Simple Table adapter propaga `tableHeight` oppure dichiara esplicitamente il proprio valore/default.
- [ ] Nessun consumer esterno continua a dipendere dalle vecchie variabili CSS senza una migrazione dichiarata.
