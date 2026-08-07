# DEVK-908 — Migrare e rimuovere le API deprecate in v22

- Approved at: 2026-08-07T11:27:15.928Z

> Fase finale dell’aggiornamento Angular 22: rimozione sicura delle API deprecate tramite migrazioni consumer e sostituzioni canoniche già disponibili.

## Plan lineage

- Ancestors:
  - `devk-908-supportare-angular-21`
  - `devk-908-ng-22-upgrade`

### Requirement changes from ancestors

- `devk-908-supportare-angular-21`
  - Previous requirement: mantenere deprecati HTTP, Forms e `IbToolTestModule`, rimandandone la rimozione a dopo v22.
  - New requirement: rimuovere HTTP e Forms dalla libreria v22 dopo aver fornito una migrazione che li copia nel progetto consumer; mantenere `IbToolTestModule`, rimuovendone la deprecazione e gli elementi interni non più usati.
  - User confirmation: confirmed during planning interview.
- `devk-908-ng-22-upgrade`
  - Previous requirement: non aggiungere, rimuovere o rinominare simboli pubblici durante l’aggiornamento Angular 22.
  - New requirement: completare la major v22 rimuovendo tutte le API deprecate; HTTP e Forms ricevono una migrazione automatizzata, mentre le API legacy di Kai Table vengono eliminate in favore delle alternative canoniche già presenti.
  - User confirmation: confirmed during planning interview.

## 1. Goal

Rimuovere dalla libreria v22 tutte le API ancora marcate `@deprecated` senza perdere il comportamento disponibile ai consumer.

A lavoro concluso:

- `ng update @inobeta/ui@22` esegue una migrazione interattiva;
- i consumer che usano il modulo HTTP possono copiarne l’implementazione in `src/app/core/http/`;
- i consumer che usano Forms o Material Forms possono copiarli rispettivamente in `src/app/core/forms/` e `src/app/core/material-forms/`;
- gli import nominati da `@inobeta/ui` vengono sostituiti in sicurezza con import locali, inclusi import misti e alias;
- nessuna dipendenza Formly viene introdotta;
- HTTP, Forms e Material Forms non sono più sorgenti o API pubbliche della libreria;
- tutte le API legacy di Kai Table vengono eliminate e la libreria usa esclusivamente data source, store, selector e codec canonici;
- `IbToolTestModule` resta disponibile per i test interni, non è più deprecato e contiene soltanto infrastruttura ancora usata;
- libreria, demo, Storybook, migrazioni e test continuano a compilare e passare.

## 2. Current State

- `package.json` dichiara già `@inobeta/ui` versione `22.0.0`, Angular 22, Node 26, TypeScript 6 e Vitest.
- Non esistono attualmente:
  - una cartella `migrations/`;
  - una collection Angular per `ng update`;
  - metadati `ng-update` nel package;
  - un executor OpenCode specializzato nelle migrazioni.
- L’inventario letto dal codice contiene 90 occorrenze di `@deprecated` sotto `src/app/inobeta-ui/`.
- `public_api.ts` esporta ancora integralmente:
  - `src/app/inobeta-ui/http/index.ts`;
  - `src/app/inobeta-ui/ui/forms/index.ts`;
  - `src/app/inobeta-ui/ui/material-forms/index.ts`.
- Il modulo HTTP contiene auth, guard, interceptor, loader, skeleton, session model, store NgRx e test utility. Alcuni file pubblici hanno nomi `*.stub.spec.ts` ma sono esportati dal barrel corrente.
- `src/app/app.config.ts` importa direttamente `IbHttpModule` dal sorgente della libreria. Il demo deve quindi ricevere una copia locale prima che `src/app/inobeta-ui/http/` venga eliminato.
- Material Forms dipende strutturalmente da `ui/forms/`:
  - classi base dei controlli;
  - dynamic form, dynamic form control e dynamic form array;
  - form service, pipe, tipi e array.
  Non è quindi possibile copiare soltanto `ui/material-forms/`.
- L’analisi statica del mapping Formly ha verificato che textbox, textarea, checkbox, radio, toggle e array sono mappabili, ma:
  - dropdown richiede supporto custom per select-all, empty row e hint;
  - autocomplete richiede filtro, clear e gestione focus custom;
  - label non corrisponde a un campo Formly standard;
  - padding è puro layout;
  - button è un’azione con handler e conferma dirty, non un form field.
  Una migrazione Formly automatica richiederebbe un redesign e più componenti custom.
- Kai Table dispone già delle alternative canoniche:
  - `IbTableLocalDataSource` al posto di `IbTableDataSource`;
  - `tableStateActions` al posto di `urlStateActions`;
  - selector basati su `IbKaiTableRecord` e `IbKaiTableSnapshot`;
  - `IbTableUrlService.decodeUrlParams()` e `writeState()`.
- `IbTableDataSource` è ancora referenziato da `table.component.ts` e da diverse spec.
- `urlStateActions` non risulta più dispatchato dal codice di produzione mantenuto, ma è ancora gestito da reducer ed effects per compatibilità.
- Selector, tipi, metodi URL e composite store legacy sono ancora esportati dai barrel Kai Table.
- Dopo la rimozione delle spec HTTP e Material Forms, `IbToolTestModule` resta usato da:
  - `ui/modal/modal-message.component.spec.ts`;
  - `ui/modal/modal-message.service.spec.ts`;
  - `ui/toast/toast.service.spec.ts`.
- `IbToolTestModule` fornisce mock translate, `TranslateService`, `MatDialogRef` e provider HTTP testing. I provider HTTP dovranno essere rivalutati dopo la rimozione delle suite HTTP.
- I fatti sopra sono stati verificati leggendo sorgenti, barrel e riferimenti. Durante l’intervista non sono stati eseguiti build o test aggiuntivi.

## 3. Assumptions / Open Questions

### Decisioni confermate

- La migrazione deve partire con `ng update @inobeta/ui@22`.
- L’implementazione principale deve essere uno script Node semplice, agganciato tramite uno schematic Angular minimale.
- La migrazione deve essere interattiva e chiedere separatamente conferma per HTTP e Forms.
- Le destinazioni sono fisse:
  - `src/app/core/http/`;
  - `src/app/core/forms/`;
  - `src/app/core/material-forms/`.
- HTTP viene copiato localmente invece di essere ridisegnato con interceptor o provider Angular moderni.
- Forms e Material Forms vengono copiati localmente; la migrazione verso Formly è scartata.
- Non deve essere installato `@ngx-formly/core`.
- Le API deprecate Kai Table vengono eliminate senza migrazione consumer.
- I riferimenti interni Kai Table devono essere prima spostati sulle alternative canoniche.
- `IbToolTestModule` deve restare finché è usato dai test interni; la sua deprecazione deve essere rimossa.
- Deve essere introdotto un executor OpenCode dedicato alle migrazioni.
- Il comportamento dei sorgenti vendorizzati e delle feature Kai Table mantenute deve restare invariato.

### Decisioni prese da me, con motivazione

- La collection `ng-update` conterrà un Rule minimale che delega a moduli Node testabili. Angular CLI richiede comunque una migration collection per eseguire codice durante `ng update`.
- Le trasformazioni degli import useranno AST TypeScript, non regex. Gli import misti devono essere separati senza danneggiare alias, import type o simboli mantenuti.
- La migrazione opererà sul `Tree` dello schematic e applicherà ogni famiglia in modo transazionale: preflight completo prima di scrivere file.
- Namespace import, default import, dynamic import o percorsi deep non trasformabili con certezza causeranno uno stop con elenco preciso dei file, invece di una riscrittura euristica.
- In ambiente non interattivo, se sono presenti utilizzi da migrare, lo script terminerà con un errore esplicito prima di modificare il `Tree`. Se non esistono utilizzi, la migrazione potrà terminare senza prompt.
- Se l’utente risponde “no”, quella famiglia non verrà modificata e verranno elencati gli utilizzi che richiedono intervento manuale.
- Le directory di destinazione non verranno sovrascritte. File già presenti e byte-identici saranno accettati; differenze produrranno uno stop.
- I payload copieranno sorgenti runtime e utility di test attualmente pubbliche, ma escluderanno MDX, stories e spec private. Questo evita di imporre Storybook e suite interne ai consumer.
- I tag `@deprecated` verranno rimossi dai payload vendorizzati: il codice diventa proprietà del consumer e non appartiene più al lifecycle della libreria.
- Gli import interni fra `forms/` e `material-forms/` resteranno relativi; quelli verso feature mantenute, come Modal, Storage e Toast, saranno riallineati a `@inobeta/ui`.
- La migrazione HTTP aggiungerà al `package.json` consumer le dipendenze runtime non più garantite dalla libreria, in particolare `jwt-decode`, solo quando mancanti.
- Il demo repository riceverà una copia locale HTTP prima della cancellazione della feature di libreria, fungendo anche da verifica reale della strategia fallback.
- La creazione del nuovo executor richiederà il riavvio di OpenCode prima di eseguire gli step assegnati a `migration-executor`.

