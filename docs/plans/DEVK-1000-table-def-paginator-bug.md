# DEVK-1000 — Fix `tableDef` paginator not applied correctly

## 1. Goal

Correggere due bug distinti che, combinati, causano il mancato rispetto delle opzioni
`paginator.pageSize`, `paginator.pageSizeOptions` e `paginator.showFirstLastButtons`
passate tramite l'input `[tableDef]` di `ib-kai-table`.

**Comportamento desiderato:**
- Il `pageSize` esplicitato dal developer in `tableDef` viene rispettato.
- Se il developer non specifica `pageSize`, il fallback è `20` (default attuale).
- Se l'utente ha già interagito con il paginatore (URL contiene lo stato salvato),
  quel valore ha la precedenza sul default di `tableDef` — ma non sul fallback di `20`
  simulato da `getRawParams` quando l'URL non esiste.
- `pageSizeOptions` e `showFirstLastButtons` non vengono persi se il developer
  specifica solo alcune proprietà del paginator.

**Sintomi osservati:**
```html
<!-- pageSize rimane 20, non 100 -->
[tableDef]="{paginator: {hide: true, pageSize: 100}}"

<!-- pageSize è rispettato ma il dropdown delle opzioni sparisce -->
[tableDef]="{paginator: {hide: false, pageSize: 50}}"
```

---

## 2. Current State

### File coinvolti
- `src/app/inobeta-ui/ui/kai-table/table.component.ts`
- `src/app/inobeta-ui/ui/kai-table/table-url.service.ts`

### Bug 1 — Shallow merge nel setter `tableDef` (table.component.ts, riga ~152)

```typescript
set tableDef(value: Partial<IbTableDef>) {
  this._tableDef = {
    ...defaultTableDef,
    ...value,           // ← shallow: value.paginator SOSTITUISCE defaultTableDef.paginator
  };
}
```

Quando il consumer passa `{paginator: {hide: false, pageSize: 50}}`, lo spread di
primo livello rimpiazza l'intero `defaultTableDef.paginator` con il solo oggetto
`{hide: false, pageSize: 50}`. Vengono persi `pageSizeOptions: [10,20,50,100]` e
`showFirstLastButtons: true`, che nel template sono bound direttamente:

```html
[pageSizeOptions]="tableDef.paginator.pageSizeOptions"   <!-- → undefined → dropdown sparisce -->
[showFirstLastButtons]="tableDef.paginator.showFirstLastButtons"
```

### Bug 2 — URL fallback hardcoded sovrascrive sempre `pageSize` (table.component.ts, riga ~214)

`IbTableUrlService.getRawParams` contiene un fallback che si attiva **quando non c'è
nessun querystring** per questa tabella (riga 25 di `table-url.service.ts`):

```typescript
getRawParams(tableName: string): IbTableQsParams {
  return JSON.parse(
    this.activatedRoute.snapshot.queryParams?.[tableName]
    ?? `{..., "ibpagesize": 20, ...}`  // ← sempre 20 se manca il querystring
  );
}
```

Quindi `getPaginator()` ritorna `{ pageIndex: 0, pageSize: 20 }` anche alla prima
visita. In `ngOnInit` questo viene applicato incondizionatamente:

```typescript
ngOnInit() {
  const paginatorFromUrl = this.tableUrl.getPaginator(this.tableName);
  this.tableDef.paginator = {
    ...this.tableDef.paginator,   // { pageSize: 100, hide: true, ... }
    ...paginatorFromUrl,          // { pageIndex: 0, pageSize: 20 }  ← vince sempre
  };
}
```

Il merge sovrascrive `pageSize: 100` con `pageSize: 20` anche quando l'URL non
contiene nulla di esplicito, rendendo di fatto inutile qualsiasi `pageSize` nel
`tableDef`.

---

## 3. Assumptions / Open Questions

