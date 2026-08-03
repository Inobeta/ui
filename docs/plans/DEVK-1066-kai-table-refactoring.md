# DEVK-1066 — Refactoring architetturale di Kai Table

## 1. Goal

Ridurre in modo strutturale la complessità di `IbTable`, separando stato, rendering e caricamento dati.
Il risultato deve offrire:

- uno stato tabella canonico in NgRx, isolato per `tableName`;
- un data source locale per filter, sort e pagination client-side;
- un data source remoto indipendente da quello locale, alimentato da una query immutabile;
- inizializzazione deterministica da `tableDef`, eventuale vista e URL;
- precedenza documentata e applicata per singola proprietà;
- sincronizzazione bidirezionale con il query string, incluso browser back/forward;
- API Angular signal-based per input, output e query della Kai Table desktop;
- eliminazione delle responsabilità NgRx, URL e views dai data source;
- copertura Jasmine dedicata ai contratti introdotti.

Il refactoring è intenzionalmente incrementale, ma include breaking change esplicite e documentate per
le API signal, per il nuovo contratto remoto e per `tableName` obbligatorio.

## 2. Current State

### Data source

- `table-data-source.ts` contiene `IbTableDataSource<T>`, oggi contemporaneamente data source locale,
  contenitore di stato, gestore di filter/sort/paginator, aggregazioni, selection, views, NgRx e URL.
- `IbTableRemoteDataSource<T, V>` estende il data source locale e sostituisce parte della pipeline,
  pur non usando il processing locale.
- I data source iniettano direttamente `Store` e dispatchano `urlStateActions`.
- Il remoto riceve componenti Material mutabili (`MatSort`, `MatPaginator`) in `fetchData()` invece di
  una query value-object.
- `switchMap` impedisce già che una risposta HTTP precedente sovrascriva quella nuova, ma il debounce
  fisso di 500 ms viene applicato indistintamente anche a sort, pagina e refresh.
- Gli errori remoti vengono convertiti in `[]` e il dettaglio originale viene perso.
- `IbTableDataSource` è usato dagli esempi tramite deep import, ma non è esportato dal barrel pubblico.
- `data-export` usa metodi underscore e proprietà interne del data source.

### Stato NgRx e URL

- Lo store `ibKaiTable` contiene record parziali in un array, ma non è la source of truth usata
  all'inizializzazione.
- L'inizializzazione legge direttamente `ActivatedRoute.snapshot` tramite `IbTableUrlService`.
- Gli effect scrivono porzioni separate dello stato nell'URL; aggiornamenti ravvicinati possono partire
  da snapshot obsoleti.
- `setRemoteDatasourceParams` non è gestita dal reducer.
- I selector pubblici possono quindi restituire uno stato incompleto.
- Il query param usa un JSON con campi `ibfilter`, `ibview`, `ibpage`, `ibpagesize`,
  `ibaggregatedcolumns`, `ibsort`.
- `JSON.parse()` non è protetto; un parametro malformato può interrompere l'inizializzazione.
- `pageIndex` viene serializzato ma non è collegato al paginator nel template.
- Un sort cancellato nell'URL non può sovrascrivere `tableDef.initialSort`.
- L'assenza di un campo e la sua presenza con valore `null` non sono distinte in modo uniforme.
- Le variazioni URL successive al primo render non vengono osservate dalla tabella montata.

### Inizializzazione e views

- `IbTable.ngOnInit()` e `ngAfterContentInit()` distribuiscono l'inizializzazione fra paginator,
  filter, sort, aggregazioni e views.
- Sono presenti più `setTimeout()` usati come workaround per `NG0100`; l'ordine è timing-sensitive.
- `IbTableDef` supporta solo `paginator` e `initialSort`.
- Lo stato persistito del filtro è il raw form value (`selectedCriteria`), ma diversi tipi pubblici lo
  descrivono erroneamente come `IbFilterSyntaxExtended`, che rappresenta invece il filtro elaborato.
- Le views sono opzionali e costituiscono snapshot di filter, page size, aggregazioni e sort.
- La vista di fallback usa internamente l'ID `__ibTableView__all`; il contratto desiderato è invece
  `selectedView: null` per la vista default.
- Il contratto `IbTableViewsHost` non espone oggi un metodo per risolvere una vista iniziale per ID.

### Componente e signal API

- `IbTable` usa un mix di decorator query e signal query duplicati per alimentare il renderer mobile.
- Gli input principali sono ancora `@Input()`; view/content query sono ancora decorator-based.
- Anche colonne, selection, celle aggregate, action e sort header contengono API decorator-based.
- `[data]` e `[dataSource]` possono essere valorizzati insieme con comportamento dipendente
  dall'ordine di assegnazione.
- `tableName` ha un fallback browser-only basato su `window` e può collidere fra più tabelle.
- Sostituire il data source a runtime non riconnette in modo affidabile tutti i flussi.

### Mobile e integrazioni

- Il mobile condivide il render stream già paginato del desktop.
- Infinite scroll remoto/multipagina, empty state mobile e parità completa desktop/mobile sono problemi
  separati e non vengono risolti da DEVK-1066.
- Il mobile emette un `MatSort` costruito manualmente, invece del value object `Sort`.
- Non esistono spec dedicate sotto `ui/kai-table-mobile/`.

## 3. Assumptions / Open Questions

### Decisioni confermate

1. NgRx è la source of truth per sort, raw filter state, page index, page size, vista selezionata e
   aggregazioni. Le righe non vengono salvate nello store.
2. Non risultano consumer esterni che usano deep import di `IbTableDataSource`, override di
   `sortData`/`filterPredicate` o accesso diretto agli internals del data source.
3. Il remoto riceve una singola query immutabile e restituisce `{ data, totalCount }`.
4. Le richieste remote precedenti vengono cancellate tramite `switchMap`: con `HttpClient` questo
   normalmente abortisce anche la richiesta HTTP; in ogni caso una risposta obsoleta non può vincere.
5. `filterDebounceMs` è configurabile, default 500 ms, ed è applicato solo ai cambiamenti filtro.
   Sort, pagina e refresh sono immediati.
6. Selezione remota multipagina, export remoto completo e aggregazioni globali remote sono fuori scope
   e saranno affrontati da ticket futuri.
7. La precedenza è applicata per singolo campo. Campo URL assente e campo URL presente con `null`
   hanno semantiche diverse.
8. `initialSort`, `initialFilters`, `initialView`, `initialPageIndex`, `initialPageSize` e
   `initialAggregatedColumns` vengono aggiunti a `IbTableDef`.
9. In assenza di sort/filter/view non deve essere inizializzato uno stato applicativo artificiale;
   restano soltanto i default tecnici del paginator.
10. Una vista è uno snapshot opzionale. `selectedView: null` identifica la vista default anche se il
    relativo componente/tab non è presente.
11. Lo snapshot indicato da `initialView` prevale sugli altri campi `initial*` dello stesso
    `tableDef`; i singoli campi espliciti nell'URL prevalgono ancora sullo snapshot.
12. Le API decorator-based vengono convertite alle signal API senza facade di deprecazione. La
    breaking change deve essere documentata.

### Assunzioni adottate dal piano

1. `tableName` diventa obbligatorio e immutabile dopo la prima inizializzazione. Deve essere unico fra
   le tabelle presenti nella stessa route.
2. `dataSource` può cambiare a runtime; il precedente collegamento viene chiuso e il nuovo data source
   riceve lo stato NgRx corrente senza reinizializzare `tableName` o `tableDef`.
3. I campi `initial*` di `tableDef` vengono consumati una volta. Le opzioni puramente visuali del
   paginator (`hide`, options, first/last buttons) possono continuare a cambiare a runtime.
4. Sort e filter riportano atomicamente `pageIndex` a zero, sia in locale sia in remoto.
5. `replaceUrl: true` viene mantenuto per non creare una voce history per ogni interazione.
6. Browser back/forward deve riapplicare lo stato URL a una tabella già montata.
7. Lo stato NgRx della tabella resta disponibile dopo `ngOnDestroy`; non viene introdotto cleanup
   automatico.
8. I vecchi deep link generati dalla libreria sono bookmark/query string dell'applicazione, non un
   protocollo di integrazione esterno. Il reader continuerà quindi a riconoscere il vecchio schema e
   mapperà `__ibTableView__all` a `null`; il writer produrrà soltanto il nuovo schema.
9. Una vista sconosciuta o non risolvibile non blocca la tabella: viene usato `selectedView: null` e
   restano applicabili gli altri default/override.
10. Uno snapshot vista non conserva `pageIndex`; applicare una vista riparte da pagina zero. Conserva
    invece `pageSize`, come nel contratto corrente.
11. `initialFilters` e lo stato URL/view dei filtri rappresentano il raw form value serializzabile,
    non `IbFilterSyntax` e non la query server-side derivata.
12. Il ticket non corregge la paginazione/infinite scroll mobile né l'empty state mobile, salvo gli
    adattamenti indispensabili al nuovo contratto.

Non rimangono open question bloccanti per l'esecuzione del piano.

## 4. Proposed Approach

### 4.1 Stato canonico

Introdurre un record NgRx completo per ogni `tableName`, indicizzato tramite dizionario invece di array.
Il record contiene almeno:

- `initialized`;
- `sort: Sort | null`;
- `filters: IbTableFilterState | null` (raw form value);
- `pageIndex` e `pageSize`;
- `selectedView: string | null`;
- `aggregatedColumns`.

Lo stato di caricamento HTTP rimane responsabilità del data source remoto; non è necessario salvare
righe o errori HTTP nello store globale.

Le action di filter e sort aggiornano nello stesso reducer anche `pageIndex: 0`. Gli effect URL leggono
sempre lo snapshot completo post-reducer e serializzano un solo oggetto, evitando merge fra snapshot
parziali.

### 4.2 Risoluzione iniziale

Usare un resolver puro e testabile. La precedenza è:

1. default tecnici (`pageIndex: 0`, `pageSize: 20`, nessuna vista/sort/filter/aggregazione);
2. campi `initial*` esplicitamente presenti in `tableDef`;
3. snapshot della vista selezionata da `tableDef.initialView`, se risolta;
4. snapshot della vista indicata esplicitamente nell'URL, se presente e non `null`;
5. singoli campi esplicitamente presenti nell'URL.

Regole specifiche:

- `URL.filters: null` cancella `tableDef.initialFilters` e il filtro proveniente dalla vista;
- `URL.sort: null` cancella il sort iniziale;
- `URL.selectedView: null` cancella la selezione di `tableDef.initialView`; in questo caso riemergono
  gli altri campi `initial*`, salvo ulteriori override URL;
- `URL.aggregatedColumns: null` equivale a nessuna aggregazione;
- valori numerici `null` ricadono sui default tecnici, perché pagina e page size devono essere validi;
- la presenza dei campi viene verificata con semantica `hasOwnProperty`, non con truthiness o `??`.

La tabella attende filter e view resolution, effettua un singolo dispatch di inizializzazione e solo
dopo collega il data source. Il primo fetch remoto deve quindi avvenire una sola volta con lo stato
risolto.

### 4.3 URL

Mantenere un singolo query param per tabella, nominato tramite `tableName`, ma introdurre un payload
versionato con nomi coerenti (`version`, `filters`, `selectedView`, `pageIndex`, `pageSize`,
`aggregatedColumns`, `sort`).

- Il decoder accetta sia il nuovo payload sia il payload legacy `ib*`.
- Il valore legacy `__ibTableView__all` viene letto come `null`.
- JSON malformato o schema invalido non genera eccezioni; il parametro viene ignorato e normalizzato
  con `replaceUrl`.
- Un parametro assente non viene creato durante la sola inizializzazione.
- Dopo una modifica utente viene scritto lo stato completo, non una patch.
- Gli aggiornamenti originati dall'URL non vengono riscritti, evitando loop.

### 4.4 Data source

Definire un contratto comune minimo per il renderer e due implementazioni indipendenti:

- `IbTableLocalDataSource<T>`: possiede i dati locali ed esegue filter, sort, pagination e
  aggregazione locale;
- `IbTableRemoteDataSource<T, TFilter>`: estende direttamente CDK `DataSource<T>`, non il locale, e
  delega al consumer il fetch server-side.

Per compatibilità incrementale, l'attuale `IbTableDataSource<T>` può restare come sottile alias/wrapper
deprecato di `IbTableLocalDataSource<T>`; il nuovo codice, gli esempi e la documentazione devono usare
il nome esplicito locale.

Entrambi ricevono value object, non componenti Material. La richiesta remota è readonly e contiene
sort, pagina, page size e query filtro già derivata dal componente `IbFilter`.

I data source:

- non importano Store, Router, URL service, views o selection column;
- espongono stream stabili di righe, stato, errore e total count;
- dichiarano capability esplicite per selection, full export e global aggregation;
- supportano connessioni desktop/mobile concorrenti senza invalidarsi a vicenda;
- espongono API pubbliche per i dataset esportabili, eliminando l'uso cross-feature degli internals.

Nel remoto `switchMap` gestisce la cancellazione. Il debounce viene applicato solo quando cambia il
filtro; refresh, sort e page bypassano il debounce. L'errore originale resta osservabile.

### 4.5 Component facade e signals

Introdurre una facade per-table che orchestri Store, URL e resolver, lasciando `IbTable` responsabile
soltanto del bridge verso Material, filter, views e data source.

Migrare `IbTable` a:

- `input()`, `input.required()` e input transform;
- `contentChild()` / `contentChildren()`;
- `viewChild()` / `viewChildren()`;
- `computed()` per displayed columns, capability e stato visuale;
- `effect()` con cleanup per data source e binding reattivi.

La stessa query signal alimenta desktop e mobile: non devono più esistere query duplicate con prefisso
`mobile`. Non usare `setTimeout()` nel nuovo coordinamento.

In step separato migrare anche colonne, selection, aggregate cell, action e sort header. I template
binding Angular mantengono gli stessi nomi, ma l'accesso programmatico TypeScript passa a signal e
costituisce breaking change.

## 5. Step-by-Step Plan

### Step 1 — Definire stato, `tableDef` e resolver di precedenza ✅ DONE

**Target executor:** `kai-table-executor`  
**Model:** DeepSeek v4 Pro  
**Allowed files:**

- `src/app/inobeta-ui/ui/kai-table/table.types.ts`
- `src/app/inobeta-ui/ui/kai-table/table-state-resolver.ts` (new)

**Read-only reference files:** `table-url.service.ts`, `table-views-host.ts`,
`store/url-state/interfaces.ts`, `../kai-filter/filter.component.ts`  
**Objective:** creare contratti serializzabili e una funzione pura che risolva lo stato iniziale.

~~~
## TASK:
Definire i nuovi contratti di stato Kai Table, estendere IbTableDef e implementare il resolver puro della precedenza iniziale.

## CONTEXT:
Repo Angular 20 inobeta-ui. IbTableDef supporta oggi solo paginator e initialSort. URL, views e tableDef vengono fusi in punti diversi e senza distinguere campo assente da null.

## OBJECTIVE:
Ottenere un unico resolver puro che produca lo stato completo per una tableName prima di collegare UI e data source.

## REQUIREMENTS:
1. Introdurre un tipo raw filter state serializzabile distinto da IbFilterSyntax elaborato.
2. Definire lo snapshot runtime con sort nullable, filters nullable, selectedView nullable, pageIndex, pageSize e aggregatedColumns.
3. Estendere IbTableDef con initialSort, initialFilters, initialView, initialPageIndex, initialPageSize e initialAggregatedColumns, tutti con semantica nullable documentata.
4. Separare le opzioni visuali del paginator dai campi iniziali; mantenere i default tecnici pageIndex=0 e pageSize=20.
5. Implementare il resolver con precedenza: default tecnici, campi initial*, snapshot initialView, snapshot URL view, singoli campi URL espliciti.
6. Verificare la presenza dei campi, non la truthiness.
7. Trattare null come cancellazione esplicita; per pageIndex/pageSize null usare il default tecnico.
8. Non introdurre dipendenze da Angular component, Store o Router.

## CONSTRAINTS:
- Non modificare componenti, store, URL service o views.
- Non usare any.
- Non inventare uno stato dati/righe in NgRx.
- Non serializzare IbFilterSyntax come se fosse il raw form value.

## OUTPUT:
Elenco dei file modificati e sintesi della matrice di precedenza implementata.

## ACCEPTANCE CRITERIA:
- `npx tsc -p tsconfig.app.json --noEmit` completa senza errori.
- IbTableDef espone tutti e sei i campi initial* richiesti.
- Il resolver non importa @ngrx/store, @angular/router o componenti Material.
- Il codice distingue proprietà assente da proprietà presente con null.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 2 — Testare resolver e semantica `null` ✅ DONE

**Target executor:** `unit-jasmine-executor`  
**Model:** DeepSeek v4 Pro  
**Allowed files:** `src/app/inobeta-ui/ui/kai-table/table-state-resolver.spec.ts` (new)  
**Read-only reference files:** `table-state-resolver.ts`, `table.types.ts`  
**Objective:** fissare la matrice di precedenza prima di introdurre Store e UI.

~~~
## TASK:
Scrivere test Jasmine esaustivi per il resolver iniziale Kai Table.

## CONTEXT:
Il resolver deve distinguere campi assenti e null e fondere tableDef, snapshot vista e patch URL per singola proprietà.

## OBJECTIVE:
Rendere verificabile e non ambiguo ogni livello della precedenza concordata.

## REQUIREMENTS:
1. Testare il caso senza configurazione: solo default tecnici paginator e stato applicativo vuoto.
2. Testare tutti i campi initial* di tableDef.
3. Verificare che lo snapshot initialView prevalga sugli altri initial*.
4. Verificare che lo snapshot URL view prevalga sulla vista tableDef.
5. Verificare che ogni singolo campo URL esplicito prevalga sulla vista.
6. Verificare che un campo URL assente mantenga il valore precedente.
7. Verificare null per filters, sort, selectedView e aggregatedColumns.
8. Verificare null e valori invalidi per pageIndex/pageSize.
9. Verificare vista sconosciuta/non risolta e selectedView URL null.

## CONSTRAINTS:
- Non modificare codice production.
- Non usare TestBed: il resolver è puro.
- Non omettere i casi di payload URL parziale.

## OUTPUT:
Spec aggiunta e riepilogo dei casi coperti.

## ACCEPTANCE CRITERIA:
- `ng test --include='src/app/inobeta-ui/ui/kai-table/table-state-resolver.spec.ts' --watch=false` passa.
- Sono presenti assertion separate per campo assente e campo null.
- Non sono presenti fdescribe o fit.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 3 — Ricostruire lo slice NgRx come source of truth ✅ DONE

**Target executor:** `kai-table-executor`  
**Model:** DeepSeek v4 Pro  
**Allowed files:** `src/app/inobeta-ui/ui/kai-table/store/**/*.ts`  
**Read-only reference files:** `table.types.ts`, `table-state-resolver.ts`, `table.module.ts`  
**Objective:** sostituire lo stato parziale in array con record completi indicizzati per `tableName`.

~~~
## TASK:
Refactor dello slice NgRx Kai Table per renderlo la source of truth completa dello stato tabella.

## CONTEXT:
Lo slice attuale conserva patch parziali in un array e setRemoteDatasourceParams non aggiorna il reducer. Le action URL sono pubbliche e possono restare come compatibility facade, ma il nuovo codice interno deve usare action di table state.

## OBJECTIVE:
Disporre di stato completo, reducer atomici e selector coerenti per ogni tableName.

## REQUIREMENTS:
1. Usare un dizionario indicizzato per tableName, non un array con ricerca/mutazione.
2. Introdurre action esplicite per initialize/hydrate, filter, sort, paginator, aggregation e apply view.
3. Filter e sort devono impostare pageIndex=0 nello stesso passaggio reducer.
4. Initialize/hydrate deve accettare uno snapshot completo già risolto.
5. Applicare una view deve impostare selectedView, snapshot e pageIndex=0 atomicamente.
6. Esporre un selector del record completo e selector granulari utili alla facade.
7. Mantenere il feature key ibKaiTable e la registrazione createFeature.
8. Mantenere le vecchie urlStateActions e i vecchi selector come compatibility facade deprecata, gestendoli nel nuovo reducer senza usarli internamente.
9. Correggere setRemoteDatasourceParams anche nel percorso legacy.
10. Non rimuovere lo stato al destroy.

