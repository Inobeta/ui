
# DEVK-672 — Storico Storybook su runner separati — Manual review remediation

## References

- Original plan: `devk-672-stabilizzare-deploy-di-documentazione-ed-esempi`.
- Review date: `2026-08-05`.
- Source: manual validation by the user.

## Verdict

**FAIL**

Il job manuale `docs:history` ha selezionato correttamente tag e immagini Node, ma è fallito alla prima build perché il runner con accesso VPN non dispone di Docker-in-Docker; inoltre l’utente ha confermato di spostare l’inizio dello storico da `15.1.0` a `18.0.1`.

## Manual review summary

L’utente ha avviato manualmente `docs:history` dalla pipeline GitLab. Lo script ha selezionato i tag da `15.1.0` a `20.0.0` e associato correttamente le immagini Node, ma il primo `docker run` è fallito con:

```text
docker: Cannot connect to the Docker daemon at tcp://docker:2375.
ERROR: build failed for 15.1.0
```

La stessa build isolata funziona localmente quando Docker è disponibile. Il runner `dedicated` è necessario per raggiungere via VPN il server di destinazione, ma non risulta abilitato a Docker-in-Docker; il runner `gitlab-org-docker` supporta le build Docker ma non raggiunge il server. L’utente ha quindi richiesto di separare build e upload in due job.

È stato inoltre chiarito che le versioni precedenti a `18.0.1` dipendono da pacchetti non più reperibili. Queste versioni saranno recuperate separatamente dagli archivi storici e non devono più essere rigenerate dallo script.

## Reviewed steps

### Step 6 — Aggiungere la rigenerazione manuale dello storico Storybook

- **Original plan state**: `[DONE]`
- **Reported behaviour**: il job `docs:history`, eseguito sul runner `dedicated`, raggiunge la prima build ma non può collegarsi al servizio Docker-in-Docker configurato come `tcp://docker:2375`.
- **Expected behaviour**: tutte le build selezionate devono essere eseguite in container isolati su un runner con Docker disponibile; gli artefatti completi devono poi essere trasferiti al server da un runner con accesso VPN.
- **Classification**: `architectural problem`
- **Issues found**:
  - `[BLOCKER]` Un singolo job combina build Docker e upload VPN ed è assegnato al runner `dedicated`, mentre il comando di build richiede un daemon Docker raggiungibile (`.gitlab-ci.yml:159-185`, `docker/docs/assets/build-history.sh:121-125`, `docker/docs/assets/build-history.sh:141-151`, `docker/docs/assets/build-history.sh:165-202`). Impact: il batch si interrompe alla prima versione e nessuna documentazione storica viene pubblicata. Recommendation: separare la produzione degli artefatti versionati su `gitlab-org-docker` dal loro upload atomico su `dedicated`, collegando i job tramite artifact GitLab.
  - `[BLOCKER]` La modalità `--no-upload` conserva soltanto l’ultima versione compilata in `dist/storybook/ui`, quindi non può trasferire l’intero batch al successivo job di upload (`docker/docs/assets/build-history.sh:135-139`, `docker/docs/assets/build-history.sh:153-163`, `docker/docs/assets/build-history.sh:205-209`). Impact: il semplice split del job perderebbe tutte le versioni tranne l’ultima. Recommendation: aggiungere modalità esplicite di build-only e upload-only con un artifact contenente una directory per ogni tag e un manifest ordinato del batch.

### Step 6 — Aggiungere la rigenerazione manuale dello storico Storybook: versione iniziale

- **Original plan state**: `[DONE]`
- **Reported behaviour**: lo script seleziona le versioni da `15.1.0`, ma quelle precedenti a `18.0.1` non sono più compilabili perché dipendono da pacchetti non reperibili.
- **Expected behaviour**: lo storico rigenerabile deve iniziare da `18.0.1`; le versioni precedenti saranno recuperate separatamente dagli archivi esistenti.
- **Classification**: `requirement change`
- **Issues found**:
  - `[BLOCKER]` `FIRST_SUPPORTED_TAG` e la selezione cronologica impongono ancora `15.1.0` come inizio del batch (`docker/docs/assets/build-history.sh:5`, `docker/docs/assets/build-history.sh:75-98`). Impact: anche dopo aver corretto il runner, l’operazione fallirebbe su versioni che non devono più essere rigenerate e non raggiungerebbe `18.0.1`. Recommendation: sostituire il limite iniziale con `18.0.1` e adeguare dry-run, intervalli e messaggi di validazione.

