
# DEVK-672 — Stabilizzare deploy di documentazione ed esempi

- Approved at: 2026-08-05T08:10:19.595Z

> Infrastruttura Docker e GitLab CI per pubblicare stabilmente Storybook versionato ed esempi Angular.

## Plan lineage

- Ancestors: None

## 1. Goal

Rendere automatici e stabili la pubblicazione e il consumo di:

- esempi Angular, serviti come applicazione statica nginx dal corretto output `dist/ui/browser`;
- documentazione Storybook, servita da un container nginx dedicato senza server Node.js;
- tutte le versioni Storybook pubblicate, disponibili sotto `/v/<versione>/`;
- una pagina indice che mostri `current` e tutte le versioni disponibili;
- lo storico Storybook a partire dal primo tag compatibile, rigenerabile tramite un job GitLab manuale.

I servizi `examples` e `docs` resteranno indipendenti, esposti su porte host configurabili e senza gestione TLS interna. Il reverse proxy HTTPS e i certificati Let's Encrypt resteranno responsabilità del server host.

## 2. Current State

- Il `Dockerfile` in root usa un'immagine nginx non versionata e copia `dist/ui` in `/usr/share/nginx/html`.
- `angular.json` usa il builder Angular `@angular/build:application` con base output `dist/ui`. Con Angular 20 i file browser distribuibili sono prodotti in `dist/ui/browser`; questa struttura è stata anche osservata nel container di produzione.
- Il file `env-start` tenta sostituzioni per `#API_PROT#`, `#API_SERVER#` e `#API_PORT#`, ma tali placeholder non esistono nel file `nginx`.
- `env-start` e la relativa installazione/uso di `sed` derivano da un copia-incolla non necessario e possono essere eliminati.
- `docker-compose.yml`:
  - usa il formato con `version: '2'`;
  - definisce solo `examples`;
  - avvia nginx tramite `env-start`;
  - espone la porta tramite `${EXTERNALPORT_HTTP}`.
- `.gitlab-ci.yml`:
  - costruisce Storybook con `npm run build-storybook`;
  - produce `dist/storybook/ui`;
  - pubblica i file via SCP in `~/Apps/$APPNAME/docs/v/$dir`;
  - usa `current` per il branch di default e la versione del `package.json` negli altri ref di pubblicazione;
  - costruisce l'immagine examples usando il `Dockerfile` in root;
  - ignora intenzionalmente l'errore finale di `docker build`, permettendo falsi successi;
  - usa ancora il comando obsoleto `docker-compose`;
  - non contiene un'immagine o un servizio Docker dedicato alla documentazione.
- Il precedente container Storybook, non committato e ormai perduto, usava un server Node.js e mostrava crash `EISDIR`. Il log è un riferimento operativo, non una base da recuperare.
- L'ispezione cronologica dei tag Git ha verificato che:
  - `15.1.0` è il primo tag con comando `build-storybook`, dipendenze Storybook e configurazione `.storybook`;
  - i tag precedenti non supportano la generazione Storybook;
  - lo storico deve quindi partire da `15.1.0`.
- Il piano DEVK-1106 riguarda il contenuto Storybook, non l'infrastruttura di build e deploy. Questo piano non ne modifica requisiti o decisioni.

## 3. Assumptions / Open Questions

### Decisioni confermate

- Il vecchio container Storybook non deve essere recuperato o replicato.
- Il container docs deve servire contemporaneamente tutte le versioni archiviate.
- Deve esistere una pagina indice con link a tutte le versioni.
- Le versioni resteranno archiviate sul server host sotto `~/Apps/$APPNAME/docs/v/`.
- Il servizio docs userà un volume host invece di incorporare tutte le versioni nell'immagine.
- L'indice sarà rigenerato a ogni avvio del container.
- Lo storico Storybook partirà dal tag `15.1.0`.
- La rigenerazione dello storico sarà un job GitLab manuale e non parte delle normali pipeline.
- `examples` e `docs` saranno servizi indipendenti nello stesso `docker-compose.yml`.
- I due servizi useranno porte host separate, configurate tramite variabili GitLab CI.
- TLS, porta 443, certificati e reverse proxy host sono fuori scope.
- L'immagine docs sarà ricostruita automaticamente solo quando cambiano i relativi file Docker/runtime.
- I deploy useranno Docker Compose v2 tramite `docker compose`, senza trattino.
- Il nuovo layout sarà:
  - `docker/examples/Dockerfile`;
  - `docker/examples/assets/`;
  - `docker/docs/Dockerfile`;
  - `docker/docs/assets/`.
- `env-start` e tutti i suoi utilizzi possono essere rimossi.

### Decisioni prese da me, con motivazione

