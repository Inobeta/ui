# DEVK-908 — Pulizia demo e note di rilascio v22 — Manual review remediation

## References

- Original plan: `devk-908-migrare-e-rimuovere-le-api-deprecate-in-v22`.
- Review date: `2026-08-07`.
- Source: manual validation by the user.

## Verdict

**FAIL**

La verifica manuale della UI e dei sorgenti ha confermato il corretto funzionamento visibile, ma ha rilevato un fallback HTTP locale non necessario come feature del demo e documentazione v22 incompleta o obsoleta; due modifiche circoscritte ai requisiti originali sono state confermate dall’utente.

## Manual review summary

L’utente ha verificato manualmente la UI, senza trovare regressioni funzionali, e ha poi ispezionato i file sorgente per individuare code smell e codice morto.

Ha osservato:

- la presenza di `src/app/core/http/`, apparentemente equivalente al risultato della migrazione HTTP applicata al repository stesso;
- l’assenza di consumer diretti delle API `IbHttpModule` sotto `src/app/examples/`;
- l’assenza, in `whats_new.mdx`, dell’elenco delle compatibility API Kai Table rimosse in v22;
- il mantenimento dell’etichetta Storybook `Forms (new)`, nonostante i precedenti Forms siano stati rimossi.

L’aspettativa è che il demo non conservi localmente una feature HTTP che non espone direttamente negli esempi, che le breaking change Kai Table siano dichiarate nelle note di rilascio e che la feature Forms mantenuta sia denominata semplicemente `Forms`.

## Reviewed steps

### Step 7 — Spostare HTTP nel core del demo

- **Original plan state**: `[DONE]`
- **Reported behaviour**: il repository contiene l’intero payload HTTP sotto `src/app/core/http/`; `app.config.ts` registra modulo, interceptor, store ed effects HTTP anche se nessun esempio importa direttamente queste API.
- **Expected behaviour**: il demo deve mantenere soltanto `HttpClient` necessario alle traduzioni e al data source GitHub, senza conservare la feature HTTP rimossa dalla libreria.
- **Classification**: `requirement change`
- **Issues found**:
  - `[WARNING]` Il fallback HTTP locale occupa circa trenta file ed estende la configurazione globale con token, stato NgRx, effects e hydration non consumati direttamente dagli esempi (`src/app/app.config.ts:9-14`, `src/app/app.config.ts:29-33`, `src/app/app.config.ts:39-45`, `src/app/app.config.ts:53-65`). Impact: aumenta il codice mantenuto dal demo e rende meno chiara la separazione tra package, migration payload e applicazione di esempio. Recommendation: eliminare la copia locale e tutte le registrazioni specifiche, preservando `provideHttpClient(withXhr())`.
  - `[WARNING]` La copia non è completamente inerte: `IbHttpModule` registra tre interceptor globali (`src/app/core/http/http.module.ts:83-86`) che agiscono sul `HttpClient` usato dal data source GitHub (`src/app/examples/kai-table-example/server-side/github-data-source.ts:37`, `src/app/examples/kai-table-example/server-side/github-data-source.ts:61-69`). L’auth interceptor modifica gli header (`src/app/core/http/http/auth.interceptor.ts:29-56`), il loader ritarda le risposte e aggiorna lo store (`src/app/core/http/http/loader.interceptor.ts:23-56`) e l’error interceptor mostra toast (`src/app/core/http/http/error.interceptor.ts:22-64`). Impact: la rimozione è più ampia di una semplice pulizia di file e richiede una verifica manuale del server-side example.

### Step 8 — Rimuovere documentazione e stories legacy

- **Original plan state**: `[DONE]`
- **Reported behaviour**: la feature mantenuta `forms-utilities` continua a comparire nella navigazione Storybook come `Forms (new)`.
- **Expected behaviour**: la navigazione deve usare il nome `Forms`, perché i precedenti Forms e Material Forms non fanno più parte della libreria.
- **Classification**: `requirement change`
- **Issues found**:
  - `[WARNING]` Il qualificatore `(new)` è rimasto sia nella guida sia nella story (`src/app/inobeta-ui/ui/forms-utilities/forms.mdx:4`, `src/app/inobeta-ui/ui/forms-utilities/form.stories.ts:36-38`). Impact: Storybook suggerisce ancora la coesistenza con una precedente feature Forms, mentre quella superficie è stata rimossa. Recommendation: rinominare esclusivamente i due metadata title, senza modificare contenuto o comportamento delle forms utilities.

### Step 13 — Rimuovere le API compatibility Kai Table

