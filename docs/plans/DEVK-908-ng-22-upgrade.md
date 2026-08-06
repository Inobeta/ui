# DEVK-908 — Aggiornare ad Angular 22, Node 26 e Vitest

- Approved at: 2026-08-06T15:05:57.211Z

> Ripristinare applicazione e test dopo le migrazioni automatiche Angular 22, senza modificare la logica funzionale dei componenti.

## Plan lineage

- Ancestors:
  - `devk-908-supportare-angular-21`

### Requirement changes from ancestors

- `devk-908-supportare-angular-21`
  - Previous requirement: mantenere la baseline Angular 21, Node 24 e la suite Karma/Jasmine.
  - New requirement: adottare Angular 22 e Node 26, sostituire Karma con il runner Vitest di Angular e mantenere temporaneamente lo stile Jasmine delle spec esistenti.
  - User confirmation: confirmed during planning interview.
  - Previous requirement: mantenere verdi build e test correggendo incompatibilità Angular 21 senza ampliare la strictness TypeScript.
  - New requirement: preservare esplicitamente la permissività della configurazione TypeScript precedente, rimandando a un ticket separato la correzione sistematica dei tipi emersi con Angular 22 e TypeScript 6.
  - User confirmation: confirmed during planning interview.

## 1. Goal

Rendere nuovamente operativo il repository con Angular 22 e Node 26.

A lavoro concluso:

- `npm start` compila e avvia l'applicazione esempi;
- `npm run build` e `npm run packagr` completano senza errori;
- `npm run test-ci` usa Vitest, esegue le spec esistenti e termina con zero failure;
- le soglie globali di coverage restano almeno all'80% per statements, branches, functions e lines;
- la CI usa Node 26 e raccoglie gli artefatti coverage prodotti da Vitest;
- non vengono introdotte modifiche alla logica funzionale o alle API pubbliche dei componenti, salvo adattamenti indispensabili ad Angular 22;
- la conversione completa delle spec Jasmine verso API Vitest native resta fuori scope.

## 2. Current State

- `package.json` e `package-lock.json` dichiarano già:
  - libreria `22.0.0`;
  - Angular `22.1.x`;
  - Angular Material/CDK `22.1.x`;
  - Angular CLI/build `22.1.x`;
  - ng-packagr `22.1.x`;
  - TypeScript `6.0.3`;
  - Zone.js `0.16.x`;
  - Vitest `4.x`;
  - NgRx `22.0.0-rc.0`.
- `package.json` mantiene ancora:
  - `@types/node` 24;
  - Karma, Jasmine core e relativi reporter/launcher;
  - gli script `test` e `test-ci` con il flag Karma `--code-coverage`, non riconosciuto dal nuovo builder.
- `angular.json` usa già `@angular/build:unit-test` con runner `vitest`, reporter coverage e soglie globali all'80%.
- Non esiste una configurazione Vitest esterna. Il nuovo builder può quindi usare la configurazione Angular supportata direttamente.
- `tsconfig.app.json` e `tsconfig.spec.json` contengono già `strictTemplates: false` e la soppressione dei diagnostici estesi aggiunta dalla migrazione.
- `tsconfig.spec.json` include `vitest/globals`, mentre numerose spec usano ancora API del namespace Jasmine come `jasmine.createSpyObj`, `jasmine.objectContaining`, `jasmine.Spy` e `jasmine.SpyObj`.
- `src/test.ts` inizializza ancora manualmente `TestBed` tramite `initTestEnvironment()`. La migrazione Angular 22 indica che questa inizializzazione deve essere rimossa perché ora è responsabilità del builder.
- `src/karma.conf.js` conserva configurazione, browser custom e soglie coverage del runner precedente, ma non è più collegato al target test corrente.
- L'output fornito dall'utente mostra che `npm start` fallisce con molti diagnostici TypeScript:
  - null e `undefined` non ammessi;
  - membri o parametri implicitamente `any`;
  - proprietà non inizializzate;
  - accessor signal potenzialmente assenti;
  - incompatibilità di firma Angular Material;
  - errori analoghi in template e form.
- Gli errori segnalati coinvolgono soprattutto:
  - `src/app/inobeta-ui/ui/kai-filter/`;
  - `src/app/inobeta-ui/ui/kai-table/`;
  - `src/app/inobeta-ui/ui/kai-table-mobile/`;
  - `src/app/inobeta-ui/ui/material-forms/`;
  - `src/app/inobeta-ui/ui/views/`;
  - alcune feature condivise.
- L'elenco fornito è troncato. La lista completa dei diagnostici dovrà quindi essere rilevata dopo la normalizzazione della configurazione TypeScript.
- Durante `ng update` si è verificato `exports is not defined in ES module scope` durante il caricamento di `@ngrx/effects` 22 RC. L'errore non sembra ripresentarsi in `npm start`, ma non è ancora stato verificato sulla baseline finale.
- `.gitlab-ci.yml` usa ancora:
  - `node:24.8` come immagine predefinita;
  - `inobeta/node-chrome:24.8` per i test;
  - `./src/coverage` come artefatto dei test.
- Il runner Vitest predefinito di Angular usa jsdom quando non vengono configurati browser, quindi non richiede l'immagine CI con Chrome.
- La directory coverage predefinita del builder è `coverage/ui`.
- I Dockerfile applicativi usano Nginx e non contengono una runtime Node: non devono essere modificati per il bump a Node 26.
- Le decisioni funzionali del precedente piano Angular 21 — inclusi side menu, uploader ufficiale, rimozione delle API legacy e separazione Kai Table/Views — restano valide e non sono riaperte da questo aggiornamento.

## 3. Assumptions / Open Questions

### Decisioni confermate

- Angular deve essere aggiornato alla major 22 e Node alla major 26.
- La CI deve essere aggiornata a Node 26 nello stesso ticket.
- NgRx `22.0.0-rc.0` deve essere mantenuto; non è previsto un downgrade.
- Karma deve essere sostituito da Vitest.
- Le spec devono mantenere per ora lo stile Jasmine esistente; una conversione completa alle API Vitest native sarà affrontata in un ticket futuro.
- `src/test.ts` non deve più chiamare `TestBed.initTestEnvironment()`.
- `strictTemplates: false` deve essere mantenuto.
- Non si deve correggere sistematicamente ogni problema di tipo se una configurazione compatibile può preservare il comportamento precedente.
- La logica dei componenti non deve cambiare, salvo quando una modifica è indispensabile per compilare o funzionare con Angular 22.
- La coverage deve continuare a imporre almeno l'80% per statements, branches, functions e lines.
- L'errore ESM di NgRx deve essere verificato, senza sostituire la versione RC scelta.