### Questioni aperte, non bloccanti

- Non sono noti tutti gli stili di import adottati dai consumer esterni. I pattern supportati saranno coperti da fixture; quelli non supportati produrranno un errore non distruttivo.
- Workspace multi-project con consumer fuori da `src/app/` non sono compatibili con la destinazione fissa scelta. La migrazione li rileverà e richiederà intervento manuale.
- Potrebbero esistere directory `src/app/core/http`, `forms` o `material-forms` già personalizzate. Il controllo collisioni impedisce sovrascritture.
- Il comportamento del prompt sotto Angular CLI sarà verificato sia tramite adapter testabile sia tramite smoke test del package generato.
- La rimozione di molte spec e sorgenti può cambiare le percentuali di coverage, ma non è consentito ridurre le soglie globali dell’80%.

## 4. Proposed Approach

La soluzione è divisa in quattro aree indipendenti.

```text
ng update @inobeta/ui@22
└── migrations/migrations.json
    └── update-22 schematic bridge
        ├── preflight AST degli import @inobeta/ui
        ├── prompt HTTP
        │   ├── copia → src/app/core/http/
        │   └── import package → import locali
        ├── prompt Forms
        │   ├── copia → src/app/core/forms/
        │   ├── copia → src/app/core/material-forms/
        │   └── import package → import locali
        └── aggiornamento dipendenze consumer necessarie
```

La trasformazione consumer seguirà queste regole:

1. inventariare tutti gli import prima di scrivere;
2. classificare ogni specifier tramite manifest HTTP, Forms o API mantenuta;
3. dividere gli import misti;
4. calcolare path relativi POSIX verso i barrel locali;
5. copiare i payload soltanto dopo preflight e conferma;
6. applicare tutte le modifiche della famiglia oppure nessuna;
7. risultare idempotente alla seconda esecuzione.

La pulizia libreria seguirà invece questo ordine:

```text
payload migrazione verificati
        ↓
demo HTTP spostato localmente
        ↓
docs e spec legacy rimosse
        ↓
HTTP / Forms / Material Forms eliminati dalla public API
        ↓
Kai Table spostata sulle API canoniche
        ↓
tutti i marker @deprecated eliminati
```

La migrazione Formly non viene perseguita: la presenza di action button e componenti di layout non mappabili 1:1 rende la trasformazione automatica più rischiosa della copia locale.

## 5. Step-by-Step Plan

### Dependencies between steps

Dopo lo Step 1 OpenCode deve essere riavviato prima di proseguire. Sequenza: `1 → 2 → 3`; `3 → 4`; `3 → 5`; `4+5 → 6`; `4 → 7`; `4+5 → 8`; `4+5 → 9`; `6+7+8+9 → 10`; `1 → 11 → 12 → 13 → 14`; `9 → 15`; `10+14+15 → 16`; `6+8+10+13+16 → 17`.

---

### Step 1 — Creare il migration executor ✅ DONE [2026-08-07T11:28:20.847Z]

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo F
- **File consentiti**: `.opencode/agents/migration-executor.md`, `.opencode/agents/architecture-planner.md`, `.opencode/agents/task-executor.md`
- **Obiettivo**: rendere disponibile un executor OpenCode specializzato nella scrittura e verifica delle migrazioni `ng update`.
- **Requisiti**:
  1. Creare `migration-executor.md` con frontmatter valido e `mode: all`.
  2. Limitare il dominio dell’executor a migration collection, script Node, payload, fixture e configurazione package strettamente necessaria alle migrazioni.
  3. Imporre `focused-execution` e `inobeta-ui-conventions`, insieme a test transazionali, AST sicuro e stop condition.
  4. Vietare modifiche a sorgenti Angular di produzione, Kai Table, esempi, Storybook e spec applicative.
  5. Aggiungere `migration-executor` alla tabella dell’architecture planner.
  6. Aggiungere il routing guard corrispondente al generic task executor.
  7. Segnalare che OpenCode deve essere riavviato prima degli step successivi.
- **Vincoli**: non modificare configurazioni runtime OpenCode, modelli, provider o altri executor.
- **Validazione**: `test -f .opencode/agents/migration-executor.md && rg 'migration-executor|migrations/' .opencode/agents/migration-executor.md .opencode/agents/architecture-planner.md .opencode/agents/task-executor.md` deve terminare con exit code `0`.
- **Stop condition**: fermarsi se la definizione richiede campi frontmatter non supportati dal formato degli agent esistenti.

**Executor Input**:

~~~
## TASK:
Create and register a dedicated OpenCode executor for ng-update migration work.

## CONTEXT:
Project agents live under `.opencode/agents/`. The architecture planner and generic task executor maintain routing information. Migration work must no longer be assigned to the generic executor.

## OBJECTIVE:
Add a focused `migration-executor` and route migration collection, Node transformation, payload, and fixture work to it.

## REQUIREMENTS:
1. Create `.opencode/agents/migration-executor.md` with valid frontmatter and `mode: all`.
2. Restrict its domain to migration collections, Node migration scripts, payloads, fixtures, and migration-specific package configuration.
3. Require `focused-execution`, `inobeta-ui-conventions`, transactional edits, AST-safe transforms, and explicit stop conditions.
4. Forbid Angular production, Kai Table, examples, Storybook, and application-spec changes.
5. Register the executor in the architecture planner executor table.
6. Add it to the generic task executor routing guard.
7. Report that OpenCode must be restarted before the new executor can be used.

## CONSTRAINTS:
- Do not modify providers, models, commands, or unrelated agent definitions.
- Do not add production or migration code in this step.

## OUTPUT:
Report the agent definition, routing changes, and restart requirement.

## ACCEPTANCE CRITERIA:
- The three allowed files reference `migration-executor`.
- The new agent explicitly owns `migrations/`.
- The new agent explicitly rejects production-source work.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 2 — Registrare la migration collection v22 ✅ DONE [2026-08-07T11:34:23.116Z]