- Il volume `./docs/v` sarà montato in sola lettura nel container su `/srv/docs/versions`. Separarlo dalla document root nginx evita che il mount nasconda l'indice e gli asset inclusi nell'immagine.
- Le versioni saranno esposte come `/v/<versione>/`; `/` conterrà l'indice generato e `/assets/` gli asset statici dell'indice.
- L'indice mostrerà `current` per primo e le versioni semantiche in ordine decrescente. Saranno ignorate directory nascoste, temporanee o con nomi non conformi.
- Il servizio docs userà le nuove variabili `DOCS_IMAGE` e `DOCS_EXTERNALPORT_HTTP`; examples manterrà `IMAGE` ed `EXTERNALPORT_HTTP` per non rompere la configurazione esistente.
- Entrambe le immagini useranno `nginx:1.28-alpine`, evitando il tag mobile `nginx` e rimuovendo la dipendenza da Node.js in produzione.
- Il top-level obsoleto `version` sarà rimosso da `docker-compose.yml`, perché Docker Compose v2 usa la Compose Specification.
- I deploy docs forzeranno la ricreazione del container dopo la pubblicazione. Questo garantisce la rigenerazione dell'indice quando viene aggiunta o sostituita una versione.
- Le pubblicazioni remote useranno directory temporanee e rinomina finale, riducendo il rischio di versioni parzialmente caricate.
- I deploy docs ed examples useranno `resource_group` separati per impedire corse tra pipeline concorrenti.
- Lo script storico selezionerà un'immagine Node compatibile in base alla major Angular del tag. Versioni sconosciute o build fallite fermeranno il job invece di produrre uno storico incompleto non segnalato.

### Questioni aperte, non bloccanti

- I valori effettivi di `DOCS_IMAGE` e `DOCS_EXTERNALPORT_HTTP` saranno configurati dall'operatore nelle variabili GitLab CI.
- Il repository non ha ancora un tag `20.0.0`; il job storico includerà soltanto tag realmente presenti.
- Vecchie dipendenze npm potrebbero non essere più disponibili. Il job storico dovrà fallire indicando il tag problematico e conservare quanto già pubblicato.
- Il routing HTTPS definitivo dipenderà dalla configurazione nginx del server host, esplicitamente fuori scope.

## 4. Proposed Approach

La soluzione separa contenuto versionato e runtime HTTP:

```text
GitLab docs_build
       |
       v
dist/storybook/ui
       |
       | SCP atomico
       v
~/Apps/$APPNAME/docs/v/
├── current/
├── 15.1.0/
├── 15.2.0/
└── ...
       |
       | volume read-only
       v
docs container
├── /srv/docs/versions       contenuto versionato
└── /usr/share/nginx/html
    ├── index.html           generato all'avvio
    └── assets/              inclusi nell'immagine
```

Il container docs userà nginx esclusivamente come server statico:

- `/` servirà l'indice generato;
- `/assets/` servirà gli asset dell'indice;
- `/v/` servirà il volume versionato;
- versioni o asset inesistenti restituiranno `404`, senza fallback verso l'indice globale.

Il container examples copierà direttamente `dist/ui/browser` e userà una configurazione SPA nginx statica.

La pipeline sarà divisa per responsabilità:

1. build del contenuto;
2. build delle immagini;
3. pubblicazione e deploy;
4. rigenerazione storica manuale.

## 5. Step-by-Step Plan

### Dependencies between steps

`1+2 → 3`; `1+2 → 4`; `3+4 → 5`; `2+5 → 6`

---

### Step 1 — Riorganizzare e correggere il container examples ✅ DONE [2026-08-05T08:14:32.074Z]

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo F
- **File consentiti**: `Dockerfile`, `nginx`, `env-start`, `docker/examples/Dockerfile`, `docker/examples/assets/nginx.conf`
- **Obiettivo**: spostare l'infrastruttura examples sotto `docker/examples/` e servire il corretto output Angular senza bootstrap legacy.
- **Requisiti**:
  1. Creare `docker/examples/Dockerfile` usando `nginx:1.28-alpine`.
  2. Copiare `dist/ui/browser/` in `/usr/share/nginx/html/`.
  3. Spostare e normalizzare la configurazione SPA nginx in `docker/examples/assets/nginx.conf`.
  4. Mantenere il fallback delle route Angular verso `/index.html`.
  5. Aggiungere un endpoint statico `/healthz` che restituisca HTTP 200 senza coinvolgere l'app Angular.
  6. Eliminare `Dockerfile`, `nginx` ed `env-start` dalla root dopo il trasferimento.
  7. Rimuovere installazione di `sed`, sostituzioni API e comando di avvio custom.
- **Vincoli**: non modificare `angular.json`, sorgenti Angular, ambienti applicativi o comportamento funzionale degli esempi; non introdurre configurazione TLS o reverse proxy.
- **Validazione**: `npm run build && docker build -f docker/examples/Dockerfile -t inobeta-ui-examples:dev .` deve completare; avviando l'immagine, `/`, `/healthz` e una route Angular non-file devono rispondere senza errori nginx.
- **Stop condition**: fermarsi se `npm run build` non produce `dist/ui/browser/index.html`.

**Executor Input**:

~~~
## TASK:
Move and fix the examples nginx container under docker/examples.

## CONTEXT:
The Angular 20 application builder in angular.json emits browser assets under dist/ui/browser. The root Dockerfile currently copies dist/ui and starts nginx through the obsolete env-start script. env-start contains unused substitutions copied from another project.

## OBJECTIVE:
Produce a self-contained static nginx image definition for the examples application and remove the obsolete root-level files.

## REQUIREMENTS:
1. Create docker/examples/Dockerfile based on nginx:1.28-alpine.
2. Copy dist/ui/browser into /usr/share/nginx/html.
3. Move the SPA server configuration to docker/examples/assets/nginx.conf.
4. Preserve Angular deep-link fallback to /index.html.
5. Add a static /healthz endpoint returning HTTP 200.
6. Delete the superseded root Dockerfile, nginx, and env-start files.
7. Remove sed installation, placeholder replacement, bash startup, and custom nginx command handling.

## CONSTRAINTS:
- Do not modify angular.json or Angular source files.
- Do not add TLS, host reverse-proxy logic, or runtime API substitution.
- Keep the Docker build context at repository root.

## OUTPUT:
Report files created, moved, and deleted, plus the image build and smoke-test results.

## ACCEPTANCE CRITERIA:
- npm run build succeeds and creates dist/ui/browser/index.html.
- docker build -f docker/examples/Dockerfile -t inobeta-ui-examples:dev . succeeds.
- A container created from the image returns HTTP 200 for / and /healthz.
- A non-file Angular route resolves to the application index rather than an nginx 404.
- No root Dockerfile, nginx, or env-start file remains.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 2 — Creare il runtime nginx per la documentazione versionata ✅ DONE [2026-08-05T08:18:28.846Z]

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `docker/docs/Dockerfile`, `docker/docs/assets/nginx.conf`, `docker/docs/assets/generate-index.sh`, `docker/docs/assets/index.css`
- **Obiettivo**: creare un'immagine docs priva di Node.js che serva un volume versionato e generi l'indice a ogni avvio.
- **Requisiti**:
  1. Creare `docker/docs/Dockerfile` basato su `nginx:1.28-alpine`.
  2. Copiare esplicitamente configurazione nginx, generatore indice e CSS dalle rispettive sorgenti in `docker/docs/assets/`.
  3. Usare `/srv/docs/versions` come directory delle versioni montate.
  4. Eseguire `generate-index.sh` tramite il meccanismo di entrypoint dell'immagine nginx prima dell'avvio del server.
  5. Generare `/usr/share/nginx/html/index.html` senza scrivere nel volume delle versioni.
  6. Inserire `current` per primo, poi le directory semver in ordine decrescente.
  7. Ignorare directory nascoste, temporanee e nomi diversi da `current` o `X.Y.Z`.
  8. Mostrare un messaggio esplicito e valido anche quando non esistono versioni.
  9. Servire le versioni sotto `/v/<versione>/`, senza autoindex e senza fallback al root index per asset mancanti.
  10. Servire `/assets/index.css` dall'immagine e `/healthz` con HTTP 200.
  11. Rendere lo script compatibile con POSIX shell e fallire in caso di errore di generazione.
- **Vincoli**: non incorporare build Storybook nell'immagine; non usare Node.js, server Storybook o server statici npm; non modificare contenuti Storybook; non rendere scrivibile il volume per il solo bisogno dell'indice.
- **Validazione**: build dell'immagine e smoke test con un volume fixture contenente `current`, `15.1.0`, `19.0.0` e directory da ignorare; l'indice deve contenere solo i tre link ammessi nell'ordine stabilito e `/v/15.1.0/` deve servire la fixture.
- **Stop condition**: fermarsi se nginx non può servire correttamente Storybook da un path prefissato `/v/<versione>/` senza riscrivere i file generati.

**Executor Input**:

~~~
## TASK:
Create the dedicated nginx runtime image for versioned Storybook documentation.

## CONTEXT:
Documentation files remain on the host under ~/Apps/$APPNAME/docs/v and will be mounted read-only at /srv/docs/versions. The image must own the root index and its assets so the mount cannot hide them. The lost production container used Node.js and crashed with EISDIR; do not reproduce that architecture.

## OBJECTIVE:
Serve all mounted Storybook versions through nginx and generate a safe version index whenever the container starts.

## REQUIREMENTS:
1. Create docker/docs/Dockerfile based on nginx:1.28-alpine.
2. Copy only the named nginx config, index generator, and CSS assets from docker/docs/assets.
3. Read versions from /srv/docs/versions.
4. Run generate-index.sh through the official nginx entrypoint before nginx starts.
5. Write the generated root index outside the mounted version directory.
6. List current first and valid semantic versions in descending order.
7. Ignore hidden, temporary, and invalid directory names.
8. Render a clear empty-state page when no versions exist.
9. Serve versions below /v/<version>/ with autoindex disabled and no root-index fallback for missing version assets.
10. Expose /assets/index.css and a static /healthz endpoint.
11. Use POSIX shell with strict failure handling.