### Decisioni prese da me, con motivazione

- Rendere esplicita la baseline TypeScript permissiva nel `tsconfig` comune. Questo evita che nuovi default o impostazioni effettive del builder trasformino l'upgrade in un refactoring generale dei tipi.
- Non usare `skipLibCheck` come soluzione generale. Gli errori osservati riguardano il codice applicativo e nasconderli tramite il controllo delle sole librerie non risolverebbe la causa.
- Applicare modifiche al codice solo ai diagnostici che restano dopo la correzione della configurazione. Questo limita il rischio di regressioni funzionali.
- Trattare separatamente Kai Table desktop, Kai Table mobile, Kai Filter e Material Forms. Queste aree hanno contratti e executor diversi e non devono essere modificate da un'unica operazione trasversale.
- Conservare temporaneamente la compatibilità di compilazione e runtime per le API Jasmine effettivamente usate, senza eseguire lo schematico globale `refactor-jasmine-vitest`.
- Eliminare le dipendenze Karma soltanto dopo che almeno una suite rappresentativa funziona sotto Vitest. Questo evita di rimuovere il fallback prima di avere una baseline verificabile.
- Usare `node:26` anche per il job test CI. Vitest con jsdom non richiede Chrome, quindi il custom image `inobeta/node-chrome` non è più necessario.
- Aggiungere `.nvmrc` con major 26 per rendere riproducibile la versione Node locale senza imporre un vincolo `engines` ai consumer del package pubblicato.
- Mantenere invariato `allow_failure` del job `test_unit`: la policy CI non fa parte dell'upgrade runtime e non deve essere modificata implicitamente.

### Questioni aperte, non bloccanti

- Non è ancora nota la lista completa dei diagnostici residui dopo aver reso esplicita la configurazione TypeScript. Gli step per area rileveranno e correggeranno solo quelli ancora presenti.
- Non è ancora noto se l'errore ESM NgRx si ripresenterà con `npm ci`, build o test. La verifica è inclusa nella normalizzazione delle dipendenze.
- L'ampiezza delle API `jasmine.*` richieste dalle spec sarà determinata tramite inventario e test. Se non fosse possibile conservarle con un adapter limitato e semanticamente equivalente, l'esecuzione dovrà fermarsi invece di introdurre un framework custom esteso.
- La percentuale esatta di coverage sotto la nuova strumentazione Vitest potrà differire da Karma. Questo non blocca l'avvio perché la soglia richiesta resta esplicita e verificabile.

## 4. Proposed Approach

L'aggiornamento procede in quattro strati:

1. **Baseline toolchain**
   - allineare lockfile, Node 26, Angular 22, TypeScript 6 e NgRx 22 RC;
   - verificare che l'errore ESM non sia riproducibile.

2. **Compatibilità di compilazione**
   - rendere esplicita la permissività TypeScript già richiesta;
   - ricompilare;
   - correggere per area soltanto le incompatibilità Angular 22 residue;
   - non cambiare contratti pubblici, flussi NgRx o comportamento dei componenti.

3. **Migrazione test**
   - completare la configurazione `@angular/build:unit-test`;
   - rimuovere inizializzazione TestBed e configurazione Karma;
   - aggiornare gli script;
   - preservare temporaneamente le API Jasmine richieste dalle spec;
   - eseguire tutta la suite con coverage all'80%.

4. **CI e validazione**
   - portare i job Node a v26;
   - usare il percorso coverage Vitest;
   - eseguire lint, build applicazione, package libreria, test e Storybook;
   - verificare manualmente l'avvio di `npm start`.

Le migrazioni Angular automatiche già applicate, incluso `ChangeDetectionStrategy.Eager`, `withXhr()` e gli adattamenti safe-navigation, non devono essere riscritte senza un errore riproducibile.

## 5. Step-by-Step Plan

### Dependencies between steps

`1 → 2`; `2 → 3`; `2 → 4`; `2 → 5`; `2 → 6`; `3+4+5+6 → 7`; `1+2+7 → 8`; `8 → 9`; `1+8 → 10`; `7+9+10 → 11`

---

### Step 1 — Normalizzare Angular 22 e Node 26 ✅ DONE [2026-08-06T15:12:28.025Z]

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo R
- **File consentiti**: `package.json`, `package-lock.json`, `.nvmrc`
- **Obiettivo**: ottenere un'installazione riproducibile con Node 26 e una matrice coerente di dipendenze Angular 22.
- **Requisiti**:
  1. Aggiungere `.nvmrc` con la major Node 26.
  2. Allineare `@types/node` alla major 26.
  3. Verificare la coerenza delle versioni Angular, Material/CDK, CLI/build, ng-packagr, TypeScript, Zone.js e Vitest già migrate.
  4. Mantenere NgRx `22.0.0-rc.0` senza downgrade o override.
  5. Rigenerare `package-lock.json` esclusivamente tramite npm sotto Node 26.
  6. Verificare se l'errore `exports is not defined in ES module scope` è riproducibile durante installazione o `ng version`.
  7. Non rimuovere ancora le dipendenze Karma/Jasmine: saranno gestite dopo l'avvio verificato di Vitest.
- **Vincoli**: non modificare sorgenti, non patchare `node_modules`, non aggiungere override NgRx e non aggiungere `engines.node` al package pubblicato.
- **Validazione**: `node --version && npm ci --no-audit --no-fund && npx ng version` deve terminare con exit code `0`, mostrare Node 26 e Angular CLI/Core 22.
- **Stop condition**: fermarsi se Node 26 non è disponibile, se npm non risolve i peer richiesti o se l'errore ESM NgRx si ripresenta e richiede una patch di dipendenze.

**Executor Input**:

~~~
## TASK:
Normalize the Angular 22 dependency baseline for Node 26.

## CONTEXT:
The repository already declares Angular 22.1.x, TypeScript 6.0.3, Vitest 4.x, and NgRx 22.0.0-rc.0 in `package.json`. `@types/node` is still on major 24. An NgRx ESM error occurred during `ng update` but has not been reproduced afterward.

## OBJECTIVE:
Produce a clean, reproducible `npm ci` baseline under Node 26 without changing application code.