- **Executor**: `migration-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `package.json`, `package-lock.json`, `ng-package.json`, `migrations/migrations.json`, `migrations/update-22/index.cjs`, `migrations/test/scaffold.test.cjs`
- **Obiettivo**: fornire lo scheletro pubblicabile che Angular CLI riconosce ed esegue durante `ng update @inobeta/ui@22`.
- **Requisiti**:
  1. Aggiungere a `package.json` il metadato `ng-update.migrations`.
  2. Creare una collection con migration versionata `22.0.0` e factory CommonJS.
  3. Creare un bridge schematic minimale che restituisca un Rule valido senza ancora applicare trasformazioni consumer.
  4. Copiare `migrations/` nel package tramite gli assets di `ng-package.json`.
  5. Dichiarare direttamente le dipendenze runtime necessarie alla migration, incluso `@angular-devkit/schematics` e il parser TypeScript, senza duplicare versioni incompatibili.
  6. Aggiungere lo script `test-migrations` basato su `node --test`.
  7. Verificare che package e collection siano caricabili dal contenuto di `dist/`.
- **Vincoli**: non modificare sorgenti sotto `src/`; non implementare ancora prompt, copia o import rewrite; non usare ESM se Angular CLI non riesce a caricare la factory pubblicata.
- **Validazione**: `npm run test-migrations && npm run packagr && test -f dist/migrations/migrations.json && node -e "const p=require('./dist/package.json'); if(!p['ng-update']?.migrations) process.exit(1)"` deve terminare con exit code `0`.
- **Stop condition**: fermarsi se ng-packagr non conserva il metadato `ng-update` o se la factory non è caricabile dal package generato.

**Executor Input**:

~~~
## TASK:
Scaffold the publishable Angular v22 migration collection.

## CONTEXT:
`@inobeta/ui` has no existing migration infrastructure. Angular CLI requires package `ng-update` metadata and a migration collection even though the implementation will delegate to simple Node modules.

## OBJECTIVE:
Make the built package expose a loadable `22.0.0` migration with an initially inert bridge.

## REQUIREMENTS:
1. Add `ng-update.migrations` metadata to `package.json`.
2. Create `migrations/migrations.json` with a versioned `22.0.0` factory.
3. Create a CommonJS schematic bridge that returns a valid Rule without consumer edits.
4. Copy the complete migrations directory through ng-packagr assets.
5. Declare direct runtime dependencies needed by the published migration, including Angular DevKit Schematics and the TypeScript parser, without incompatible duplicates.
6. Add a `test-migrations` Node test script.
7. Test loading collection and factory from the built package.

## CONSTRAINTS:
- Do not modify files under `src/`.
- Do not implement prompts or source transforms yet.
- Do not rely on undeclared transitive runtime dependencies.

## OUTPUT:
Report package metadata, dependencies, generated migration files, and dist loading result.

## ACCEPTANCE CRITERIA:
- `npm run test-migrations` passes.
- `npm run packagr` passes.
- `dist/package.json` points to an existing migration collection.
- The factory can be required from the package output.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 3 — Implementare il motore sicuro di migrazione ✅ DONE [2026-08-07T11:37:51.686Z]

- **Executor**: `migration-executor`
- **Modelli suggeriti**: gruppo R
- **File consentiti**: `migrations/update-22/lib/`, `migrations/test/engine.test.cjs`, `migrations/test/fixtures/engine/`
- **Obiettivo**: creare un motore transazionale e idempotente per analisi import, prompt e copia file.
- **Requisiti**:
  1. Analizzare i file TypeScript tramite AST, senza regex per modificare import.
  2. Supportare named import, alias, `import type` e import misti da `@inobeta/ui`.
  3. Dividere gli import misti conservando ordine, alias e simboli non migrati.
  4. Calcolare import relativi POSIX verso i barrel locali, senza estensioni.
  5. Eseguire un preflight completo prima di cambiare il `Tree`.
  6. Fermarsi su namespace import, default import, dynamic import, deep import o consumer fuori dal perimetro supportato.
  7. Fornire un prompt adapter iniettabile per distinguere TTY, risposta sì, risposta no e test.
  8. In modalità non interattiva, fallire senza modifiche quando esistono utilizzi migrabili.
  9. Gestire collisioni: accettare file identici, fermarsi su contenuti differenti.
  10. Garantire idempotenza alla seconda esecuzione.
  11. Applicare ogni famiglia in modo atomico tramite Angular `Tree`.
- **Vincoli**: nessun accesso diretto distruttivo al filesystem consumer; nessuna riscrittura euristica di espressioni; nessuna dipendenza da ts-morph.
- **Validazione**: `node --test migrations/test/engine.test.cjs` deve terminare con exit code `0`.
- **Stop condition**: fermarsi se un costrutto non può essere trasformato mantenendo semantica e formattazione degli import.

**Executor Input**:

~~~
## TASK:
Build the shared transactional migration engine.

## CONTEXT:
HTTP and Forms migrations need the same safe import analysis, prompt, copy, collision, and idempotency behavior. The engine operates on an Angular Schematics Tree and uses TypeScript AST.

## OBJECTIVE:
Provide deterministic primitives that either migrate one feature family completely or leave the Tree unchanged.

## REQUIREMENTS:
1. Parse TypeScript imports through the TypeScript AST.
2. Support named imports, aliases, type-only imports, and mixed package imports.
3. Split mixed imports while preserving aliases and retained package symbols.
4. Generate extensionless POSIX relative import paths.
5. Complete preflight before writing any Tree entry.
6. Reject namespace, default, dynamic, deep, and unsupported cross-project imports with exact file diagnostics.
7. Implement an injectable prompt adapter for TTY, yes, no, and tests.
8. Fail without edits in non-interactive mode when migration is required.
9. Accept identical destination files and reject differing collisions.
10. Make a second migration run a no-op.
11. Commit each feature family atomically through the Tree.

## CONSTRAINTS:
- Do not use regex as the TypeScript import transformer.
- Do not use ts-morph.
- Do not write directly to consumer disk outside the Tree abstraction.
- Do not silently skip unsupported syntax.

## OUTPUT:
Report engine modules, supported syntax, rejected syntax, and fixture coverage.

## ACCEPTANCE CRITERIA:
- Engine tests cover mixed imports, aliases, type-only imports, no-op, non-TTY, collisions, unsupported syntax, rollback, and idempotency.
- `node --test migrations/test/engine.test.cjs` exits 0.
- Failed preflight fixtures retain byte-identical trees.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 4 — Implementare la migrazione fallback HTTP ✅ DONE [2026-08-07T11:46:39.382Z]

- **Executor**: `migration-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `migrations/update-22/http/`, `migrations/update-22/files/http/`, `migrations/test/http-migration.test.cjs`, `migrations/test/fixtures/http/`
- **Obiettivo**: vendorizzare il modulo HTTP nel progetto consumer e riallinearne gli import su richiesta.
- **Requisiti**:
  1. Creare un manifest completo dei simboli pubblici esportati da `src/app/inobeta-ui/http/index.ts`.
  2. Creare un payload runtime sotto `migrations/update-22/files/http/`.
  3. Includere le utility di test realmente pubbliche, ma escludere stories, MDX e spec private.
  4. Rimuovere dai file vendorizzati i tag lifecycle `@deprecated` senza cambiare codice eseguibile.
  5. Riallineare nel payload gli import verso Storage, Toast e altre feature mantenute a `@inobeta/ui`.
  6. Chiedere conferma solo quando il preflight trova simboli HTTP importati.
  7. Alla risposta positiva, copiare il payload in `src/app/core/http/`.
  8. Riscrivere gli import nominati consumer verso il barrel locale, dividendo eventuali import misti.
  9. Aggiungere `jwt-decode` alle dipendenze consumer quando necessario e assente.
  10. Alla risposta negativa, non modificare quella famiglia e riportare file e simboli irrisolti.
  11. Testare assenza utilizzi, sì, no, alias, import misti, collisione, rollback e seconda esecuzione.
- **Vincoli**: non modernizzare interceptor, guard, store o componenti; non modificare il comportamento HTTP; non sovrascrivere file consumer differenti.
- **Validazione**: `node --test migrations/test/http-migration.test.cjs` deve terminare con exit code `0`.
- **Stop condition**: fermarsi se il payload richiede un’API non più pubblica e non vendorizzata o se un import consumer non è classificabile.

**Executor Input**:

~~~
## TASK:
Implement the interactive HTTP vendoring migration.

## CONTEXT:
The current HTTP feature is exported through `src/app/inobeta-ui/http/index.ts`. It must be removed from the library, so consumers choosing the fallback receive behavior-equivalent local source under `src/app/core/http/`.

## OBJECTIVE:
Copy the required HTTP implementation and safely replace consumer package imports after explicit confirmation.

## REQUIREMENTS:
1. Build a complete manifest from the current HTTP public barrel.
2. Snapshot runtime source into the HTTP migration payload.
3. Include publicly exported test utilities but exclude private specs, stories, and MDX.
4. Remove `@deprecated` lifecycle tags from vendored source without executable changes.
5. Rewrite payload imports for retained library features to `@inobeta/ui`.
6. Prompt only when HTTP symbols are used.
7. Copy accepted payload files to `src/app/core/http/`.
8. Rewrite supported named imports to a relative local barrel and split mixed imports.
9. Add a direct `jwt-decode` consumer dependency only when required and absent.
10. On a negative response, leave the family untouched and report unresolved files and symbols.
11. Test no-use, yes, no, aliases, mixed imports, collision, rollback, and idempotency.

## CONSTRAINTS:
- Do not modernize or redesign HTTP behavior.
- Do not overwrite differing consumer files.
- Do not transform unsupported import syntax heuristically.

## OUTPUT:
Report the symbol manifest, payload contents, dependency behavior, and migration fixture results.

## ACCEPTANCE CRITERIA:
- `node --test migrations/test/http-migration.test.cjs` exits 0.
- Accepted fixtures contain `src/app/core/http/` and no HTTP symbol imported from `@inobeta/ui`.
- Declined and failed fixtures remain unchanged.
- A second run produces no diff.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 5 — Implementare la migrazione fallback Forms ✅ DONE [2026-08-07T11:51:32.816Z]

