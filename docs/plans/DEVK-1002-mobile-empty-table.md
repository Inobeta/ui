# DEVK-1002 — Mobile: fallback tabella vuota

## 1. Goal

Risolvere il problema per cui `IbKaiTableMobileComponent`, in assenza di dati, occupa
uno spazio verticale fisso invece di collassare o mostrare un feedback visivo appropriato.
Come prerequisito, creare un esempio dedicato con 4 tabelle mobili vuote per rendere
il difetto riproducibile e verificare la fix visivamente.

---

## 2. Current State

### Componente libreria: `IbKaiTableMobileComponent`
- Percorso: `src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.ts`
- Quando `data()` è vuoto e le colonne sono definite, la condizione
  `@if (cardDataColumns().length || cardActionColumns().length)` è **vera** (dipende
  dalle colonne, non dai dati), quindi viene renderizzato il `div.ib-kai-table-mobile__content`
  con `padding: 4px 12px 12px` ma zero card al suo interno → spazio bianco fisso.
- Non esiste alcun template di empty-state né un input dedicato.
- Non esiste alcuna chiave i18n per un messaggio di "nessun dato".

### Esempio esistenti
- Tutte le pagine esempio esistenti caricano dati prima di renderizzare la tabella.
- Non esiste nessuna pagina che mostri lo stato vuoto della tabella mobile.

### Routing e menu
- Le route degli esempi si trovano in `src/app/routing.module.ts` sotto
  `home/kai-table/*`.
- Le voci di menu sono in `src/app/examples/main-menu-example/main-menu-data.json`.
- Le label menu usano chiavi i18n del tipo `examples.ibMainMenu.kaiTable*`
  definite in `src/assets/i18n/it.json`.

---

## 3. Assumptions / Open Questions

1. **Placeholder di default vs. input opzionale**: si assume che il placeholder
   (icona + messaggio) sia mostrato automaticamente dal componente mobile senza
   richiedere all'host di passare un template. Un futuro ticket potrà rendere il
   template personalizzabile.
2. **Il comportamento su tabella desktop** non è in scope: il ticket riguarda
   esplicitamente la versione mobile.
3. **Fix solo per `IbKaiTableMobileComponent`**: non toccare il componente desktop.
4. **`state === 'loading'`**: il placeholder non deve comparire mentre la tabella
   è in stato `loading`.

---

## 4. Proposed Approach

### Step 1 — Esempio con 4 tabelle vuote (prerequisito visivo)

Creare una nuova pagina esempio `IbKaiTableMobileEmptyExamplePage` che istanzia
4 `<ib-kai-table>` standard con colonne definite ma `data=[]`. Come tutti gli
altri esempi, la versione mobile (`IbKaiTableMobileComponent`) viene attivata
automaticamente via media query CSS a 767px dal componente desktop. Collegare la
pagina al router e al menu. Questo step permette di vedere il bug prima della fix
e verificare il risultato dopo.

### Step 2 — Empty-state placeholder nel componente mobile

Dentro `IbKaiTableMobileComponent`, aggiungere un blocco `@if` che si attiva
quando `visibleRows()` è vuoto **e** `state() !== 'loading'`. Il blocco mostra
una riga centrata con icona Material (`inbox` o `table_rows`) e una stringa
i18n. Aggiungere la chiave `kaiTable.emptyState` in `src/assets/i18n/it.json`.

### Step 3 — Test unitari

Scrivere spec per la nuova logica dell'empty-state: verificare che il placeholder
appaia con data vuoto in stato idle, non appaia con stato loading, non appaia
quando ci sono righe.

---

## 5. Step-by-Step Plan

---

### Step 1 — Nuovo esempio: 4 tabelle `ib-kai-table` vuote ✅ DONE

**Target executor:** `examples-executor`

**Allowed files:**
- `src/app/examples/kai-table-example/kai-table-mobile-empty-example.ts` *(nuovo)*
- `src/app/routing.module.ts`
- `src/app/examples/main-menu-example/main-menu-data.json`
- `src/assets/i18n/it.json` (solo chiave menu `kaiTableMobileEmpty`)

**Read-only reference files:**
- `src/app/examples/kai-table-example/kai-table-example.ts`
- `src/app/examples/kai-table-example/kai-table-example.html`
- `src/app/examples/kai-table-example/users.ts`
- `src/app/routing.module.ts` (struttura route esistente)
- `src/app/examples/main-menu-example/main-menu-data.json`
- `src/assets/i18n/it.json`

**Executor Input:**