## REQUIREMENTS:
1. Add `.nvmrc` targeting Node major 26.
2. Update `@types/node` to major 26.
3. Verify and preserve a coherent Angular 22 dependency matrix.
4. Keep all NgRx packages on `22.0.0-rc.0`.
5. Regenerate `package-lock.json` with npm under Node 26.
6. Check whether the reported NgRx ESM error recurs.
7. Keep Karma/Jasmine packages until the Vitest infrastructure step.

## CONSTRAINTS:
- Do not patch `node_modules`.
- Do not add dependency overrides for NgRx.
- Do not modify source files.
- Do not add a published-package Node engine restriction.

## OUTPUT:
Report modified dependency files, resolved versions, Node/npm versions, and whether the NgRx ESM error reproduced.

## ACCEPTANCE CRITERIA:
- `node --version` reports major 26.
- `npm ci --no-audit --no-fund` succeeds.
- `npx ng version` reports Angular CLI and Angular Core major 22.
- NgRx remains `22.0.0-rc.0`.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 2 — Preservare la baseline TypeScript permissiva ✅ DONE [2026-08-06T15:14:04.356Z]

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo R
- **File consentiti**: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json`
- **Obiettivo**: impedire che Angular 22 e TypeScript 6 trasformino l'upgrade in un refactoring generale della tipizzazione.
- **Requisiti**:
  1. Ispezionare la configurazione TypeScript effettiva tramite `tsc --showConfig`.
  2. Rendere esplicito `strict: false` nella configurazione comune.
  3. Aggiungere singole opzioni permissive solo se necessarie e non già determinate da `strict: false`.
  4. Conservare `strictTemplates: false` nei target applicazione e test.
  5. Conservare le soppressioni dei diagnostici estesi aggiunte dalla migrazione.
  6. Non disabilitare il controllo TypeScript o Angular nel suo complesso.
  7. Non usare `skipLibCheck` come soluzione ai diagnostici del codice applicativo.
- **Vincoli**: nessuna modifica a file sorgente, nessun aumento della strictness e nessuna soppressione di errori sintattici o incompatibilità API reali.
- **Validazione**: `npx tsc -p tsconfig.app.json --showConfig | rg '"strict": false' && rg '"strictTemplates": false' tsconfig.app.json tsconfig.spec.json` deve terminare con exit code `0`.
- **Stop condition**: fermarsi se gli errori possono essere soppressi soltanto disabilitando interamente il compilatore, usando `skipLibCheck` impropriamente o cambiando codice di produzione.

**Executor Input**:

~~~
## TASK:
Make the pre-upgrade permissive TypeScript policy explicit for Angular 22.

## CONTEXT:
`tsconfig.json` does not explicitly declare strictness. Both application and test configs already contain `strictTemplates: false`. The user explicitly deferred a broad type-safety refactor to another ticket.

## OBJECTIVE:
Ensure Angular 22 and TypeScript 6 compile with the intended non-strict baseline while retaining normal syntax and API checks.

## REQUIREMENTS:
1. Inspect effective application and test compiler configurations.
2. Set `strict: false` in the shared TypeScript configuration.
3. Add individual permissive flags only when the aggregate option does not produce the required effective configuration.
4. Preserve `strictTemplates: false` in both Angular compiler targets.
5. Preserve migrated extended-diagnostic suppressions.
6. Keep ordinary TypeScript and Angular compilation enabled.
7. Do not use `skipLibCheck` to hide application diagnostics.

## CONSTRAINTS:
- Do not edit production or test source.
- Do not increase strictness.
- Do not suppress syntax errors or real Angular 22 API incompatibilities.

## OUTPUT:
Report effective compiler settings before and after the change and list the remaining build diagnostics by feature area.

## ACCEPTANCE CRITERIA:
- Effective TypeScript configuration contains `"strict": false`.
- Both Angular compiler targets contain `"strictTemplates": false`.
- Configuration files remain valid for Angular CLI 22.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 3 — Risolvere le incompatibilità residue di Kai Filter ✅ DONE [2026-08-06T15:17:49.996Z]

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/app/inobeta-ui/ui/kai-filter/`
- **Obiettivo**: eliminare i diagnostici Angular 22 residui di Kai Filter senza modificarne query, operatori o comportamento.
- **Requisiti**:
  1. Correggere soltanto i diagnostici ancora presenti dopo lo Step 2.
  2. Preservare operatori, categorie data, query prodotte e valori speciali come `__empty`.
  3. Preferire tipi espliciti, valori iniziali coerenti e guardie su stati realmente opzionali.
  4. Usare non-null assertion soltanto quando l'invariante è garantita dalla costruzione del form.
  5. Mantenere semplici i template: nessun cast o sintassi TypeScript nei binding.
  6. Non ampliare o restringere le interfacce pubbliche dei filtri.
  7. Se lo Step 2 ha già eliminato tutti i diagnostici dell'area, non apportare modifiche preventive.
- **Vincoli**: nessuna modifica alla semantica dei filtri, nessun `any`, nessun refactoring estraneo e nessuna modifica a Kai Table.
- **Validazione**: `npm run build 2>&1 | tee /tmp/devk-908-kai-filter.log; ! rg 'src/app/inobeta-ui/ui/kai-filter/' /tmp/devk-908-kai-filter.log` deve terminare con exit code `0`.
- **Stop condition**: fermarsi se la compilazione richiede di cambiare il formato delle query, gli operatori pubblici o il comportamento runtime dei filtri.

**Executor Input**:

~~~
## TASK:
Remove remaining Angular 22 compilation errors from Kai Filter.

## CONTEXT:
The reported diagnostics include nullable form values, inferred `never` arrays, query methods returning null or undefined, and template translation inputs. Step 2 establishes a non-strict baseline first.

## OBJECTIVE:
Make `src/app/inobeta-ui/ui/kai-filter/` free of Angular 22 diagnostics without changing filtering behavior.

## REQUIREMENTS:
1. Fix only diagnostics that remain after the compiler configuration change.
2. Preserve every filter operator, date category, query shape, and special value.
3. Prefer explicit types, coherent initial values, and real runtime guards.
4. Use non-null assertions only for construction-time invariants.
5. Keep templates free of casts and TypeScript-only syntax.
6. Preserve all public filter interfaces.
7. Make no preventive edits when the area already compiles.

## CONSTRAINTS:
- Do not introduce `any`.
- Do not alter filter semantics.
- Do not touch Kai Table or unrelated features.
- Do not perform broad refactoring.

