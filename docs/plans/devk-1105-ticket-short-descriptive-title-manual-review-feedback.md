
# DEVK-1105 — Correggere l’export di selezione e pagina corrente — Manual review remediation

## References

- Original plan: `devk-1105-ticket-short-descriptive-title`.
- Review date: `2026-08-04`.
- Source: manual validation by the user.

## Verdict

**FAIL**

La validazione manuale del Full Example ha mostrato che il dialog di export si apre ma la conferma non scarica alcun file; manca un requisito che estenda al Full Example il pattern capability-aware già richiesto per l’API example. Nessun requisito originale è stato modificato e le parti del piano non coinvolte restano valide.

## Manual review summary

L’utente ha verificato manualmente gli example di `IbKaiTable`:

1. Nel Full Example ha aperto il dialog tramite il pulsante export.
2. Ha confermato l’esportazione, ma non è stato scaricato alcun file e non è comparso alcun errore visibile.
3. Negli example API e routing, la stessa operazione completa correttamente il download.
4. Il comportamento del Full Example era probabilmente preesistente, ma impedisce di usarlo per validare adeguatamente DEVK-1105.

L’ispezione degli example ha confermato che solo `kai-table-full-example.ts` usa direttamente `<ib-table-data-export-action />`. Gli example API e routing usano il marker capability-aware `ibTableAction` con `kind="export"`.

## Reviewed steps

### Step 8 — Rendere verificabile l’export nell’esempio API

- **Original plan state**: `[DONE]`
- **Reported behaviour**: l’API example aggiornato dallo Step 8 e l’example routing eseguono correttamente il download; il Full Example apre il dialog ma, dopo la conferma, non scarica il file.
- **Expected behaviour**: anche il Full Example deve attraversare l’integrazione capability-aware di `IbTable` e completare il download, così da poter essere usato nella verifica manuale di DEVK-1105. Questo non era richiesto esplicitamente dal piano originale: lo Step 8 limitava l’intervento all’API example.
- **Classification**: `missing requirement`.
- **Issues found**:
  - `[BLOCKER]` Il Full Example proietta `<ib-table-data-export-action />` dentro un’action generica priva di `kind="export"` (`src/app/examples/kai-table-example/kai-table-full-example.ts:38-40`). Il componente apre il dialog e, alla conferma, emette `ibDataExport` (`src/app/inobeta-ui/ui/data-export/table-data-export.component.ts:35-43`), ma nel template dell’example nessun listener riceve l’evento. Solo il percorso `ibTableAction` con `kind="export"` viene sostituito da `IbTable` con un componente collegato a `(ibDataExport)="doExport($event)"` (`src/app/inobeta-ui/ui/kai-table/table.component.html:6-14`). Impact: nel Full Example il dialog funziona, ma il servizio di esportazione non viene invocato e nessun file viene scaricato. Recommendation: adottare nel Full Example lo stesso marker capability-aware già presente negli example routing e API (`src/app/examples/kai-table-example/kai-table-with-routing.ts:36`, `src/app/examples/kai-table-example/server-side/kai-table-api-example.ts:26`).

## Confirmed requirement changes

- None.

## Impact analysis