~~~
## TASK:
Creare un esempio con 4 tabelle `ib-kai-table` vuote per mostrare il comportamento
di IbKaiTableMobileComponent (integrato in ib-kai-table) quando non ci sono dati.

## CONTEXT:
- Library Angular in `src/app/inobeta-ui/`
- Esempi in `src/app/examples/kai-table-example/`
- Route in `src/app/routing.module.ts` sotto `home/kai-table`
- Menu in `src/app/examples/main-menu-example/main-menu-data.json`
- i18n in `src/assets/i18n/it.json`
- Le route kai-table esistenti seguono il pattern `{ path: 'xxx', data: { breadcrumb: 'Yyy' }, component: SomeComponent }`.
- `IbKaiTableModule` è importabile da `public_api` e include sia il componente
  desktop che quello mobile; il CSS del componente `ib-kai-table` nasconde la
  versione desktop sotto 767px e mostra quella mobile tramite media query. Non
  occorre usare `ib-kai-table-mobile` direttamente.

## OBJECTIVE:
1. Creare `src/app/examples/kai-table-example/kai-table-mobile-empty-example.ts`
   con un componente standalone `IbKaiTableMobileEmptyExamplePage` che mostri
   4 istanze di `<ib-kai-table>` in colonna, ciascuna con:
   - `[data]="[]"` (array vuoto)
   - `[state]="'idle'"`
   - almeno 2 colonne `<ib-text-column>` (es. `name`, `fruit`)
   - ogni tabella deve avere un `tableName` univoco per evitare conflitti di stato
     nel NgRx store (es. `emptyTable1`, `emptyTable2`, ecc.)
   - un titolo/intestazione sopra ogni tabella (testo statico va bene nell'esempio)
2. Aggiungere la route
   `{ path: 'mobile-empty', data: { breadcrumb: 'Mobile Empty' }, component: IbKaiTableMobileEmptyExamplePage }`
   nell'array figli di `home/kai-table` in `src/app/routing.module.ts`.
3. Aggiungere una voce nel menu in `main-menu-data.json`:
   `{ "label": "examples.ibMainMenu.kaiTableMobileEmpty", "link": "/home/kai-table/mobile-empty" }`
4. Aggiungere la chiave i18n in `src/assets/i18n/it.json`:
   `"kaiTableMobileEmpty": "Empty Tables"` sotto `examples.ibMainMenu`.

## REQUIREMENTS:
1. Il componente `IbKaiTableMobileEmptyExamplePage` deve essere standalone.
2. Deve importare `IbKaiTableModule` da `public_api`.
3. Deve usare `[data]="[]"` per tutte e 4 le tabelle.
4. Ogni `<ib-kai-table>` deve avere un attributo `tableName` univoco.
5. Il selettore del componente deve essere `ib-kai-table-mobile-empty-example`.
6. Non introdurre nuove dipendenze npm.
7. Non modificare file della libreria in `src/app/inobeta-ui/`.

## CONSTRAINTS:
- NON usare `<ib-kai-table-mobile>` direttamente: usare `<ib-kai-table>` come
  tutti gli altri esempi.
- NON modificare `public_api.ts`.
- NON toccare altri esempi esistenti.
- NON aggiungere logica complessa; l'esempio deve essere minimale.

## OUTPUT:
- File `src/app/examples/kai-table-example/kai-table-mobile-empty-example.ts` creato.
- `src/app/routing.module.ts` aggiornato con la nuova route.
- `src/app/examples/main-menu-example/main-menu-data.json` aggiornato con la voce menu.
- `src/assets/i18n/it.json` aggiornato con la chiave `kaiTableMobileEmpty`.

## ACCEPTANCE CRITERIA:
- `npm run lint` non produce nuovi errori.
- `grep "mobile-empty" src/app/routing.module.ts` ha almeno un match.
- `grep "kaiTableMobileEmpty" src/app/examples/main-menu-example/main-menu-data.json` ha almeno un match.
- `grep "kaiTableMobileEmpty" src/assets/i18n/it.json` ha almeno un match.
- Il file `kai-table-mobile-empty-example.ts` non contiene `ib-kai-table-mobile` nel template.
- Il componente naviga correttamente a `/home/kai-table/mobile-empty` nell'app demo.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 2 — Empty-state placeholder in `IbKaiTableMobileComponent` ✅ DONE

**Dipende da:** Step 1 (il bug è già visibile nell'esempio creato)

**Target executor:** `kai-table-mobile-executor`

**Allowed files:**
- `src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.ts`
- `src/assets/i18n/it.json`

**Read-only reference files:**
- `src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.ts` (struttura corrente)
- `src/assets/i18n/it.json`

**Executor Input:**

~~~
## TASK:
Aggiungere un placeholder di empty-state a `IbKaiTableMobileComponent` quando
non ci sono righe da mostrare.

## CONTEXT:
- File: `src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.ts`
- Il componente è standalone e usa la sintassi `@if` / `@for` (Angular 17+).
- Attualmente quando `visibleRows()` è vuoto ma le colonne sono definite,
  il `div.ib-kai-table-mobile__content` viene comunque renderizzato perché
  la condizione `@if (cardDataColumns().length || cardActionColumns().length)`
  dipende dalle colonne, non dai dati. Risultato: un div vuoto con padding
  occupa spazio visivo.
- Chiave i18n da aggiungere: `kaiTable.emptyState` in `src/assets/i18n/it.json`
  con valore italiano `"Nessun dato disponibile"`.
- Il componente importa già `MatProgressBar`; può importare `MatIconModule` e
  `TranslatePipe` / `TranslateModule` (peer dep già presente).

## OBJECTIVE:
1. Aggiungere nel template, dentro `.ib-kai-table-mobile__content`, un blocco
   `@if (visibleRows().length === 0 && state() !== 'loading')` che mostri:
   - un `<mat-icon>` (es. `inbox`) centrato
   - un testo tradotto con chiave `kaiTable.emptyState` tramite `TranslatePipe`
   Esempio struttura HTML minima:
   ```html
   @if (visibleRows().length === 0 && state() !== 'loading') {
     <div class="ib-kai-table-mobile__empty-state">
       <mat-icon>inbox</mat-icon>
       <span>{{ 'kaiTable.emptyState' | translate }}</span>
     </div>
   }
   ```
2. Aggiungere CSS per `.ib-kai-table-mobile__empty-state` negli stili del
   componente:
   - `display: flex; flex-direction: column; align-items: center; justify-content: center;`
   - `padding: 32px 16px; gap: 8px;`
   - colore testo: `var(--ib-mobile-text-muted)`
3. Aggiungere i moduli/pipe mancanti negli `imports` del componente
   (`MatIconModule`, `TranslatePipe` o `TranslateModule`).
4. Aggiungere la chiave `"emptyState": "Nessun dato disponibile"` dentro
   il blocco `kaiTable` in `src/assets/i18n/it.json`.

## REQUIREMENTS:
1. L'empty-state NON deve apparire mentre `state() === 'loading'`.
2. L'empty-state NON deve apparire se `visibleRows().length > 0`.
3. L'empty-state DEVE apparire quando `data` è array vuoto in stato `idle`.
4. Il placeholder deve usare `TranslatePipe` con la chiave `kaiTable.emptyState`,
   non stringhe hardcoded in template.
5. Nessuna modifica all'API pubblica del componente (nessun nuovo `@Input`).
6. Non modificare `public_api.ts`.

## CONSTRAINTS:
- NON modificare altri componenti mobile (`table-mobile-item`, `table-mobile-toolbar`, ecc.).
- NON cambiare la logica di `visibleRows()`, `cardDataColumns()`, o `hasMoreRows()`.
- NON aggiungere dipendenze npm.
- Mantenere il componente standalone.

## OUTPUT:
- `table-mobile.component.ts` aggiornato con il blocco empty-state nel template,
  i CSS relativi e gli import aggiornati.
- `src/assets/i18n/it.json` aggiornato con la chiave `kaiTable.emptyState`.

## ACCEPTANCE CRITERIA:
- `npm run lint` non produce nuovi errori.
- `grep -r "emptyState" src/assets/i18n/it.json` ha almeno un match.
- `grep -r "ib-kai-table-mobile__empty-state" src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.ts` ha almeno un match.
- Navigando a `/home/kai-table/mobile-empty` nell'app demo, le 4 tabelle vuote
  mostrano l'icona e il testo "Nessun dato disponibile" invece di spazio bianco.
- Con `state='loading'` il placeholder NON è visibile (la progress bar è al suo posto).

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 3 — Unit test per l'empty-state ✅ DONE

**Dipende da:** Step 2

**Target executor:** `unit-jasmine-executor`

**Allowed files:**
- `src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.spec.ts` *(nuovo o esistente)*

**Read-only reference files:**
- `src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.ts`
- `src/app/inobeta-ui/ui/kai-table-mobile/index.ts`

**Executor Input:**

~~~
## TASK:
Scrivere test unitari Karma/Jasmine per il nuovo comportamento empty-state
di `IbKaiTableMobileComponent`.

## CONTEXT:
- Componente: `src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.ts`
- Il componente è standalone, quindi in TestBed si usa `imports: [IbKaiTableMobileComponent, ...]`.
- Aggiungere `NoopAnimationsModule` e `TranslateModule.forRoot()` ai provider di test.
- Il componente ha un input `state` (tipo `IbKaiTableState`: 'idle' | 'loading') e
  un `dataSource` (IbTableDataSource). Per i test dell'empty-state è sufficiente
  far sì che `visibleRows()` ritorni `[]` senza collegare un vero DataSource;
  si può impostare `data` signal direttamente via `componentInstance.data.set([])`.

## OBJECTIVE:
Creare `src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.spec.ts`
(o aggiornarlo se già esiste) con una suite `describe('empty state', ...)` che copra:

1. **Mostra placeholder** quando `data = []` e `state = 'idle'`:
   - Verificare che l'elemento `.ib-kai-table-mobile__empty-state` sia presente nel DOM.

2. **Nasconde placeholder** quando `data` ha almeno una riga e `state = 'idle'`:
   - Verificare che `.ib-kai-table-mobile__empty-state` NON sia nel DOM.

3. **Nasconde placeholder durante loading** quando `data = []` e `state = 'loading'`:
   - Verificare che `.ib-kai-table-mobile__empty-state` NON sia nel DOM.

## REQUIREMENTS:
1. Usare `TestBed.configureTestingModule` con `imports: [IbKaiTableMobileComponent, NoopAnimationsModule, TranslateModule.forRoot()]`.
2. I test devono essere `fakeAsync` / `fixture.detectChanges()` dove necessario.
3. Usare `fixture.nativeElement.querySelector('.ib-kai-table-mobile__empty-state')` per assertion DOM.
4. Fornire colonne minimali tramite l'input `columns` per attivare la sezione content
   (almeno una `IbColumn` con `name` e `isActionColumn = false`).

## CONSTRAINTS:
- NON modificare `table-mobile.component.ts`.
- NON aggiungere `fdescribe` o `fit`.
- NON testare logica non correlata all'empty-state.

## OUTPUT:
- File spec creato/aggiornato con la suite `describe('empty state', ...)`.

## ACCEPTANCE CRITERIA:
- `ng test --include='src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.spec.ts' --watch=false` completa senza errori.
- I 3 test della suite `empty state` risultano PASSED.
- `npm run test-ci` mantiene la copertura ≥ 80%.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

## 6. Impacted Areas

| File | Tipo di modifica |
|---|---|
| `src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.ts` | Aggiunta empty-state nel template + CSS + import |
| `src/app/examples/kai-table-example/kai-table-mobile-empty-example.ts` | Nuovo file |
| `src/app/routing.module.ts` | Nuova route `mobile-empty` |
| `src/app/examples/main-menu-example/main-menu-data.json` | Nuova voce menu |
| `src/assets/i18n/it.json` | Nuova chiave `kaiTable.emptyState` + `examples.ibMainMenu.kaiTableMobileEmpty` |
| `src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.spec.ts` | Nuovo spec |

**Simboli pubblici toccati:** nessuno (nessun nuovo `@Input` pubblico, nessuna modifica a `public_api.ts`).

---

## 7. Risks

| Rischio | Probabilità | Mitigazione |
|---|---|---|
| Il blocco empty-state appare anche con `cardDataColumns().length === 0` (nessuna colonna definita) | Bassa | La condizione outer `@if (cardDataColumns().length \|\| cardActionColumns().length)` protegge già; il placeholder è dentro quel blocco |
| `TranslatePipe` non è ancora negli `imports` del componente standalone | Media | Step 2 richiede esplicitamente di aggiungerlo |
| L'icona `inbox` potrebbe non essere disponibile nel tema Material configurato | Bassa | Si può usare `table_rows` che è già usato nel menu |
| Il test potrebbe non attivare il rendering del `content` div senza colonne | Media | Step 3 richiede di fornire colonne minimali nell'input `columns` |

---

## 8. Validation Checklist

- [ ] `npm run lint` — zero nuovi warning/errori
- [ ] `npm run test-ci` — tutti i test passano, copertura ≥ 80%
- [ ] Navigazione manuale a `/home/kai-table/mobile-empty`: 4 tabelle vuote mostrano il placeholder
- [ ] Navigazione manuale a un esempio esistente con dati (es. `/home/kai-table/full`): nessun placeholder visibile
- [ ] Con `state = 'loading'` (es. al primo caricamento di `/home/kai-table/full`): nessun placeholder visibile, solo progress bar