## OUTPUT:
Report modified files, each residual diagnostic addressed, and any invariant relied upon.

## ACCEPTANCE CRITERIA:
- Angular build output contains no diagnostic under `ui/kai-filter/`.
- Existing query and operator contracts are unchanged.
- Lint reports no new errors in the modified files.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 4 — Risolvere le incompatibilità residue dei Material Forms ✅ DONE [2026-08-06T15:28:42.453Z]

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo R
- **File consentiti**: `src/app/inobeta-ui/ui/material-forms/`
- **Obiettivo**: rendere Material Forms compatibile con Angular Material 22 mantenendo invariati form dinamici, validatori ed eventi.
- **Requisiti**:
  1. Correggere soltanto i diagnostici ancora presenti dopo lo Step 2.
  2. Adattare le firme Angular Material realmente cambiate, incluso `DateAdapter`, senza reintrodurre API obsolete.
  3. Preservare configurazione dei controlli, callback `change`, validatori, opzioni dropdown e azioni submit.
  4. Inizializzare o dichiarare gli input richiesti senza inventare fallback runtime che nascondano configurazioni mancanti.
  5. Gestire valori nullable solo dove il contratto del controllo li ammette.
  6. Spostare eventuale logica di narrowing complessa dal template alla classe.
  7. Non cambiare i tipi pubblici per rendere opzionali campi che sono obbligatori a runtime.
  8. Se l'area compila già dopo lo Step 2, non apportare modifiche preventive.
- **Vincoli**: nessun redesign dei form, nessun `any`, nessun cambio alle chiavi di traduzione e nessuna modifica alle API pubbliche.
- **Validazione**: `npm run build 2>&1 | tee /tmp/devk-908-material-forms.log; ! rg 'src/app/inobeta-ui/ui/material-forms/' /tmp/devk-908-material-forms.log` deve terminare con exit code `0`.
- **Stop condition**: fermarsi se una firma Angular Material 22 richiede una modifica del contratto pubblico o del comportamento dei controlli.

**Executor Input**:

~~~
## TASK:
Resolve remaining Angular 22 and Angular Material 22 compilation errors in Material Forms.

## CONTEXT:
Reported errors include optional form/control values, required inputs, callback invocation, validator return types, template nullability, and a changed `DateAdapter` constructor signature. The feature is dynamic and regressions can affect many consumers.

## OBJECTIVE:
Compile Material Forms on Angular 22 without changing form behavior or public contracts.

## REQUIREMENTS:
1. Fix only diagnostics remaining after Step 2.
2. Adapt real Angular Material 22 signatures, including `DateAdapter`.
3. Preserve control configuration, callbacks, validators, dropdown options, and submit actions.
4. Express required Angular inputs safely without adding fake runtime defaults.
5. Preserve nullable values only where allowed by the control contract.
6. Move complex template narrowing into typed component helpers.
7. Do not weaken required public fields to optional fields.
8. Avoid edits if the area already compiles.

## CONSTRAINTS:
- Do not introduce `any`.
- Do not redesign dynamic forms.
- Do not change translation keys.
- Do not change public APIs merely to silence TypeScript.

## OUTPUT:
Report modified files, Angular 22 API adaptations, and preserved behavioral invariants.

## ACCEPTANCE CRITERIA:
- Angular build output contains no diagnostic under `ui/material-forms/`.
- Existing control callbacks and validators retain their contracts.
- Modified templates contain no casts or TypeScript-only syntax.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 5 — Risolvere le incompatibilità residue di Kai Table desktop ✅ DONE [2026-08-06T15:40:50.071Z]

- **Executor**: `kai-table-executor`
- **Modelli suggeriti**: gruppo R
- **File consentiti**: `src/app/inobeta-ui/ui/kai-table/`
- **Obiettivo**: eliminare i diagnostici Angular 22 della tabella desktop preservando data source, sorting, filtering, pagination, selection e URL state.
- **Requisiti**:
  1. Correggere soltanto i diagnostici ancora presenti dopo lo Step 2.
  2. Preservare accessor di colonna, sorting e filtering esistenti.
  3. Preservare i default del paginator e la semantica di `tableDef`.
  4. Preservare selection, grouping, export e URL state.
  5. Trattare signal e callback opzionali tramite default o narrowing coerenti con i contratti esistenti.
  6. Non trasformare valori assenti in dati inventati quando l'assenza ha significato funzionale.
  7. Non usare API private o protette Angular Material.
  8. Se l'area compila già dopo lo Step 2, non apportare modifiche preventive.
- **Vincoli**: nessun refactoring architetturale, nessun cambio agli export pubblici, nessuna modifica a Views o Kai Table mobile e nessun `any`.
- **Validazione**: `npm run build 2>&1 | tee /tmp/devk-908-kai-table.log; ! rg 'src/app/inobeta-ui/ui/kai-table/' /tmp/devk-908-kai-table.log` deve terminare con exit code `0`.
- **Stop condition**: fermarsi se la correzione richiede di cambiare contratti pubblici, flussi NgRx, URL persistiti o comportamento della tabella.

**Executor Input**:

~~~
## TASK:
Remove remaining Angular 22 compilation errors from desktop Kai Table.

## CONTEXT:
Reported diagnostics affect cells, column accessors, local and legacy data sources, paginator labels, URL-state selectors, table signals, templates, and subscriptions. Step 2 first restores the intended non-strict compiler baseline.

## OBJECTIVE:
Make desktop Kai Table compile on Angular 22 with no functional or public-contract changes.

## REQUIREMENTS:
1. Fix only diagnostics that remain after Step 2.
2. Preserve column accessors, sorting, and filtering.
3. Preserve paginator defaults and `tableDef` behavior.
4. Preserve selection, grouping, export, and URL-state behavior.
5. Narrow optional signals and callbacks according to existing invariants.
6. Do not invent data for semantically absent values.
7. Avoid all private or protected Angular Material APIs.
8. Make no preventive edits if the area already compiles.

## CONSTRAINTS:
- Do not introduce `any`.
- Do not refactor Kai Table architecture.
- Do not change public exports.
- Do not touch Views or mobile table files.

## OUTPUT:
Report modified files, diagnostics fixed, and the table invariants explicitly preserved.