- **Executor**: `migration-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `migrations/update-22/forms/`, `migrations/update-22/files/forms/`, `migrations/update-22/files/material-forms/`, `migrations/test/forms-migration.test.cjs`, `migrations/test/fixtures/forms/`
- **Obiettivo**: vendorizzare Forms e Material Forms nel progetto consumer, senza introdurre Formly.
- **Requisiti**:
  1. Creare manifest completi dai barrel `ui/forms/index.ts` e `ui/material-forms/index.ts`.
  2. Copiare il payload Forms in `src/app/core/forms/`.
  3. Copiare il payload Material Forms in `src/app/core/material-forms/`.
  4. Conservare i path relativi fra le due directory sorelle.
  5. Riallineare gli import verso Modal e altre feature mantenute a `@inobeta/ui`.
  6. Includere test module e stub attualmente pubblici, escludendo spec private, stories e MDX.
  7. Rimuovere i tag lifecycle `@deprecated` senza alterare implementazione, template inline o callback.
  8. Usare un unico prompt Forms quando è usato almeno un simbolo dei due barrel.
  9. Riscrivere ogni simbolo verso il barrel locale corretto, anche negli import misti.
  10. Non aggiungere `@ngx-formly/core` o wrapper Formly.
  11. Testare utilizzo congiunto, solo base Forms, solo Material Forms, alias, import type, risposta no, collisioni e idempotenza.
- **Vincoli**: nessun redesign del modello form; nessuna modifica a validatori, callback, layout, submit, dirty confirmation, dropdown o autocomplete.
- **Validazione**: `node --test migrations/test/forms-migration.test.cjs` deve terminare con exit code `0`.
- **Stop condition**: fermarsi se un file Material Forms dipende da un sorgente base non incluso o se un simbolo non può essere associato univocamente a un barrel locale.

**Executor Input**:

~~~
## TASK:
Implement the interactive Forms and Material Forms vendoring migration.

## CONTEXT:
Material Forms depends on base sources under `ui/forms/`. Formly was rejected because buttons, padding, labels, autocomplete, and custom select behavior do not map safely through an automatic migration.

## OBJECTIVE:
Copy both required source trees locally and rewrite supported consumer imports without functional redesign.

## REQUIREMENTS:
1. Build complete symbol manifests from both current public barrels.
2. Copy base Forms to `src/app/core/forms/`.
3. Copy Material Forms to `src/app/core/material-forms/`.
4. Preserve sibling relative imports between the two local trees.
5. Rewrite retained cross-feature imports, including Modal, to `@inobeta/ui`.
6. Include currently public test modules and stubs while excluding private specs, stories, and MDX.
7. Remove lifecycle `@deprecated` tags without executable or template changes.
8. Ask one Forms prompt when either barrel is used.
9. Route each imported symbol to the correct local barrel and split mixed imports.
10. Do not add Formly dependencies or generated Formly wrappers.
11. Test combined use, base-only use, Material-only use, aliases, type imports, decline, collisions, and idempotency.

## CONSTRAINTS:
- Preserve validators, callbacks, form values, actions, layout, and Material behavior.
- Do not add `@ngx-formly/core`.
- Do not overwrite differing consumer files.

## OUTPUT:
Report both manifests, payload trees, local import layout, and fixture results.

## ACCEPTANCE CRITERIA:
- `node --test migrations/test/forms-migration.test.cjs` exits 0.
- Accepted fixtures compile their local relative import graph.
- No migrated Forms symbol remains imported from `@inobeta/ui`.
- Declined and failed fixtures remain unchanged.
- A second run is a no-op.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 6 — Verificare la migrazione dal package generato ✅ DONE [2026-08-07T11:54:36.974Z]

- **Executor**: `migration-executor`
- **Modelli suggeriti**: gruppo R
- **File consentiti**: `migrations/update-22/index.cjs`, `migrations/test/package-smoke.test.cjs`, `migrations/test/fixtures/package-consumer/`, `package.json`
- **Obiettivo**: collegare HTTP e Forms al bridge v22 e verificare che il package pubblicato sia autosufficiente.
- **Requisiti**:
  1. Comporre il coordinator v22 eseguendo prima il preflight condiviso.
  2. Ordinare i prompt HTTP e Forms in modo deterministico.
  3. Garantire che il rifiuto di una famiglia non annulli una famiglia già accettata, ma che ogni famiglia resti atomica.
  4. Caricare collection, factory e payload esclusivamente da `dist/` nel package smoke test.
  5. Eseguire fixture con HTTP e Forms nello stesso import misto.
  6. Verificare il contenuto prodotto da `npm pack --dry-run`.
  7. Verificare che il package non dipenda dai futuri sorgenti eliminati sotto `src/app/inobeta-ui/`.
- **Vincoli**: non modificare sorgenti libreria o fixture applicative reali; non simulare il package caricando moduli dalla root sorgente.
- **Validazione**: `npm run packagr && node --test migrations/test/package-smoke.test.cjs && cd dist && npm pack --dry-run` deve terminare con exit code `0`.
- **Stop condition**: fermarsi se collection, runtime dependency o payload vengono risolti soltanto grazie ai sorgenti del repository.

**Executor Input**:

~~~
## TASK:
Integrate both feature migrations and smoke-test the built package.

## CONTEXT:
The scaffolded v22 bridge is currently inert. HTTP and Forms modules now expose tested migration functions and static payloads. The package must work after the original library source is deleted.

## OBJECTIVE:
Run the complete migration from `dist/` and prove the published tarball contains every required artifact.

## REQUIREMENTS:
1. Compose the v22 coordinator around shared preflight.
2. Prompt for HTTP and Forms in deterministic order.
3. Keep each family atomic while allowing independent accept or decline decisions.
4. Load collection, factory, code, and payload only from `dist/` in the smoke test.
5. Test a fixture with HTTP and Forms symbols in one mixed package import.
6. Inspect `npm pack --dry-run` output for migration files and payloads.
7. Ensure no runtime path points back to `src/app/inobeta-ui/`.

## CONSTRAINTS:
- Do not modify library production source.
- Do not let the package smoke test import migration modules from repository source.
- Do not hide missing assets with test-only fallbacks.

## OUTPUT:
Report coordinator order, dist-only test setup, tarball contents, and test result.

## ACCEPTANCE CRITERIA:
- `npm run packagr` exits 0.
- `node --test migrations/test/package-smoke.test.cjs` exits 0.
- `npm pack --dry-run` lists collection, bridge, engine, manifests, and both payloads.
- The fixture has valid split local/package imports.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 7 — Spostare HTTP nel core del demo ✅ DONE [2026-08-07T11:57:32.970Z]

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/app/app.config.ts`, `src/app/core/http/`
- **Obiettivo**: mantenere il comportamento HTTP del demo dopo la rimozione del modulo dalla libreria.
- **Requisiti**:
  1. Copiare nel core del demo lo stesso payload runtime verificato dalla migrazione HTTP.
  2. Adattare soltanto gli import repo-specific verso Storage, Toast e altre feature mantenute.
  3. Aggiornare `app.config.ts` affinché importi `IbHttpModule` dal barrel locale.
  4. Conservare provider, interceptor, guard, store, loader e opzioni HTTP esistenti.
  5. Non introdurre un secondo set di provider HTTP.
  6. Verificare che nessun file demo importi più da `src/app/inobeta-ui/http/`.
- **Vincoli**: nessuna modernizzazione del modulo; nessuna modifica a route, traduzioni o comportamento visibile; nessuna copia di stories, MDX o spec private.
- **Validazione**: `npm run build && ! rg 'inobeta-ui/http' src/app --glob '*.{ts,html}'` deve terminare con exit code `0`.
- **Stop condition**: fermarsi se la copia locale richiede di modificare una feature mantenuta della libreria.

**Executor Input**:

~~~
## TASK:
Move the demo application's HTTP dependency to local core source.

## CONTEXT:
`src/app/app.config.ts` currently imports `IbHttpModule` directly from library source. That source will be deleted. The tested HTTP migration payload defines the source that consumers receive.

## OBJECTIVE:
Make the demo consume a behavior-equivalent local `src/app/core/http/` copy.

## REQUIREMENTS:
1. Copy the verified HTTP runtime payload into `src/app/core/http/`.
2. Adapt only repository-specific imports for retained Storage, Toast, and related features.
3. Import the module from the local barrel in `app.config.ts`.
4. Preserve all existing providers, interceptors, guards, store, loader, and HTTP options.
5. Avoid duplicate HTTP provider registration.
6. Remove every demo import targeting `src/app/inobeta-ui/http/`.

## CONSTRAINTS:
- Do not modernize HTTP code.
- Do not change routes, translations, or visible behavior.
- Do not copy private specs, Storybook stories, or MDX.

## OUTPUT:
Report copied runtime files, adjusted cross-feature imports, and app configuration change.

## ACCEPTANCE CRITERIA:
- `npm run build` exits 0.
- No demo source imports `inobeta-ui/http`.
- `app.config.ts` uses the local HTTP barrel exactly once.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 8 — Rimuovere documentazione e stories legacy ✅ DONE [2026-08-07T12:03:28.318Z]

- **Executor**: `storybook-executor`
- **Modelli suggeriti**: gruppo F
- **File consentiti**: `src/app/inobeta-ui/http/**/*.mdx`, `src/app/inobeta-ui/http/**/*.stories.ts`, `src/app/inobeta-ui/ui/forms/**/*.mdx`, `src/app/inobeta-ui/ui/forms/**/*.stories.ts`, `src/app/inobeta-ui/ui/material-forms/**/*.mdx`, `src/app/inobeta-ui/ui/material-forms/**/*.stories.ts`, `src/getting_started.mdx`, `src/whats_new.mdx`
- **Obiettivo**: impedire che Storybook presenti come disponibili le feature eliminate dalla libreria v22.
- **Requisiti**:
  1. Eliminare le pagine e stories dedicate a HTTP, Forms e Material Forms.
  2. Rimuovere dalle pagine generali link, import e istruzioni che presentano tali API come pubbliche.
  3. Indicare in What’s New che le feature sono state rimosse e che `ng update` può vendorizzarle localmente.
  4. Non documentare Formly come percorso automatico supportato.
  5. Conservare invariati contenuti e stories delle feature mantenute.
- **Vincoli**: nessuna modifica ai sorgenti di componenti; nessuna riscrittura editoriale estranea; nessuna aggiunta di esempi locali fallback a Storybook.
- **Validazione**: `npm run build-storybook && ! rg 'IbHttpModule|IbMaterialForm|IbDynamicForm' src --glob '*.{mdx,stories.ts}'` deve terminare con exit code `0`.
- **Stop condition**: fermarsi se una pagina condivisa contiene documentazione inseparabile di una feature mantenuta.

