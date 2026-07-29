# DEVK-1066 — Step 12.1: separazione del remoto e cutover di `IbTable`

## 1. Goal

Implementare esclusivamente lo step 12.1 del piano DEVK-1066: rendere
`IbTableRemoteDataSource` indipendente dalla pipeline locale e collegare `IbTable`
ai nuovi contratti locale/remoto, senza migrare ancora la signal API e senza
modificare file oltre ai tre consentiti.

Il risultato deve mantenere temporaneamente gli input/query decorator-based di
`IbTable`, ma usare la facade e il record NgRx già introdotti per inizializzare
il data source con uno stato canonico prima del primo fetch.

## 2. Current State

### Piano e dipendenze già presenti

- Lo step 11 ha introdotto `data-source.types.ts` e `IbTableLocalDataSource`.
- `IbTableDataSource` è ora un wrapper compatibility locale, ma conserva API
  Material legacy (`sort`, `paginator`, `filter`, `sortState`, ecc.).
- La facade `IbKaiTableStateFacade` esiste, ma `table.component.ts` non la usa:
  oggi inizializza direttamente `IbTableUrlService`, `ActivatedRoute`, data
  source e store.
- Lo store/resolver/codec e l'adapter views sono già disponibili come riferimenti
  read-only per questo step.

### `remote-data-source.ts`

- `IbTableRemoteDataSource<T, V>` estende ancora `IbTableDataSource<T>`.
- Importa `MatSort`, `MatPaginator`, `Store`, `urlStateActions` e dipende da
  `tableName`, `filter`, `sort`, `paginator`, `_renderData` e altri internals
  della classe locale/compatibility.
- `fetchData()` riceve tre argomenti mutabili (`MatSort`, `MatPaginator`,
  filtro), non una request value-object.
- `_updateChangeSubscription()` usa `combineLatest`/`merge` e applica
  `debounceTime(500)` a refresh, sort, pagina e filtro indistintamente.
- Gli errori vengono trasformati in `null`/righe vuote; l'errore originale non
  è esposto.
- La lunghezza del paginator viene aggiornata direttamente dal data source.
- Non esiste ancora un contratto esplicito per stato, errore, total count,
  capability o connessioni concorrenti.

### `table.component.ts`

- `IbTable` usa ancora `@Input`, `@ContentChild`/`@ContentChildren` e
  `@ViewChild`; la migrazione signal è correttamente rinviata allo step 13.
- `dataSource` è tipizzato come `IbTableDataSource<unknown>` e inizializzato con
  il wrapper locale legacy.
- `ngOnInit()` legge `ActivatedRoute.snapshot`, assegna paginator/tableName e
  si sottoscrive a `_state` solo tramite `instanceof IbTableRemoteDataSource`.
- `ngAfterContentInit()` assegna direttamente al data source sort, filter,
  columns, view, aggregazioni e stato URL; usa più `setTimeout()` per evitare
  `NG0100`.
- Il componente dispatcha `urlStateActions` direttamente per paginator e il
  data source remoto dispatcha sort/filter URL state.
- `data` e `dataSource` possono essere valorizzati contemporaneamente senza una
  regola esplicita.
- `updateSortFromMobile()` emette un `MatSort` manuale: l'adattamento minimo
  previsto in questo step deve preservare questo bridge, perché la conversione
  mobile a `Sort` è fuori scope.

### `table.component.html`

- Il template usa `[dataSource]="dataSource"` direttamente con Material table.
- Il paginator è configurato da `tableDef`, disabilitato quando `state !==
  'idle'`, e invoca `setPaginatorState()` sull'evento pagina.
- Le opzioni export usano `isRemote` per nascondere l'export completo.
- Footer aggregato e no-data leggono internals legacy (`shouldDisplayAggregationFooter`,
  `columns.length`), quindi il cutover deve fornire un bridge compatibile o
  usare capability senza introdurre binding a file non consentiti.
- Il blocco mobile riceve lo stesso data source e deve continuare a ricevere
  lo stream di righe condiviso.

## 3. Assumptions / Open Questions

### Assunzioni operative

1. La facade `IbKaiTableStateFacade` è già fornita nel perimetro del componente
   o può essere resa disponibile usando esclusivamente modifiche a
   `table.component.ts`; non si aggiunge un provider in altri file.
2. `data-source.types.ts` è il contratto di riferimento. Se non contiene un
   tipo remoto/base sufficiente per stato, errore, total count e connect, il
   planner considera necessario un chiarimento perché non è consentito
   modificarlo nello step 12.1.