1. **Priorità URL reale vs tableDef**: se l'utente ha cambiato `pageSize` via UI
   (URL contiene un querystring esplicito per questa tabella), tale valore deve avere
   priorità sul `tableDef.paginator.pageSize`. Questo è il comportamento di URL-state
   persistence che deve essere preservato.

2. **Prima visita / URL assente**: se non esiste un querystring per questa tabella,
   il `pageSize` del developer in `tableDef` deve essere rispettato. Il fallback `20`
   vale solo se il developer non ha specificato `pageSize` in `tableDef`.

3. **`pageIndex` dall'URL**: continua ad essere applicato sempre (non è impattato
   dal fallback problematico per `pageSize`).

---

## 4. Proposed Approach

**Fix A** — Deep merge del sotto-oggetto `paginator` nel setter `tableDef`, così i
default (`pageSizeOptions`, `showFirstLastButtons`) non vengono persi quando il
developer specifica solo alcune proprietà.

**Fix B** — In `ngOnInit`, applicare il merge di `paginatorFromUrl` **solo se esiste
davvero un querystring nell'URL** per questa tabella
(`activatedRoute.snapshot.queryParams?.[tableName]`). Quando il querystring non esiste,
saltare il merge interamente: il `tableDef.paginator` rimane invariato (con il
`pageSize` del developer o il default `20` ereditato dai default).

Entrambi i fix sono chirurgici e non richiedono modifiche a `IbTableUrlService`,
`IbTableDef`, al template HTML o a `public_api.ts`.

---

## 5. Step-by-Step Plan

### Step 1 — Deep merge nel setter + URL paginator applicato solo con querystring esplicito ✅ DONE

**Target Executor:** `kai-table-executor`

**Allowed Files:**
- `src/app/inobeta-ui/ui/kai-table/table.component.ts`

**Read-only Reference Files:**
- `src/app/inobeta-ui/ui/kai-table/table-url.service.ts`
- `src/app/inobeta-ui/ui/kai-table/table.types.ts`

~~~
## TASK:
Correggere due bug nel componente `IbTable` che impediscono al developer di
controllare correttamente il paginatore tramite l'input `[tableDef]`.

## CONTEXT:
File: `src/app/inobeta-ui/ui/kai-table/table.component.ts`

**Bug 1 — setter `tableDef` (riga ~152):**
```typescript
set tableDef(value: Partial<IbTableDef>) {
  this._tableDef = {
    ...defaultTableDef,
    ...value,   // shallow: value.paginator sostituisce defaultTableDef.paginator
  };
}
```
Passando `{paginator: {hide: false, pageSize: 50}}`, l'intero `defaultTableDef.paginator`
viene rimpiazzato da `{hide: false, pageSize: 50}`. Vengono persi `pageSizeOptions` e
`showFirstLastButtons`, usati direttamente nel template.

**Bug 2 — `ngOnInit` (riga ~213):**
```typescript
ngOnInit() {
  const paginatorFromUrl = this.tableUrl.getPaginator(this.tableName);
  this.tableDef.paginator = {
    ...this.tableDef.paginator,
    ...paginatorFromUrl,   // applica sempre pageSize: 20 dal fallback hardcoded
  };
  ...
}
```
`IbTableUrlService.getPaginator` chiama internamente `getRawParams`, il cui fallback
restituisce `ibpagesize: 20` quando non esiste un querystring nell'URL per questa
tabella. Questo sovrascrive incondizionatamente il `pageSize` del developer.

Il componente ha accesso diretto ad `ActivatedRoute` via `this.activatedRoute`
(già iniettato, riga ~129).

## OBJECTIVE:
Dopo il fix:
- `tableDef = {paginator: {pageSize: 50}}` → `tableDef.paginator.pageSizeOptions`
  vale `[10, 20, 50, 100]` (ereditato dai default) e `pageSize` è `50`.
- `tableDef = {paginator: {pageSize: 100}}` alla prima visita (no querystring) →
  `tableDef.paginator.pageSize` rimane `100` dopo `ngOnInit`.