**Executor Input**:

~~~
## TASK:
Remove Storybook content for the v22-removed HTTP and Forms APIs.

## CONTEXT:
The migration payload preserves source for consumers, but HTTP, Forms, and Material Forms will no longer be library features. Storybook must describe the final v22 public surface.

## OBJECTIVE:
Build Storybook without pages, stories, or general documentation that exposes removed APIs.

## REQUIREMENTS:
1. Delete dedicated HTTP, Forms, and Material Forms stories and MDX.
2. Remove links, imports, and usage instructions from general pages.
3. State in What's New that `ng update` can vendor the removed features locally.
4. Do not present Formly as an automatic supported migration.
5. Preserve all unrelated documentation and stories.

## CONSTRAINTS:
- Do not modify component implementation.
- Do not rewrite unrelated editorial content.
- Do not create fallback-source stories.

## OUTPUT:
Report deleted pages, updated general references, and Storybook build result.

## ACCEPTANCE CRITERIA:
- `npm run build-storybook` exits 0.
- No retained MDX or story references removed HTTP or Forms symbols as public APIs.
- Unrelated story titles and coverage remain unchanged.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 9 — Eliminare le suite delle feature rimosse ✅ DONE [2026-08-07T12:15:36.979Z]

- **Executor**: `unit-jasmine-executor`
- **Modelli suggeriti**: gruppo F
- **File consentiti**: `src/app/inobeta-ui/http/**/*.spec.ts`, `src/app/inobeta-ui/ui/forms/**/*.spec.ts`, `src/app/inobeta-ui/ui/material-forms/**/*.spec.ts`
- **Obiettivo**: rimuovere test e stub privati che appartengono esclusivamente alle feature destinate alla cancellazione.
- **Requisiti**:
  1. Eliminare le suite HTTP, Forms e Material Forms non mantenute dalla libreria.
  2. Non eliminare dal payload migration le utility di test oggi pubbliche.
  3. Verificare che nessuna spec mantenuta importi una feature rimossa.
  4. Non modificare aspettative di Modal, Toast, Kai Table o altre feature.
  5. Mantenere verdi le soglie globali di coverage.
- **Vincoli**: nessuna modifica ai sorgenti di produzione; nessun test skipped o focused; nessuna riduzione delle soglie.
- **Validazione**: `npm run test-ci && ! rg 'inobeta-ui/(http|ui/forms|ui/material-forms)' src/app --glob '*.spec.ts'` deve terminare con exit code `0`.
- **Stop condition**: fermarsi se una suite contiene copertura condivisa necessaria a una feature mantenuta.

**Executor Input**:

~~~
## TASK:
Delete tests belonging exclusively to removed HTTP and Forms library features.

## CONTEXT:
Migration payloads already preserve currently public test helpers. Production source still exists temporarily, but these library feature suites must disappear before the folders are deleted.

## OBJECTIVE:
Remove obsolete feature tests while preserving all maintained-feature tests and global coverage gates.

## REQUIREMENTS:
1. Delete private HTTP, Forms, and Material Forms specs.
2. Leave migration payload test utilities untouched.
3. Confirm no retained spec imports a removed feature source.
4. Preserve Modal, Toast, Kai Table, and all unrelated expectations.
5. Keep every global coverage category at or above 80%.

## CONSTRAINTS:
- Do not modify production source.
- Do not skip or focus tests.
- Do not lower coverage thresholds.
- Do not delete shared maintained-feature tests.

## OUTPUT:
Report deleted suites, retained shared consumers, test count, and coverage percentages.

## ACCEPTANCE CRITERIA:
- `npm run test-ci` exits 0.
- No retained spec imports removed feature source.
- Statements, branches, functions, and lines each remain at least 80%.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 10 — Rimuovere HTTP e Forms dalla libreria ✅ DONE [2026-08-07T12:20:17.409Z]

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `public_api.ts`, `package.json`, `package-lock.json`, `src/app/inobeta-ui/http/`, `src/app/inobeta-ui/ui/forms/`, `src/app/inobeta-ui/ui/material-forms/`
- **Obiettivo**: eliminare implementazioni ed export pubblici HTTP, Forms e Material Forms dal package v22.
- **Requisiti**:
  1. Eliminare i tre export corrispondenti da `public_api.ts`.
  2. Eliminare le directory di produzione HTTP, Forms e Material Forms.
  3. Rimuovere dipendenze peer non più richieste dalla libreria, incluso `jwt-decode`, soltanto dopo una ricerca globale.
  4. Conservare dipendenze ancora richieste da feature mantenute o dalla migration runtime.
  5. Verificare che nessun sorgente mantenuto importi i barrel rimossi.
  6. Non aggiungere Formly.
  7. Conservare invariata la restante public API.
- **Vincoli**: non modificare implementazioni mantenute; non eliminare `forms-utilities`; non modificare i payload migration statici.
- **Validazione**: `npm run packagr && npm run build && ! test -d src/app/inobeta-ui/http && ! test -d src/app/inobeta-ui/ui/forms && ! test -d src/app/inobeta-ui/ui/material-forms && ! rg 'inobeta-ui/(http|ui/forms|ui/material-forms)' public_api.ts src/app/inobeta-ui` deve terminare con exit code `0`.
- **Stop condition**: fermarsi se una feature mantenuta dipende ancora da uno dei tre moduli e non può essere riallineata senza variazione funzionale.

**Executor Input**:

~~~
## TASK:
Remove HTTP, Forms, and Material Forms from the v22 library package.

## CONTEXT:
Consumer migrations, static payloads, demo local HTTP source, docs cleanup, and test cleanup are complete. The three features can now be removed from the public package.

## OBJECTIVE:
Produce a buildable library with no source or public exports for the removed features.

## REQUIREMENTS:
1. Remove all three feature exports from `public_api.ts`.
2. Delete their production source directories.
3. Remove no-longer-required peer dependencies, including `jwt-decode`, only after a global usage check.
4. Retain dependencies needed by maintained features or migration runtime.
5. Confirm no maintained library source imports removed barrels.
6. Do not add Formly.
7. Preserve every unrelated public export.

## CONSTRAINTS:
- Do not modify maintained component behavior.
- Do not remove `forms-utilities`.
- Do not modify static migration payloads.
- Do not remove dependencies still used by another feature.

## OUTPUT:
Report deleted directories, removed public exports, dependency cleanup, and remaining API verification.

## ACCEPTANCE CRITERIA:
- `npm run packagr` exits 0.
- `npm run build` exits 0.
- Removed feature directories no longer exist.
- `public_api.ts` contains no HTTP, Forms, or Material Forms export.
- No maintained source imports removed feature paths.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 11 — Eliminare IbTableDataSource ✅ DONE [2026-08-07T12:22:32.518Z]

- **Executor**: `kai-table-executor`
- **Modelli suggeriti**: gruppo R
- **File consentiti**: `src/app/inobeta-ui/ui/kai-table/table-data-source.ts`, `src/app/inobeta-ui/ui/kai-table/table.component.ts`, `src/app/inobeta-ui/ui/kai-table/cells.ts`, `src/app/inobeta-ui/ui/kai-table/index.ts`
- **Obiettivo**: usare esclusivamente `IbTableLocalDataSource` per il flusso dati locale Kai Table.
- **Requisiti**:
  1. Eliminare `IbTableDataSource` e il relativo file.
  2. Rimuoverne l’export pubblico.
  3. Sostituire union type, default source, `instanceof` e branch compatibilità nel componente.
  4. Usare le API canoniche `setInput`, `setColumns`, dati filtrati, sorting e aggregazione del local data source.
  5. Aggiornare commenti mantenuti che nominano il wrapper legacy.
  6. Preservare sorting, filtering, pagination, aggregation, export, selection e sostituzione runtime del data source canonico.
  7. Non modificare il remote data source.
- **Vincoli**: nessun adapter sostitutivo o alias con il vecchio nome; nessuna modifica a mobile, URL state o spec in questo step.
- **Validazione**: `npm run packagr && ! rg 'IbTableDataSource|table-data-source' src/app/inobeta-ui/ui/kai-table --glob '*.ts' --glob '!*.spec.ts'` deve terminare con exit code `0`.
- **Stop condition**: fermarsi se una capacità usata dal componente non è disponibile sul data source canonico e richiede un nuovo contratto pubblico.

**Executor Input**:

~~~
## TASK:
Remove the deprecated IbTableDataSource compatibility wrapper.

## CONTEXT:
`IbTableLocalDataSource` is the canonical local source. `table.component.ts` still accepts and branches on the deprecated wrapper, while tests will be updated separately.

## OBJECTIVE:
Make all production local-table paths use `IbTableLocalDataSource` directly.

## REQUIREMENTS:
1. Delete the deprecated class and source file.
2. Remove its public barrel export.
3. Remove compatibility union types, defaults, `instanceof` checks, and branches.
4. Use canonical local-source APIs for input, columns, filtering, sorting, pagination, and aggregation.
5. Remove maintained production comments naming the wrapper.
6. Preserve sorting, filtering, pagination, aggregation, export, selection, and runtime source replacement.
7. Leave the remote data source unchanged.