3. Il data source remoto può implementare direttamente `DataSource<T>` e
   definire nel proprio file i soli tipi remoti necessari, senza duplicare o
   contraddire il contratto comune.
4. Gli input/query decorator-based restano invariati; non si anticipano
   `input()`, `contentChild()` o `viewChild()`.
5. Non vengono aggiunti test in questo step: lo step 12.2 è il proprietario di
   `remote-data-source.spec.ts` e i test di integrazione di `IbTable` sono
   successivi.

### Incompatibilità da risolvere o segnalare prima dell'esecuzione

- Il tipo corrente di `dataSource` (`IbTableDataSource<unknown>`) non accetta
  naturalmente il nuovo remoto indipendente né il locale esplicito; il
  componente deve passare a un tipo comune compatibile o a un union/adapter
  definito nei tre file consentiti.
- Il template e il componente usano numerosi internals del wrapper locale che
  il nuovo contratto non garantisce. Se non è possibile mantenere tali bridge
  senza modificare `data-source.types.ts`/`local-data-source.ts`, l'executor deve
  fermarsi con `NEED CLARIFICATION`, non ampliare gli allowed files.
- La facade non è attualmente collegata a `IbTable`; la sua integrazione deve
  evitare di reimplementare resolver/URL/store nel componente.
- Gli esempi e le spec esistenti usano ancora `fetchData(sort, page, filter)`;
  con allowed files limitati non possono essere aggiornati in questo step.
- Il template contiene export/aggregation/selection legacy. Le capability del
  nuovo data source devono essere lette senza `instanceof`; se il contratto
  comune non espone capability sufficienti per il template attuale, va
  documentato come blocker, non corretto fuori perimetro.

## 4. Proposed Approach

Eseguire un cutover unico e conservativo in due parti, nello stesso step:

1. Riscrivere il remoto come `DataSource<T>` autonomo con request readonly,
   stream stabili e trigger separati. Il remoto riceve gli aggiornamenti di
   stato dal componente tramite value-object; non conosce store, router, views,
   selection o controlli Material.
2. Ridurre `IbTable` a bridge fra Material/template, filter/views/mobile, facade
   e data source. L'inizializzazione deve attendere la risoluzione della facade,
   applicare lo snapshot al paginator/sort/filter e collegare il data source una
   sola volta dopo l'init.

Il componente deve mantenere compatibilità visuale e decorator API, ma non deve
conservare la responsabilità di persistenza URL. Gli eventi Material diventano
intent della facade; lo stato osservato dalla facade viene applicato al data
source. Per `[data]`, usare un locale interno esplicito; se `[dataSource]` e
`[data]` sono entrambi assegnati, rifiutare la combinazione con un errore
deterministico invece di dipendere dall'ordine degli input.

## 5. Step-by-Step Plan

### Step 12.1 — Remote data source e cutover `IbTable`

**Target executor:** `kai-table-executor`  
**Model:** DeepSeek v4 Pro

**Allowed files:**

- `src/app/inobeta-ui/ui/kai-table/remote-data-source.ts`
- `src/app/inobeta-ui/ui/kai-table/table.component.ts`
- `src/app/inobeta-ui/ui/kai-table/table.component.html`

**Read-only reference files:**

- `src/app/inobeta-ui/ui/kai-table/data-source.types.ts`
- `src/app/inobeta-ui/ui/kai-table/local-data-source.ts`
- `src/app/inobeta-ui/ui/kai-table/table-data-source.ts`
- `src/app/inobeta-ui/ui/kai-table/table-state.facade.ts`
- `src/app/inobeta-ui/ui/kai-table/table-state-resolver.ts`
- `src/app/inobeta-ui/ui/kai-table/table.types.ts`
- `src/app/inobeta-ui/ui/kai-table/store/**/*.ts`
- `src/app/inobeta-ui/ui/kai-table/columns/**/*`
- `src/app/inobeta-ui/ui/kai-filter/**/*`
- `src/app/inobeta-ui/ui/kai-table/table-views-host.ts`
- `src/app/inobeta-ui/ui/kai-table-mobile/**/*`
- `src/app/inobeta-ui/ui/data-export/**/*`

**Objective:** separare la pipeline server-side e collegare `IbTable` alla
facade/data source senza anticipare la migrazione signal.

**Key requirements:**

1. In `remote-data-source.ts`, non estendere `IbTableDataSource` né
   `IbTableLocalDataSource`; usare direttamente CDK `DataSource<T>` o il
   contratto comune già esistente.