- **Original plan state**: `[DONE]`
- **Reported behaviour**: `whats_new.mdx` dichiara soltanto la rimozione di HTTP, Forms e Material Forms (`src/whats_new.mdx:11-14`), senza menzionare le breaking change Kai Table.
- **Expected behaviour**: le note della versione 22 devono indicare le compatibility API Kai Table eliminate e le alternative canoniche mantenute.
- **Classification**: `missing requirement`
- **Issues found**:
  - `[WARNING]` Le note di rilascio omettono la rimozione di `IbTableDataSource`, `urlStateActions`, tipi e selector URL legacy, metodi legacy di `IbTableUrlService`, `IKaiTableStore` e `kaiTableReducers` (`src/whats_new.mdx:7-14`). Impact: un consumer può scoprire le breaking change soltanto tramite errori di compilazione o altra documentazione. Recommendation: aggiungere una sezione Kai Table concisa che riporti i simboli rimossi, le alternative canoniche e l’assenza di una migration consumer per tali API.

## Confirmed requirement changes

### Change 1 — Non vendorizzare HTTP nel demo

- **Original requirement**: Step 7 richiedeva di copiare il payload HTTP in `src/app/core/http/`, importare `IbHttpModule` dal barrel locale e conservare provider, interceptor, guard, store, loader e opzioni HTTP esistenti.
- **New behaviour required**: eliminare dal demo la copia HTTP locale e le registrazioni specifiche non richieste dagli esempi, mantenendo il solo client HTTP Angular necessario.
- **Nature of the contradiction**: il requisito originale impone la presenza e la registrazione del fallback locale; il nuovo comportamento ne richiede la rimozione. Le due condizioni non possono coesistere.
- **Confirmed by the user**: “non mi sembra che serva questa cartella in questo progetto” e, dopo la verifica, “Si corretto, questo è il problema, più una cosa di ordine che altro infatti”.
- **Parts of the original plan this invalidates**: Step 7; la precedente evidenza integrata dello Step 17 deve essere rieseguita limitatamente a build, test e comportamento del demo.

### Change 2 — Rinominare Forms (new)

- **Original requirement**: Step 8, requisito 5, richiedeva di conservare invariati contenuti e stories delle feature mantenute.
- **New behaviour required**: modificare i metadata Storybook della feature mantenuta da `Forms (new)` a `Forms`.
- **Nature of the contradiction**: il requisito originale impediva modifiche alle stories mantenute; il nuovo comportamento richiede una modifica mirata ai loro titoli.
- **Confirmed by the user**: “l'indicazione "Forms (new)" può diventare Forms e basta visto che i forms vecchi li abbiamo cestinati”.
- **Parts of the original plan this invalidates**: Step 8, requisito 5, esclusivamente per i metadata title di `forms-utilities`; la precedente validazione Storybook dello Step 17 deve essere rieseguita.

## Impact analysis

- **Other steps of the original plan**:
  - Step 7 viene sostituito limitatamente all’integrazione HTTP del demo.
  - Step 8 viene esteso con la rinomina della feature Forms mantenuta e con note di rilascio complete.
  - Step 13 resta funzionalmente valido: nessuna API Kai Table viene ripristinata; cambia soltanto la documentazione della rimozione.
  - Step 17 deve rieseguire build, test e Storybook sulle modifiche.
  - Steps 1-6 e la migration HTTP consumer non sono interessati: collection, engine, prompt, payload e destinazione consumer `src/app/core/http/` devono restare invariati.
  - Steps 9-16, salvo la documentazione collegata, restano validi e non vengono riaperti.

- **Components that depend on the changed behaviour**:
  - Il server-side Kai Table example usa `HttpClient` per GitHub e deve continuare a caricare dati.
  - Il translate loader usa `HttpClient` e deve continuare a caricare le traduzioni.
  - Nessuna route usa `IbAuthGuard`, `IbLoginGuard` o `IbRoleGuard` (`src/app/routing.module.ts:21-114`).
  - Nessun componente example importa direttamente simboli dal fallback HTTP.
  - Modal, Toast, Kai Table locale, export e altre feature: Not affected.

- **Application state, contracts between modules, API surface, persistence**:
  - Vengono rimossi dal demo `ibSessionFeature`, `ibLoaderFeature`, `ibHttpEffects` e la chiave hydration `ibHttpSessionState`.
  - Viene eliminato il contratto interno tra `app.config.ts` e il barrel `src/app/core/http`.
  - La public API di `@inobeta/ui`: Not affected.
  - Il contratto della migration consumer e i payload pubblicati: Not affected.
  - Le altre chiavi hydration, incluso `exampleLazyFeature` e `ibTable`, devono restare invariate.