## Confirmed requirement changes

### Change 1 — Iniziare lo storico rigenerabile da 18.0.1

- **Original requirement**: Step 6, requisito 5: “Iniziare da `15.1.0` incluso e ignorare tutti i tag precedenti.”
- **New behaviour required**: lo script deve iniziare da `18.0.1` incluso; le versioni precedenti non devono essere selezionate o compilate e saranno recuperate dagli archivi storici.
- **Nature of the contradiction**: `15.1.0` e `18.0.1` non possono essere contemporaneamente il primo tag del batch predefinito.
- **Confirmed by the user**: “confermo che partiamo dalla 18.0.1”.
- **Parts of the original plan this invalidates**: Step 6, requisito 5 e le relative validazioni e acceptance criteria che indicano `15.1.0` come prima versione o build isolata di riferimento.

## Impact analysis

- **Other steps of the original plan**: Steps 1-5 non sono invalidati e devono restare invariati. La pubblicazione ordinaria di `current` e delle singole versioni continua a usare il flusso dello Step 5. Solo Step 6 richiede remediation.
- **Components that depend on the changed behaviour**: il job GitLab dello storico e `build-history.sh`. Il job di upload dipenderà dall’artifact completo prodotto dal job di build. Il container docs continuerà a leggere lo stesso volume versionato e a rigenerare l’indice allo stesso modo.
- **Application state, contracts between modules, API surface, persistence**: Not affected. Non cambiano sorgenti Angular, NgRx, API pubblica o persistenza applicativa. Il contenuto pubblicato resta persistito nelle stesse directory `docs/v/<tag>`.
- **Backward compatibility**: gli URL `/v/<versione>/`, `current`, l’indice docs e le versioni già presenti sul server restano compatibili. Il comando predefinito dello storico non tenterà più di rigenerare `15.1.0`-`17.1.1`.
- **Automated tests and validations that assert the old behaviour**: le validazioni che richiedevano un dry-run o una build `15.1.0`-only devono essere sostituite con equivalenti su `18.0.1`. Devono essere aggiunte verifiche del layout dell’artifact multi-versione, del manifest ordinato e dell’impossibilità di eseguire l’upload senza un artifact completo.
- **Validations**: restano richiesti ShellCheck e GitLab CI Lint. La build isolata deve essere verificata sul runner Docker; upload atomico e riavvio singolo devono essere verificati sul runner VPN.
- **Documentation**: il testo d’uso dello script deve indicare `18.0.1` come limite iniziale e descrivere chiaramente le modalità build-only e upload-only. Altra documentazione: Not affected.
- **Already-implemented features that keep working**: selezione dei soli tag `X.Y.Z`, ordine cronologico Git, mapping Angular-major/Node, worktree isolati, fail-fast, upload atomico, conservazione delle versioni remote non coinvolte, mancata modifica di `current`, `resource_group` docs e singola ricreazione finale del servizio devono restare invariati.
- **Scope size**: la correzione è materialmente più ampia della sola sostituzione del runner. Lo script attuale compila e carica ogni versione nello stesso ciclo e la modalità senza upload conserva soltanto l’ultimo output; per usare due runner è necessario introdurre un artifact multi-versione e separare esplicitamente le fasi build e upload. Non sono necessari refactoring esterni allo Step 6.

## Assumptions

- Il runner `gitlab-org-docker` continua a supportare Docker-in-Docker.
- Il runner `dedicated` continua ad avere accesso VPN e SSH al server di destinazione.
- Gli artifact GitLab possono contenere l’intero batch Storybook prodotto dai tag selezionati.

## Remediation plan

### Remediation 1 — Spostare il limite iniziale a 18.0.1 [agent: task-executor] [model: openai/gpt-5.6-terra] ✅ DONE [2026-08-05T10:12:03.295Z]

- **Dipendenze**: none.
- **File consentiti**: `docker/docs/assets/build-history.sh`
- **Origine**: `requirement change (Change 1)`

~~~
## TASK:
Aggiorna il limite iniziale dello storico Storybook da 15.1.0 a 18.0.1.

## CONTEXT:
Lo Step 6 del piano DEVK-672 richiedeva originariamente di partire da 15.1.0. L’utente ha confermato che i tag precedenti a 18.0.1 non sono più compilabili per indisponibilità di dipendenze e saranno recuperati separatamente. Il limite è definito in docker/docs/assets/build-history.sh:5 e governa validazione e selezione in docker/docs/assets/build-history.sh:75-98.