2. Definire/consumare una request readonly con `sort: Sort | null`,
   `pageIndex`, `pageSize` e filtro server tipizzato. `fetchData` deve ricevere
   un solo value-object; non importare `MatSort` o `MatPaginator`.
3. Conservare `IbFetchDataResponse<T>` con `data` e `totalCount`, aggiungendo
   solo i tipi necessari per stato/errore se il contratto comune non li offre.
4. Esporre stream stabili per righe, stato, errore originale e total count;
   distinguere `loading`, `idle`, `no_data` e `http_error`.
5. Usare `switchMap` per cancellare richieste obsolete. Applicare
   `filterDebounceMs = 500` solo a modifiche filtro; sort, pagina e refresh
   devono bypassare il debounce.
6. Supportare due consumer concorrenti di `connect()` senza che il disconnect
   di uno chiuda la pipeline dell'altro; evitare subscription globali legate a
   un singolo renderer.
7. Dichiarare capability remote: nessun full export, nessuna aggregazione
   globale e nessuna selection multipagina; consentire solo aggregazione della
   pagina corrente se già supportata dal contratto.
8. In `table.component.ts`, collegare la facade per-table esistente e non
   duplicare parsing URL, resolver o dispatch legacy. Attendere l'init risolto
   prima di collegare il data source e garantire un solo primo fetch remoto.
9. Applicare dal record/facade lo stato corrente a paginator, sort, filter,
   aggregazioni e data source. Gli eventi UI devono chiamare gli intent della
   facade; non dispatchare direttamente `urlStateActions` legacy.
10. Gestire replacement del data source con cleanup del precedente e
    riapplicazione dello snapshot corrente. Usare capability, non `instanceof`,
    per export/aggregation/selection.
11. Mantenere temporaneamente decorator input/query e l'evento mobile
    `MatSort`; non convertire le query o gli input a signals.
12. Rendere `[data]` un shorthand per un locale interno; rilevare e rifiutare
    `[data]` + `[dataSource]` in modo deterministico.
13. Rimuovere dal componente la lettura di `ActivatedRoute.snapshot` per lo
    stato, i `setTimeout()` di coordinamento e i dispatch diretti di
    `urlStateActions`. Non aggiungere nuove API decorator legacy.
14. Aggiornare `table.component.html` solo quanto necessario per il contratto
    comune/capability: mantenere desktop, mobile, no-data, paginator, export,
    selection e aggregation senza cast o sintassi TypeScript nel template.

**Constraints:**

- Modificare esclusivamente i tre allowed files.
- Non modificare `local-data-source.ts`, `data-source.types.ts`, facade, store,
  URL service, views, export, mobile o spec.
- Non reintrodurre filter/sort/pagination client-side nel remoto.
- Non importare nel remoto `Store`, `Router`, `IbTableUrlService`, views,
  selection, `MatSort` o `MatPaginator`.
- Non usare `instanceof` per capability.
- Non implementare retry, caching, infinite scroll, export remoto completo,
  selection remota multipagina o aggregazione globale.
- Non ingoiare l'errore HTTP originale.
- Non introdurre signal API, breaking change dello step 13 o testo UI nuovo.
- Non aggiornare esempi/spec per risolvere incompatibilità esterne; riportarle
  nell'output.

**Validation:**

- Verificare staticamente che `remote-data-source.ts` non contenga import o
  riferimenti a `MatSort`, `MatPaginator`, `Store`, `Router`,
  `IbTableUrlService`, views o selection.
- Verificare staticamente che `IbTable` non contenga `setTimeout`, dispatch
  diretto di `urlStateActions` o lettura di `ActivatedRoute.snapshot` per lo
  stato tabella.
- Eseguire `npm run packagr`.
- Eseguire, se il repository compila fino ai consumer esistenti,
  `npx tsc -p tsconfig.app.json --noEmit`; se fallisce per `fetchData` legacy
  negli esempi/spec fuori allowed files, riportare esattamente file, errori e
  motivo senza modificarli.
- Eseguire almeno il controllo Angular/template implicato dal packagr e
  verificare che il template non usi cast, `as` o accessi nullable non protetti.
- Verificare manualmente, tramite fixture esistente se compatibile, che locale
  e remoto condividano lo stream desktop/mobile, che il filtro sia debounced,
  sort/pagina/refresh immediati e che una risposta precedente non sovrascriva
  quella corrente.