## CONSTRAINTS:
- Do not create a compatibility alias.
- Do not modify mobile table, URL state, or specs.
- Do not change canonical public contracts.

## OUTPUT:
Report deleted compatibility code, canonical replacement paths, and preserved table invariants.

## ACCEPTANCE CRITERIA:
- `npm run packagr` exits 0.
- Production Kai Table contains no `IbTableDataSource` reference.
- The canonical local and remote source exports remain available.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 12 — Rimuovere le actions URL legacy ✅ DONE [2026-08-07T12:24:05.746Z]

- **Executor**: `kai-table-executor`
- **Modelli suggeriti**: gruppo R
- **File consentiti**: `src/app/inobeta-ui/ui/kai-table/store/url-state/actions.ts`, `src/app/inobeta-ui/ui/kai-table/store/url-state/reducers.ts`, `src/app/inobeta-ui/ui/kai-table/store/url-state/effects.ts`
- **Obiettivo**: rendere `tableStateActions` l’unico protocollo di aggiornamento dello stato Kai Table.
- **Requisiti**:
  1. Eliminare `urlStateActions`.
  2. Eliminare i relativi handler di compatibilità dal reducer.
  3. Eliminare gli effects dedicati alle actions legacy.
  4. Conservare tutti gli handler e gli effects canonici.
  5. Preservare reset pagina su filter, sort e view.
  6. Preservare initialize, hydrate from URL, paginator, aggregation e apply view.
  7. Verificare che il codice di produzione non dispatchi più actions legacy.
- **Vincoli**: nessuna modifica alla shape canonica dello store, al codec URL o al facade; nessuna modifica alle spec.
- **Validazione**: `npm run packagr && ! rg 'urlStateActions' src/app/inobeta-ui/ui/kai-table --glob '*.ts' --glob '!*.spec.ts'` deve terminare con exit code `0`.
- **Stop condition**: fermarsi se viene trovato un dispatch di produzione non sostituibile con una action canonica semanticamente equivalente.

**Executor Input**:

~~~
## TASK:
Remove the legacy Kai Table URL action protocol.

## CONTEXT:
Production table flows already use `tableStateActions` through the state facade. Legacy actions remain only for backward-compatible reducer and effect handling.

## OBJECTIVE:
Make `tableStateActions` the sole production state-update protocol.

## REQUIREMENTS:
1. Delete `urlStateActions`.
2. Remove all legacy reducer handlers.
3. Remove all legacy-only effects.
4. Preserve every canonical handler and effect.
5. Preserve page reset behavior on filter, sort, and view changes.
6. Preserve initialize, URL hydration, paginator, aggregation, and apply-view behavior.
7. Confirm no production dispatch references the removed action group.

## CONSTRAINTS:
- Do not change canonical store shape.
- Do not modify the URL codec or state facade.
- Do not modify specs in this step.

## OUTPUT:
Report removed actions, handlers, effects, and verified canonical flows.

## ACCEPTANCE CRITERIA:
- `npm run packagr` exits 0.
- Production Kai Table contains no `urlStateActions`.
- Canonical action types and handlers remain unchanged.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 13 — Rimuovere le API compatibility Kai Table ✅ DONE [2026-08-07T12:27:38.660Z]

- **Executor**: `kai-table-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/app/inobeta-ui/ui/kai-table/table-url.service.ts`, `src/app/inobeta-ui/ui/kai-table/store/url-state/selectors.ts`, `src/app/inobeta-ui/ui/kai-table/store/url-state/interfaces.ts`, `src/app/inobeta-ui/ui/kai-table/store/index.ts`, `src/app/inobeta-ui/ui/kai-table/index.ts`
- **Obiettivo**: eliminare selector, tipi, metodi URL e store composite deprecati dalla public API Kai Table.
- **Requisiti**:
  1. Rimuovere da `IbTableUrlService` tutti i metodi legacy, mantenendo `decodeUrlParams()` e `writeState()`.
  2. Rimuovere `IbTableQsParams`.
  3. Rimuovere `IbKaiTableParams` e `IbKaiTableNamedParams`.
  4. Rimuovere `ibTableSelectUrlState`, `ibTableSelectLastQueryStringRaw` e `ibTableSelectLastQueryString`.
  5. Rimuovere projector e helper usati soltanto dai selector legacy.
  6. Rimuovere `IKaiTableStore` e `kaiTableReducers`.
  7. Aggiornare tutti i barrel senza modificare gli export canonici.
  8. Verificare che non restino marker `@deprecated` nella feature.
- **Vincoli**: nessuna migrazione consumer per questi simboli; nessuna rinomina degli equivalenti canonici; nessuna modifica a facade, codec o record canonici.
- **Validazione**: `npm run packagr && ! rg '@deprecated|IbTableQsParams|IbKaiTableNamedParams|IbKaiTableParams|ibTableSelectUrlState|ibTableSelectLastQueryString|IKaiTableStore|kaiTableReducers' src/app/inobeta-ui/ui/kai-table --glob '*.ts' --glob '!*.spec.ts'` deve terminare con exit code `0`.
- **Stop condition**: fermarsi se un simbolo legacy risulta ancora necessario a un flusso di produzione mantenuto.

**Executor Input**:

~~~
## TASK:
Remove all remaining deprecated Kai Table compatibility APIs.

## CONTEXT:
The canonical data source and canonical action protocol are now the only production paths. Legacy URL service methods, query-string selectors, types, and composite store exports remain isolated compatibility surface.

## OBJECTIVE:
Expose only canonical Kai Table URL and state APIs.

## REQUIREMENTS:
1. Remove all legacy IbTableUrlService methods while retaining `decodeUrlParams()` and `writeState()`.
2. Remove `IbTableQsParams`.
3. Remove `IbKaiTableParams` and `IbKaiTableNamedParams`.
4. Remove all three legacy query-string selectors.
5. Remove projector and helper functions used only by those selectors.
6. Remove `IKaiTableStore` and `kaiTableReducers`.
7. Clean every barrel while preserving canonical exports.
8. Remove every production `@deprecated` marker from Kai Table.

## CONSTRAINTS:
- Do not provide a consumer migration for these symbols.
- Do not rename canonical replacements.
- Do not modify the state facade, URL codec, or canonical record shape.
- Do not modify specs in this step.

## OUTPUT:
Report removed symbols, retained canonical replacements, and barrel changes.

## ACCEPTANCE CRITERIA:
- `npm run packagr` exits 0.
- No deprecated production symbol remains under `ui/kai-table/`.
- Canonical selectors, `tableStateActions`, `IbKaiTableRecord`, `IbKaiTableSnapshot`, `decodeUrlParams`, and `writeState` remain exported.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 14 — Riallineare i test Kai Table canonici ✅ DONE [2026-08-07T12:34:17.978Z]

- **Executor**: `unit-jasmine-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/app/inobeta-ui/ui/kai-table/**/*.spec.ts`
- **Obiettivo**: eliminare copertura delle compatibility API rimosse e preservare la copertura dei flussi canonici.
- **Requisiti**:
  1. Rimuovere il blocco test dedicato a `IbTableDataSource`.
  2. Sostituire negli host test mantenuti `IbTableDataSource` con `IbTableLocalDataSource`.
  3. Conservare le asserzioni osservabili su filtering, sorting, pagination, aggregation, export e source replacement.
  4. Rimuovere test di `urlStateActions` da reducer ed effects.
  5. Rimuovere test dei selector e metodi URL legacy.
  6. Conservare test individuali di actions, reducer, effects, selector, facade e codec canonici.
  7. Non modificare sorgenti di produzione o aspettative funzionali valide.
- **Vincoli**: nessun test skipped o focused; nessun cast aggiunto soltanto per conservare tipi rimossi; nessuna riduzione di coverage.
- **Validazione**: `npx ng test --include='src/app/inobeta-ui/ui/kai-table/**/*.spec.ts' --watch=false --coverage=false` deve terminare con exit code `0`.
- **Stop condition**: fermarsi se una failure rivela una regressione di produzione nelle API canoniche anziché un riferimento legacy del test.

**Executor Input**:

~~~
## TASK:
Realign Kai Table tests after removing all deprecated compatibility APIs.

## CONTEXT:
Production now uses `IbTableLocalDataSource`, `tableStateActions`, canonical selectors, canonical records, and the v2 URL service API only.

## OBJECTIVE:
Keep strong coverage of observable canonical behavior without references to removed symbols.

## REQUIREMENTS:
1. Remove the dedicated IbTableDataSource compatibility test block.
2. Replace maintained test hosts with `IbTableLocalDataSource`.
3. Preserve observable filtering, sorting, pagination, aggregation, export, and source-replacement assertions.
4. Remove legacy action reducer and effect test sections.
5. Remove legacy selector and URL service method tests.
6. Preserve individual canonical action, reducer, effect, selector, facade, and codec tests.
7. Do not modify production source or weaken valid expectations.