## CONSTRAINTS:
- Nessun accesso a Router o ActivatedRoute nel reducer.
- Nessuna riga/dataset nello store.
- Nessuna mutazione di state o payload.
- Non modificare table.module.ts in questo step salvo necessità di compilazione strettamente legata agli export dello store.

## OUTPUT:
File store aggiornati, nuove action/selector e note sulla compatibility facade.

## ACCEPTANCE CRITERIA:
- `npx tsc -p tsconfig.app.json --noEmit` completa senza errori.
- Filter e sort azzerano pageIndex nel reducer.
- Due tableName producono record indipendenti.
- setRemoteDatasourceParams aggiorna filters e sort nel percorso legacy.
- Nessun reducer importa Router o IbTableUrlService.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 4 — Coprire reducer, action e selector NgRx ✅ DONE

**Target executor:** `unit-jasmine-executor`  
**Model:** DeepSeek v4 Pro  
**Allowed files:**

- `src/app/inobeta-ui/ui/kai-table/store/**/*.spec.ts`

**Read-only reference files:** `src/app/inobeta-ui/ui/kai-table/store/**/*.ts`, `table.types.ts`  
**Objective:** verificare atomicità, isolamento per nome e compatibility facade.

~~~
## TASK:
Creare o aggiornare le spec Jasmine dello slice NgRx Kai Table.

## CONTEXT:
Lo slice è ora canonico e completo; le regressioni più rischiose sono patch parziali, mancato reset pagina e collisioni fra tabelle.

## OBJECTIVE:
Testare reducer e selector senza dipendere da componenti Angular.

## REQUIREMENTS:
1. Testare initialize/hydrate con snapshot completo.
2. Testare filter e sort con reset atomico pageIndex=0.
3. Testare paginator, aggregation e apply view.
4. Testare selectedView null.
5. Testare due tableName indipendenti.
6. Testare setRemoteDatasourceParams legacy.
7. Testare selector completo e selector query-string compatibility.
8. Verificare immutabilità degli input state.

## CONSTRAINTS:
- Non modificare production code salvo correzioni minime necessarie a rendere vere le acceptance criteria, da riportare esplicitamente.
- Non usare fdescribe o fit.

## OUTPUT:
Spec store aggiunte/aggiornate e riepilogo copertura.

## ACCEPTANCE CRITERIA:
- `ng test --include='src/app/inobeta-ui/ui/kai-table/store/**/*.spec.ts' --watch=false` passa.
- Esiste almeno un test con due tableName.
- Esistono test espliciti per reset pagina su filter e sort.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 5 — Introdurre codec URL versionato e persistenza full-state ✅ DONE

**Target executor:** `kai-table-executor`  
**Model:** DeepSeek v4 Pro  
**Allowed files:**

- `src/app/inobeta-ui/ui/kai-table/table-url-codec.ts` (new)
- `src/app/inobeta-ui/ui/kai-table/table-url.service.ts`
- `src/app/inobeta-ui/ui/kai-table/store/url-state/effects.ts`

**Read-only reference files:** nuovo store, `table.types.ts`, `table-state-resolver.ts`  
**Objective:** leggere patch URL in sicurezza e scrivere sempre lo stato completo post-reducer.

~~~
## TASK:
Sostituire il merge URL incrementale con codec versionato e persistenza dello snapshot completo.

## CONTEXT:
Ogni tabella usa un query param JSON denominato tableName. Il codice corrente fa JSON.parse senza guardia e ogni effect riscrive una sola porzione partendo dallo snapshot route.

## OBJECTIVE:
Eliminare race e ambiguità mantenendo compatibilità in lettura con i deep link prodotti dalla versione corrente.

## REQUIREMENTS:
1. Implementare un codec puro v2 con campi version, filters, selectedView, pageIndex, pageSize, aggregatedColumns e sort.
2. Il decoder deve restituire una patch con informazione di presenza dei campi.
3. Supportare in lettura il payload legacy ib*.
4. Mappare __ibTableView__all a selectedView null; non scrivere mai più il sentinel.
5. Gestire JSON malformato, tipo errato e valori numerici invalidi senza throw.
6. Il service deve scrivere un payload completo con queryParamsHandling=merge e replaceUrl=true.
7. Gli effect devono reagire solo ad action utente/persistibili, leggere lo stato completo post-reducer e fare una singola write.
8. Initialize e hydrate-from-URL non devono generare write.
9. Evitare loop fra una navigation prodotta dalla tabella e l'osservazione route.
10. Conservare metodi legacy pubblici solo come wrapper deprecati sul nuovo codec, se necessari alla compilazione dei consumer interni.

## CONSTRAINTS:
- Non usare ActivatedRoute.snapshot come base per fondere porzioni dello stesso payload.
- Non perdere gli altri query param o lo stato di altre tabelle.
- Non introdurre stringhe UI.
- Non cambiare tableName durante la serializzazione.

## OUTPUT:
Codec, service ed effect aggiornati; descrizione schema v2 e comportamento legacy.

## ACCEPTANCE CRITERIA:
- `npx tsc -p tsconfig.app.json --noEmit` completa senza errori.
- JSON.parse malformato è gestito senza eccezione.
- Il writer produce un unico oggetto completo e usa replaceUrl=true.
- Il nuovo writer non contiene __ibTableView__all.
- Gli effect di inizializzazione/hydration non navigano.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 6 — Testare codec, URL effect e race prevention ✅ DONE

**Target executor:** `unit-jasmine-executor`  
**Model:** DeepSeek v4 Pro  
**Allowed files:**

- `src/app/inobeta-ui/ui/kai-table/table-url-codec.spec.ts` (new)
- `src/app/inobeta-ui/ui/kai-table/table-url.service.spec.ts` (new)
- `src/app/inobeta-ui/ui/kai-table/store/url-state/effects.spec.ts` (new/update)

**Read-only reference files:** Step 5 production files, nuovo store  
**Objective:** verificare schema, malformed input, legacy e full-state writes.

~~~
## TASK:
Scrivere test Jasmine per codec URL, service ed effect Kai Table.

## CONTEXT:
Il nuovo flusso deve preservare presenza/null, leggere v1, scrivere v2 completo e non reagire a initialize/hydrate.

## OBJECTIVE:
Prevenire regressioni su deep link, query parziali e aggiornamenti ravvicinati.

## REQUIREMENTS:
1. Test codec v2 round trip.
2. Test payload v2 parziale e distinzione absent/null.
3. Test payload legacy completo e parziale.
4. Test sentinel legacy convertito in null.
5. Test JSON malformato e schema invalido.
6. Test writer con merge e replaceUrl.
7. Test effect: una action utente scrive lo stato completo selezionato dopo il reducer.
8. Test effect: initialize e hydrate non scrivono.
9. Test due aggiornamenti ravvicinati senza perdita di campi.
10. Test isolamento di due query param tableName.

## CONSTRAINTS:
- Usare Router/Store mock controllabili.
- Non modificare production code oltre fix minimi esplicitamente riportati.
- Non usare fdescribe o fit.

## OUTPUT:
Spec aggiunte e riepilogo dei casi URL coperti.

## ACCEPTANCE CRITERIA:
- I tre file spec passano con `ng test --include='src/app/inobeta-ui/ui/kai-table/**/*url*.spec.ts' --watch=false`.
- Sono presenti test per malformed JSON, null, legacy sentinel e rapid updates.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 7 — Estendere il contratto opzionale delle views ✅ DONE

**Target executor:** `task-executor`  
**Model:** DeepSeek v4 Pro  
**Routing note:** non esiste un executor specializzato per `ui/views`; questo step è volutamente
limitato al solo adapter views richiesto da Kai Table. È una scope exception esplicita: se
`task-executor` non è autorizzato a modificare `ui/views`, lo step deve fermarsi con
`NEED CLARIFICATION`, non estendere il proprio perimetro.  
**Allowed files:**

- `src/app/inobeta-ui/ui/kai-table/table-views-host.ts`
- `src/app/inobeta-ui/ui/views/components/table-view-group/table-view-group.component.ts`
- `src/app/inobeta-ui/ui/views/store/views/table-view.ts`

**Read-only reference files:** nuovo state/resolver/URL codec, views reducer/service  
**Objective:** risolvere una vista iniziale per ID e usare `null` al boundary per la vista default.

~~~
## TASK:
Estendere IbTableViewsHost e il relativo adapter IbTableViewGroup per inizializzazione e snapshot canonici.

## CONTEXT:
Le views sono opzionali e persistono snapshot. Kai Table deve poter risolvere initialView o URL selectedView prima del primo fetch, senza importare implementazioni dal modulo views.

## OBJECTIVE:
Fornire un contratto asincrono minimo per risolvere una vista e normalizzare la vista default a null.

## REQUIREMENTS:
1. Aggiungere al host un metodo asincrono per risolvere uno snapshot tramite view ID.
2. Usare string|null per gli eventi/selezione al boundary Kai Table.
3. Mantenere l'ID __ibTableView__all solo come dettaglio interno del widget views, convertendolo a null verso la tabella.
4. Correggere il tipo del raw filter snapshot; non dichiararlo IbFilterSyntax elaborato.
5. Normalizzare in lettura gli snapshot views legacy che usano il campo filter, se il nuovo contratto usa filters.
6. Applicare una vista con pageIndex=0; pageSize resta parte dello snapshot.
7. Vista sconosciuta o store vuoto deve risolversi a null senza throw.
8. Il componente views deve continuare a essere opzionale e la tab default deve dipendere solo dalla presenza del componente.

## CONSTRAINTS:
- Non accoppiare kai-table allo store interno di views.
- Non modificare dialog, template o stile delle views.
- Non aggiungere testo visibile.
- Non ampliare lo scope a CRUD views non correlato.

## OUTPUT:
Contratto e adapter aggiornati, inclusa la strategia di normalizzazione legacy.

## ACCEPTANCE CRITERIA:
- `npx tsc -p tsconfig.app.json --noEmit` completa senza errori.
- IbTableViewsHost può risolvere una vista per ID.
- Il boundary usa null per la default view.
- Nessun file kai-table importa direttamente componenti o store da ui/views.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 8 — Testare risoluzione e normalizzazione views ✅ DONE

**Target executor:** `unit-jasmine-executor`  
**Model:** DeepSeek v4 Pro  
**Allowed files:**

