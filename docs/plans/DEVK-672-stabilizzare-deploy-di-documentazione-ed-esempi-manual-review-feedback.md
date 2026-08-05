# DEVK-672 — Documentazione versionata: indice grafico — Manual review remediation

## References

- Original plan: `devk-672-stabilizzare-deploy-di-documentazione-ed-esempi`.
- Review date: `2026-08-05`.
- Source: manual validation by the user.

## Verdict

**FAIL**

La validazione manuale conferma tutti i comportamenti funzionali; l’indice `/` del container docs necessita però di una presentazione grafica più curata. Nessun requisito originale è stato modificato.

## Manual review summary

L’utente ha verificato manualmente il deploy. Routing, versioni e contenuto funzionano come previsto. L’indice alla root del container docs, generato da `generate-index.sh`, resta però una pagina HTML visivamente scarna: elenco e link non hanno una gerarchia grafica curata. È richiesto uno sfondo scuro indipendente dal tema Angular, link semantici stilizzati come pulsanti e una palette sobria con colore, senza JavaScript, immagini, GIF o suoni.

## Reviewed steps

### Step 2 — Creare il runtime nginx per la documentazione versionata

- **Original plan state**: `[DONE]`
- **Reported behaviour**: l’indice `/` viene generato e serve correttamente le versioni, ma le presenta come un elenco di link con stile minimo.
- **Expected behaviour**: una landing page statica con fondo scuro, gerarchia visiva sobria e link alle versioni stilizzati come pulsanti. È una nuova necessità estetica non definita dal piano originale.
- **Classification**: `missing requirement`
- **Issues found**:
  - `[WARNING]` Il foglio di stile non definisce un layout scuro né trasforma i link delle versioni in controlli visivi distinti (`docker/docs/assets/index.css:1-37`, `docker/docs/assets/generate-index.sh:28-49`). Impact: chi apre la documentazione riceve un indice funzionale ma privo della presentazione richiesta. Recommendation: aggiornare esclusivamente il CSS della landing page, preservando markup, URL e comportamento dei link.

## Confirmed requirement changes

- None.

## Impact analysis

- **Other steps of the original plan**: Step 2 è l’unico step modificato. Steps 1 e 3-6 non sono coinvolti e restano validi.
- **Components that depend on the changed behaviour**: il solo indice statico del container docs. La copia dell’asset definita in `docker/docs/Dockerfile:5` e la location nginx in `docker/docs/assets/nginx.conf:18-20` continuano a servire lo stesso file.
- **Application state, contracts between modules, API surface, persistence**: Not affected.
- **Backward compatibility**: gli URL `/v/current/` e `/v/<version>/`, il markup semantico `<a>` e la generazione/ordinamento delle versioni restano invariati.
- **Automated tests and validations that assert the old behaviour**: non esiste un harness di test per la grafica dell’indice. Il build Docker e lo smoke test previsti dallo Step 2 restano la regressione funzionale; la resa grafica richiede verifica manuale nel browser.
- **Documentation**: Not affected. L’indice statico è il solo artefatto utente aggiornato.
- **Already-implemented features that keep working**: endpoint `/healthz`, messaggio per archivio vuoto, filtro delle directory, ordinamento semver, volume read-only, assenza di autoindex e assenza di fallback per asset mancanti devono restare invariati.
- **Scope size**: non materialmente maggiore della richiesta: serve una modifica CSS isolata, senza markup, script, container o CI.

## Assumptions

- None.

## Remediation plan

### Remediation 1 — Stilizzare l’indice delle versioni [agent: task-executor] [model: `openai/gpt-5.6-terra`] ✅ DONE [2026-08-05T09:13:36.572Z]

- **Dipendenze**: none.
- **File consentiti**: `docker/docs/assets/index.css`
- **Origine**: ordinary fix — missing requirement.

**Executor Input**:

~~~
## TASK:
Aggiorna lo stile dell’indice statico delle versioni Storybook.

## CONTEXT:
Lo Step 2 del piano DEVK-672 genera l’indice tramite `docker/docs/assets/generate-index.sh`; il markup esistente contiene `main`, `.intro`, `.versions`, `li` e link `a`. Il CSS attuale in `docker/docs/assets/index.css` è minimale. Il deploy e le funzionalità sono già corrette.

## OBJECTIVE:
Rendere l’indice `/` una landing page sobria a tema scuro, con ogni versione visualizzata come link semanticamente invariato ma stilizzato come pulsante.

## REQUIREMENTS:
1. Modifica solo `docker/docs/assets/index.css`: usa una palette dark generica e indipendente dal tema Angular, con accenti di colore sobri; crea gerarchia per pagina, contenitore, titolo, testo introduttivo ed elenco.
2. Rimuovi la presentazione da elenco nativo e rendi i link `.versions a` controlli tipo pulsante con padding, bordo, contrasto adeguato, stati hover e `:focus-visible` chiaramente distinguibili.
3. Mantieni leggibili `.empty` e layout responsive su viewport strette.
4. Non aggiungere JavaScript, immagini, GIF, suoni, font remoti, dipendenze o modifiche al markup.
5. Esegui la regressione funzionale disponibile: costruisci l’immagine docs e verifica che `/`, `/assets/index.css` e almeno una rotta `/v/<version>/` restino raggiungibili con una fixture di versioni.

## CONSTRAINTS:
- Non modificare `docker/docs/assets/generate-index.sh`, Dockerfile, nginx, Compose, CI o piano originale.
- Non cambiare gli URL, il testo, l’ordinamento, il filtro versioni o il comportamento di navigazione.
- I link devono restare elementi `<a>` navigabili, non pulsanti JavaScript.

## OUTPUT:
Riporta la modifica CSS, i comandi di verifica eseguiti e l’esito della verifica manuale della resa a viewport desktop e stretta.

## ACCEPTANCE CRITERIA:
- `docker build -f docker/docs/Dockerfile -t inobeta-ui-docs:review .` completa senza errori.
- Con una fixture montata, `/` continua a contenere link a `/v/current/` e/o alle versioni semver disponibili, `/assets/index.css` restituisce HTTP 200 e una rotta `/v/<version>/` serve la fixture.
- In browser, l’indice ha sfondo scuro, link versione con aspetto da pulsante, accenti di colore sobri e focus da tastiera visibile.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~