## ACCEPTANCE CRITERIA:
- Angular build output contains no diagnostic under `ui/kai-table/`.
- Sorting, filtering, pagination, selection, grouping, and URL-state contracts remain unchanged.
- No private or protected Angular Material member is referenced.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 6 — Risolvere le incompatibilità residue di Kai Table mobile ✅ DONE [2026-08-06T15:42:08.193Z]

- **Executor**: `kai-table-mobile-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/app/inobeta-ui/ui/kai-table-mobile/`
- **Obiettivo**: eliminare i diagnostici Angular 22 della tabella mobile senza cambiare rendering, toolbar o infinite scroll.
- **Requisiti**:
  1. Correggere soltanto i diagnostici ancora presenti dopo lo Step 2.
  2. Preservare i default di `headerActions` e `filters`.
  3. Preservare il significato di assenza per `rowGroup`.
  4. Mantenere il rendering card-based e il comportamento infinite scroll.
  5. Evitare chiamate ripetute a signal opzionali nei template quando un valore locale o computed tipizzato è più sicuro.
  6. Non modificare il contratto con Kai Table desktop.
  7. Se l'area compila già dopo lo Step 2, non apportare modifiche preventive.
- **Vincoli**: nessun cambiamento visuale, nessun CSS estraneo, nessuna modifica a store o URL state e nessun `any`.
- **Validazione**: `npm run build 2>&1 | tee /tmp/devk-908-kai-table-mobile.log; ! rg 'src/app/inobeta-ui/ui/kai-table-mobile/' /tmp/devk-908-kai-table-mobile.log` deve terminare con exit code `0`.
- **Stop condition**: fermarsi se la correzione richiede una modifica del rendering mobile o dei contratti condivisi con la tabella desktop.

**Executor Input**:

~~~
## TASK:
Remove remaining Angular 22 compilation errors from mobile Kai Table.

## CONTEXT:
Reported diagnostics involve optional signal values for header actions, filters, and row grouping in the mobile component template.

## OBJECTIVE:
Compile mobile Kai Table on Angular 22 without changing rendering or interaction behavior.

## REQUIREMENTS:
1. Fix only diagnostics remaining after Step 2.
2. Preserve empty defaults for header actions and filters.
3. Preserve the semantic absence of row grouping.
4. Preserve card rendering and infinite-scroll behavior.
5. Use typed local or computed values when repeated optional signal calls make templates unsafe.
6. Preserve the desktop/mobile integration contract.
7. Avoid edits when the area already compiles.

## CONSTRAINTS:
- Do not introduce `any`.
- Do not change visual behavior or CSS.
- Do not modify desktop table, store, or URL-state files.

## OUTPUT:
Report modified files and the input/default invariants retained.