- `src/app/inobeta-ui/ui/views/components/table-view-group/table-view-group.component.spec.ts`
- `src/app/inobeta-ui/ui/kai-table/table-views-host.stub.spec.ts`

**Read-only reference files:** Step 7 production files  
**Objective:** coprire ID iniziale, default null, legacy snapshot e vista sconosciuta.

~~~
## TASK:
Aggiornare le spec del views host per il nuovo contratto di inizializzazione Kai Table.

## CONTEXT:
IbTable può inizializzarsi solo dopo aver risolto l'eventuale snapshot vista. Il sentinel legacy non deve uscire dal views adapter.

## OBJECTIVE:
Garantire che risoluzione e normalizzazione siano deterministiche.

## REQUIREMENTS:
1. Testare resolve di una vista esistente.
2. Testare vista sconosciuta e store views vuoto.
3. Testare conversione default sentinel -> null.
4. Testare normalizzazione snapshot legacy filter -> canonical filters.
5. Testare activeViewChanged per vista salvata e default.
6. Aggiornare lo stub usato dalle spec IbTable.

## CONSTRAINTS:
- Non rimuovere copertura CRUD già presente.
- Usare NoopAnimationsModule e TranslateModule quando richiesti.
- Non usare fdescribe o fit.

## OUTPUT:
Spec e stub aggiornati.

## ACCEPTANCE CRITERIA:
- `ng test --include='src/app/inobeta-ui/ui/views/components/table-view-group/table-view-group.component.spec.ts' --watch=false` passa.
- I test verificano esplicitamente che il sentinel non venga emesso al boundary.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 9 — Creare la facade per-table di inizializzazione e URL hydration ✅ DONE

**Target executor:** `kai-table-executor`  
**Model:** DeepSeek v4 Pro  
**Allowed files:**

- `src/app/inobeta-ui/ui/kai-table/table-state.facade.ts` (new)
- `src/app/inobeta-ui/ui/kai-table/table.module.ts` (solo se richiesto dal provider scope)

**Read-only reference files:** resolver, URL service/codec, store, views host  
**Objective:** centralizzare initialize, route observation e dispatch, senza dipendere da Material.

~~~
## TASK:
Implementare una facade per istanza IbTable che orchestri resolver, NgRx, URL e view resolution.

## CONTEXT:
IbTable oggi legge snapshot URL e dispatcha direttamente in più punti. La facade deve essere fornita per istanza, non root condivisa, e non deve conoscere MatSort, MatPaginator o i data source.

## OBJECTIVE:
Esporre uno stato reattivo unico e metodi di intent per la UI.

## REQUIREMENTS:
1. La facade deve inizializzare una tableName una sola volta dopo aver ricevuto tableDef e host views opzionale.
2. Decodificare URL, risolvere la vista richiesta e usare il resolver puro prima del singolo initialize dispatch.
3. Osservare queryParamMap/navigation dopo l'init per browser back/forward.
4. Distinguere navigation propria da navigation esterna ed evitare loop.
5. Su URL malformato ignorare la patch e chiedere al service la normalizzazione/rimozione del parametro.
6. Esporre selector/signal dello stato completo e intent per filter, sort, page, aggregation e view.
7. Filter e sort devono usare le action atomiche che resettano pagina.
8. Non fare cleanup dello state NgRx al destroy; chiudere soltanto subscription/effect locali.
9. Rifiutare o segnalare il cambio di tableName dopo initialize.
10. Non scrivere URL per la sola inizializzazione da tableDef.

## CONSTRAINTS:
- Nessuna importazione di MatSort, MatPaginator, MatTable o data source.
- Nessun setTimeout.
- Nessuna riga dati nello store.
- Non rendere la facade providedIn root se contiene identità tableName mutabile per istanza.

## OUTPUT:
Facade aggiunta e descrizione del lifecycle.

## ACCEPTANCE CRITERIA:
- `npx tsc -p tsconfig.app.json --noEmit` completa senza errori.
- La facade osserva cambi URL successivi all'init.
- Un init produce un solo initialize/hydrate dispatch.
- Non esiste dispatch di remove state in destroy.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 10 — Testare facade, back/forward e primo init ✅ DONE

**Target executor:** `unit-jasmine-executor`  
**Model:** DeepSeek v4 Pro  
**Allowed files:** `src/app/inobeta-ui/ui/kai-table/table-state.facade.spec.ts` (new)  
**Read-only reference files:** facade, resolver, codec, store, views stub  
**Objective:** garantire un solo init/fetch-ready state e rehydration browser.

~~~
## TASK:
Scrivere test Jasmine della facade per-table Kai Table.

## CONTEXT:
La facade è il confine fra URL/tableDef/views e lo store canonico. Deve evitare loop e dispatch duplicati.

## OBJECTIVE:
Verificare il lifecycle prima dell'integrazione con IbTable.

## REQUIREMENTS:
1. Test init senza query param.
2. Test init con URL parziale e null.
3. Test risoluzione asincrona initialView e URL view.
4. Test vista URL prevalente e singoli override URL.
5. Test malformed URL con normalizzazione.
6. Test queryParamMap successivo che simula back/forward.
7. Test che una navigation propria non produca loop.
8. Test cambio tableName dopo init.
9. Test che destroy non elimini il record NgRx.

## CONSTRAINTS:
- Usare MockStore e router/route stub deterministici.
- Non introdurre component fixture se non necessaria.
- Non usare fdescribe o fit.

## OUTPUT:
Spec facade e riepilogo lifecycle coperto.

## ACCEPTANCE CRITERIA:
- `ng test --include='src/app/inobeta-ui/ui/kai-table/table-state.facade.spec.ts' --watch=false` passa.
- Sono verificati un solo initialize dispatch e una rehydration successiva.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 11 — Definire il contratto comune e il data source locale ✅ DONE

**Target executor:** `kai-table-executor`  
**Model:** DeepSeek v4 Pro  
**Allowed files:**

- `src/app/inobeta-ui/ui/kai-table/data-source.types.ts` (new)
- `src/app/inobeta-ui/ui/kai-table/local-data-source.ts` (new)
- `src/app/inobeta-ui/ui/kai-table/table-data-source.ts`
- `src/app/inobeta-ui/ui/kai-table/index.ts`

**Read-only reference files:** facade/store/types, columns, filter component, remote data source,
mobile component, data-export service  
**Objective:** definire il boundary condiviso e isolare il processing client-side senza ancora
modificare remoto o componente.

~~~
## TASK:
Definire il contratto data source comune e implementare IbTableLocalDataSource.

## CONTEXT:
IbTableDataSource contiene oggi processing locale, Store, URL, views, selection e aggregazioni. Questo step deve estrarre soltanto il motore locale e una superficie comune consumabile dai renderer.

## OBJECTIVE:
Un data source locale autonomo, tipizzato e privo di side effect applicativi.

## REQUIREMENTS:
1. Definire un contratto comune minimo e capability esplicite.
2. Creare IbTableLocalDataSource per data array, local filter, sort, page e aggregazioni.
3. Conservare sortData/filterPredicate come extension point locale tipizzato.
4. Mantenere IbTableDataSource come wrapper compatibility deprecato del locale, senza usarlo nel nuovo codice.
5. Ricevere sort, raw filter state, page e aggregation tramite value object/API, non tramite Store o URL.
6. Usare gli accessor delle colonne per sort e filter.
7. Esporre API pubbliche per righe filtrate/ordinate e current page necessarie a export/aggregation.
8. Esporre stream stabili di righe renderizzate e total count.
9. Supportare connect concorrenti desktop/mobile senza teardown globale al disconnect di un consumer.
10. Rimuovere Store, Router, URL, views e selection dal locale e dal wrapper compatibility.
11. Dichiarare capability locali: full export e global aggregation supportati; selection gestita dal componente, non dal data source.
12. Esportare dal barrel i nuovi contratti e il locale affinché i consumer successivi non usino deep import.

## CONSTRAINTS:
- Non salvare righe in NgRx.
- Non modificare IbTableRemoteDataSource o IbTable.
- Non importare componenti MatSort/MatPaginator nel nuovo contratto di stato.
- Non modificare colonne, cells, export o mobile.
- Non mantenere side effect NgRx/URL nel wrapper compatibility.

## OUTPUT:
File modificati, pipeline locale e lista delle API pubbliche/compatibility.

## ACCEPTANCE CRITERIA:
- `npx tsc -p tsconfig.app.json --noEmit` completa senza errori oppure l'executor documenta esattamente i consumer non ancora migrati che impediscono la compilazione completa.
- local-data-source.ts e table-data-source.ts non importano @ngrx/store, Router, IbTableUrlService, IbTableViewsHost o IbSelectionColumn.
- IbTableDataSource è soltanto compatibility wrapper del locale.
- Il contratto comune non dipende da componenti Material.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 12 — Coprire la pipeline locale ✅ DONE

**Target executor:** `unit-jasmine-executor`  
**Model:** DeepSeek v4 Pro  
**Allowed files:** `src/app/inobeta-ui/ui/kai-table/local-data-source.spec.ts` (new)  

**Read-only reference files:** Step 11 data source files, columns test stubs  
**Objective:** testare processing locale, extension point, capability e connect multipli.

~~~
## TASK:
Scrivere spec Jasmine/RxJS dedicate a IbTableLocalDataSource.

## CONTEXT:
La pipeline locale non deve più dipendere dal component test monolitico né da Store/Router.

## OBJECTIVE:
Verificare in isolamento il contratto locale.

## REQUIREMENTS:
1. Locale: data update, filtro, sort, page, page clamp, aggregazione total/current page.
2. Locale: custom sortData e filterPredicate.
3. Locale: sort su colonna sconosciuta non deve generare crash non gestito.
4. Verificare API pubbliche per dataset filtrato/ordinato e current page.
5. Verificare due connect concorrenti e disconnect indipendente.
6. Verificare capability locali.
7. Verificare che il wrapper IbTableDataSource mantenga il comportamento locale essenziale.

## CONSTRAINTS:
- Usare Subject/Observable controllati.
- Non testare NgRx o Router qui.
- Non usare fdescribe o fit.

## OUTPUT:
Spec locale e riepilogo dei flussi coperti.

## ACCEPTANCE CRITERIA:
- `ng test --include='src/app/inobeta-ui/ui/kai-table/local-data-source.spec.ts' --watch=false` passa.
- Esistono test per extension point, page clamp e connect concorrenti.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 12.1 — Separare il remoto e integrare i data source in `IbTable` ✅ DONE