## CONSTRAINTS:
- Do not include Storybook output in the image.
- Do not add Node.js, npm static servers, TLS, or host reverse-proxy configuration.
- Do not write into /srv/docs/versions.
- Do not modify Storybook source or configuration.

## OUTPUT:
Report created files, chosen nginx locations, generated-index ordering, and smoke-test results.

## ACCEPTANCE CRITERIA:
- docker build -f docker/docs/Dockerfile -t inobeta-ui-docs:dev . succeeds.
- With a read-only fixture volume, / returns an index containing current, 19.0.0, and 15.1.0 in that order.
- Invalid and hidden fixture directories do not appear in the index.
- /v/15.1.0/ serves its fixture index.
- A missing version asset returns 404 rather than the global index.
- /healthz returns HTTP 200.
- The mounted fixture remains unchanged after container startup.
- ShellCheck reports no errors for generate-index.sh.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 3 — Definire i due servizi Docker Compose indipendenti ✅ DONE [2026-08-05T08:19:04.349Z]

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo F
- **File consentiti**: `docker-compose.yml`
- **Obiettivo**: descrivere examples e docs nello stesso Compose file con immagini, porte, reti e storage separati.
- **Requisiti**:
  1. Rimuovere il top-level obsoleto `version`.
  2. Conservare il servizio `examples` con immagine `${IMAGE}:${version:-latest}`.
  3. Rimuovere da examples `NODE_ENV`, `env-start` e il comando nginx custom.
  4. Esporre examples tramite `${EXTERNALPORT_HTTP}:80`.
  5. Aggiungere il servizio `docs` con immagine `${DOCS_IMAGE}:${version:-latest}`.
  6. Esporre docs tramite `${DOCS_EXTERNALPORT_HTTP}:80`.
  7. Montare `./docs/v` su `/srv/docs/versions` in sola lettura.
  8. Non introdurre `depends_on` o volumi condivisi tra i due servizi.
  9. Assegnare reti distinte ai due servizi.
  10. Configurare restart policy `unless-stopped` e healthcheck basato su `/healthz` per entrambi.
- **Vincoli**: nessuna gestione TLS, porta 443, certificati, hostname pubblico o reverse proxy; non rinominare le variabili examples esistenti.
- **Validazione**: `IMAGE=examples DOCS_IMAGE=docs version=latest EXTERNALPORT_HTTP=8080 DOCS_EXTERNALPORT_HTTP=8081 docker compose config` deve produrre una configurazione valida con due servizi, due porte e un solo volume read-only appartenente a docs.
- **Stop condition**: fermarsi se la versione Docker Compose disponibile non supporta la Compose Specification o l'interpolazione `${VAR:-default}`.

**Executor Input**:

~~~
## TASK:
Update docker-compose.yml to define independent examples and docs services.

## CONTEXT:
The examples image is configured by IMAGE and EXTERNALPORT_HTTP. The new docs image uses DOCS_IMAGE and DOCS_EXTERNALPORT_HTTP. The compose file is copied to ~/Apps/$APPNAME, making ./docs/v resolve to the established host archive directory.

## OBJECTIVE:
Provide a Docker Compose v2-compatible definition for both static services.

## REQUIREMENTS:
1. Remove the obsolete top-level version key.
2. Keep examples on ${IMAGE}:${version:-latest}.
3. Remove NODE_ENV, env-start, and the custom nginx command from examples.
4. Publish examples through ${EXTERNALPORT_HTTP}:80.
5. Add docs on ${DOCS_IMAGE}:${version:-latest}.
6. Publish docs through ${DOCS_EXTERNALPORT_HTTP}:80.
7. Mount ./docs/v at /srv/docs/versions as read-only.
8. Add no depends_on relationship or shared service volume.
9. Attach each service to a separate network.
10. Add restart: unless-stopped and /healthz-based healthchecks to both services.

## CONSTRAINTS:
- Do not add TLS, port 443, certificates, public hostnames, or a reverse proxy.
- Do not rename IMAGE or EXTERNALPORT_HTTP.
- Do not make the docs archive writable by the container.

## OUTPUT:
Report the resolved services, port mappings, networks, and volume mode from docker compose config.