## CONSTRAINTS:
- Do not skip or focus tests.
- Do not add casts solely to retain removed types.
- Do not lower coverage.
- Stop on a real canonical production regression.

## OUTPUT:
Report deleted compatibility test sections, canonical replacements, test count, and failures found.

## ACCEPTANCE CRITERIA:
- The targeted Kai Table command exits 0.
- No Kai Table spec references a removed symbol.
- Canonical state and data-source behavior remains individually asserted.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 15 — Ripulire IbToolTestModule ✅ DONE [2026-08-07T12:35:22.786Z]

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo F
- **File consentiti**: `src/app/inobeta-ui/tools/tools-test.module.ts`
- **Obiettivo**: mantenere `IbToolTestModule` come utility interna non deprecata, rimuovendo soltanto provider non più usati.
- **Requisiti**:
  1. Verificare che dopo la rimozione delle suite legacy il modulo resti usato da Modal e Toast.
  2. Rimuovere il tag `@deprecated`.
  3. Conservare mock translate, `TranslateService` stub e `MatDialogRef` stub se richiesti dai consumer rimasti.
  4. Rimuovere `provideHttpClient`, `withInterceptorsFromDi`, `withXhr` e `provideHttpClientTesting` soltanto se nessun consumer rimasto ne dipende.
  5. Rimuovere gli import diventati inutilizzati.
  6. Non modificare spec o stub condivisi.
- **Vincoli**: nessuna rinomina del modulo; nessuna esportazione pubblica nuova; nessuna rimozione di provider ancora richiesti.
- **Validazione**: `npx ng test --include='src/app/inobeta-ui/ui/{modal,toast}/**/*.spec.ts' --watch=false --coverage=false && ! rg '@deprecated' src/app/inobeta-ui/tools/tools-test.module.ts` deve terminare con exit code `0`.
- **Stop condition**: fermarsi se non è possibile determinare tramite test quale provider sia ancora necessario.

**Executor Input**:

~~~
## TASK:
Keep and prune the internal IbToolTestModule after legacy test removal.

## CONTEXT:
After HTTP and Material Forms specs are deleted, the module remains used by Modal and Toast tests. It currently also registers HTTP client testing providers that may no longer be required.

## OBJECTIVE:
Retain a non-deprecated test utility containing only infrastructure used by surviving tests.

## REQUIREMENTS:
1. Confirm surviving Modal and Toast consumers.
2. Remove the `@deprecated` annotation.
3. Retain translate and dialog stubs required by those consumers.
4. Remove HTTP client and HTTP testing providers only when targeted tests prove they are unused.
5. Remove imports made unused by provider cleanup.
6. Do not edit specs or shared stubs.

## CONSTRAINTS:
- Do not rename the module.
- Do not add a public export.
- Do not remove any provider still required by surviving tests.

## OUTPUT:
Report remaining consumers, retained providers, removed providers, and targeted test result.

## ACCEPTANCE CRITERIA:
- Targeted Modal and Toast tests exit 0.
- `IbToolTestModule` has no `@deprecated` annotation.
- No unused HTTP provider import remains when HTTP testing is removed.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 16 — Stabilizzare la suite dopo la pulizia ✅ DONE [2026-08-07T12:36:25.058Z]

- **Executor**: `unit-jasmine-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/**/*.spec.ts`, `src/**/*.stub.spec.ts`, `src/vitest-jasmine-compat.ts`
- **Obiettivo**: portare a verde l’intera suite Vitest dopo le rimozioni, mantenendo le soglie globali.
- **Requisiti**:
  1. Eseguire la suite completa.
  2. Correggere soltanto import, setup o aspettative rimaste legate a simboli rimossi.
  3. Non modificare test di comportamento ancora validi.
  4. Non modificare sorgenti di produzione.
  5. Non estendere la compatibility layer Jasmine salvo necessità comune già ammessa.
  6. Mantenere almeno l’80% per statements, branches, functions e lines.
  7. Verificare assenza di test focused o skipped.
- **Vincoli**: nessun test rimosso oltre alle suite feature già previste; nessuna riduzione soglie; nessun refactor generale Jasmine→Vitest.
- **Validazione**: `npm run test-ci` deve terminare con exit code `0`, zero failure e tutte le soglie rispettate.
- **Stop condition**: fermarsi se una failure richiede una modifica funzionale di produzione o il ripristino di un’API deprecata.

**Executor Input**:

~~~
## TASK:
Stabilize the complete Vitest suite after deprecated API removal.

## CONTEXT:
Feature-specific production and test steps are complete. Remaining failures should only be stale imports, setup, or compatibility assumptions.

## OBJECTIVE:
Pass the full CI test suite with all four coverage thresholds at or above 80%.

## REQUIREMENTS:
1. Run the complete suite.
2. Fix only stale imports, setup, or expectations tied to removed symbols.
3. Preserve all still-valid behavioral expectations.
4. Do not modify production source.
5. Do not broaden the Jasmine compatibility layer unless several surviving suites require the same existing Jasmine semantics.
6. Keep statements, branches, functions, and lines at least 80%.
7. Remove any accidental focused or skipped test.

## CONSTRAINTS:
- Do not restore removed APIs.
- Do not delete additional maintained tests.
- Do not lower coverage thresholds.
- Do not perform a broad Jasmine-to-Vitest rewrite.

## OUTPUT:
Report failures found, specs adjusted, final test count, and coverage percentages.

## ACCEPTANCE CRITERIA:
- `npm run test-ci` exits 0.
- Zero tests fail.
- All four coverage categories meet 80%.
- No focused or skipped tests exist.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 17 — Verificare la rimozione integrata ✅ DONE [2026-08-07T12:46:40.322Z]

- **Executor**: `code-reviewer`
- **Modelli suggeriti**: gruppo R
- **File consentiti**: `.opencode/agents/`, `package.json`, `package-lock.json`, `ng-package.json`, `public_api.ts`, `migrations/`, `src/`
- **Obiettivo**: produrre una verifica read-only della migrazione v22 e della completa rimozione delle API deprecate.
- **Requisiti**:
  1. Verificare registrazione e dominio del nuovo `migration-executor`.
  2. Eseguire lint, migration tests, package, build, test CI e Storybook.
  3. Verificare che il tarball contenga collection, engine e payload.
  4. Eseguire il package smoke test con HTTP e Forms accettati.
  5. Verificare risposta negativa, non-TTY, collisione e idempotenza tramite fixture.
  6. Verificare che HTTP, Forms e Material Forms non siano più nella public API o nel sorgente libreria.
  7. Verificare che Kai Table non contenga simboli o marker deprecati.
  8. Verificare che `IbToolTestModule` resti usato, non deprecato e privo di provider inutili.
  9. Verificare assenza globale di `@deprecated` nelle aree mantenute e nei payload vendorizzati.
  10. Controllare che non siano stati introdotti Formly, `any`, test disabilitati o modifiche funzionali estranee.
  11. Produrre esito PASS/FAIL senza modificare file.
- **Vincoli**: revisione read-only; nessuna correzione; ogni problema deve riportare severità, file e comando.
- **Validazione**: `npm run lint && npm run test-migrations && npm run packagr && npm run build && npm run test-ci && npm run build-storybook` deve terminare con exit code `0`.
- **Stop condition**: nessuna; ogni failure produce verdetto FAIL.

**Executor Input**:

~~~
## TASK:
Perform a read-only integrated review of the v22 deprecated API removal and consumer migrations.

## CONTEXT:
The result must expose a working ng-update migration, vendor HTTP and Forms safely, remove those library APIs, remove all Kai Table compatibility APIs, and retain a pruned non-deprecated IbToolTestModule.

## OBJECTIVE:
Return PASS only when migration safety, package contents, public API cleanup, behavior gates, and coverage all succeed.

## REQUIREMENTS:
1. Verify the migration executor definition and routing.
2. Run lint, migration tests, library packaging, app build, CI tests, and Storybook build.
3. Inspect the packed artifact for collection, engine, manifests, and payloads.
4. Run the packaged migration smoke fixture with both prompts accepted.
5. Verify decline, non-TTY, collision, rollback, and idempotency fixtures.
6. Confirm HTTP, Forms, and Material Forms are absent from library source and public API.
7. Confirm Kai Table contains no removed compatibility symbol or deprecated marker.
8. Confirm IbToolTestModule remains used, non-deprecated, and contains no proven-unused provider.
9. Confirm no `@deprecated` marker remains in maintained source or vendored payloads.
10. Check for Formly, new explicit `any`, focused or skipped tests, and unrelated behavior changes.
11. Produce a read-only PASS/FAIL report.

## CONSTRAINTS:
- Do not modify any file.
- Do not fix findings during review.
- Treat unsafe migration behavior, missing payload assets, failed commands, or restored deprecated APIs as blockers.

## OUTPUT:
Return commands and exit codes, package contents, fixture results, coverage percentages, findings by severity, and final verdict.