**Target executor:** `kai-table-executor`  
**Model:** DeepSeek v4 Pro  
**Allowed files:**

- `src/app/inobeta-ui/ui/kai-table/remote-data-source.ts`
- `src/app/inobeta-ui/ui/kai-table/table.component.ts`
- `src/app/inobeta-ui/ui/kai-table/table.component.html`

**Read-only reference files:** `data-source.types.ts`, `local-data-source.ts`, facade/store/types,
columns, filter, views host, mobile component, data-export service  
**Objective:** rendere il remoto indipendente e fare il cutover atomico del componente sui nuovi
contratti, mantenendo temporaneamente le API decorator di `IbTable`.

~~~
## TASK:
Riscrivere IbTableRemoteDataSource sul contratto comune e integrare locale/remoto in IbTable.

## CONTEXT:
Il remoto corrente estende IbTableDataSource, riceve MatSort/MatPaginator e applica debounceTime(500) a ogni trigger. Poiché IbTable dipende dagli internals ereditati, remoto e componente devono essere aggiornati nello stesso cutover.

## OBJECTIVE:
Una pipeline server-side autonoma, cancellabile e tipizzata, collegata alla facade canonica insieme al locale.

## REQUIREMENTS:
1. Estendere direttamente CDK DataSource o implementare il contratto comune; non estendere classi locali.
2. Sostituire fetchData(sort,paginator,filter) con fetchData(readonly request).
3. La request contiene Sort|null, pageIndex, pageSize e filtro server tipizzato.
4. Esporre filterDebounceMs configurabile con default 500.
5. Applicare debounce soltanto quando cambia il filtro.
6. Sort, page e refresh devono avviare il fetch immediatamente.
7. Usare switchMap per cancellare la subscription precedente e impedire risposte obsolete.
8. Esporre loading, idle, no_data, http_error ed errore originale osservabile.
9. Esporre total count e righe della pagina corrente.
10. Supportare connect concorrenti desktop/mobile.
11. Dichiarare capability remote: no selection multipagina, no full export, no global aggregation; current-page aggregation consentita.
12. Non importare Store, URL service, views, selection, MatSort component o MatPaginator component.
13. In IbTable attendere filter e view resolution tramite facade prima di applicare lo stato.
14. Applicare sort/page/pageSize/filter/aggregation a Material e filtri dal record NgRx.
15. Collegare il data source soltanto dopo lo stato iniziale risolto; il primo remote fetch avviene una volta.
16. Le modifiche UI inviano intent alla facade; gli aggiornamenti da store/URL non creano loop.
17. Supportare dataSource replacement con cleanup e stato corrente.
18. Rendere [data] shorthand per un data source locale interno e rifiutare [data]+[dataSource].
19. Usare capability, non instanceof, per selection, export e aggregation.
20. Eliminare setTimeout e letture dirette di ActivatedRoute.snapshot dallo stato tabella.
21. Mantenere temporaneamente i decorator input/query; la conversione signal è Step 13.

## CONSTRAINTS:
- Non modificare locale, facade, store, URL, views, export o mobile.
- Non reintrodurre local filtering.
- Non implementare retry, caching, infinite scroll o feature remote future.
- Non ingoiare il dettaglio errore.
- Non salvare righe in NgRx.
- Non aggiungere nuove API decorator legacy.

## OUTPUT:
Remote data source e IbTable aggiornati; descrizione di pipeline, trigger e lifecycle.

## ACCEPTANCE CRITERIA:
- IbTableRemoteDataSource non estende IbTableLocalDataSource o IbTableDataSource.
- fetchData riceve un solo value object readonly.
- filterDebounceMs default è 500.
- Il file non importa Store, Router, IbTableUrlService, views, selection, MatSort o MatPaginator.
- `npm run packagr` completa senza errori.
- table.component.ts non dispatcha urlStateActions legacy, non legge ActivatedRoute.snapshot per lo stato tabella e non contiene setTimeout.
- IbTable usa capability invece di instanceof.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 12.2 — Coprire la pipeline remota ✅ DONE

**Target executor:** `unit-jasmine-executor`  
**Model:** DeepSeek v4 Pro  
**Allowed files:** `src/app/inobeta-ui/ui/kai-table/remote-data-source.spec.ts` (new)  
**Read-only reference files:** `remote-data-source.ts`, `data-source.types.ts`  
**Objective:** testare request, debounce, cancellation, stato ed errore.

~~~
## TASK:
Scrivere spec Jasmine/RxJS dedicate a IbTableRemoteDataSource.

## CONTEXT:
Il remoto deve distinguere filter change da sort/page/refresh e deve impedire a risposte obsolete di vincere.

## OBJECTIVE:
Verificare in isolamento il contratto server-side.

## REQUIREMENTS:
1. Testare request readonly corretta.
2. Testare debounce filtro con fakeAsync/tick.
3. Testare sort, page e refresh immediati.
4. Testare switchMap con risposta vecchia emessa dopo quella nuova.
5. Testare loading, idle, no_data e http_error.
6. Testare errore originale osservabile.
7. Testare totalCount e current page rows.
8. Testare due connect concorrenti e disconnect indipendente.
9. Testare capability remote.

## CONSTRAINTS:
- Non usare HTTP reale.
- Usare Subject/Observable controllati.
- Non testare NgRx o Router.
- Non usare fdescribe o fit.

## OUTPUT:
Spec remota e riepilogo dei trigger coperti.

## ACCEPTANCE CRITERIA:
- `ng test --include='src/app/inobeta-ui/ui/kai-table/remote-data-source.spec.ts' --watch=false` passa.
- Un test dimostra la cancellazione della risposta obsoleta.
- Un test dimostra sort immediato e filtro debounced.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 12.3 — Preparare gli esempi al cutover remoto e a `tableName` required ✅ DONE

**Target executor:** `examples-executor`  
**Model:** DeepSeek v4 Flash  
**Allowed files:** `src/app/examples/kai-table-example/**/*`  
**Read-only reference files:** public API aggiornata, nuovo remote request, route esistenti  
**Objective:** mantenere compilabile la demo prima della migrazione signal, limitandosi ai blocker.

~~~
## TASK:
Aggiornare gli esempi Kai Table per il nuovo fetch remoto e assegnare tableName unici.

## CONTEXT:
IbTableRemoteDataSource usa ora fetchData(readonly request). Nel prossimo step tableName diventerà input.required; gli esempi devono essere preparati prima del cutover signal.

## OBJECTIVE:
Rimuovere i soli blocker di compilazione della demo senza anticipare il cleanup documentale completo dello Step 22.

## REQUIREMENTS:
1. Assegnare un tableName stabile e unico a ogni ib-kai-table negli esempi.
2. Migrare GithubDataSource a fetchData(readonly request).
3. Importare i nuovi contratti dal public_api, non con nuovi deep import.
4. Rimuovere il console.log dal remote example.
5. Non rinominare ancora gli esempi locali o fare cleanup non necessario: è responsabilità dello Step 22.

## CONSTRAINTS:
- Non modificare libreria, route, menu, traduzioni, layout o dataset.
- Non aggiungere stringhe UI.
- Non implementare feature remote fuori scope.

## OUTPUT:
Esempi aggiornati e inventario tableName assegnati.

## ACCEPTANCE CRITERIA:
- `npm run build` completa senza errori.
- Ogni ib-kai-table sotto kai-table-example ha tableName.
- GithubDataSource usa il request object e non contiene console.log.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 13 — Migrare `IbTable` alle signal API ✅ DONE

**Target executor:** `kai-table-executor`  
**Model:** DeepSeek v4 Pro  
**Allowed files:**

- `src/app/inobeta-ui/ui/kai-table/table.component.ts`
- `src/app/inobeta-ui/ui/kai-table/table.component.html`

**Read-only reference files:** facade, data source contracts, mobile component, Angular template safety skill  
**Objective:** rimuovere decorator input/view/content query e query duplicate mobile.

~~~
## TASK:
Migrare IbTable da @Input/@ViewChild/@ContentChild alle signal API Angular 20.

## CONTEXT:
Lo state/data-source refactor è già operativo. Questo step è una breaking change accettata e non deve mantenere proprietà decorator legacy.

## OBJECTIVE:
Una sola API signal coerente per desktop e mobile, con template aggiornato e cleanup automatico.

## REQUIREMENTS:
1. Convertire state, data, dataSource, tableName, tableDef, displayedColumns, stripedRows e activeRowParams a input signals.
2. Rendere tableName required.
3. Convertire tutte le query IbTable a contentChild/contentChildren/viewChild.
4. Rimuovere le query duplicate mobile* e riusare le query canoniche.
5. Usare computed per displayed columns effettive, capability e host classes quando appropriato.
6. Aggiornare il template chiamando i signal e mantenendo espressioni semplici/null-safe.
7. Usare effect con cleanup per dataSource replacement e binding reattivi.
8. Consumare i campi initial* una sola volta; mantenere reattive le opzioni visuali paginator.
9. Conservare i selector e i nomi binding template pubblici.
10. Non creare facade/deprecation property per il precedente accesso TypeScript.
11. Mantenere un adapter temporaneo per l'evento sort mobile corrente; la conversione dell'output
    mobile al value object `Sort` è responsabilità dello Step 19.
12. Nessun setTimeout e nessuna subscription senza cleanup.

## CONSTRAINTS:
- Non migrare ancora i child component nello stesso step.
- Non usare cast o sintassi TypeScript nei template.
- Non chiamare ripetutamente metodi costosi dal template; usare computed.
- Non modificare CSS o comportamento mobile fuori dall'adattamento contrattuale minimo.

## OUTPUT:
Component e template aggiornati; elenco delle proprietà TypeScript divenute signal.

## ACCEPTANCE CRITERIA:
- `npm run build` completa senza errori.
- table.component.ts non contiene @Input, @ViewChild, @ContentChild o @ContentChildren.
- Non esistono proprietà query duplicate con prefisso mobile.
- tableName usa input.required.
- Il template compila con Angular template checker.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 14 — Riscrivere le integration spec di `IbTable` ✅ DONE

**Target executor:** `unit-jasmine-executor`  
**Model:** DeepSeek v4 Pro  
**Allowed files:**