## ACCEPTANCE CRITERIA:
- docker compose config succeeds with all required environment variables.
- Exactly two services are present: examples and docs.
- The services expose different configurable host ports.
- Only docs mounts ./docs/v, and the mount is read-only.
- No service contains env-start or a custom nginx launch command.
- The services have no dependency on each other.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 4 — Adeguare i job di build delle immagini ✅ DONE [2026-08-05T08:20:50.191Z]

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `.gitlab-ci.yml`
- **Obiettivo**: costruire e pubblicare correttamente le immagini examples e docs dai nuovi Dockerfile, senza falsi successi.
- **Requisiti**:
  1. Inserire lo stage `docs:image` tra `docs:build` e `docs:deploy`.
  2. Aggiornare `examples:image` affinché usi `docker/examples/Dockerfile` mantenendo la root come build context.
  3. Rimuovere la gestione che trasforma un errore `docker build` in successo.
  4. Conservare trigger e ref di deploy già previsti per l'immagine examples.
  5. Aggiungere un job docs image basato su Docker-in-Docker che costruisca e pubblichi `${DOCS_IMAGE}:latest` usando `docker/docs/Dockerfile`.
  6. Eseguire automaticamente il job docs image sui ref di deploy solo quando cambiano `docker/docs/Dockerfile` o file sotto `docker/docs/assets/`.
  7. Usare `rules:changes` per il job docs image e non ricostruirlo a ogni release di contenuto.
  8. Usare login registry tramite password standard input.
  9. Serializzare le pubblicazioni dell'immagine docs con un `resource_group` dedicato.
  10. Non aggiungere una dipendenza dai file `dist/storybook/ui`, perché il contenuto docs arriva dal volume.
- **Vincoli**: non modificare job npm, test, lint o regole di pubblicazione del package; non incorporare lo storico o Storybook nell'immagine docs; non cambiare i tag npm.
- **Validazione**: entrambi i comandi Dockerfile usati nei job devono funzionare localmente; GitLab CI Lint deve dichiarare valida `.gitlab-ci.yml`; una build Docker fallita deve causare il fallimento del job.
- **Stop condition**: fermarsi se `DOCS_IMAGE` non può essere usata come destinazione registry distinta da `IMAGE`.

**Executor Input**:

~~~
## TASK:
Update GitLab CI image-build stages and jobs for the reorganized examples image and the new docs image.

## CONTEXT:
The repository now has docker/examples/Dockerfile and docker/docs/Dockerfile. The docs image contains only nginx runtime files; Storybook output is mounted at deployment time. The current examples build command masks docker build failures.

## OBJECTIVE:
Publish both images from their dedicated Dockerfiles and rebuild the docs image only when its runtime files change.