- Con un querystring esplicito che contiene `ibpagesize: 30` → `pageSize` diventa `30`
  (URL state ha la precedenza, comportamento invariato).

## REQUIREMENTS:
1. Nel setter `tableDef`, eseguire un deep merge esplicito del sotto-oggetto `paginator`:
   ```typescript
   set tableDef(value: Partial<IbTableDef>) {
     this._tableDef = {
       ...defaultTableDef,
       ...value,
       paginator: {
         ...defaultTableDef.paginator,
         ...value?.paginator,
       },
     };
   }
   ```
2. In `ngOnInit`, condizionare il merge di `paginatorFromUrl` all'esistenza di un
   querystring reale per questa tabella:
   ```typescript
   const hasUrlState = !!this.activatedRoute.snapshot.queryParams?.[this.tableName];
   if (hasUrlState) {
     const paginatorFromUrl = this.tableUrl.getPaginator(this.tableName);
     this.tableDef.paginator = {
       ...this.tableDef.paginator,
       ...paginatorFromUrl,
     };
   }
   ```
3. Tutto il resto di `ngOnInit` rimane invariato.

## CONSTRAINTS:
- Modificare **solo** `src/app/inobeta-ui/ui/kai-table/table.component.ts`.
- Non aggiungere import (l'`ActivatedRoute` è già disponibile come
  `this.activatedRoute`).
- Non introdurre nuove proprietà, Input o Output.
- Non modificare il template, `IbTableUrlService`, `IbTableDef` o `public_api.ts`.
- Non riformattare il file.

## OUTPUT:
Il setter `tableDef` e il metodo `ngOnInit` aggiornati.

## ACCEPTANCE CRITERIA:
- `npm run lint` non riporta errori.
- `npm run test-ci` passa senza regressioni.
- `grep -n "defaultTableDef.paginator" src/app/inobeta-ui/ui/kai-table/table.component.ts`
  restituisce almeno un match nel setter.
- `grep -n "hasUrlState" src/app/inobeta-ui/ui/kai-table/table.component.ts`
  restituisce almeno un match in `ngOnInit`.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

## 6. Impacted Areas

| File | Tipo di modifica |
|---|---|
| `src/app/inobeta-ui/ui/kai-table/table.component.ts` | Bug fix: setter `tableDef` + `ngOnInit` |

**Nessuna modifica a:**
- `public_api.ts`
- `IbTableDef` / `IbPaginatorOptions`
- `IbTableUrlService`
- Template HTML

---

## 7. Risks

| Rischio | Probabilità | Mitigazione |
|---|---|---|
| Tabelle con paginatore visibile e URL state esistente: comportamento invariato | Nessuna — il guard è `hasUrlState`, e se il querystring esiste viene applicato esattamente come prima | — |
| Tabelle senza `tableDef` esplicito: prima visita ora usa `pageSize: 20` da `defaultTableDef` invece che dal fallback di `getRawParams` — stesso risultato | Nessuna | — |
| Tabelle con `hide: true` ma senza `pageSize` esplicito: mostrano solo 20 record (default) e non è possibile cambiare pagina | Media — edge case raro, ma documentare nel JSDoc che `hide: true` richiede un `pageSize` esplicito adeguato | Aggiungere nota al JSDoc dell'input `tableDef` |

---

## 8. Validation Checklist

- [ ] `npm run lint` — nessun errore ESLint
- [ ] `npm run test-ci` — tutti i test passano, coverage ≥ 80%
- [ ] Prima visita con `hide: false, pageSize: 50` → dropdown pageSize visibile con opzioni `[10, 20, 50, 100]`, pageSize iniziale `50`
- [ ] Prima visita con `hide: true, pageSize: 100` → tutti i record visibili (100+), paginatore assente
- [ ] Visita con URL che contiene `ibpagesize: 30` → pageSize `30` (URL ha la precedenza)
- [ ] Nessun `tableDef` → comportamento default invariato (pageSize 20, paginatore visibile)