## OBJECTIVE:
Fare in modo che il batch predefinito e gli intervalli accettati inizino da 18.0.1 incluso e non selezionino versioni precedenti.

## REQUIREMENTS:
1. Sostituire FIRST_SUPPORTED_TAG con 18.0.1 e adeguare eventuali messaggi d’uso o validazione collegati.
2. Verificare che il dry-run inizi da 18.0.1, continui in ordine cronologico Git e non mostri tag precedenti.
3. Verificare che 18.0.1 sia raggiungibile e abbia package.json, configurazione .storybook e comando build-storybook secondo le verifiche già presenti.
4. Non saltare silenziosamente tag selezionati successivi a 18.0.1.

## CONSTRAINTS:
- Non modificare il mapping Angular-major/Node oltre quanto necessario.
- Non modificare tag Git, package.json o lock file storici.
- Non cambiare current, destinazioni remote o strategia atomica di pubblicazione.
- Non modificare .gitlab-ci.yml in questa remediation.

## OUTPUT:
Riporta la modifica del limite e l’output del dry-run con il primo e l’ultimo tag selezionati.

## ACCEPTANCE CRITERIA:
- `sh -n docker/docs/assets/build-history.sh` passa.
- `sh docker/docs/assets/build-history.sh --dry-run --no-upload` elenca 18.0.1 come primo tag e non contiene 15.1.0, 15.2.0, 16.0.0 o tag 17.x.
- ShellCheck non segnala errori nuovi.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 2 — Separare build e upload nello script [agent: task-executor] [model: openai/gpt-5.6-terra] ✅ DONE [2026-08-05T10:14:24.745Z]

- **Dipendenze**: Remediation 1.
- **File consentiti**: `docker/docs/assets/build-history.sh`
- **Origine**: `architectural problem` — ordinary fix.

~~~
## TASK:
Rendi build-history.sh utilizzabile in due fasi indipendenti, una per produrre l’intero batch e una per caricarlo.

## CONTEXT:
Il job dello Step 6 deve usare runner distinti per Docker-in-Docker e accesso VPN. Attualmente lo script compila e carica ogni tag nello stesso ciclo (docker/docs/assets/build-history.sh:141-203), mentre --no-upload conserva solo l’ultima build in dist/storybook/ui (docker/docs/assets/build-history.sh:135-163). Questo impedisce il passaggio dell’intero batch come artifact GitLab.

## OBJECTIVE:
Produrre su un runner Docker un artifact completo e verificabile con una directory per ogni tag, quindi permettere a un runner senza Docker di caricare lo stesso batch in ordine e con la strategia atomica esistente.

## REQUIREMENTS:
1. Introdurre modalità esplicite e mutuamente esclusive di build-only e upload-only, con input/output directory dichiarati e documentati nell’help.
2. In build-only, selezionare i tag dal nuovo limite 18.0.1, eseguire le build isolate esistenti e salvare ogni output sotto una directory dedicata al tag senza sovrascrivere le build precedenti.
3. Produrre insieme agli output un manifest del batch nell’ordine cronologico selezionato.
4. Verificare per ogni tag la presenza di index.html prima di includerlo nel manifest e fallire senza presentare un artifact completo in caso di errore.
5. In upload-only, non invocare Docker e non ricostruire le versioni; validare manifest, nomi tag, directory e index.html prima della prima mutazione remota.
6. Caricare solo le versioni dichiarate nel manifest usando la strategia temporanea e sostituzione finale già implementata.
7. Conservare fail-fast, mancata modifica di current, preservazione delle altre versioni remote e indicazione del tag fallito.
8. Mantenere la modalità dry-run per selezione e mapping senza richiedere Docker o variabili SSH.
9. Aggiungere una regressione eseguibile che verifichi almeno il layout artifact e il manifest per un batch 18.0.1-only; se non esiste un framework shell dedicato, documentare comandi deterministici di verifica.

## CONSTRAINTS:
- Non aggiungere build Storybook al container docs.
- Non modificare configurazione nginx, Docker Compose o sorgenti Angular.
- Non cambiare ordinamento, mapping Node o isolamento tramite worktree/container.
- Non riavviare il servizio docs dallo script.
- Non introdurre un terzo percorso di pubblicazione diverso dalla sostituzione atomica esistente.
- Non modificare .gitlab-ci.yml in questa remediation.

## OUTPUT:
Riporta le modalità CLI introdotte, la struttura dell’artifact, il manifest prodotto e le verifiche eseguite.