- **Backward compatibility**:
  - Consumer della libreria: Not affected.
  - Demo interno: la rimozione disattiva gli interceptor globali che oggi aggiungono header, ritardano le risposte, aggiornano lo stato loader e mostrano toast sugli errori HTTP.
  - Questa conseguenza rende la correzione materialmente più ampia di quanto suggerisse la descrizione “codice morto”: non esistono consumer diretti, ma esiste un effetto indiretto attraverso la dependency injection globale.
  - Il funzionamento positivo del server-side example deve essere preservato; non va ricreata un’infrastruttura HTTP equivalente senza un requisito esplicito.

- **Automated tests and validations that assert the old behaviour**:
  - Non risultano test applicativi che asseriscano lo stato HTTP locale o gli interceptor del demo.
  - Devono essere rieseguiti `npm run build`, `npm run test-ci` e `npm run build-storybook`.
  - Una verifica strutturale deve assicurare l’assenza di `src/app/core/http/` e dei provider rimossi.
  - Serve una verifica manuale della route Kai Table server-side che interroga GitHub.

- **Documentation**:
  - `whats_new.mdx` deve documentare le breaking change Kai Table.
  - I due title Storybook delle forms utilities devono perdere `(new)`.
  - Guide Kai Table, migration payload docs e Getting Started: Not affected.

- **Already-implemented features that keep working**:
  - UI verificata manualmente, build della libreria, migration HTTP/Forms, Kai Table canonica, Storybook e forms utilities devono continuare a funzionare.
  - La presente review è circoscritta ai tre problemi riportati e non invalida il resto del piano originale.

## Assumptions

- None.

## Remediation plan

### Remediation 1 — Rimuovere il fallback HTTP inutilizzato dal demo [agent: task-executor] [model: openai/gpt-5.6-sol] ✅ DONE [2026-08-07T14:28:13.525Z]

- **Dipendenze**: none.
- **File consentiti**: `src/app/app.config.ts`, `src/app/core/http/**`
- **Origine**: `requirement change (Change 1)`

~~~
## TASK:
Remove the demo-local HTTP fallback and its application registrations while retaining the standard Angular HttpClient required by the demo.

## CONTEXT:
Original Step 7 copied the migration HTTP payload into `src/app/core/http/` and registered it from `src/app/app.config.ts`. Manual source review found no direct example consumer. The module is nevertheless globally active through interceptors registered at `src/app/core/http/http.module.ts:83-86`, and the GitHub data source uses Angular HttpClient at `src/app/examples/kai-table-example/server-side/github-data-source.ts:37,61-69`.

## OBJECTIVE:
Keep the demo buildable and its GitHub/translation HTTP access functional without maintaining or registering the removed library HTTP feature locally.

## REQUIREMENTS:
1. Delete `src/app/core/http/` completely.
2. Remove from `app.config.ts` the local HTTP barrel import, `IbHttpModule`, `ibHttpEffects`, `ibLoaderFeature`, `ibSessionFeature`, and their provider registrations.
3. Remove HTTP-feature-only injection tokens, `statusErrorMessages`, and the `ibHttpSessionState` hydration key when they become unused.
4. Remove imports made unused by this cleanup, including `importProvidersFrom` and `provideState` only if they have no remaining consumer.
5. Preserve `provideHttpClient(withXhr())`, because translations and the GitHub data source still use Angular HttpClient.
6. Preserve all non-HTTP hydration keys, store setup, router setup, translations, animations and data-export providers.
7. Do not add replacement auth, loader or error-interceptor infrastructure.
8. No new unit spec is required: this is a structural cleanup. Use the production build, full test suite, static absence assertions and manual server-side example verification as regression coverage.

## CONSTRAINTS:
- Do not modify `migrations/` or the vendored HTTP migration payload.
- Do not restore HTTP to the library public API.
- Do not modify example components, Kai Table, translations or retained library features.
- Do not refactor unrelated application configuration.
- Stop if the demo cannot access GitHub or translations with the standard Angular HttpClient alone.

## OUTPUT:
Report deleted files, removed providers/imports/state, retained HttpClient configuration, command results and manual GitHub example result.

## ACCEPTANCE CRITERIA:
- `npm run build` exits 0.
- `npm run test-ci` exits 0.
- `test ! -d src/app/core/http` exits 0.
- `rg 'core/http|IbHttpModule|ibHttpEffects|ibLoaderFeature|ibSessionFeature|ibHttpSessionState|ibHttpToast|ibHttpUrlExcludedFromLoader|HttpMode' src/app/app.config.ts` returns no match.
- `rg 'provideHttpClient' src/app/app.config.ts` confirms the Angular HttpClient provider remains.
- The Kai Table server-side GitHub example still completes a successful data request.
- Translation loading still succeeds.
- Migration tests and migration payload files remain byte-unmodified.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 2 — Documentare le rimozioni Kai Table in What's New [agent: storybook-executor] [model: openai/gpt-5.6-sol] ✅ DONE [2026-08-07T14:29:08.510Z]

