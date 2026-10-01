# AEKI-termékkereső – gyakorlo projekt interjúfelkészülési app

Készült: 2026. október 1.

Ez egy saját gyakorlóapp követelményspecifikációja. A cél egy összefüggő üzleti példán gyakorolni az gyakorlo projekt-elvárásokat, és saját kóddal, tesztekkel, magyarázatokkal bemutatni a tudást. Nem ismert AEKI-rendszer vagy hivatalos interjúfeladat leírása.

## Elfogadott engineering alapelvek

Csaba 2026. október 1-jei utasítása alapján SOLID szerint tervezzük az appot, TDD-vel dolgozunk, a TypeScript-típusok szerződésként működnek, minden HTTP endpoint OpenAPI-specifikációt kap. Érdemi döntésekhez ADR, a nagyobb kontextusokhoz külön C4 diagramok tartoznak.

Kiegészítő elfogadott alapelv: unit tesztek mellett integrációs tesztek igazolják az egységek együttműködését és szükséges üzleti sorrendjét/időzítését; kritikus felhasználói folyamatokhoz E2E teszt tartozik. Zöld unit teszt vagy magas coverage önmagában nem elegendő. TDD az egyeztetett integrációs és E2E határokon is alkalmazható. Döntés: [ADR-0002](../architecture/adr/0002-integration-and-e2e-testing.hu.md).

Konkrét alkalmazás és ellenőrzési keret: [engineering útmutató](../architecture/engineering-principles.hu.md). Elfogadott döntés: [ADR-0001](../architecture/adr/0001-engineering-principles.hu.md). Canonical módszertani rekord: belső Linear-rekord. Ez módszertani vállalás, nem új aktív prioritás.

## 1. Az gyakorlo projekt követelményei

### A. A nyilvános hirdetésben szereplő alapelvárások

| ID | Elvárás |
| --- | --- |
| K01 | Erős JavaScript/TypeScript, ES6+ tudás |
| K02 | React, Vue vagy Angular biztos ismerete; ebben az appban React |
| K03 | Node.js backendfejlesztési tapasztalat |
| K04 | HTTP, TCP/IP és WebSocket megértése |
| K05 | REST vagy REST-szerű API-k készítése |
| K06 | Relációs vagy NoSQL-adatbázis használata |
| K07 | Legalább egy cloud platform ismerete: AWS, GCP vagy Azure |
| K08 | Git használata |
| K09 | Jó angol kommunikáció |