- `src/app/inobeta-ui/ui/kai-table/table.component.spec.ts`
- `src/app/inobeta-ui/ui/kai-table/table-views-host.stub.spec.ts`

**Read-only reference files:** IbTable, facade, local/remote data source, URL specs  
**Objective:** verificare il bridge UI-store-data source e aggiornare accessi signal.

~~~
## TASK:
Aggiornare e ampliare le spec IbTable per il nuovo stato canonico e le signal API.

## CONTEXT:
Le pipeline data source e il resolver hanno spec dedicate. Qui va verificata l'integrazione Material/filter/views/store, non duplicata tutta la logica unit.

## OBJECTIVE:
Coprire inizializzazione, precedenza visibile, eventi UI, replacement data source e breaking API signal.

## REQUIREMENTS:
1. Aggiornare host fixture con tableName obbligatorio.
2. Aggiornare accessi programmatici alle input/query signal.
3. Testare init senza sort/filter/view.
4. Testare tableDef iniziale e URL override inclusi null e pageIndex.
5. Testare che il primo remote fetch avvenga una volta dopo filter/view resolution.
6. Testare sort/filter -> pageIndex zero e URL/store update.
7. Testare paginator restore e modifica.
8. Testare selectedView null e vista snapshot.
9. Testare replacement runtime del data source.
10. Testare errore [data]+[dataSource].
11. Testare tableName required/immutabile.
12. Conservare coverage di rendering, row group, export trigger e aggregation integration pertinente.

## CONSTRAINTS:
- Non reintrodurre setTimeout nel production code per far passare i test.
- Usare fakeAsync/tick solo per debounce/filter async reali.
- Usare Material harness dove disponibile.
- Non usare fdescribe o fit; non aggiungere nuovi test disabilitati.

## OUTPUT:
Spec aggiornata e lista dei vecchi test sostituiti.

## ACCEPTANCE CRITERIA:
- `ng test --include='src/app/inobeta-ui/ui/kai-table/table.component.spec.ts' --watch=false` passa.
- Sono presenti assertion per null URL, pageIndex restore, primo fetch singolo e data source replacement.
- Non sono aggiunti xdescribe/xit.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 15 — Migrare le API signal dei child desktop ✅ DONE

**Target executor:** `kai-table-executor`  
**Model:** DeepSeek v4 Pro  
**Allowed files:**

- `src/app/inobeta-ui/ui/kai-table/columns/**/*.ts`
- `src/app/inobeta-ui/ui/kai-table/cells.ts`
- `src/app/inobeta-ui/ui/kai-table/action.ts`
- `src/app/inobeta-ui/ui/kai-table/sort-header.ts`

**Read-only reference files:** IbTable signal API, tokens, mobile renderer  
**Objective:** completare la rimozione di `@Input/@Output/@ViewChild/@ContentChild` dal feature desktop.

~~~
## TASK:
Migrare colonne, selection column, aggregate cell, action e sort header alle signal API Angular.

## CONTEXT:
IbTable è già signal-based. I child usano ancora decorator e accedono alle proprietà IbTable come valori normali.

## OBJECTIVE:
Uniformare l'intero folder kai-table senza adapter decorator legacy.

## REQUIREMENTS:
1. Convertire input classici a input/input.required con transform equivalenti.
2. Convertire output EventEmitter a output.
3. Convertire view/content query a signal query, required solo quando realmente garantite.
4. Aggiornare tutti i template inline per invocare signal in modo null-safe.
5. Aggiornare accessi a IbTable/dataSource/query ora signal-based.
6. Preservare auto-registration column, custom accessors, sticky, aggregate e mobileDataRenderer.
7. Preservare i nomi alias come ib-action-column e ibSortHeaderFor.
8. Non creare property getter legacy/deprecati.
9. Non introdurre any nuovi; ridurre quelli toccati quando il tipo è noto.
10. Mantenere output selection e aggregate con gli stessi nomi template.
11. Aggiornare l'helper `IbAggregate.aggregate`, se ancora mantenuto, affinché usi soltanto API
    pubbliche del nuovo data source e non `_orderData`/`_pageData`.

## CONSTRAINTS:
- Non ridisegnare template o CSS.
- Non modificare filtri, views o mobile.
- Non tentare in questo step una riscrittura del workaround MatSortHeader._sort; registrarlo fra i rischi residui se resta necessario.
- Non usare cast nei template.

## OUTPUT:
Child component aggiornati e inventario delle breaking property signal.

## ACCEPTANCE CRITERIA:
- `npm run build` completa senza errori.
- Nei file production sotto ui/kai-table non restano decorator @Input, @Output, @ViewChild, @ViewChildren, @ContentChild o @ContentChildren.
- I binding template pubblici conservano i nomi precedenti.
- Custom column e selection compilano.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 16 — Coprire le API signal dei child desktop ✅ DONE

**Target executor:** `unit-jasmine-executor`  
**Model:** DeepSeek v4 Pro  
**Allowed files:**

- `src/app/inobeta-ui/ui/kai-table/columns/**/*.spec.ts`
- `src/app/inobeta-ui/ui/kai-table/cells.spec.ts` (new/update)
- `src/app/inobeta-ui/ui/kai-table/action.spec.ts` (new/update)
- `src/app/inobeta-ui/ui/kai-table/sort-header.spec.ts` (new/update)

**Read-only reference files:** Step 15 production files, table component spec  
**Objective:** verificare binding invariati e accesso programmatico signal.

~~~
## TASK:
Aggiungere o aggiornare le spec per i child Kai Table migrati a signal.

## CONTEXT:
I binding template restano compatibili, mentre l'accesso TypeScript cambia. Column registration e static query timing sono aree ad alto rischio.

## OBJECTIVE:
Prevenire regressioni su registrazione colonne, output e rendering.

## REQUIREMENTS:
1. Testare name/header/accessor/sort/sticky signal di IbColumn.
2. Testare custom cell template e registrazione/rimozione MatColumnDef.
3. Testare date/number/text specific inputs.
4. Testare selection output e toggle.
5. Testare aggregate input/output.
6. Testare action TemplateRef query.
7. Testare ibSortHeaderFor binding.
8. Verificare almeno un accesso programmatico al valore tramite signal invocation.

## CONSTRAINTS:
- Usare NoopAnimationsModule nei component test Material.
- Non testare dettagli CSS.
- Non usare fdescribe o fit.

## OUTPUT:
Spec child aggiunte/aggiornate.

## ACCEPTANCE CRITERIA:
- `ng test --include='src/app/inobeta-ui/ui/kai-table/**/*.spec.ts' --watch=false` passa.
- Sono coperti registration lifecycle e output selection/aggregate.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 17 — Disaccoppiare data export dagli internals del data source ✅ DONE

**Target executor:** `task-executor`  
**Model:** DeepSeek v4 Flash  
**Allowed files:**

- `src/app/inobeta-ui/ui/data-export/data-export.service.ts`

**Read-only reference files:** data source contracts/capability, IbTable export bridge  
**Objective:** usare API pubbliche/capability e mantenere fuori scope full export remoto.

~~~
## TASK:
Aggiornare IbDataExportService per non usare proprietà underscore dei data source.

## CONTEXT:
Il service usa _orderData, _pageData, filteredData, selectionColumn e sortedColumns. Il nuovo data source espone capability e snapshot esportabili pubblici.

## OBJECTIVE:
Eliminare il coupling cross-feature agli internals e rispettare le limitazioni remote.

## REQUIREMENTS:
1. Usare le API pubbliche del data source locale per all/current.
2. Ricevere le righe selected dal bridge IbTable/selection, non conservarle nel data source.
3. Non offrire all/selected quando la capability remota non lo consente.
4. Conservare trasformazioni colonna e formati esistenti.
5. Gestire dataset non supportato con errore esplicito, non con array undefined.

## CONSTRAINTS:
- Non implementare full export remoto.
- Non modificare dialog UI o provider formato.
- Non aggiungere any nuovi.
- Non modificare file sotto `ui/kai-table`; il relativo helper aggregate è responsabilità dello Step 15.

## OUTPUT:
Service aggiornato e lista degli internals eliminati.

## ACCEPTANCE CRITERIA:
- `npm run build` completa senza errori.
- data-export.service.ts non usa _orderData o _pageData.
- Il remoto non espone full export come supportato.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 18 — Aggiornare i test data export ✅ DONE

**Target executor:** `unit-jasmine-executor`  
**Model:** DeepSeek v4 Flash  
**Allowed files:** `src/app/inobeta-ui/ui/data-export/**/*.spec.ts`  
**Read-only reference files:** service aggiornato, data source contracts  
**Objective:** verificare all/current/selected locale e rifiuto remoto.

~~~
## TASK:
Aggiornare le spec di IbDataExportService per il nuovo contratto data source.

## CONTEXT:
Il service non può più raggiungere internals o selection column dentro il data source.

## OBJECTIVE:
Conservare il comportamento locale ed esplicitare i limiti remoti.

## REQUIREMENTS:
1. Testare export all locale filtrato/ordinato.
2. Testare export current page locale.
3. Testare selected rows passate dal caller.
4. Testare trasformazioni colonna.
5. Testare richiesta unsupported su remoto.

## CONSTRAINTS:
- Non usare dialog reali se non necessari.
- Non usare fdescribe o fit.

## OUTPUT:
Spec aggiornate.

## ACCEPTANCE CRITERIA:
- `ng test --include='src/app/inobeta-ui/ui/data-export/**/*.spec.ts' --watch=false` passa.
- Nessun nuovo test è disabilitato.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 19 — Adattare il renderer mobile al nuovo contratto ✅ DONE

**Target executor:** `kai-table-mobile-executor`  
**Model:** DeepSeek v4 Pro  
**Allowed files:** `src/app/inobeta-ui/ui/kai-table-mobile/**/*.ts`  
**Read-only reference files:** IbTable signal API, data source contracts, shared state types  
**Objective:** mantenere il mobile stateless rispetto allo stato tabella e compatibile con connect concorrenti.

~~~
## TASK:
Adattare Kai Table Mobile ai nuovi data source e alla signal API desktop.

## CONTEXT:
Il mobile riceve lo stesso data source del desktop. Sort/filter/page restano canonici nella facade/store desktop; non va creato uno slice mobile.

## OBJECTIVE:
Preservare rendering e toolbar usando value object e cleanup corretti.