- **Dipendenze**: none.
- **File consentiti**: `src/whats_new.mdx`
- **Origine**: `missing requirement`

~~~
## TASK:
Add the missing Kai Table v22 breaking removals and canonical replacements to What's New.

## CONTEXT:
Original Step 13 removed deprecated Kai Table compatibility APIs, but `src/whats_new.mdx:11-14` currently documents only HTTP, Forms and Material Forms removals. The runtime/API removal itself is complete and must not be changed.

## OBJECTIVE:
Make the v22 release notes accurately describe all relevant Kai Table breaking removals and direct consumers to the retained canonical APIs.

## REQUIREMENTS:
1. Add a concise Kai Table entry under Version 22.0.0.
2. State that `IbTableDataSource` was removed in favor of `IbTableLocalDataSource`.
3. State that `urlStateActions` was removed in favor of `tableStateActions`.
4. Cover the removed legacy URL types/selectors, `IKaiTableStore`, `kaiTableReducers`, and legacy `IbTableUrlService` methods.
5. Identify `IbKaiTableRecord`, `IbKaiTableSnapshot`, granular canonical selectors, `decodeUrlParams()` and `writeState()` as retained alternatives where applicable.
6. Make clear that these Kai Table compatibility APIs do not receive the HTTP/Forms vendoring migration.
7. Preserve the existing HTTP and Forms removal notes.
8. Use existing technical symbol names; do not invent aliases or migration support.
9. Use `npm run build-storybook` plus a symbol-presence assertion as documentation regression coverage.

## CONSTRAINTS:
- Modify only `src/whats_new.mdx`.
- Do not change production code, public exports, stories or migration code.
- Do not restore removed compatibility APIs.
- Do not broaden the release notes into unrelated editorial changes.

## OUTPUT:
Report the documented removals, canonical replacements and Storybook build result.

## ACCEPTANCE CRITERIA:
- `npm run build-storybook` exits 0.
- `src/whats_new.mdx` names `IbTableDataSource`, `IbTableLocalDataSource`, `urlStateActions` and `tableStateActions`.
- The release notes cover legacy URL selectors/types, composite store exports and legacy URL-service methods.
- Existing HTTP, Forms and Material Forms migration guidance remains present and unchanged in meaning.
- No production or migration file is modified.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 3 — Rinominare Forms (new) in Forms [agent: storybook-executor] [model: openai/gpt-5.6-sol] ✅ DONE [2026-08-07T14:29:52.388Z]

- **Dipendenze**: none.
- **File consentiti**: `src/app/inobeta-ui/ui/forms-utilities/forms.mdx`, `src/app/inobeta-ui/ui/forms-utilities/form.stories.ts`
- **Origine**: `requirement change (Change 2)`

~~~
## TASK:
Remove the obsolete `(new)` qualifier from the maintained Forms Storybook titles.

## CONTEXT:
The old Forms and Material Forms library features were removed by DEVK-908. The maintained forms-utilities guide and story still use `Components/Forms (new)` at `forms.mdx:4` and `form.stories.ts:36-38`.

## OBJECTIVE:
Present the retained forms utilities under `Components/Forms` without changing their content or behavior.

## REQUIREMENTS:
1. Change the guide metadata title from `Components/Forms (new)/Guide` to `Components/Forms/Guide`.
2. Change the story title from `Components/Forms (new)` to `Components/Forms`.
3. Preserve all story components, examples, imports, controls and guide content.
4. Use the Storybook build and an absence assertion for `Forms (new)` as regression coverage.

## CONSTRAINTS:
- Modify only the two allowed files.
- Do not rename files, classes, selectors, exports or public API symbols.
- Do not alter Forms behavior or documentation content beyond the two titles.
- Do not reintroduce or reference the removed Forms and Material Forms modules.

## OUTPUT:
Report both title changes and the Storybook build result.

## ACCEPTANCE CRITERIA:
- `npm run build-storybook` exits 0.
- `rg 'Forms \(new\)' src/app/inobeta-ui/ui/forms-utilities` returns no match.
- Storybook exposes the story at `Components/Forms` and the guide at `Components/Forms/Guide`.
- No Forms implementation, public API or example behavior changes.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~