**Stop condition:** fermarsi con `NEED CLARIFICATION` se per soddisfare il
contratto servono modifiche a uno dei read-only reference files, se la facade
non è fornibile al componente con gli allowed files, oppure se il template
richiede nuovi simboli pubblici non presenti nei contratti dello step 11.

~~~
## TASK:
Separare `IbTableRemoteDataSource` dalla pipeline locale e fare il cutover di `IbTable` ai contratti data source/facade già introdotti, modificando esclusivamente i tre allowed files.

## CONTEXT:
Repo Angular 20 `inobeta-ui`. Step 11 ha introdotto `IbTableLocalDataSource` e i contratti value-object; la facade/store/resolver/URL codec sono già presenti. Il remoto corrente estende `IbTableDataSource`, riceve componenti Material, dispatcha URL state e applica debounce a ogni trigger. `IbTable` usa ancora decorator API e internals legacy; la signal migration è Step 13.

## OBJECTIVE:
Ottenere una pipeline remote server-side autonoma e un `IbTable` che attenda lo stato canonico risolto, colleghi locale/remoto una sola volta, propaghi gli intent alla facade e mantenga il rendering desktop/mobile.

## REQUIREMENTS:
1. Modifica solo `remote-data-source.ts`, `table.component.ts`, `table.component.html`.
2. Il remoto implementa direttamente CDK `DataSource<T>` o il contratto comune, mai un data source locale/compatibility.
3. `fetchData` riceve un solo request readonly con sort nullable, page index/size e filtro server tipizzato.
4. Debounce configurabile default 500 ms solo per filtro; sort/page/refresh immediati; `switchMap` impedisce risposte obsolete.
5. Esporre righe, loading/idle/no_data/http_error, errore originale e total count; supportare connect concorrenti.
6. Dichiarare capability remote corrette e usare capability, non `instanceof`, nel componente/template bridge.
7. Usare la facade esistente per init, URL/store e intent; rimuovere dispatch URL legacy, snapshot route per stato e setTimeout dal componente.
8. Attendere init prima del primo fetch; gestire replacement data source e stato corrente.
9. Mantenere decorator input/query e bridge sort mobile; non anticipare Step 13.
10. [data] crea/usa un locale interno; [data]+[dataSource] è rifiutato deterministicamente.
11. Nessun filtro locale nel remoto, nessun retry/cache/infinite scroll/export remoto completo/selection multipagina/aggregazione globale.
12. Template senza cast o sintassi TypeScript, con accessi nullable sicuri.

## CONSTRAINTS:
Non modificare file oltre ai tre allowed files. Non modificare test, esempi, barrel, facade, store, URL, views, export o mobile. Se un contratto mancante rende impossibile il cutover senza ampliare lo scope, scrivere `NEED CLARIFICATION` e non applicare workaround fuori perimetro.

## OUTPUT:
Elenco dei tre file modificati, descrizione dei trigger remote/lifecycle di connect e lista degli eventuali blocker di compilazione nei consumer read-only (con file e messaggio), senza modificarli.

## ACCEPTANCE CRITERIA:
- `IbTableRemoteDataSource` non estende `IbTableLocalDataSource` o `IbTableDataSource`.
- `fetchData` riceve un solo value-object readonly.
- `filterDebounceMs` default è 500 e il debounce non avvolge sort/page/refresh.
- Il remoto non importa `Store`, `Router`, `IbTableUrlService`, views, selection, `MatSort` o `MatPaginator`.
- `table.component.ts` non contiene `setTimeout`, dispatch `urlStateActions` legacy o lettura `ActivatedRoute.snapshot` per stato tabella.
- `IbTable` usa capability per export/aggregation/selection, non `instanceof`.
- Il template supera il controllo Angular e non contiene cast TypeScript.
- `npm run packagr` passa oppure l'output documenta il blocker preciso e la sua causa fuori dagli allowed files.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

## 6. Impacted Areas

### File modificabili

- `src/app/inobeta-ui/ui/kai-table/remote-data-source.ts`
- `src/app/inobeta-ui/ui/kai-table/table.component.ts`
- `src/app/inobeta-ui/ui/kai-table/table.component.html`

### API/simboli interessati

- `IbTableRemoteDataSource<T, TFilter>`
- `IbFetchDataResponse<T>`
- nuovo request readonly remoto, se necessario e confinato al file
- `IbTable` e i suoi input/query decorator-based esistenti
- binding template `data`, `dataSource`, `state`, paginator, export e mobile