## ACCEPTANCE CRITERIA:
- Every required command exits 0.
- Packaged migrations run without repository-source fallback.
- All removed APIs are absent.
- Every coverage category is at least 80%.
- No blocker remains for a PASS verdict.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

## 6. Impacted Areas

### OpenCode

- Nuovo `.opencode/agents/migration-executor.md`.
- `architecture-planner` e `task-executor` riconoscono il nuovo dominio.
- È necessario riavviare OpenCode dopo la registrazione.

### Package e migrazioni

- Nuova cartella `migrations/` contenente:
  - collection `ng-update`;
  - bridge v22;
  - motore AST;
  - manifest simboli;
  - payload HTTP;
  - payload Forms e Material Forms;
  - fixture e test Node.
- `package.json`:
  - nuovo metadato `ng-update`;
  - nuovo comando `test-migrations`;
  - dipendenze runtime della migration;
  - rimozione delle peer dependency non più necessarie alla libreria.
- `ng-package.json`:
  - copia degli asset migration.
- Il tarball pubblicato deve contenere tutti gli artefatti senza dipendere da `src/app/inobeta-ui/`.

### Sorgente demo

- Nuovo `src/app/core/http/`.
- `src/app/app.config.ts` usa l’implementazione HTTP locale.

### API pubbliche rimosse

- Tutto il barrel `src/app/inobeta-ui/http/index.ts`.
- Tutto il barrel `src/app/inobeta-ui/ui/forms/index.ts`.
- Tutto il barrel `src/app/inobeta-ui/ui/material-forms/index.ts`.
- `IbTableDataSource`.
- `urlStateActions`.
- `IbTableQsParams`.
- `IbKaiTableParams`.
- `IbKaiTableNamedParams`.
- `ibTableSelectUrlState`.
- `ibTableSelectLastQueryStringRaw`.
- `ibTableSelectLastQueryString`.
- `IKaiTableStore`.
- `kaiTableReducers`.
- I metodi legacy di `IbTableUrlService`:
  - `getRawParams`;
  - `getFilters`;
  - `setFilters`;
  - `getActiveView`;
  - `setPaginator`;
  - `getPaginator`;
  - `setAggregatedColumns`;
  - `getAggregatedColumns`;
  - `setSort`;
  - `getSort`;
  - `handleViewChange`;
  - `getViewState`;
  - `setFilterAndSort`.

### API pubbliche mantenute

- `IbTableLocalDataSource`.
- `IbTableRemoteDataSource`.
- `tableStateActions`.
- `IbKaiTableRecord`.
- `IbKaiTableSnapshot`.
- Selector granulari e canonici.
- `IbTableUrlService.decodeUrlParams()`.
- `IbTableUrlService.writeState()`.
- Tutte le feature non coinvolte di `public_api.ts`.

### Utility di test

- `IbToolTestModule` resta presente e mantiene lo stesso nome.
- La deprecazione viene rimossa.
- Restano soltanto mock e provider usati dalle suite Modal e Toast.

### Aree deliberatamente non modificate

- Nessuna migrazione Formly.
- Nessuna modifica a Kai Table mobile.
- Nessuna modifica ai contratti canonical URL state.
- Nessun cambio alle soglie coverage.
- Nessun refactor generale Jasmine→Vitest.
- Nessun redesign del codice vendorizzato.

## 7. Risks

- **Il prompt potrebbe non essere disponibile in esecuzioni non-TTY.**
  - Mitigazione: preflight e stop senza modifiche quando esistono utilizzi da migrare; nessun default implicito distruttivo.
- **Import consumer non standard potrebbero non essere trasformabili.**
  - Mitigazione: AST, manifest espliciti, diagnostica con file e simboli, rollback completo.
- **Gli import misti potrebbero perdere alias o type-only semantics.**
  - Mitigazione: fixture dedicate e printer/range edit basati su AST.
- **Directory locali già esistenti potrebbero contenere personalizzazioni.**
  - Mitigazione: accettare solo file byte-identici; mai sovrascrivere differenze.
- **Il payload potrebbe divergere dal sorgente eliminato.**
  - Mitigazione: snapshot prima della cancellazione, test dist-only e smoke test dopo il package.
- **Le dipendenze del codice vendorizzato potrebbero non essere più garantite dal package.**
  - Mitigazione: manifest delle dipendenze runtime e aggiunta consumer mirata, incluso `jwt-decode`.
- **Il codice copiato diventa responsabilità del consumer.**
  - Rischio accettato: è la strategia fallback esplicitamente scelta per rimuovere feature non più mantenute.
- **La rimozione Table è una breaking change senza migrazione.**
  - Rischio accettato: ogni simbolo dispone già di alternativa canonica e l’utente ha approvato l’eliminazione diretta.
- **Il refactor da `IbTableDataSource` potrebbe cambiare sorting, filtering o aggregazione.**
  - Mitigazione: executor specializzato, test osservabili canonici e validazione integrata.
- **La rimozione degli handler `urlStateActions` potrebbe alterare URL state.**
  - Mitigazione: verificare che non esistano dispatch di produzione e mantenere test individuali su facade, actions, reducer, effects e codec canonici.
- **La rimozione di suite può modificare coverage.**
  - Mitigazione: soglie reali all’80%, test canonici conservati e full suite obbligatoria.
- **Il nuovo migration executor non viene caricato nella sessione corrente.**
  - Mitigazione: Step 1 separato e riavvio OpenCode obbligatorio prima di proseguire.
- **Workspace multi-project fuori da `src/app/` non possono usare la destinazione fissa.**
  - Mitigazione: rilevamento e stop; supporto multi-project resta fuori scope perché contraddirebbe la destinazione confermata.

## 8. Validation Checklist

- [ ] OpenCode è stato riavviato dopo la creazione di `migration-executor`.
- [ ] `migration-executor` appare nelle regole di routing.
- [ ] `npm ci --no-audit --no-fund` termina con exit code `0`.
- [ ] `npm run lint` termina con exit code `0`.
- [ ] `npm run test-migrations` termina con exit code `0`.
- [ ] Test engine: import misti, alias e `import type` vengono trasformati correttamente.
- [ ] Test engine: namespace, dynamic e deep import producono stop senza modifiche.
- [ ] Test engine: modalità non-TTY con utilizzi presenti produce stop senza modifiche.
- [ ] Test engine: collisioni differenti non sovrascrivono file.
- [ ] Test engine: seconda esecuzione non produce diff.
- [ ] Fixture HTTP accettata crea `src/app/core/http/`.
- [ ] Fixture Forms accettata crea `src/app/core/forms/` e `src/app/core/material-forms/`.
- [ ] Fixture rifiutata non modifica la relativa famiglia.
- [ ] Gli import misti conservano i simboli mantenuti da `@inobeta/ui`.
- [ ] `jwt-decode` viene aggiunto al consumer soltanto quando necessario.
- [ ] `npm run packagr` termina con exit code `0`.
- [ ] `dist/package.json` contiene `ng-update.migrations`.
- [ ] Il package contiene collection, bridge, engine, manifest e payload.
- [ ] Il package smoke test carica tutto esclusivamente da `dist/`.
- [ ] `npm pack --dry-run` include tutti gli asset migration.
- [ ] `npm run build` termina con exit code `0`.
- [ ] Il demo usa `src/app/core/http/`.
- [ ] Nessun demo import punta a `src/app/inobeta-ui/http/`.
- [ ] `public_api.ts` non esporta HTTP, Forms o Material Forms.
- [ ] Le directory libreria HTTP, Forms e Material Forms non esistono più.
- [ ] `@ngx-formly/core` non è installato o referenziato.
- [ ] Kai Table non contiene `IbTableDataSource`.
- [ ] Kai Table non contiene `urlStateActions`.
- [ ] Kai Table non esporta selector, tipi, metodi URL o store composite legacy.
- [ ] `IbTableLocalDataSource` e `IbTableRemoteDataSource` restano esportati.
- [ ] `tableStateActions` e i selector canonici restano esportati.
- [ ] `IbToolTestModule` resta usato dalle suite Modal e Toast.
- [ ] `IbToolTestModule` non è deprecato.
- [ ] I provider HTTP testing sono rimossi dal tool module se i test ne confermano l’inutilizzo.
- [ ] `npm run test-ci` termina con exit code `0`.
- [ ] Coverage statements ≥80%.
- [ ] Coverage branches ≥80%.
- [ ] Coverage functions ≥80%.
- [ ] Coverage lines ≥80%.
- [ ] Nessun test contiene focus o skip introdotti.
- [ ] `npm run build-storybook` termina con exit code `0`.
- [ ] Storybook non documenta le API rimosse come disponibili.
- [ ] Nessun marker `@deprecated` resta nel sorgente mantenuto o nei payload vendorizzati.
- [ ] Nessun accesso ad API private Angular o Material è stato introdotto.
- [ ] Sorting, filtering, pagination, aggregation, export, selection e URL state canonici mantengono i test osservabili.