## ACCEPTANCE CRITERIA:
- `sh -n docker/docs/assets/build-history.sh` passa.
- ShellCheck non segnala errori.
- Una build-only limitata a 18.0.1 produce un artifact contenente una directory 18.0.1 con `index.html` e un manifest che contiene esclusivamente 18.0.1.
- La modalità upload-only rifiuta prima di SSH un manifest invalido, una directory mancante o una versione senza index.html.
- La modalità upload-only non esegue alcun comando Docker.
- Il dry-run continua a funzionare senza variabili remote.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 3 — Dividere il job storico tra runner Docker e VPN [agent: task-executor] [model: openai/gpt-5.6-terra] ✅ DONE [2026-08-05T10:17:06.751Z]

- **Dipendenze**: Remediation 2.
- **File consentiti**: `.gitlab-ci.yml`
- **Origine**: `architectural problem` — ordinary fix.

~~~
## TASK:
Sostituisci il job docs:history monolitico con una fase di build sul runner Docker e una fase di upload sul runner VPN.

## CONTEXT:
Il job attuale in .gitlab-ci.yml:159-185 usa contemporaneamente docker:27.1.1-dind, SSH/SCP e il runner dedicated. In pipeline il daemon tcp://docker:2375 non è raggiungibile sul runner dedicated. Il runner gitlab-org-docker è disponibile per la build Docker, mentre dedicated è necessario per raggiungere il server tramite VPN. build-history.sh ora supporta artifact multi-versione e modalità separate.

## OBJECTIVE:
Eseguire le build storiche su gitlab-org-docker, trasferire il batch tramite artifact GitLab e pubblicarlo su dedicated senza richiedere Docker al secondo runner.

## REQUIREMENTS:
1. Creare due job distinti nello stage o negli stage dello storico: un job manuale di build e un job di upload/deploy collegato al suo artifact.
2. Assegnare il job di build a gitlab-org-docker con Docker-in-Docker, checkout completo, fetch esplicito dei tag e modalità build-only dello script.
3. Pubblicare come artifact soltanto il batch storico completo e il relativo manifest, con durata sufficiente per consentire l’avvio della fase di upload.
4. Assegnare il job di upload a dedicated, consumare esplicitamente l’artifact del job di build ed eseguire la modalità upload-only senza configurare DOCKER_HOST o docker:dind.
5. Rendere il flusso manuale e non bloccante per le pipeline normali; impedire che l’upload possa partire con artifact assente o incompleto.
6. Mantenere entrambi i job disponibili soltanto dal branch di default.
7. Eseguire validazione delle variabili e preparazione SSH soltanto nel job di upload, prima di ogni mutazione remota.
8. Conservare il resource_group docs-deployment sul job che effettua upload e deploy.
9. Dopo il completo successo dell’upload, eseguire prepare_staging e ricreare il solo servizio docs esattamente una volta.
10. Non eseguire il riavvio dopo una build isolata fallita, un artifact invalido o un upload parziale.
11. Aggiungere una validazione CI o un controllo deterministico che dimostri assegnazione dei runner, passaggio artifact e assenza di Docker nel job VPN.

## CONSTRAINTS:
- Non modificare docs_publish, examples o i job npm.
- Non cambiare le directory remote docs/v/<tag>.
- Non modificare current.
- Non riavviare examples o servizi non interessati.
- Non stampare chiavi SSH o credenziali.
- Non richiedere accesso VPN al runner gitlab-org-docker.
- Non richiedere Docker-in-Docker al runner dedicated.

## OUTPUT:
Riporta i due job, runner assegnati, dipendenza artifact, regole manuali, resource_group e risultato di GitLab CI Lint.

## ACCEPTANCE CRITERIA:
- GitLab CI Lint dichiara valida .gitlab-ci.yml.
- Il job di build usa gitlab-org-docker, docker:27.1.1-dind e la modalità build-only.
- Il job di upload usa dedicated, consuma esplicitamente l’artifact completo e non dichiara docker:dind o DOCKER_HOST.
- Il job di upload non può pubblicare senza manifest e output validi.
- Un batch riuscito da 18.0.1 produce e pubblica tutte le versioni dichiarate nel manifest.
- Un errore di build impedisce l’upload.
- Un errore di upload lascia intatta la destinazione finale del tag interessato e impedisce il riavvio.
- Il servizio docs viene ricreato una sola volta dopo il completo successo del batch.
- I job normali della pipeline restano non bloccati quando lo storico non viene richiesto.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~