Non sono autorizzate modifiche a `public_api.ts`, barrel, esempi o spec in questo
step.

## 7. Risks

1. **Contratto incompleto:** i nuovi tipi comuni espongono capability locali ma
   non definiscono chiaramente lo stato/error/total count remoto. Duplicare tipi
   localmente può creare incompatibilità con step 12.2; modificare i contratti
   sarebbe fuori scope.
2. **Facade non integrata:** la facade esistente ha API asincrone e provider
   per-table; un provider mancante o un host non disponibile può impedire il
   bootstrap. Non risolvere toccando `table.module.ts`.
3. **Compatibilità template:** `shouldDisplayAggregationFooter`, `aggregatedData`,
   selection e API export sono internals del wrapper legacy. Il cutover può
   rompere compilazione o rendering se il bridge non è esprimibile nei tre file.
4. **Consumer legacy:** `table.component.spec.ts` e gli esempi definiscono
   `fetchData(sort, page)`; il nuovo metodo causerà errori TypeScript finché gli
   step successivi non li migreranno. Con allowed files attuali è un blocker
   noto, non una modifica autorizzata.
5. **Primo fetch duplicato:** inizializzazione Material, facade e subscription
   possono emettere eventi iniziali multipli. L'ordine init → apply snapshot →
   connect deve essere esplicito e verificato.
6. **Mobile/desktop concorrenti:** un disconnect errato o un Subject condiviso
   con ref-count improprio può interrompere il renderer rimanente.
7. **Stato visuale:** lo stato remote `no_data` deve essere distinto da
   `http_error`; mappature incomplete lasciano il template vuoto o mostrano il
   messaggio errato.
8. **Breaking change involontaria:** rimuovere troppo presto proprietà legacy
   rompe export, colonne e spec. Mantenere solo bridge necessari senza
   reintrodurre responsabilità URL/NgRx nel data source.

## 8. Existing Tests to Consider

- `src/app/inobeta-ui/ui/kai-table/table.component.spec.ts`: copre creazione
  locale/remota, debounce storico da 500 ms, errore HTTP, views, selection,
  row group, export e aggregazioni. Contiene uno stub remoto con firma
  `fetchData(sort: MatSort, page: MatPaginator)` e accessi a internals legacy;
  non è modificabile in questo step.
- `src/app/inobeta-ui/ui/kai-table/local-data-source.spec.ts`: verifica il
  comportamento locale, page clamp, extension point, connect concorrenti e
  capability. Serve come contratto read-only per non contaminare il remoto con
  processing locale.
- `src/app/inobeta-ui/ui/kai-table/table-state.facade.spec.ts`: copre init,
  hydration URL, vista e lifecycle della facade; utile per non duplicare o
  alterare le sue responsabilità nel componente.
- `src/app/inobeta-ui/ui/kai-table/table-state-resolver.spec.ts` e store/URL
  specs: fissano precedenza, null, hydration e assenza di write durante init.
- `src/app/inobeta-ui/ui/kai-table/table-url.service.spec.ts` e
  `store/url-state/effects.spec.ts`: rilevano regressioni se il componente o il
  remoto continuano a dispatchare la vecchia API URL.
- `src/app/inobeta-ui/ui/kai-table/local-data-source.spec.ts` è l'unica spec
  dedicata ai nuovi data source attualmente presente; la spec remota appartiene
  allo step 12.2 e non va aggiunta ora.

## 9. Validation Checklist

- [ ] Solo i tre allowed files risultano modificati.
- [ ] Il remoto è autonomo, tipizzato, cancellabile e privo di dipendenze
      Material/Store/Router/URL/views/selection.
- [ ] Filtro debounced soltanto per `filterDebounceMs`; sort/page/refresh
      immediati.
- [ ] Stato, errore originale, total count e capability sono osservabili.
- [ ] `IbTable` usa facade e stato canonico senza `setTimeout`, snapshot route o
      dispatch URL legacy.
- [ ] `[data]`/`[dataSource]` ha comportamento deterministico e replacement
      gestito.
- [ ] Template Angular safe e mobile/desktop continuano a usare lo stesso
      render stream.
- [ ] `npm run packagr`.
- [ ] `npm run lint` (se il branch raggiunge il controllo lint completo).
- [ ] `npm run test-ci` solo dopo che gli step autorizzati migrano spec/examples;
      per questo step registrare gli eventuali errori preesistenti o causati
      dalla firma `fetchData` senza modificare file fuori scope.