## REQUIREMENTS:
1. Tipizzare dataSource con il nuovo contratto comune.
2. Usare Sort come output, non costruire MatSort manualmente.
3. Collegarsi allo stream condiviso senza chiamare disconnect globale.
4. Gestire dataSource replacement e undefined con cleanup effect.
5. Correggere il check actionColumn usando il valore del signal.
6. Rimuovere o convertire il ViewChild scrollAnchor inutilizzato nel root mobile.
7. Ricevere pageSize/stato corrente dalla facade desktop quando già disponibili.
8. Conservare la propagazione sort verso il facade desktop; niente stato sort parallelo canonico.
9. Uniformare il TemplateRef context row group con desktop se necessario all'adattamento.

## CONSTRAINTS:
- Non implementare infinite scroll multipagina o fetch remoto incrementale.
- Non correggere l'empty state mobile del ticket separato.
- Non introdurre NgRx nel mobile.
- Non modificare file sotto ui/kai-table.
- Non cambiare CSS se non indispensabile alla compilazione.

## OUTPUT:
File mobile aggiornati e limiti mobile rimasti fuori scope.

## ACCEPTANCE CRITERIA:
- `npm run build` completa senza errori.
- Il mobile non importa MatSort come tipo di output/evento.
- Non esiste un nuovo store mobile.
- Le subscription data source vengono chiuse al replacement/destroy.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 20 — Aggiungere unit test mobile di integrazione ✅ DONE

**Target executor:** `unit-jasmine-executor`  
**Model:** DeepSeek v4 Pro  
**Allowed files:** `src/app/inobeta-ui/ui/kai-table-mobile/**/*.spec.ts`  
**Read-only reference files:** mobile production, data source test stubs  
**Objective:** coprire connessione condivisa, replacement e sort forwarding.

~~~
## TASK:
Creare spec Jasmine per Kai Table Mobile dopo l'adattamento ai nuovi contratti.

## CONTEXT:
Non esistono spec mobile dedicate. DEVK-1066 deve coprire solo integrazione col nuovo core, non feature mobili future.

## OBJECTIVE:
Verificare che il mobile consumi righe e propaghi intent senza duplicare stato.

## REQUIREMENTS:
1. Testare render da data source connect.
2. Testare replacement data source e unsubscribe precedente.
3. Testare destroy cleanup.
4. Testare sortUpdated con Sort value object.
5. Testare assenza action column senza falsa colonna ib-action.
6. Testare context row group compatibile.
7. Non aggiungere assertion su infinite scroll multipagina o nuovo empty state.

## CONSTRAINTS:
- Usare NoopAnimationsModule e TranslateModule.
- Non usare viewport/E2E reali.
- Non usare fdescribe o fit.

## OUTPUT:
Nuove spec mobile.

## ACCEPTANCE CRITERIA:
- `ng test --include='src/app/inobeta-ui/ui/kai-table-mobile/**/*.spec.ts' --watch=false` passa.
- Sono presenti test per replacement e Sort output.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 21 — Finalizzare barrel e public API ✅ DONE

**Target executor:** `task-executor`  
**Model:** DeepSeek v4 Flash  
**Allowed files:**

- `src/app/inobeta-ui/ui/kai-table/index.ts`
- `src/app/inobeta-ui/ui/kai-table/store/index.ts`
- `public_api.ts` (solo se il barrel esistente non è sufficiente)

**Read-only reference files:** tutti i nuovi contratti/source, `ng-package.json`  
**Objective:** rendere importabili i simboli supportati senza deep import.

~~~
## TASK:
Finalizzare gli export pubblici della nuova architettura Kai Table.

## CONTEXT:
Il package root già re-esporta il barrel kai-table, ma il locale e diversi token utili agli esempi non sono oggi pubblici.

## OBJECTIVE:
Una superficie pubblica coerente e verificata da ng-packagr.

## REQUIREMENTS:
1. Esportare IbTableLocalDataSource, contratto comune, remote request/response e opzioni remote.
2. Conservare l'export compatibility IbTableDataSource se mantenuto.
3. Esportare IbTableDef, state/filter types, nuove action e selector supportati.
4. Conservare i vecchi selector/action compatibility dichiarati nel piano.
5. Esportare i token necessari a custom columns/aggregation già documentati.
6. Non duplicare export espliciti in public_api.ts se il barrel chain funziona.
7. Verificare assenza di collisioni di nomi nei declaration file.

## CONSTRAINTS:
- Non rimuovere export pubblici non coinvolti.
- Non esportare classi helper interne della facade/codec se non sono contratti consumer.
- Non modificare implementation code.

## OUTPUT:
Barrel aggiornati e lista dei nuovi simboli pubblici.

## ACCEPTANCE CRITERIA:
- `npm run packagr` completa senza errori.
- I declaration file espongono IbTableLocalDataSource e IbTableRemoteDataSource.
- Gli esempi non devono più richiedere deep import per data source o token.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 22 — Migrare gli esempi applicativi ✅ DONE

**Target executor:** `examples-executor`  
**Model:** DeepSeek v4 Flash  
**Allowed files:**

- `src/app/examples/kai-table-example/**/*`

**Read-only reference files:** public API, nuovi data source/types, route esistenti  
**Objective:** aggiornare i consumer reali senza introdurre nuove demo o testi.

~~~
## TASK:
Migrare tutti gli esempi Kai Table alla nuova public API DEVK-1066.

## CONTEXT:
Gli esempi coprono data array, data source esplicito, custom sort/filter, aggregation, views, routing e remote GitHub. Alcuni usano deep import.

## OBJECTIVE:
Usare esclusivamente public_api e documentare implicitamente i nuovi contratti tramite esempi compilabili.

## REQUIREMENTS:
1. Aggiungere tableName unico a ogni ib-kai-table.
2. Sostituire deep import con public_api.
3. Usare IbTableLocalDataSource negli esempi locali espliciti.
4. Migrare GithubDataSource a fetchData(readonly request).
5. Aggiornare tableDef a initialPageSize/initialPageIndex e nuovi campi quando pertinente.
6. Aggiornare eventuali accessi programmatici a signal.
7. Mantenere viste opzionali e selectedView null come default.
8. Non aggiungere selezione/full export/aggregazione globale al remoto.
9. Rimuovere console.log non necessario nel remote example.

## CONSTRAINTS:
- Non modificare libreria, routing, menu o traduzioni salvo errore di compilazione direttamente causato dalla migrazione.
- Non aggiungere stringhe UI nuove.
- Non cambiare layout o dataset degli esempi.

## OUTPUT:
Esempi aggiornati e inventario tableName assegnati.

## ACCEPTANCE CRITERIA:
- `npm run build` completa senza errori.
- Nessun esempio Kai Table fa deep import da src/app/inobeta-ui.
- Ogni ib-kai-table negli esempi ha tableName.
- GithubDataSource usa il nuovo request object.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 23 — Aggiornare Storybook e documentazione d'uso ✅ DONE

**Target executor:** `storybook-executor`  
**Model:** DeepSeek v4 Flash  
**Allowed files:**

- `src/app/inobeta-ui/ui/kai-table/table.stories.ts`
- `src/app/inobeta-ui/ui/kai-table/table.mdx`

**Read-only reference files:** public API, table types, URL codec, remote data source  
**Objective:** documentare stato, precedenza, null, local/remote e signal access.

~~~
## TASK:
Aggiornare stories e MDX Kai Table alla nuova architettura DEVK-1066.

## CONTEXT:
La documentazione corrente descrive initialSort, vecchio fetchData e selector URL parziali. Deve diventare la fonte d'uso del nuovo contratto.

## OBJECTIVE:
Documentare senza ambiguità inizializzazione e data source.

## REQUIREMENTS:
1. Aggiornare tutte le stories con tableName e nuovo tableDef.
2. Documentare IbTableLocalDataSource e shorthand [data].
3. Documentare che [data] e [dataSource] sono mutuamente esclusivi.
4. Documentare fetchData(request), filterDebounceMs e cancellazione switchMap.
5. Inserire la matrice URL field > view snapshot > tableDef initial* > technical default.
6. Documentare absent vs null con esempio filters:null.
7. Documentare selectedView null e views opzionali.
8. Documentare reset pagina su sort/filter e browser back/forward.
9. Aggiornare selector NgRx e full-state URL behavior.
10. Documentare che remote multi-page selection, full export e global aggregation non sono supportati.
11. Aggiornare snippet programmatici per signal API.

## CONSTRAINTS:
- Non modificare component implementation.
- Non introdurre story per feature mobile fuori scope.
- Non aggiungere testo visibile nell'app demo.

## OUTPUT:
Stories/MDX aggiornati e sezioni nuove indicate.

## ACCEPTANCE CRITERIA:
- `npm run build-storybook` completa senza errori.
- table.mdx contiene la precedenza e la semantica null.
- Nessuno snippet usa fetchData(MatSort, MatPaginator, filter).
- Tutte le stories specificano tableName.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 24 — Scrivere la migration guide delle breaking change ✅ DONE

**Target executor:** `task-executor`  
**Model:** DeepSeek v4 Flash  
**Allowed files:**

- `src/app/inobeta-ui/ui/kai-table/deprecation-guide.md`
- `docs/DEVK-1066-kai-table-migration.md` (new)

**Read-only reference files:** component/data source public API finali, table.mdx  
**Objective:** dare istruzioni di migrazione esplicite senza adapter per le proprietà decorator.

~~~
## TASK:
Documentare tutte le breaking change DEVK-1066 e il percorso di migrazione consumer.

## CONTEXT:
La migrazione signal è intenzionalmente senza deprecation facade. Anche tableName required, tableDef, remote fetch e URL writer cambiano contratto.

## OBJECTIVE:
Una guida concisa ma completa, verificabile contro i simboli finali.

## REQUIREMENTS:
1. Elencare accesso TypeScript prima/dopo per input, output e query signal.
2. Documentare tableName required e unicità.
3. Documentare IbTableLocalDataSource e compatibility IbTableDataSource.
4. Documentare nuovo fetchData(request) e filterDebounceMs.
5. Documentare nuovi campi tableDef e precedenza, inclusa initialView snapshot.
6. Documentare null come override esplicito.
7. Documentare schema URL v2 e lettura legacy sentinel.
8. Documentare [data]/[dataSource] mutuamente esclusivi.
9. Documentare limiti remoti fuori scope.
10. Rimuovere il contenuto della deprecation guide e riscriverne il contenuto con quanto emerso in questo lavoro.