- **Other steps of the original plan**: lo Step 8 necessita di un’estensione incrementale al Full Example. Gli Step 1–7 non richiedono modifiche; in particolare, il wiring capability-aware realizzato dallo Step 4 resta corretto e viene riutilizzato dalla remediation.
- **Components that depend on the changed behaviour**: soltanto `IbKaiTableFullExamplePage` deve cambiare il modo in cui dichiara l’action export. `IbTableDataExportAction`, `IbTable` e gli example API e routing non richiedono modifiche.
- **Application state**: Not affected.
- **Contracts between modules**: Not affected. Restano invariati il contratto `IbKaiTableAction.kind`, l’output `ibDataExport` e il servizio di export.
- **API surface**: Not affected. Non vengono aggiunti o modificati simboli pubblici.
- **Persistence**: Not affected.
- **Backward compatibility**: Not affected. Il componente export diretto rimane disponibile per consumatori che gestiscono esplicitamente il suo output; cambia soltanto un example che oggi lo usa senza listener.
- **Automated tests and validations that assert the old behaviour**: non esistono attualmente spec sotto `src/app/examples/`. Serve una copertura mirata che verifichi che il Full Example proietti un’action con `kind="export"`, oltre a `npm run build`. I test esistenti della libreria e delle remediation già applicate devono restare invariati e verdi.
- **Documentation**: Not affected. Non sono richieste modifiche alla documentazione o al piano originale.
- **Already-implemented features**: capability gating, selezione, export della pagina locale e remota, ordinamento, filtri, trasformazioni, rendering mobile e gli example API/routing devono continuare a funzionare senza modifiche.
- **Breadth of the fix**: l’ispezione completa di `src/app/examples/` ha trovato una sola occorrenza di `<ib-table-data-export-action />`, nel Full Example. Il lavoro non è materialmente più ampio di quanto segnalato: consiste in una sostituzione mirata del marker e nella relativa copertura di regressione.

## Assumptions

- None.

## Remediation plan

### Remediation 1 — Collegare il Full Example al percorso export di IbTable [agent: examples-executor] [model: openai/gpt-5.6-sol] ✅ DONE

- **Dipendenze**: none.
- **File consentiti**: `src/app/examples/kai-table-example/kai-table-full-example.ts`, `src/app/examples/kai-table-example/kai-table-full-example.spec.ts`
- **Origine**: `missing requirement` — ordinary fix; no confirmed requirement change.

~~~
## TASK:
Replace the unhandled direct export component in the Full Example with the canonical capability-aware `ibTableAction` export marker.

## CONTEXT:
Manual validation found that the Full Example opens the export dialog but downloads no file. At `src/app/examples/kai-table-example/kai-table-full-example.ts:38-40`, `<ib-table-data-export-action />` is rendered inside a generic action template. It emits `ibDataExport`, but the example does not handle that output. `IbTable` connects the event to `doExport()` only for an action whose kind is `export`, as implemented at `src/app/inobeta-ui/ui/kai-table/table.component.html:6-14`.

Original Step 8 required this canonical marker only in the API example. The API and routing examples already use it successfully; the Full Example was omitted from that requirement.

## OBJECTIVE:
Make the Full Example execute the table’s capability-aware export flow so confirming the dialog downloads the requested file.

## REQUIREMENTS:
1. Replace the generic action containing `<ib-table-data-export-action />` with an `ibTableAction` template whose kind is `export`, following the existing API and routing examples.
2. Keep `IbDataExportModule` and `IbTableActionModule` available; do not alter unrelated imports unless compilation proves one is redundant.
3. Add `src/app/examples/kai-table-example/kai-table-full-example.spec.ts`.
4. The regression spec must instantiate the Full Example with controlled user data and assert that its projected export action has `kind="export"` rather than being a default action containing an unhandled direct export component.
5. Preserve the Full Example’s selection action, refresh action, filters, columns, sorting, loading state, table definition, styles and data retrieval behaviour.
6. Do not modify the already-working API or routing examples.

## CONSTRAINTS:
- Do not modify library source under `src/app/inobeta-ui/`.
- Do not modify the original plan or its existing feedback document.
- Do not refactor unrelated example code.
- Do not add visible strings or translation keys.
- Do not change export formats, providers, capability rules or public APIs.
- Keep all unaffected DEVK-1105 requirements and previous remediations intact.
- Do not use `any`, `fit` or `fdescribe` in the new test.

## OUTPUT:
Report the template marker change, the regression scenario covered, all modified files and the exact verification results.

## ACCEPTANCE CRITERIA:
- `ng test --include='src/app/examples/kai-table-example/kai-table-full-example.spec.ts' --watch=false` passes with 0 failures.
- `npm run build` passes with 0 Angular or TypeScript errors.
- The Full Example contains an `ibTableAction` whose kind is `export`.
- The Full Example no longer directly renders `<ib-table-data-export-action />`.
- Manual verification confirms that opening the Full Example, choosing an export format and dataset, and confirming the dialog downloads a file.
- The API and routing examples remain unchanged and continue to export successfully.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~