Forrás: [INSPYRE – Full Stack Engineer](https://join.com/companies/inspyre1/16734190-full-stack-engineer-node-js-vue-angular-react), ellenőrizve 2026. október 1-jén. A hirdetés többféle projektről szól; nem ad AEKI-specifikus architektúrát vagy interjúkérdéssort.

### B. A hirdetésben előnyként szereplő területek

| ID | Előny |
| --- | --- |
| K10 | Összetettebb frontend state management |
| K11 | GraphQL |
| K12 | Microservice-ek |
| K13 | Message queue/broker |
| K14 | Reaktív programozás, RxJS/Streams |

Forrás: ugyanaz a hirdetés. Ezekhez külön gyakorlóbővítések tartoznak; az első működő verzióhoz nem szükséges valamennyit beépíteni.

### C. A saját interjúinformációd alapján hozzáadott fókusz

| ID | Téma | Bizonyítékhatár |
| --- | --- | --- |
| K15 | NestJS: module, controller, service, DI, pipe, guard, interceptor, exception filter | A korábban megadott React/TypeScript/Node/Nest interjústack része; a mostani hirdetés nem nevesíti |
| K16 | Magyar technikai beszélgetés, döntések és működés magyarázata | Saját közlésed; angol gyakorlás ettől még indokolt a hirdetés miatt |

### D. Saját senior felkészülési követelmények

Ezeket a gyakorlás teljességéhez adjuk hozzá, nem igazolt külön INSPYRE-előírások.

| ID | Gyakorlási cél |
| --- | --- |
| K17 | Unit, integrációs és végponttól végpontig tartó tesztelés |
| K18 | Hitelesítés, erőforrás-jogosultság, bemeneti validáció |
| K19 | Konkurencia, tranzakció, idempotencia |
| K20 | Hibakeresés és teljesítménymérés |
| K21 | Architektúra, cache, szállítás és üzemeltetési kompromisszumok |
| K22 | CSR, SSR, hydration, ISR közti különbség elmagyarázása |

Az alapkövetelmények nyilvános forrása a fent hivatkozott hirdetés; a további fókuszok saját gyakorlási döntések. A személyes felkészülési jegyzetek külön kezeltek. A projekt belépőpontja: [AEKI README](../../README.md).

## 2. Az appötlet: AEKI Product Finder

**Üzleti helyzet:** egy vásárló íróasztalt keres megadott árkereten belül. Kiválasztja az áruházat, összehasonlítja a találatokat, majd egy elérhető terméket rövid időre lefoglal. A munkatárs módosítja a készletet; a vásárló felületén ez megjelenik.

**Miért most:** a kereső közvetlenül gyakoroltatja a már felmerült React/aszinkron hibákat, a készletfoglalás pedig üzleti okot ad a backend, adatbázis és jogosultság témákra.

**Desired outcome:** saját kézzel elkészített, helyben futó full-stack függőleges szelet; a többi témához elkülönített bővítés vagy dokumentált tervezési gyakorlat. Egy kérés útját a keresőmezőtől az SQL-lekérdezésen át a képernyőig el tudod magyarázni.

**Adatok:** saját, szintetikus katalógus legalább 50 termékkel és 3 mintabolttal. Legyen több kategória, ismétlődő terméknév, eltérő ár és nullás készlet. Nincs függés valódi AEKI API-tól. A felület jelezze, hogy demóadatokat mutat.

**Szerepek:** látogató keres és terméket néz; bejelentkezett vásárló saját foglalást kezel; munkatárs készletet módosít. Fizetés, valódi rendelés és valódi ügyféladat nem része a gyakorlatnak.

### C4 architektúradiagramok

A diagramokat külön fájlokban kezeljük:

- [System Context – szereplők és rendszerhatár](../architecture/01-system-context.md).
- [Container – React/RTK webalkalmazás, NestJS API és PostgreSQL](../architecture/02-containers.md).
- [Component – backend data flow](../architecture/03-components.md).

## 3. Javasolt technikai keret

| Rész | Választás | Gyakorlási indok |
| --- | --- | --- |
| Frontend | React + TypeScript, Vite | State, render, effect és aszinkron adatfolyam közvetlenül látható |
| Backend | Node.js + NestJS | HTTP-réteg, DI, validáció, üzleti logika elkülönítése |
| Adatbázis | PostgreSQL | Relációk, SQL, indexek és valódi tranzakciós konkurenciateszt |
| Kliensoldali közös állapot | Redux Toolkit (RTK) + React Redux | Szükség esetén slice, action, reducer és selector; például termék-összehasonlításra kijelölt azonosítók |
| API-adatok és cache | RTK Query az első appverziótól | Query/mutation, argumentum szerinti cache, betöltés/hiba, újralekérés és tag alapú invalidálás |
| Tesztek | Vitest + React Testing Library; Nest HTTP-/DB-integráció; Playwright | Viselkedés a megfelelő határon ellenőrizhető |
| Helyi futtatás | Frontend, backend és DB; opcionálisan Docker Compose | Más gépen is reprodukálható indulás |

Ez választott gyakorlóstack, nem állítás az AEKI tényleges technológiáiról. A könyvtárverziókat implementációkor rögzítsük a lockfile-ban.

Alaparchitektúra: böngésző → Nest API → PostgreSQL. Modulok: Products, Inventory, Reservations, Auth. Az üzleti döntések service-be kerülnek; az adatbázis-műveletek repository mögé. A Nest alapértelmezett singleton providereiben ne tároljunk felhasználónkénti keresést vagy sessionállapotot.

**Állapotkezelési döntés, 2026. október 1.:** a React app Redux Toolkitet használ. Termékek, készletek és foglalások az RTK Query cache-ben élnek; nem másoljuk őket külön slice-ba. A keresőmező gépelés közbeni értéke lokális state, az alkalmazott keresési feltételek az URL-ben élnek. Külön slice akkor kell, ha több képernyő által használt kliensállapot jelenik meg; erre opcionális példa a termék-összehasonlításhoz kijelölt azonosítók listája. A bejelentkezés session-cookie-ját nem tároljuk Reduxban.

Az RTK Query cache-kulcsának minden keresési feltételt tartalmaznia kell. Az UI csak az aktuális argumentumhoz tartozó eredményt mutathatja; az előző keresés adata nem jelenhet meg új találatként. A 300 ms debounce-ot külön kezeljük. Foglalás, lemondás és készletmódosítás után az érintett query-k tagjeit invalidáljuk; WebSocket-eseménynél is ezt használjuk. Kijelentkezéskor a felhasználóhoz kötött cache-t töröljük. Fordított válaszsorrenddel és felhasználóváltással ellenőrizzük a működést.

A kézzel írt fetch/AbortController példa külön kis tanulási gyakorlat maradhat az aszinkron működés megértésére; az app adatlekérési rétege RTK Query. Forrás: [RTK Query áttekintés](https://redux-toolkit.js.org/rtk-query/overview).

**Microservice-döntés:** a NestJS mind a moduláris monolithoz, mind az önálló szolgáltatásokhoz használható. A microservice architekturális határ, nem egy framework neve. A B02-ben kiemelt értesítő külön NestJS-alkalmazás lesz; a választott brokerhez az `@nestjs/microservices` csomagot használjuk. Egy Nest module önmagában nem önálló microservice. Forrás: [NestJS microservices](https://docs.nestjs.com/microservices/basics).

## 4. Funkcionális követelmények és elfogadási feltételek

### F01 – Termékkeresés

- A vásárló név vagy cikkszám alapján kereshet; a környező whitespace nem számít, a névkeresés kis-/nagybetűtől független.
- Az első nézet keresésre vár. Üres vagy csak whitespace-ból álló szöveg nem indít keresőkérést, és törli a korábbi találatokat.
- Nem üres bemenetnél 300 ms változatlan keresési feltétel után indul kérés. Ez az app saját viselkedési döntése.
- A teljes feltételkészlet számít: keresőszöveg, áruház, szűrők, rendezés és lapozás. Változáskor a régi válasz nem jelenhet meg az új feltételek eredményeként.
- Legyen várakozó, betöltés, sikeres találat, nincs találat és hiba állapot; hibánál újrapróbálás az aktuális feltételekkel.
- A lista termékazonosítót használ stabil React key-ként. A keresőnek látható labelje van.

**Elfogadás:** az `asztal` kérés később fejeződik be, mint az `asztali`, de csak az utóbbi eredménye marad látható. Ugyanez működik szűrőváltáskor, keresés törlésekor és oldalelhagyáskor. A debounce önmagában nem teljesíti ezt.

**Magyarázandó:** closure és state snapshot; debounce és válaszsorrend különbsége; cleanup; miért nem oldja meg a useCallback a régi válasz felülírását.

### F02 – Szűrés, rendezés, lapozás és URL

- Szűrés kategóriára, minimum-/maximumárra és kiválasztott áruházban elérhető termékekre.
- Rendezés név vagy ár szerint; azonos értéknél termékazonosító ad stabil másodlagos sorrendet.
- A backend végzi a szűrést és lapozást. Alapméret 20, megengedett maximum 50.
- A keresőfeltételek az URL-ben is szerepelnek; linkmegnyitás és vissza/előre navigáció visszaállítja őket.
- Feltételváltozás az első oldalra lép. Negatív ár vagy minimumárnál kisebb maximum hibás bemenet.
- A kezdő REST-szerződés számozott oldalakat használ; a változó katalógus és nagy offset korlátait külön el kell magyarázni.

**Elfogadás:** a teljes szűrést a backend alkalmazza, nem csak az aktuálisan letöltött oldalt szűri a frontend. Az URL megnyitása ugyanazokat a feltételeket adja vissza; egy változatlan katalógus lapjain nincs duplikáció a bizonytalan sorrend miatt.

### F03 – Termékadatlap és áruházi készlet

- A találat neve, képe, ára és kiválasztott áruházhoz tartozó elérhetősége látszik.
- Az adatlap kategóriát, leírást és áruházankénti készletet mutat.
- Ismeretlen termék külön 404 nézetet eredményez.
- Pénzérték egész számú HUF; pénznem explicit. A megjelenített készlet tájékoztató, a foglaláskor a backend ismét ellenőrzi.

**Elfogadás:** a felhasználó olyan termékre is kaphat készlethiányt foglaláskor, amely az adatlap betöltésekor elérhető volt; az UI ezt érthetően kezeli.

### F04 – Bejelentkezés és jogosultság

- Előre létrehozott demófelhasználókkal használható bejelentkezés és kijelentkezés.
- Javasolt session: HttpOnly cookie, éles HTTPS-konfigurációban Secure; a cookie-alapú módosító kérésekhez CSRF-védelem tartozik.
- A backend állapítja meg a felhasználót és a szerepkört. A böngésző által küldött userId vagy role nem jogosultsági bizonyíték.
- A vásárló csak a saját foglalásait olvashatja és törölheti. A készletmódosítás munkatársi jogosultságot igényel.

**Elfogadás:** hiányzó/lejárt session 401; vásárló készletmódosítása 403; más felhasználó foglalása a saját foglalásleolvasó/törlő útvonalon 404. A felület gombjainak elrejtése mellett közvetlen HTTP-kéréssel is élnek a korlátok.

### F05 – Készletfoglalás és versenyhelyzet

- A vásárló terméket, áruházat és pozitív egész darabszámot ad meg.
- A foglalás 10 percig aktív. Az elérhető készlet csökkentése és a foglalás létrehozása egy tranzakció része.
- Ugyanazon készletre versengő kérések nem vihetik negatívba az elérhető mennyiséget. A garanciát az adatbázis adja.
- Saját aktív foglalás lemondható; lejárat után felszabadul. A felszabadítás legfeljebb egyszer történik meg akkor is, ha lemondás és lejáratkezelés verseng.
- A lejáratkezeléshez ismételhető háttérfolyamat és tesztben vezérelhető óra tartozik.

**Elfogadás:** 1 elérhető darabra két külön vásárló párhuzamos foglalásából pontosan egy sikerül, a másik 409-et kap. DB-integráció igazolja; mock repository nem bizonyítja a konkurenciagaranciát. Ismételt lemondás/lejáratkezelés nem növeli kétszer a készletet.

### F06 – Biztonságos újraküldés

- A foglalás létrehozása felhasználónként elkülönített Idempotency-Key-t fogad.
- Azonos kulcs és azonos tartalom ugyanazt a foglalást adja vissza újabb készletcsökkentés nélkül; eltérő tartalom 409.
- Az idempotenciarekord és a foglalás tartósan, összehangolt tranzakcióban készül. A párhuzamos, azonos kulcsú kérések is deduplikáltak.
- A kulcs 24 óráig érvényes; utána új művelet indulhat. Ez demópolicy, az újrapróbálás üzleti határait dokumentálni kell.

**Elfogadás:** a sikeres foglalás válaszát elveszettnek szimuláljuk, majd újraküldjük a kérést. Egy foglalás és egy készletcsökkentés történik.

### F07 – Élő készletjelzés WebSocketen

- Foglalás, lemondás, lejárat vagy munkatársi módosítás után esemény jelzi az érintett termék/áruház készletváltozását.
- Az esemény sikeres DB-commit után indul. Érzékeny felhasználói/foglalási adatot nem küldünk nyilvánosan.
- A kliens az esemény hatására újralekéri a készletet. Újracsatlakozáskor szintén frissít, mert kiesés alatt eseményt veszíthetett.
- A feliratkozás és annak megszüntetése tesztelhető; a WebSocket jelzés nem a foglalás konzisztenciagaranciája.

**Elfogadás:** két böngészőlapon az egyik foglalása a másikon készletfrissítést eredményez. Kapcsolatbontás és visszatérés után nincs tartósan régi állapot.

### F08 – Munkatársi készletmódosítás

- A munkatárs hozzáad vagy kivon darabszámot, kötelező indokkal. Negatív elérhető készletet eredményező módosítás 409.
- A változásból auditrekord készül: ki, mikor, melyik termék/áruház, milyen delta és indok.
- Az audit és készletváltozás közös tranzakcióban történik; cache-frissítés csak commit után.

**Elfogadás:** vásárló nem módosíthat; konkurens foglalás és munkatársi kivonás sem teszi negatívvá a készletet; sikertelen tranzakció nem hagy sikeres auditot.

## 5. Minimális adatmodell és API-szerződés

| Entitás | Fontos mezők és szabályok |
| --- | --- |
| Product | id, egyedi articleNumber, name, category, description, priceHuf ≥ 0, currency, imageUrl |
| Store | id, name |
| Inventory | productId + storeId egyedi pár, availableQuantity ≥ 0, updatedAt |
| User / Session | id, szerepkör; lejáró és visszavonható session |
| Reservation | id, userId, productId, storeId, quantity > 0, expiresAt, status: active/cancelled/expired |
| IdempotencyRecord | userId + key egyedi pár, requestFingerprint, reservationId, expiresAt |
| InventoryAudit | szereplő, készletpár, delta, indok, időpont |

Az Inventory az éppen foglalható mennyiséget tárolja. Aktív foglalás csökkenti; egyszeri lezárása visszaadja. Fizikai és lefoglalt készlet külön könyvelése későbbi modellbővítés lehet.

| HTTP | Útvonal | Szerződés |
| --- | --- | --- |
| GET | /api/products?q=&category=&storeId=&minPrice=&maxPrice=&availableOnly=&sort=&page=&pageSize= | Találatok + total + page + pageSize; a query max. 100 karakter |
| GET | /api/products/:id | Termék és áruházi készletek |
| GET | /api/stores | Választható áruházak |
| POST | /api/auth/login | Demóbelépés és session létrehozás |
| POST | /api/auth/logout | Session visszavonás |
| POST | /api/reservations | productId, storeId, quantity; session + Idempotency-Key |
| GET | /api/reservations | Saját foglalások |
| GET | /api/reservations/:id | Saját foglalás részletei |
| DELETE | /api/reservations/:id | Saját foglalás lemondása; ismétlés nem szabadít fel újra |
| PATCH | /api/inventory/:productId/:storeId | Munkatársi delta és indok |

Egységes hibaválasz: error.code, error.message, requestId, opcionális mezőhibák. Hibás bemenet 400; készlet-/idempotenciaütközés 409; átmeneti szolgáltatáshiba megfelelő 5xx. HTTP-, WebSocket- és külső adatnál futásidejű validáció szükséges; az `as Product` nem validáció.

## 6. Nem funkcionális követelmények

| ID | Követelmény | Ellenőrzés |
| --- | --- | --- |
| N01 | Szigorú TypeScript; egymásnak ellentmondó UI-állapotok kizárása | Típusellenőrzés és állapotátmenetek review-ja |
| N02 | Billentyűzettel használható kereső/szűrők, látható fókusz és label, közölhető státuszok | Manuális billentyűzetes próba, szerep/label alapú UI-tesztek |
| N03 | Paraméterezett SQL, korlátozott input, védett módosítás, jelszó/session nélküli logok | Hibás input és jogosulatlan HTTP-kérés integrációs tesztje |
| N04 | Lassú/hibás kérés látható állapotot ad; cleanup és kontrollált újrapróbálás | Fordított válaszsorrend, timeout, hiba és unmount próbák |
| N05 | Mérhető keresés: kérésidő, SQL-hívásszám, böngészős renderköltség | Reprodukálható mérési jegyzet az optimalizálás előtt és után |
| N06 | RequestId, strukturált log, liveness/readiness; hiba nem lepleződik sikeres üres listaként | DB-kiesés és hibás kérés követhető a logokban |
| N07 | Dokumentált, reprodukálható indítás, seed és migráció | README alapján tiszta környezetből kipróbálható |
| N08 | CI-ben lint, típusellenőrzés, releváns tesztek és build | Valódi pipeline-eredmény; megtervezett pipeline nem elvégzett szállítás |

Teljesítménygyakorlat: külön generálható 10 000 termékes adatkészleten mérj baseline-t, keresd az N+1-et, nézd meg a lekérdezési tervet, majd egy indokolt változtatást mérj újra. Index, memoizálás vagy cache csak feltárt problémára kerüljön be. Gépet, terhelést, futtatást és eredményt dokumentálj; ez nem bizonyít éles skálázhatóságot.

## 7. Lefedettség: melyik elvárást hol gyakorolod?

| Követelmény | Appfunkció vagy külön gyakorlat | Amit saját szavakkal el kell mondanod |
| --- | --- | --- |
| K01 JS/TS | F01/F02, API-adatvalidáció, állapotunion | Referencia/másolás, closure, unknown/narrowing, union, generikus, Promise |
| K02 React | F01–F03 | Render vs. DOM, state gazdája, effect/cleanup, key, méréshez kötött memo |
| K03 Node | Keresőendpoint; külső adatadapter gyakorlat | Event loop, I/O és CPU, timeout, soros/párhuzamos munka |
| K04 hálózat | HTTP-keresés + F07; kérésút rajza | DNS → IP/port → TCP → TLS → HTTP; WS-kapcsolat, reconnect; CORS |
| K05 REST | 5. fejezet | Metódus, státuszkód, validáció, stabil lapozás, hibaszerződés |
| K06 DB | F05/F08 | Relációk, egyedi/check constraint, tranzakció, lock, index, lekérdezési terv |
| K07 cloud | Cloud-terv és opcionális próbatelepítés | HTTPS belépési pont, app/DB hálózata, secret, migráció, log, rollback |
| K08 Git | Kis funkcióágak és review-zható commitok | Diff, konfliktus, revert, elkülönített módosítások |
| K09 angol | Rövid bemutató és egy hibakeresési történet | Igény → saját döntés → bizonyíték → kompromisszum |
| K10 state management | Redux Toolkit + RTK Query, F01/F02/F05/F07 | Store/slice/selector; query és mutation; argumentum szerinti cache, tag invalidálás; input lokális, keresőfeltétel URL, termék szerveradat |
| K11 GraphQL | B01 | Query/mutation, mezőválasztás, N+1, REST-kompromisszum |
| K12 microservice | B02 | Szolgáltatáshatár, tulajdonolt adat, új hibalehetőség, üzemeltetési ár |
| K13 broker | B02 | At-least-once, deduplikáció, retry, hibasor, outbox |
| K14 RxJS/Streams | B03/B04 | Debounce, switchMap, cancellation; stream és backpressure |
| K15 Nest | F04/F05, modulok és HTTP-pipeline | DI-token, provider csere tesztben; middleware/guard/pipe/interceptor/filter szerepe |
| K16 kommunikáció | Rövid bemutató minden kész szelet után | Működés, határok, indoklás és megmaradt bizonytalanság |
| K17 tesztek | F01/F05/F06 és teljes vásárlói folyamat | Melyik garanciát milyen teszt bizonyítja; mock korlátja |
| K18 biztonság | F04/F08, DTO és válaszvalidáció | Hitelesítés vs. erőforrás-jogosultság, runtime ellenőrzés |
| K19 konkurencia | F05/F06 | Versenyhelyzet, atomi művelet, idempotencia és lejárat |
| K20 diagnózis | N05, mesterséges késleltetés/hiba | Hipotézis → reprodukció → mérés → javítás → ellenőrzés |
| K21 rendszertervezés | Moduláris monolit, cache és cloud-terv | Mi indokol változtatást; commit és invalidálás; szállítás bizonyítéka |
| K22 renderstratégiák | B05 | CSR/SSR/hydration/ISR; termékleírás és gyorsan változó készlet külön kezelése |

Kiegészítő Node-gyakorlat: egy szimulált külső termékadat-adapter legfeljebb 4 párhuzamos hívással dolgozik, input sorrendű eredménnyel, elemenkénti siker/hiba unionnel és határidővel. Teszteld az aktív hívások maximumát, eltérő válaszidőket és részleges hibát. A CPU-blokkolás vizsgálatához legyen külön hibás, lassú változat; az `async` szó nem bizonyít háttérszálas végrehajtást.

## 8. Későbbi bővítések a teljes tématérképhez

Ezek a gyakorlási lehetőségek fedik le az előnyként jelölt területeket. Nem új aktív prioritások és nem automatikusan vállalt interjú előtti feladatok.

- **B01 – GraphQL:** alternatív termékadatlap-lekérés ugyanarra a service-rétegre. Ellenőrzés: csak kért mezők, jogosultság, kapcsolt készletek lekérdezésszáma. A REST API működése marad összehasonlítási alap.
- **B02 – Broker és szolgáltatáshatár:** foglalásról szimulált értesítés külön NestJS microservice-ben, `@nestjs/microservices` és választott broker használatával. DB-outbox köti össze a commitot és a publikálást; az ismételt esemény nem küld újabb értesítést. Külső levélküldés helyett helyi napló/sink. Külön folyamatba csak az értesítőt emeljük ki, és dokumentáljuk, mikor indokolt ez az összetettség.
- **B03 – RxJS:** a keresőadatfolyam alternatív megoldása debounce/distinct/switchMap segítségével. Ugyanazok a fordított válaszsorrend-tesztek érvényesek; magyarázd el az Observable leiratkozása és a tényleges HTTP-megszakítás közötti kapcsolatot.
- **B04 – Node stream:** nagyobb helyi katalógus CSV-exportja teljes fájlmemória nélkül. Ellenőrzés: lassú fogyasztó, megszakított letöltés és backpressure.
- **B05 – Renderelési összevetés:** először a Vite app CSR-működését magyarázd el. Külön kis Next.js demóban vizsgáld a termékleírás SSR/ISR lehetőségét és a hydrationt. A készletet külön friss adatfolyam kezeli; a foglalás mindig DB-ben dönt. Dokumentáld a választott framework konkrét revalidációs viselkedését; ne kezeld a cache-t korlátlanul friss készletforrásként.
- **B06 – Cloud:** válassz egy platformot, például AWS-t, és rajzold meg a CDN/frontend, HTTPS API, alkalmazás, privát PostgreSQL, secret és log útját. Terv és tényleges telepítés külön státusz. Fizetős erőforrás létrehozása nem ennek a dokumentumnak a feladata.

## 9. Megvalósítási sorrend és kilépési feltételek

Egyszerre egy szeletet írj meg. Minden lépés építsen a korábbi működő változatra; a teljes specifikáció nem interjú előtti kötelező mennyiség.

| Szelet | Eredmény | Függőség | Kilépési feltétel |
| --- | --- | --- | --- |
| S1 | Saját TS termékmodell, szintetikus adatok, keresési szerződés | Nincs | Típusellenőrzés; üres input és névkeresés tesztje; saját magyarázat |
| S2 | React + Redux Toolkit + RTK Query kereső késleltetett, szimulált HTTP API-val | S1 | F01, hibakezelés, helyes query-argumentum és régi válasz elleni védelem működik |
| S3 | Nest GET endpoint + valódi PostgreSQL | S1/S2 | Ugyanaz a kereső valódi HTTP/DB láncon működik; DTO/lekérdezés tesztelt |
| S4 | Szűrők, lapozás, URL és adatlap | S3 | F02/F03 elfogadási esetek; vissza navigáció és 404 |
| S5 | Session és atomi foglalás | S3/S4 | F04/F05; jogosultság és utolsó darab DB-integrációs tesztje |
| S6 | Újraküldés, lemondás és lejárat | S5 | F06; nincs dupla foglalás vagy dupla felszabadítás |
| S7 | WebSocket és munkatársi módosítás | S5/S6 | F07/F08; két kliens és reconnect ellenőrizve |
| S8 | Mérés, CI, cloud-terv és angol bemutató | Működő szelet | Dokumentált bizonyítékok, állítások és határok |
| S9 | Választott B01–B06 bővítés | Stabil alap | Az adott bővítés viselkedése és kompromisszuma ellenőrizve |

**Kis kezdő verzió (S1–S3):** kereső → React + RTK Query → Nest → PostgreSQL, betöltés/hiba/üres állapot, debounce és késői válasz elleni védelem. Ez az első érdemi cél; a teljes senior tématérkép részhalmazát igazolja.

**Review trigger:** minden szelet után bemutató és saját magyarázat. Ha egy alap viselkedését nem tudod megjósolni vagy az időkeret elfogy, álljunk meg a működő szeletnél, és a továbbiakat tervezési beszélgetésként gyakoroljuk. Az interjú előtti napon új infrastruktúra helyett a bizonytalan alapok és a bemutató kapjon időt.

**Linear:** ez a fájl review-ra alkalmas javaslat a meglévő felkészüléshez. A keresés most nem adott INSPYRE-találatot Linearban; ebből nem következik projekt vagy prioritás hiánya. Nem hoztunk létre issue-t, nem változtattunk státuszt, priority budgetet vagy canonical DoD-t. A fenti szeletek és kilépési feltételek javaslatok; felvételük külön, kifejezett utasítás alapján történhet.

## 10. Mitől tekinthető késznek és mitől tanultad meg?

Az adott szelet technikailag kész, ha az elfogadási esetei teljesülnek, a megfelelő szintű tesztjei zöldek, tiszta indítása dokumentált, és ismert hibája/korlátja fel van jegyezve.

A szeletek review-ja ellenőrzi a SOLID felelősségeket, a megfigyelt TDD-ciklust, a statikus és runtime szerződéseket, a HTTP-válasz OpenAPI-megfelelését, valamint a változáshoz releváns ADR/C4 frissítését. Az adott funkció együttműködési kockázataihoz megfelelő integrációs bizonyíték és a kritikus teljes folyamatokhoz E2E eredmény is szükséges; a unit eredmény nem helyettesíti ezeket. Ez a Linearban rögzített módszertani keret helyi alkalmazása; önmagában nem minősít egy szeletet késznek.

A tanulási cél teljesítéséhez ezen felül:

1. Saját kézzel írod a megoldást; az asszisztens specifikációval, kérdéssel és review-val segít.
2. Egy fontos hibát reprodukálsz, majd a javítás hatását ellenőrzöd.
3. Elmagyarázod az adat és state gazdáját, a kérések útját és a választott kompromisszumot.
4. Később egy kisebb részt üres lapról vagy eltérő bemenettel megismételsz.
5. A bemutatóban külön mondod el, mi implementált, mi tesztelt, mi csak tervezett, és mihez van éles tapasztalatod.

Nem használunk egyetlen „senior kompetenciaszázalékot”. Külön követjük a funkciók elkészültét, a teszteket, a saját magyarázatot és az önálló felidézést. A követelmények leírása önmagában nem bizonyítja a tudást.

## 11. Próbainterjú ugyanerről az appról

- „Beírom, hogy asztal, majd asztali, és rossz találat jelenik meg. Hogyan deríted ki az okát?”
- „Melyik adat lokális state, URL-állapot vagy szerveradat? Mit nem tárolsz kétszer?”
- „Mi kerül Redux slice-ba és mi RTK Query cache-be? Hogyan működik a query-kulcs, invalidálás és a kijelentkezéskori cache-törlés?”
- „Hogyan lesz a JSON-ból ellenőrzött TypeScript-adat? Hol lép be a Nest pipe?”
- „Mi történik a kereső leütésétől a képernyő frissítéséig, hálózati és alkalmazásszinten?”
- „Miért nem lesz gyorsabb a CPU-intenzív keresés attól, hogy async a függvény?”
- „Hogyan tesztelsz service-t repositorycsere mellett, és mit nem bizonyít ez a DB-ről?”
- „Mi történik, ha két apppéldány egyszerre foglalja az utolsó darabot?”
- „A foglalás létrejött, de a válasz elveszett. Mi történik újraküldéskor?”
- „Mi történik, ha lejárat, lemondás és készletmódosítás egy időben fut?”
- „A WebSocket megszakadt. Honnan tudja a kliens a helyes készletet?”
- „Mikor választanál indexet, cache-t, worker threadet vagy külön szolgáltatást?”
- „Melyik rész lehet SSR/ISR, és melyik üzleti döntéshez kell friss DB-állapot?”
- „Mutasd be angolul két percben a problémát, a saját döntésedet, egy tesztet és egy kompromisszumot.”

**Első konkrét feladat:** S1-ben mondd ki a termék adatait és a keresési függvény bemenetét/kimenetét; aztán írd meg saját kézzel. Egy működő kis szeletből építkezünk tovább.