## ACCEPTANCE CRITERIA:
- Angular build output contains no diagnostic under `ui/kai-table-mobile/`.
- Mobile toolbar and row rendering contracts remain unchanged.
- Modified templates contain no casts or TypeScript-only syntax.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 7 — Chiudere le incompatibilità Angular 22 condivise ✅ DONE [2026-08-06T15:43:12.592Z]

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/app/app.component.ts`, `src/app/app.config.ts`, `src/app/inobeta-ui/http/`, `src/app/inobeta-ui/ui/charts/`, `src/app/inobeta-ui/ui/data-export/`, `src/app/inobeta-ui/ui/forms/`, `src/app/inobeta-ui/ui/forms-utilities/`, `src/app/inobeta-ui/ui/modal/`, `src/app/inobeta-ui/ui/toast/`, `src/app/inobeta-ui/ui/uploader/`, `src/app/inobeta-ui/ui/views/`, `src/app/examples/`
- **Obiettivo**: ottenere una build applicativa Angular 22 verde correggendo gli ultimi diagnostici non appartenenti alle aree specializzate.
- **Requisiti**:
  1. Eseguire la build completa dopo gli step per area e catalogare i diagnostici residui.
  2. Correggere soltanto errori Angular 22 riproducibili nei file consentiti.
  3. Preservare le migrazioni automatiche `ChangeDetectionStrategy.Eager`, `withXhr()` e safe-navigation salvo errore dimostrato.
  4. Adattare valori `null`/`undefined` alle nuove firme usando il valore semanticamente equivalente.
  5. Preservare servizi, dialog, views, traduzioni, grafici ed esempi.
  6. Non modificare API pubbliche o logica funzionale.
  7. Non toccare file Kai Filter, Kai Table, Kai Table mobile o Material Forms.
- **Vincoli**: nessun refactoring, nessun `any`, nessuna modifica CSS o di contenuto visibile non richiesta e nessuna nuova dipendenza.
- **Validazione**: `npm run build` deve terminare con exit code `0`.
- **Stop condition**: fermarsi e riportare il percorso esatto se una build verde richiede modifiche fuori dai file consentiti o una variazione funzionale.

**Executor Input**:

~~~
## TASK:
Resolve the final non-specialized Angular 22 application build errors.

## CONTEXT:
Kai Filter, Material Forms, desktop Kai Table, and mobile Kai Table are handled by earlier dedicated steps. The user-provided error list was truncated, so a final full build is required to discover remaining diagnostics.

## OBJECTIVE:
Make the production application build pass on Angular 22 without functional changes.

## REQUIREMENTS:
1. Run a full production build and inventory residual diagnostics.
2. Fix only reproducible Angular 22 errors in the allowed areas.
3. Preserve automatic Eager change-detection, `withXhr()`, and safe-navigation migrations unless a concrete compiler error proves an adjustment necessary.
4. Replace null or undefined arguments only with semantically equivalent values accepted by the new API.
5. Preserve services, dialogs, views, translations, charts, and examples.
6. Keep public APIs and behavior unchanged.
7. Do not edit specialized feature areas owned by prior steps.

## CONSTRAINTS:
- Do not introduce `any`.
- Do not refactor unrelated code.
- Do not change CSS or user-visible content.
- Do not add dependencies.

## OUTPUT:
Report all residual diagnostics found, modified files, and confirmation that no functional contract changed.

## ACCEPTANCE CRITERIA:
- `npm run build` succeeds.
- No new public API is added, removed, or renamed.
- No specialized Kai or Material Forms area is modified by this step.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 8 — Completare il passaggio da Karma a Vitest ✅ DONE [2026-08-06T16:46:44.508Z]

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo R
- **File consentiti**: `package.json`, `package-lock.json`, `angular.json`, `tsconfig.spec.json`, `src/test.ts`, `src/vitest-jasmine-compat.ts`, `src/karma.conf.js`, `eslint.config.js`
- **Obiettivo**: avviare le spec esistenti con il runner Vitest di Angular, senza eseguire il refactoring generale da Jasmine.
- **Requisiti**:
  1. Aggiornare `test` e `test-ci` usando `--coverage` al posto di `--code-coverage`.
  2. Mantenere `--watch=false` per `test-ci`.
  3. Rimuovere da `src/test.ts` `TestBed.initTestEnvironment()` e la relativa inizializzazione browser-dynamic.
  4. Usare `src/test.ts` solo come setup file, se serve per la compatibilità controllata delle API Jasmine.
  5. Inventariare le API `jasmine.*` realmente usate e fornire una compatibilità minima basata su Vitest, preservando semantica di spy, matcher e reset.
  6. Non eseguire `refactor-jasmine-vitest` e non riscrivere in massa le spec.
  7. Conservare `@types/jasmine` solo se necessario alla compilazione temporanea; rimuovere dipendenze Karma, Jasmine runtime, Jasmine WD e reporter non più usati.
  8. Eliminare `src/karma.conf.js` dopo il successo della suite rappresentativa.
  9. Mantenere il builder `@angular/build:unit-test`, runner `vitest`, jsdom predefinito e soglie coverage all'80%.
  10. Mantenere i reporter `html`, `lcovonly` e `text-summary`.
  11. Aggiornare l'ignore ESLint da `src/coverage/**` a `coverage/**`.
  12. Non aggiungere una configurazione Vitest esterna salvo necessità dimostrata.
- **Vincoli**: nessuna modifica alle spec in questo step, nessun ritorno a Karma, nessuna inizializzazione manuale TestBed e nessun adapter generico che reimplementi Jasmine oltre le API effettivamente usate.
- **Validazione**: `npx ng test --include='src/app/inobeta-ui/http/http/error.interceptor.spec.ts' --watch=false --coverage=false` deve terminare con exit code `0` sotto Vitest.
- **Stop condition**: fermarsi se preservare le spec richiede un adapter Jasmine esteso, semanticamente incerto o una modifica del runner Angular.

**Executor Input**:

~~~
## TASK:
Complete the Angular unit-test builder migration from Karma to Vitest while preserving existing Jasmine-style specs.

## CONTEXT:
`angular.json` already selects `@angular/build:unit-test` and Vitest. Package scripts still use Karma flags, `src/test.ts` manually initializes TestBed, and `src/karma.conf.js` remains. Existing specs use the Jasmine namespace in addition to shared `describe`, `it`, and `expect` syntax.

## OBJECTIVE:
Run a representative existing spec under Vitest without a broad Jasmine-to-Vitest source refactor.

## REQUIREMENTS:
1. Replace `--code-coverage` with `--coverage` in test scripts.
2. Keep non-watch CI execution.
3. Remove manual TestBed environment initialization from `src/test.ts`.
4. Keep `src/test.ts` only as a supported setup file when needed.
5. Inventory and support only the Jasmine namespace APIs actually used by the repository.
6. Do not run the global Jasmine-to-Vitest refactor schematic.
7. Remove obsolete Karma/Jasmine runtime packages while retaining temporary type support only if required.
8. Delete `src/karma.conf.js` after representative Vitest execution succeeds.
9. Preserve the Angular unit-test builder, Vitest runner, jsdom environment, and 80% thresholds.
10. Preserve HTML, LCOV-only, and text-summary coverage reporters.
11. Update ESLint coverage ignores to the Vitest output root.
12. Avoid an external Vitest configuration unless the Angular builder cannot express a required option.

## CONSTRAINTS:
- Do not modify spec files in this step.
- Do not restore Karma.
- Do not manually initialize Angular TestBed.
- Do not build a broad custom Jasmine runtime.

## OUTPUT:
Report removed packages/configuration, the exact compatibility surface retained, and the representative test result.

## ACCEPTANCE CRITERIA:
- The representative interceptor spec passes using the Vitest runner.
- `src/test.ts` contains no `initTestEnvironment()` call.
- `package.json` contains no `--code-coverage`.
- `angular.json` retains all four 80% coverage thresholds.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 9 — Stabilizzare l'intera suite sotto Vitest ✅ DONE [2026-08-06T18:43:59.788Z]

- **Executor**: `unit-jasmine-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/**/*.spec.ts`, `src/**/*.stub.spec.ts`, `src/vitest-jasmine-compat.ts`
- **Obiettivo**: portare a verde l'intera suite esistente sotto Vitest, mantenendo la coverage globale almeno all'80%.
- **Requisiti**:
  1. Eseguire `npm run test-ci` dopo la migrazione del runner.
  2. Correggere soltanto incompatibilità di setup, timer, spy, matcher o isolamento introdotte dal cambio runner.
  3. Preferire l'estensione limitata dell'adapter condiviso quando più suite richiedono la stessa semantica Jasmine.
  4. Consentire modifiche puntuali alle spec solo quando dipendono da comportamento specifico di Karma non riproducibile in Vitest.
  5. Non convertire sistematicamente `jasmine.*` in `vi.*`.
  6. Non cambiare aspettative funzionali valide per far passare i test.
  7. Non modificare sorgenti di produzione.
  8. Mantenere almeno l'80% per statements, branches, functions e lines.
  9. Verificare che non restino `fdescribe` o `fit`.
- **Vincoli**: nessun refactoring globale dei test, nessuna riduzione delle soglie, nessun test rimosso o disabilitato e nessun cambio al codice di produzione.
- **Validazione**: `npm run test-ci` deve terminare con exit code `0`, zero test failing e tutte le soglie coverage rispettate.
- **Stop condition**: fermarsi se un failure richiede una modifica funzionale di produzione, la rimozione di un test o una compatibilità Jasmine troppo estesa per essere affidabile.

**Executor Input**:

~~~
## TASK:
Stabilize the full existing test suite under Angular's Vitest runner.

## CONTEXT:
The infrastructure step preserves Jasmine-style tests through a narrow compatibility setup. A future ticket will perform the full source refactor to native Vitest APIs. Production source is out of scope here.

## OBJECTIVE:
Make `npm run test-ci` pass with zero failures and at least 80% global coverage in all configured categories.

## REQUIREMENTS:
1. Run the complete CI test command.
2. Fix only runner-related setup, timer, spy, matcher, or isolation incompatibilities.
3. Extend the shared compatibility adapter when several suites need identical Jasmine semantics.
4. Modify individual specs only for Karma-specific assumptions that cannot be represented centrally.
5. Do not perform a broad `jasmine.*` to `vi.*` conversion.
6. Preserve valid functional expectations.
7. Do not edit production files.
8. Maintain all four 80% coverage thresholds.
9. Remove any accidental focused suites.

## CONSTRAINTS:
- Do not delete or disable tests.
- Do not lower coverage thresholds.
- Do not modify production behavior.
- Do not perform the future Jasmine-to-Vitest refactor in this ticket.

## OUTPUT:
Report failing suites found, compatibility changes made, spec files adjusted, final test count, and final coverage percentages.

## ACCEPTANCE CRITERIA:
- `npm run test-ci` exits with code 0.
- No tests fail or remain focused.
- Statements, branches, functions, and lines are each at least 80%.
- No production source file is modified.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 10 — Portare la CI a Node 26 e coverage Vitest ✅ DONE [2026-08-06T18:45:33.593Z]

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo F
- **File consentiti**: `.gitlab-ci.yml`
- **Obiettivo**: eseguire installazione, build, package, documentazione e test CI con Node 26, raccogliendo la coverage dal nuovo percorso.
- **Requisiti**:
  1. Sostituire l'immagine Node predefinita 24.8 con `node:26`.
  2. Sostituire `inobeta/node-chrome:24.8` nel job test con `node:26`.
  3. Mantenere il runner Vitest senza configurare Chrome.
  4. Aggiornare l'artefatto test da `./src/coverage` a `./coverage/ui`.
  5. Conservare stage, regole, cache, tag, script e policy `allow_failure` esistenti.
  6. Non modificare i job Docker DinD o le immagini Nginx applicative.
- **Vincoli**: nessuna modifica alla policy di deploy, nessun cambio di branch rules e nessuna aggiunta di browser al job test.
- **Validazione**: `! rg 'node:24\.8|inobeta/node-chrome:24\.8|src/coverage' .gitlab-ci.yml && rg 'node:26|coverage/ui' .gitlab-ci.yml` deve terminare con exit code `0`.
- **Stop condition**: fermarsi se `node:26` non è risolvibile nel registry CI o se Vitest risulta configurato per richiedere un browser reale.

**Executor Input**:

~~~
## TASK:
Update GitLab CI to Node 26 and the Vitest coverage artifact path.

## CONTEXT:
The pipeline currently uses `node:24.8`, a custom Node/Chrome 24.8 test image, and `src/coverage`. Angular's Vitest runner uses jsdom by default and writes coverage under `coverage/ui`.

## OBJECTIVE:
Run all Node-based CI jobs on Node 26 and retain the generated Vitest coverage artifact.

## REQUIREMENTS:
1. Change the default Node image to `node:26`.
2. Change the unit-test job image to `node:26`.
3. Do not configure Chrome for Vitest.
4. Change the unit-test artifact path to `coverage/ui`.
5. Preserve stages, rules, cache, tags, scripts, and `allow_failure`.
6. Leave Docker DinD and Nginx image jobs unchanged.

## CONSTRAINTS:
- Do not alter deployment policy.
- Do not alter branch rules.
- Do not add browser dependencies.
- Do not edit Dockerfiles.

## OUTPUT:
Report the changed image references and coverage artifact path.

## ACCEPTANCE CRITERIA:
- No Node 24.8 image remains in `.gitlab-ci.yml`.
- Node-based jobs inherit or declare Node 26.
- The test artifact path is `coverage/ui`.
- Existing CI policy remains otherwise unchanged.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 11 — Verificare l'upgrade Angular 22 integrato ✅ DONE [2026-08-06T18:57:21.370Z]

- **Executor**: `code-reviewer`
- **Modelli suggeriti**: gruppo R
- **File consentiti**: `package.json`, `package-lock.json`, `.nvmrc`, `angular.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json`, `eslint.config.js`, `.gitlab-ci.yml`, `src/`
- **Obiettivo**: verificare che l'upgrade completo soddisfi DEVK-908 senza regressioni funzionali o modifiche fuori scope.
- **Requisiti**:
  1. Verificare Node 26, Angular 22, TypeScript 6, Vitest e NgRx 22 RC installati.
  2. Eseguire lint, package libreria, build applicazione, test CI e build Storybook.
  3. Verificare assenza dell'errore ESM NgRx.
  4. Verificare che `npm start` completi la compilazione iniziale e serva l'applicazione.
  5. Verificare che Karma non sia più configurato o richiesto a runtime.
  6. Verificare che `src/test.ts` non inizializzi manualmente TestBed.
  7. Verificare le quattro soglie coverage all'80%.
  8. Controllare che non siano cambiate API pubbliche o logiche funzionali.
  9. Controllare che non siano stati introdotti `any`, test disabilitati o accessi ad API private Angular/Material.
  10. Produrre un report PASS/FAIL senza modificare file.
- **Vincoli**: revisione read-only; nessuna correzione, nessun aggiornamento dipendenze e nessuna modifica ai file.
- **Validazione**: `npm run lint && npm run packagr && npm run build && npm run test-ci && npm run build-storybook` deve terminare con exit code `0`.
- **Stop condition**: nessuna; ogni problema deve essere registrato nel report finale con severità e percorso.

**Executor Input**:

~~~
## TASK:
Review and validate the complete Angular 22, Node 26, and Vitest upgrade.

## CONTEXT:
The implementation must restore application startup and unit tests without changing component behavior. Type strictness cleanup and native Vitest test refactoring are explicitly deferred.

## OBJECTIVE:
Produce a read-only PASS/FAIL assessment of the integrated DEVK-908 result.

## REQUIREMENTS:
1. Verify installed Node, Angular, TypeScript, Vitest, and NgRx versions.
2. Run lint, library packaging, production build, CI tests, and Storybook build.
3. Confirm the NgRx ESM error does not recur.
4. Start the development server and verify successful initial compilation and HTTP availability.
5. Confirm Karma is no longer configured or required at runtime.
6. Confirm `src/test.ts` does not initialize TestBed manually.
7. Confirm all four coverage thresholds remain at 80% and pass.
8. Review the diff for public API or functional behavior changes.
9. Check for new `any`, disabled/focused tests, and private Angular or Material API access.
10. Return a PASS/FAIL report without modifying files.

## CONSTRAINTS:
- Perform a read-only review.
- Do not fix discovered issues.
- Do not update dependencies.
- Treat functional changes outside Angular 22 compatibility as blockers.

## OUTPUT:
Return the commands run, their exit codes, manual startup result, coverage percentages, and findings classified as BLOCKER, WARNING, or NIT.

## ACCEPTANCE CRITERIA:
- All automated validation commands exit with code 0.
- `npm start` completes initial compilation and serves the app.
- No NgRx ESM error occurs.
- No unapproved functional or public API change is present.
- The final verdict is PASS only when every blocker is absent.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

## 6. Impacted Areas

### Toolchain e configurazione

- `package.json`
  - Angular 22 and related packages remain aligned;
  - Node typings move to major 26;
  - test scripts use Vitest-compatible flags;
  - obsolete Karma runtime dependencies are removed.
- `package-lock.json`
  - regenerated under Node 26.
- `.nvmrc`
  - new local runtime marker for Node 26.
- `tsconfig.json`
  - explicitly preserves the non-strict TypeScript baseline.
- `tsconfig.app.json`
  - retains `strictTemplates: false`.
- `tsconfig.spec.json`
  - is aligned to the temporary Jasmine-style compatibility strategy.
- `angular.json`
  - retains `@angular/build:unit-test`, Vitest and 80% coverage thresholds.
- `eslint.config.js`
  - ignores the Vitest coverage output directory.

### Test infrastructure

- `src/test.ts`
  - no longer initializes TestBed manually.
- `src/vitest-jasmine-compat.ts`
  - may provide the minimum compatibility surface required by existing specs.
- `src/karma.conf.js`
  - removed after Vitest is verified.
- `src/**/*.spec.ts`
  - may receive only narrow runner-compatibility changes, not a complete Vitest refactor.

### Production source

Potential targeted fixes are limited to diagnostics that remain after restoring the compiler baseline in:

- Kai Filter;
- Material Forms;
- Kai Table desktop;
- Kai Table mobile;
- Views, Toast, Forms, Data Export, HTTP, Charts, Modal, Uploader and examples.

### CI

- `.gitlab-ci.yml`
  - Node images move from 24.8 to 26;
  - tests no longer depend on a Chrome image;
  - coverage artifact moves to `coverage/ui`.

### Public API

- Nessun simbolo deve essere aggiunto, rimosso o rinominato.
- `public_api.ts` non deve essere modificato.
- Nessun contratto di tabella, filtro, form, view, servizio o componente deve cambiare.
- I Dockerfile Nginx, le route, le traduzioni e le decisioni del piano Angular 21 restano invariati.

## 7. Risks

- **NgRx 22 è ancora RC.** Potrebbero emergere incompatibilità ESM o peer dependency.
  - Mitigazione: mantenere versioni allineate, verificare `npm ci`, build e test; non patchare `node_modules`.
- **Node 26 potrebbe non essere ancora supportato da una dipendenza transitoria.**
  - Mitigazione: rendere `npm ci` sotto Node 26 il primo gate e fermarsi sui peer incompatibili invece di forzare override.
- **La configurazione TypeScript permissiva può nascondere problemi di tipo reali.**
  - Mitigazione: scelta esplicitamente accettata per mantenere lo scope dell'upgrade; il risanamento della tipizzazione sarà un ticket separato.
- **Correzioni automatiche dei null potrebbero cambiare comportamento runtime.**
  - Mitigazione: usare fallback soltanto quando semanticamente equivalenti e assegnare le aree critiche agli executor specializzati.
- **Le migrazioni `ChangeDetectionStrategy.Eager` possono avere effetti runtime non coperti dalla sola compilazione.**
  - Mitigazione: conservarle come generate, eseguire suite completa e verifica manuale dell'app.
- **Vitest non offre automaticamente l'intero namespace Jasmine.**
  - Mitigazione: inventariare la superficie usata, fornire solo compatibilità equivalente e fermarsi se servirebbe reimplementare Jasmine.
- **La compatibility layer temporanea può diventare debito tecnico.**
  - Mitigazione: limitarla alle API presenti e documentare che il refactoring nativo Vitest appartiene a un ticket successivo.
- **La strumentazione Vitest può produrre percentuali diverse da Karma.**
  - Mitigazione: mantenere le soglie come gate reale e correggere test o configurazione senza abbassarle.
- **Il passaggio da Chrome a jsdom può esporre differenze DOM.**
  - Mitigazione: correggere soltanto assunzioni del runner e fermarsi se una feature richiede realmente un browser.
- **L'elenco iniziale degli errori è incompleto.**
  - Mitigazione: build completa dopo ogni area e stop condition esplicita per file fuori perimetro.
- **La CI mantiene `allow_failure: true` per `test_unit`.**
  - Rischio accettato: cambiarne la governance è fuori scope; la validazione locale obbligatoria resta `npm run test-ci`.

## 8. Validation Checklist

- [ ] `node --version` mostra Node 26.
- [ ] `npm ci --no-audit --no-fund` termina con exit code `0`.
- [ ] `npx ng version` mostra Angular CLI/Core 22 e TypeScript 6.
- [ ] `npm run lint` termina con exit code `0`.
- [ ] `npm run packagr` termina con exit code `0`.
- [ ] `npm run build` termina con exit code `0`.
- [ ] `npm run test-ci` usa Vitest e termina con exit code `0`.
- [ ] Coverage statements ≥80%.
- [ ] Coverage branches ≥80%.
- [ ] Coverage functions ≥80%.
- [ ] Coverage lines ≥80%.
- [ ] `npm run build-storybook` termina con exit code `0`.
- [ ] `npm start` completa la compilazione iniziale senza diagnostici.
- [ ] L'URL servito da `npm start` risponde HTTP 200.
- [ ] La pagina iniziale dell'applicazione esempi viene renderizzata senza errori console bloccanti.
- [ ] Non compare `exports is not defined in ES module scope`.
- [ ] `src/test.ts` non contiene `initTestEnvironment`.
- [ ] `package.json` non contiene `--code-coverage`.
- [ ] Karma non è più il runner o una dipendenza runtime dei test.
- [ ] `.gitlab-ci.yml` usa Node 26 e pubblica `coverage/ui`.
- [ ] Nessun test contiene `fdescribe` o `fit`.
- [ ] Nessuna soglia coverage è stata ridotta.
- [ ] Nessun simbolo pubblico è stato aggiunto, rimosso o rinominato.
- [ ] Nessuna logica di filtering, sorting, pagination, selection, grouping, form, view o navigazione è cambiata.