## CONSTRAINTS:
- Non modificare production code.
- Non promettere feature remote/mobile non implementate.
- Non indicare deprecation facade per le vecchie property decorator.

## OUTPUT:
Migration guide e deprecation guide aggiornate.

## ACCEPTANCE CRITERIA:
- La guida contiene sezioni Signals, Initialization precedence, Data sources, URL e Breaking changes.
- Non dichiara supporto a MatTableDataSource generico.
- Non dichiara esistente ibRowClicked se non implementato.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 25 — Review finale integrata ✅ DONE

**Target executor:** `code-reviewer`  
**Model:** DeepSeek v4 Pro  
**Allowed files:** nessuno, review read-only  
**Read-only reference files:** tutti i file modificati da DEVK-1066 e questo piano  
**Objective:** verificare aderenza architetturale, regressioni e scope prima della validazione finale.

~~~
## TASK:
Eseguire una review read-only dell'implementazione completa DEVK-1066 rispetto al piano.

## CONTEXT:
Il change attraversa store, URL, views adapter, data source, component signal, mobile, export, esempi e docs.

## OBJECTIVE:
Individuare difetti bloccanti, coupling residuo e test mancanti senza modificare codice.

## REQUIREMENTS:
1. Verificare che NgRx sia la source of truth e i data source non importino Store/URL/views.
2. Verificare precedenza e null semantics.
3. Verificare un solo first fetch remoto e cancellation/debounce selettivo.
4. Verificare browser back/forward e loop prevention.
5. Verificare assenza decorator richiesti sotto ui/kai-table.
6. Verificare cleanup effect/subscription e replacement data source.
7. Verificare limiti remoti non accidentalmente esposti.
8. Verificare public API, esempi, docs e test.
9. Classificare findings per severità con file e riga.

## CONSTRAINTS:
- Non modificare file.
- Non proporre refactor fuori scope senza distinguerli dai blocker.
- Non considerare blocker infinite scroll/empty state mobile esplicitamente fuori scope.

## OUTPUT:
Review con findings ordinati per severità, oppure dichiarazione esplicita di assenza findings.

## ACCEPTANCE CRITERIA:
- Ogni finding include evidenza, impatto e raccomandazione.
- La review copre tutti i nove requisiti.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Dependencies between steps

```text
1 ─▶ 2
│
├─▶ 3 ─▶ 4
│    │
│    └─▶ 5 ─▶ 6
│         │
├─────────┴─▶ 7 ─▶ 8
│               │
└───────────────┴─▶ 9 ─▶ 10
                         │
                         └─▶ 11 ─┬─▶ 12
                                 └─▶ 12.1 ─┬─▶ 12.2
                                           └─▶ 12.3

12.2 + 12.3 ─▶ 13 ─▶ 14 ─▶ 15 ─▶ 16
                     ├─▶ 17 ─▶ 18
                     └─▶ 19 ─▶ 20

16 + 18 + 20 ─▶ 21 ─▶ 22
                    ├─▶ 23
                    └─▶ 24

22 + 23 + 24 ─▶ 25
```

Gli step di test seguono il relativo source step. Dopo Step 11, Step 12 può procedere mentre Step 12.1
esegue il cutover remoto/component; Step 12.2 e Step 12.3 possono poi procedere in parallelo. Step 17 e
Step 19 possono procedere in parallelo dopo Step 13, purché non modifichino file fuori dal proprio
dominio.

## 6. Impacted Areas

### Library source

| Area | File principali | Impatto |
|---|---|---|
| State contracts | `table.types.ts`, nuovo resolver | Nuovo snapshot canonico e `tableDef` esteso |
| NgRx | `store/**/*.ts` | Record completo per tableName, action atomiche, selector completi |
| URL | `table-url.service.ts`, nuovo codec, effects | Schema v2, legacy reader, full-state write |
| Views adapter | `table-views-host.ts`, `ui/views/...` | Resolve iniziale e default view `null` |
| Data source | `table-data-source.ts`, nuovo local, remote | Pipeline indipendenti e query value-object |
| Component | `table.component.ts/html` | Facade, init deterministico e signal API |
| Child desktop | columns, cells, action, sort header | Signal API breaking |
| Export | `data-export.service.ts` | API pubbliche invece di internals |
| Mobile | `ui/kai-table-mobile/**/*.ts` | Nuovo contract e `Sort` event |
| Docs/demo | examples, Storybook, migration docs | Consumer aggiornati e breaking change documentate |

### Public API symbols

**Nuovi o promossi:**

- `IbTableLocalDataSource<T>`;
- contratto/capability data source comune;
- request remota readonly e opzioni `filterDebounceMs`;
- snapshot state e raw filter state;
- nuove action/selector table state;
- token già necessari a custom columns/aggregation ma oggi non esportati.

**Modificati:**

- `IbTableDef`;
- input/query/output di `IbTable` e child desktop, ora signal;
- `IbTableRemoteDataSource.fetchData()`;
- `IbTableViewsHost`;
- semantica selector URL, ora derivati dallo stato completo;
- `tableName`, ora required.

**Compatibility mantenuta dove utile:**

- `IbTableDataSource<T>` come wrapper deprecato del locale;
- vecchie action/selector URL come facade deprecata;
- decoder URL legacy e sentinel default-view.

Non viene fornita compatibility facade per l'accesso programmatico alle vecchie property Angular
decorator-based, come richiesto.

## 7. Risks

1. **Breaking API signal — alto:** consumer che accedono via TypeScript a input/query/output devono
   invocare signal o usare `OutputEmitterRef`. Mitigazione: Step 24 e aggiornamento esempi.
2. **Remote fetch contract — alto:** ogni subclass remota deve migrare a request object. Mitigazione:
   esempio GitHub, docs e spec dedicate.
3. **View persistence — alto:** gli snapshot esistenti usano il campo `filter` e il sentinel default.
   Mitigazione: normalizzazione read-side e test legacy.
4. **Filter raw state serialization — medio/alto:** valori come `Date` vengono serializzati in JSON e
   richiedono che i filter component accettino il valore reidratato. Il ticket corregge la tipizzazione,
   ma un codec filter-specific resta un possibile follow-up.
5. **Loop URL/store — alto:** una navigation prodotta dagli effect può essere riosservata dalla facade.
   Mitigazione: origin/serialized-state guard e test back/forward.
6. **First fetch duplicato — alto:** filter e view resolution sono asincroni. Mitigazione: initialization
   barrier e test con conteggio chiamate.
7. **Data source replacement — medio:** desktop e mobile condividono la connessione. Mitigazione:
   connect reference-safe ed effect cleanup.
8. **Public export collision — medio:** promuovere local data source, state e token può generare nomi
   duplicati nei declaration file. Mitigazione: `npm run packagr` nello Step 21.
9. **NgRx provider duplication — medio:** `provideState/provideEffects` rimane nel feature module.
   Verificare import multipli; un cambio di registration strategy è fuori scope se non emerge un bug.
10. **Angular Material private API — medio:** `IbSortHeader` usa `MatSortHeader._sort`. La migrazione
    signal non elimina automaticamente questo rischio; una riscrittura dedicata va pianificata se il
    workaround non è più necessario/supportato.
11. **Mobile parity — noto/fuori scope:** infinite scroll multipagina, full remote paging ed empty state
    mobile restano invariati.
12. **State retention — basso/voluto:** lo store conserva record dopo destroy. Applicazioni con molti
    tableName dinamici potrebbero richiedere in futuro una policy di eviction esplicita.

## 8. Validation Checklist

### Automatica

- [ ] `npm run lint`
- [ ] `npm run test-ci` con coverage globale ≥ 80%
- [ ] `npm run build`
- [ ] `npm run packagr`
- [ ] `npm run build-storybook`
- [ ] Ricerca production sotto `ui/kai-table/`: nessun `@Input`, `@Output`, `@ViewChild`,
      `@ViewChildren`, `@ContentChild`, `@ContentChildren`
- [ ] Ricerca nei data source: nessun import di Store, Router, URL service, views o selection
- [ ] Ricerca esempi: nessun deep import del data source/token Kai Table
- [ ] Nessun `fdescribe` o `fit`

### Manuale — locale

- [ ] Apertura tabella senza sort/filter/view: nessuna inizializzazione applicativa artificiale
- [ ] `tableDef` applica tutti i campi initial*
- [ ] URL parziale sovrascrive solo i campi presenti
- [ ] URL `filters: null` cancella il default `tableDef`
- [ ] Sort/filter riportano a pagina zero
- [ ] Page index viene ripristinato
- [ ] Back/forward aggiorna una tabella già montata
- [ ] Due tabelle con tableName diversi mantengono URL/store indipendenti
- [ ] Sostituzione runtime data source non duplica righe/subscription

### Manuale — views

- [ ] Senza `IbViewModule`, selectedView resta null e la tabella funziona
- [ ] `initialView` risolve e applica lo snapshot prima del render/fetch
- [ ] Lo snapshot vista prevale sugli altri initial* di tableDef
- [ ] Singoli campi URL prevalgono sullo snapshot
- [ ] Vista default produce `selectedView: null`
- [ ] Deep link legacy con `__ibTableView__all` continua ad aprirsi come default
- [ ] Vista sconosciuta non interrompe la tabella

### Manuale — remoto

- [ ] Primo load eseguito una sola volta dopo init
- [ ] Filter attende `filterDebounceMs`
- [ ] Sort, pagina e refresh partono immediatamente
- [ ] Una risposta obsoleta non sovrascrive quella recente
- [ ] Errore originale osservabile e stato `http_error`
- [ ] Risposta vuota produce `no_data`
- [ ] Selection multipagina/full export/global aggregate non vengono offerti come supportati

### Manuale — signals e mobile

- [ ] Binding template esistenti continuano a compilare
- [ ] Accessi programmatici aggiornati seguono la migration guide
- [ ] Colonne custom continuano a registrarsi/rimuoversi
- [ ] Mobile mostra lo stesso page stream del desktop senza disconnetterlo
- [ ] Sort mobile aggiorna lo stato NgRx canonico
- [ ] Nessuna regressione intenzionale viene attribuita a infinite scroll/empty state mobile fuori scope