## REQUIREMENTS:
1. Add docs:image between docs:build and docs:deploy in the stages list.
2. Build examples with -f docker/examples/Dockerfile and repository root as context.
3. Remove all logic that converts docker build failures into successful jobs.
4. Preserve the existing examples deployment-ref behavior.
5. Add a Docker-in-Docker job that builds and pushes ${DOCS_IMAGE}:latest from docker/docs/Dockerfile.
6. Run the docs image job automatically on deployment refs when docker/docs/Dockerfile or docker/docs/assets/** changes.
7. Implement the docs trigger with rules:changes.
8. Use password-stdin for registry login.
9. Serialize docs image publication with a dedicated resource_group.
10. Do not download or copy Storybook build artifacts into the docs image.

## CONSTRAINTS:
- Do not change npm publication, package testing, or package versioning jobs.
- Do not bundle documentation versions in the image.
- Keep build contexts at repository root.
- Do not retain any error-swallowing branch.

## OUTPUT:
Report changed stages, job rules, image names, Dockerfile paths, and GitLab CI Lint result.

## ACCEPTANCE CRITERIA:
- Both Dockerfile build commands succeed locally.
- GitLab CI Lint reports the file as valid.
- examples:image references docker/examples/Dockerfile.
- The new docs image job references docker/docs/Dockerfile and DOCS_IMAGE.
- The docs image job has rules:changes limited to docs runtime files on deployment refs.
- A failed docker build exits the corresponding job non-zero.
- No npm deploy or test job behavior changes.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 5 — Rendere atomici e verificabili pubblicazione e deploy ✅ DONE [2026-08-05T08:24:17.919Z]

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo R
- **File consentiti**: `.gitlab-ci.yml`
- **Obiettivo**: pubblicare versioni Storybook senza contenuti parziali e riavviare i servizi con Docker Compose v2.
- **Requisiti**:
  1. Conservare la semantica esistente: branch di default pubblicato come `current`, altri ref di documentazione nella cartella di `CURRENT_VERSION`.
  2. Caricare Storybook in una directory remota temporanea e sostituire la directory finale solo dopo SCP riuscito.
  3. Non cancellare o modificare le altre versioni presenti sotto `docs/v`.
  4. Creare `~/Apps/$APPNAME/docs/v` prima di pubblicare o avviare docs.
  5. Preparare un unico `.env` remoto contenente `IMAGE`, `DOCS_IMAGE`, `EXTERNALPORT_HTTP`, `DOCS_EXTERNALPORT_HTTP` e `version=latest`.
  6. Verificare che tutte le variabili obbligatorie siano valorizzate prima di modificare il server.
  7. Fare pull dell'immagine docs e ricreare `docs` dopo ogni pubblicazione, così l'indice viene rigenerato.
  8. Fare pull e ricreare `examples` usando il servizio omonimo.
  9. Sostituire ogni invocazione `docker-compose` con `docker compose`.
  10. Usare `docker compose up -d --force-recreate <service>` senza fermare servizi non interessati.
  11. Verificare lo stato healthy del solo servizio aggiornato e fallire il job se non diventa sano.
  12. Serializzare deploy docs ed examples con `resource_group` distinti.
  13. Mantenere `dist/storybook/ui` come sorgente del publish e collegare esplicitamente il job al relativo artifact.
- **Vincoli**: non modificare cartelle documentali estranee a `docs/v/<dir>`; non gestire TLS o nginx host; non riavviare entrambi i servizi quando cambia uno solo; non stampare credenziali nei log.
- **Validazione**: GitLab CI Lint deve passare; `docker compose` deve risolvere entrambi i servizi usando il `.env` atteso; una prova su directory remota temporanea deve dimostrare che un SCP fallito lascia intatta la versione precedente.
- **Stop condition**: fermarsi prima del deploy se manca una variabile richiesta, il server remoto non supporta `docker compose`, o il path remoto risolto non è `~/Apps/$APPNAME/docs/v`.

**Executor Input**:

~~~
## TASK:
Make Storybook publication atomic and deploy both services through Docker Compose v2.

## CONTEXT:
docs_publish currently deletes the destination before SCP and the shared helper invokes obsolete docker-compose commands. The docs container generates its index only when recreated. The compose file requires both examples and docs environment variables.

## OBJECTIVE:
Publish complete version directories and update only the requested healthy service without races between pipelines.

## REQUIREMENTS:
1. Preserve current for the default branch and CURRENT_VERSION for other documentation deployment refs.
2. Upload dist/storybook/ui to a unique remote temporary directory before replacing the final version directory.
3. Preserve every unrelated directory under docs/v.
4. Ensure ~/Apps/$APPNAME/docs/v exists.
5. Deploy one complete .env containing IMAGE, DOCS_IMAGE, EXTERNALPORT_HTTP, DOCS_EXTERNALPORT_HTTP, and version=latest.
6. Validate all required variables before any remote mutation.
7. Pull the docs image and force-recreate docs after every successful documentation publication.
8. Pull the examples image and force-recreate examples in the examples deployment job.
9. Replace every docker-compose invocation with docker compose.
10. Use docker compose up -d --force-recreate for only the target service.
11. Wait for and verify the target service health status; fail if unhealthy.
12. Use separate resource_group values for docs and examples deployments.
13. Explicitly consume the docs_build artifact containing dist/storybook/ui.

## CONSTRAINTS:
- Do not touch unrelated version directories.
- Do not configure TLS or the host nginx proxy.
- Do not restart both services for a single-service deployment.
- Do not print SSH keys or registry credentials.
- Do not preserve the old stop-then-up helper behavior.

## OUTPUT:
Report remote paths, atomic replacement sequence, environment variables, Compose commands, health verification, and CI Lint result.

## ACCEPTANCE CRITERIA:
- GitLab CI Lint reports a valid configuration.
- The default branch still targets docs/v/current.
- Versioned deployment refs still target docs/v/$CURRENT_VERSION.
- A failed upload cannot remove the previously published directory.
- Successful docs publication triggers docker compose pull docs and force-recreates only docs.
- Examples deployment force-recreates only examples.
- No docker-compose command remains.
- Missing required variables fail before SSH or SCP mutation.
- Concurrent docs or examples deploy jobs are serialized independently.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 6 — Aggiungere la rigenerazione manuale dello storico Storybook ✅ DONE [2026-08-05T08:31:17.765Z]

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo R
- **File consentiti**: `.gitlab-ci.yml`, `docker/docs/assets/build-history.sh`
- **Obiettivo**: rendere rigenerabili e ripubblicabili tutte le versioni Storybook taggate da `15.1.0` in avanti.
- **Requisiti**:
  1. Aggiungere uno stage/job manuale `docs:history`, disponibile dal branch di default e non bloccante per le pipeline normali.
  2. Configurare checkout completo con `GIT_DEPTH: "0"` e fetch esplicito dei tag.
  3. Creare `docker/docs/assets/build-history.sh` con modalità dry-run, intervallo opzionale e modalità senza upload.
  4. Elencare solo tag release conformi a `X.Y.Z`, ordinati cronologicamente tramite metadata Git.
  5. Iniziare da `15.1.0` incluso e ignorare tutti i tag precedenti.
  6. Verificare per ogni tag la presenza del comando `build-storybook` e della configurazione `.storybook`.
  7. Usare worktree o directory temporanee isolate senza modificare il checkout della pipeline.
  8. Eseguire per ogni tag `npm ci` e `npm run build-storybook`.
  9. Selezionare un'immagine Node fissata e compatibile in base alla major Angular del tag; fermarsi su major non mappate.
  10. Eseguire le build storiche in container isolati e copiare fuori `dist/storybook/ui`.
  11. Pubblicare ogni tag in `~/Apps/$APPNAME/docs/v/<tag>` mediante la stessa strategia temporanea e sostituzione finale dello Step 5.
  12. Non modificare `current`.
  13. Fermarsi al primo errore, indicare il tag fallito e lasciare intatte le versioni remote già presenti.
  14. Riavviare docs una sola volta al termine dell'intero batch riuscito.
  15. Serializzare il job con lo stesso `resource_group` usato dalla pubblicazione docs.
- **Vincoli**: non modificare i tag, non creare commit, non cambiare package o lock file storici, non saltare silenziosamente build fallite, non eseguire automaticamente il job nelle pipeline normali.
- **Validazione**: la modalità dry-run deve iniziare da `15.1.0` e mostrare i tag in ordine cronologico; una prova `15.1.0`-only senza upload deve completare e produrre `dist/storybook/ui/index.html`; ShellCheck e GitLab CI Lint devono passare.
- **Stop condition**: fermarsi se `15.1.0` non è raggiungibile, se la compatibilità Node non è determinabile, se manca il comando Storybook in un tag selezionato o se una build non produce `dist/storybook/ui/index.html`.

**Executor Input**:

~~~
## TASK:
Add a manual GitLab job and script that rebuild all tagged Storybook versions from 15.1.0 onward.

## CONTEXT:
Repository history confirms 15.1.0 is the first tag containing the build-storybook script, Storybook dependencies, and .storybook configuration. The operation is exceptional and must not run in normal pipelines. Historical Angular majors require different Node versions.

## OBJECTIVE:
Rebuild release tags chronologically in isolated environments and publish each complete Storybook output into the existing docs volume archive.

## REQUIREMENTS:
1. Add a non-blocking manual docs:history stage/job available from the default branch.
2. Use GIT_DEPTH=0 and fetch all tags explicitly.
3. Create docker/docs/assets/build-history.sh with dry-run, optional range, and no-upload modes.
4. Select only X.Y.Z release tags and order them by Git tag chronology.
5. Start at 15.1.0 inclusive and exclude every earlier tag.
6. Verify build-storybook and .storybook exist at every selected tag.
7. Build from isolated worktrees or temporary copies without changing the pipeline checkout.
8. Run npm ci and npm run build-storybook for each selected tag.
9. Map each historical Angular major to an explicit compatible Node container image and stop on unknown majors.
10. Run each build in an isolated container and extract dist/storybook/ui.
11. Upload each tag through a temporary remote directory and final replacement.
12. Never modify docs/v/current.
13. Stop at the first failure, report its tag, and preserve existing remote versions.
14. Recreate the docs service once after the complete batch succeeds.
15. Serialize the job with the documentation deployment resource_group.

## CONSTRAINTS:
- Do not mutate tags, commits, historical package.json files, or lock files.
- Do not silently skip a failed or unsupported tag.
- Do not run the history job automatically.
- Do not upload partial Storybook output.
- Do not restart docs after each individual tag.

## OUTPUT:
Report selected tags in order, Node-image mapping, build results per tag, uploaded destinations, and final docs restart status.

## ACCEPTANCE CRITERIA:
- Dry-run output starts with 15.1.0 and contains no earlier release.
- Dry-run tags follow Git chronological order rather than filesystem or lexical order.
- A 15.1.0-only no-upload run produces dist/storybook/ui/index.html.
- The script does not change git status in the main checkout.
- A simulated failed build leaves the corresponding remote destination unchanged.
- current is never selected as an upload destination.
- ShellCheck reports no errors for build-history.sh.
- GitLab CI Lint reports a valid manual, non-blocking job.
- The docs service is recreated exactly once after a successful full batch.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

## 6. Impacted Areas

### Nuovi file

- `docker/examples/Dockerfile`
- `docker/examples/assets/nginx.conf`
- `docker/docs/Dockerfile`
- `docker/docs/assets/nginx.conf`
- `docker/docs/assets/generate-index.sh`
- `docker/docs/assets/index.css`
- `docker/docs/assets/build-history.sh`

### File estesi

- `docker-compose.yml`
- `.gitlab-ci.yml`

### File rimossi

- `Dockerfile`
- `nginx`
- `env-start`

### Variabili operative

- Esistenti e conservate:
  - `IMAGE`
  - `EXTERNALPORT_HTTP`
  - `version`
- Nuove:
  - `DOCS_IMAGE`
  - `DOCS_EXTERNALPORT_HTTP`

### Superficie pubblica operativa

- Examples: porta host `${EXTERNALPORT_HTTP}`, root `/`.
- Docs: porta host `${DOCS_EXTERNALPORT_HTTP}`.
- Indice docs: `/`.
- Versioni docs: `/v/<versione>/`.
- Healthcheck di entrambi i servizi: `/healthz`.

### Deliberatamente non modificato

- Sorgenti Angular in `src/`.
- Configurazione e contenuti Storybook.
- API pubblica della libreria.
- Pubblicazione npm.
- Reverse proxy nginx del server host.
- TLS, certificati Let's Encrypt e porta 443.
- Contenuti dei piani candidati DEVK-1045, DEVK-1106 e DEVK-1046.

## 7. Risks

- **Compatibilità dei vecchi tag con Node:** Angular e Storybook storici non possono essere costruiti con una sola versione Node. Mitigazione: mapping esplicito Angular-major/Node-image e stop sulle major sconosciute.
- **Dipendenze npm storiche non più disponibili:** una build può fallire anche con Node corretto. Mitigazione: fail-fast sul tag, nessun upload parziale e possibilità di rilanciare un intervallo.
- **Indice non aggiornato dopo un semplice SCP:** l'indice viene generato solo all'avvio. Mitigazione: il deploy docs forza la ricreazione dopo ogni pubblicazione e una volta dopo il batch storico.
- **Volume che nasconde asset inclusi nell'immagine:** montare direttamente sulla document root renderebbe invisibili indice e CSS. Mitigazione: volume separato su `/srv/docs/versions` e alias nginx `/v/`.
- **Storybook servito sotto un prefisso:** vecchie versioni potrebbero contenere riferimenti assoluti non compatibili con `/v/<tag>/`. Mitigazione: smoke test obbligatorio sul primo tag `15.1.0`, su `current` e su asset nested prima del deploy completo.
- **Pipeline concorrenti:** due pubblicazioni potrebbero sostituire la stessa versione o aggiornare `latest` contemporaneamente. Mitigazione: `resource_group` distinti per docs image, docs deploy ed examples deploy.
- **Upload interrotto:** eliminare prima la directory finale causerebbe downtime o contenuti incompleti. Mitigazione: upload in directory temporanea e sostituzione solo dopo successo.
- **Variabili Compose incomplete:** un `.env` parziale può impedire anche il deploy di un singolo servizio. Mitigazione: generare sempre il set completo e validare tutte le variabili prima di SSH/SCP.
- **Tag immagine mutable `latest`:** un rollback non è deterministico. Rischio accettato per continuità con il deploy esistente; i log GitLab devono comunque registrare commit e digest pubblicato.
- **Drift dell'immagine base:** il tag nginx generico cambierebbe nel tempo. Mitigazione: pin a `nginx:1.28-alpine`.
- **Configurazione host fuori repo:** HTTPS e routing pubblico non vengono verificati dalla pipeline. Rischio accettato perché esplicitamente fuori scope e gestito dall'operatore.

## 8. Validation Checklist

- [ ] `npm run lint` completa senza errori.
- [ ] `npm run test-ci` completa senza regressioni.
- [ ] `npm run build` produce `dist/ui/browser/index.html`.
- [ ] `npm run build-storybook` produce `dist/storybook/ui/index.html`.
- [ ] `docker build -f docker/examples/Dockerfile -t inobeta-ui-examples:dev .` completa.
- [ ] `docker build -f docker/docs/Dockerfile -t inobeta-ui-docs:dev .` completa.
- [ ] `IMAGE=examples DOCS_IMAGE=docs version=latest EXTERNALPORT_HTTP=8080 DOCS_EXTERNALPORT_HTTP=8081 docker compose config` completa senza warning bloccanti.
- [ ] Examples restituisce HTTP 200 per `/` e `/healthz`.
- [ ] Una deep link examples restituisce l'app Angular, non un 404 nginx.
- [ ] Docs restituisce HTTP 200 per `/`, `/healthz` e `/v/<versione>/`.
- [ ] Un asset docs inesistente restituisce 404 e non il root index.
- [ ] L'indice mostra `current` per primo e tutte le versioni semantiche ammesse in ordine decrescente.
- [ ] Directory nascoste, temporanee o invalide non compaiono nell'indice.
- [ ] Il volume docs è montato in sola lettura e non viene modificato all'avvio.
- [ ] GitLab CI Lint dichiara valida `.gitlab-ci.yml`.
- [ ] Nessun comando `docker-compose` rimane nel repository.
- [ ] Nessun riferimento a `env-start` rimane nel repository.
- [ ] Una build Docker fallita rende fallito il relativo job.
- [ ] Un upload Storybook fallito lascia disponibile la versione precedente.
- [ ] Il deploy docs ricrea soltanto `docs` e rigenera l'indice.
- [ ] Il deploy examples ricrea soltanto `examples`.
- [ ] Il job storico è manuale, non bloccante e disponibile solo nel contesto previsto.
- [ ] Il dry-run storico parte da `15.1.0`, esclude tag precedenti e segue l'ordine cronologico Git.
- [ ] La build isolata del solo tag `15.1.0` produce `dist/storybook/ui/index.html`.
- [ ] Il job storico non modifica `current` e riavvia docs una sola volta dopo un batch riuscito.
- [ ] Verifica manuale dal server host: indice, almeno una versione storica, `current` ed examples sono raggiungibili sulle rispettive porte HTTP configurate.
- [ ] Verifica manuale separata, fuori scope applicativo: il reverse proxy host espone docs ed examples via HTTPS senza cambiare i container.
