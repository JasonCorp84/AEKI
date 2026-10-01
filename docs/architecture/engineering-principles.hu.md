# AEKI Product Finder – engineering alapelvek és alkalmazásuk

Elfogadott alapelvek, Csaba 2026. október 1-jei utasítása alapján: SOLID, TDD, TypeScript szerződések, OpenAPI, ADR és C4. Canonical módszertani rekord: belső Linear-dokumentum. Első döntésrekord: [ADR-0001](adr/0001-engineering-principles.hu.md).

Az alapelvek elfogadottak; a lent leírt konkrét OpenAPI-tooling és munkamenet implementációs javaslat, amelyet az első szelettel ellenőrzünk. Jelenleg dokumentáció készült, nem appimplementáció vagy futó CI.

## 1. SOLID a modulokban

| Elv | Követelmény az appban | Review-példa |
| --- | --- | --- |
| SRP | HTTP-adapter, üzleti művelet és adatbázis-hozzáférés felelőssége különül el | Controller nem tartalmaz SQL-t; foglalási service nem küld közvetlen emailt |
| OCP | A valódi változási pontok bővíthetők szűk szerződés mentén | Új értesítési adapter nem módosítja a foglalási szabályokat |
| LSP | Minden implementáció teljesíti a szerződés eredmény-, hiba- és mellékhatásgaranciáit | Atomi foglalást ígérő portot nem valósítunk meg védelem nélküli read-then-write-tal |
| ISP | A fogyasztó csak a szükséges műveletektől függ | Termékkeresési port nem ír készletet és nem kezel sessiont |
| DIP | Üzleti művelet indokolt határon üzleti szerződésre támaszkodik; infrastruktúra azt implementálja | StockReservationPort + PostgresStockReservation adapter, Nest runtime injekciós tokennel |

Nem cél minden osztályhoz interfészt vagy általános CRUD-base osztályt létrehozni. A szerződésnek a fogyasztó igényét kell leírnia; az extra réteg előnyét konkrét példával kell megindokolni. Az adapterek helyettesíthetőségét közös viselkedési szerződés ellenőrizheti. A fake nem bizonyít DB-konkurenciagaranciát.

## 2. TDD munkamenet

1. Egyetlen viselkedést és elfogadási példát választunk, például: új keresés mellett egy régi válasz nem válhat aktuális találattá.
2. Megnevezzük és egyeztetjük a publikus tesztelési határt.
3. Egy viselkedési tesztet írunk, és ténylegesen megfigyeljük a bukást. Ellenőrizzük, hogy a hiányzó viselkedés miatt bukik.
4. Csak annyi saját implementáció készül, amennyi ehhez a viselkedéshez szükséges; újrafuttatással igazoljuk a GREEN állapotot.
5. Külön review következik: szükséges refaktorálás, SOLID és szerződések ellenőrzése; a tesztek továbbra is zöldek.
6. Következő viselkedés, ugyanilyen kis ciklusban. Nem írjuk meg előre az összes tesztet és utána az összes kódot.

Javasolt tesztelési határok, amelyeket tesztírás előtt külön egyeztetünk:

- React-felület: látható állapot és felhasználói interakció; nem belső hookhívások száma.
- HTTP API: request, response, státuszkód, jogosultság és mellékhatás a publikus műveleteken keresztül.
- Üzleti port: jól definiált művelet eredménye és hibapolitikája.
- DB-adapter integrációs határa: valódi DB-n párhuzamos foglalás és ismételt felszabadítás; belső SQL-szöveg helyett üzleti garancia.

A frontend–HTTP–DB teljes folyamatot néhány e2e eset fedi le. Az állapotfordulatok, DTO-hibák és üzleti szélső esetek többségét célzottabb teszt ellenőrzi. A TypeScript negatív típuspéldái a statikus szerződést ellenőrzik, a runtime működést nem.

### Elfogadott alapelv: együttműködés és teljes folyamat tesztelése

Csaba kifejezett utasítása alapján, 2026. október 1. Döntésrekord: [ADR-0002](adr/0002-integration-and-e2e-testing.hu.md).

**A tesztelésnek az egységek helyessége mellett az összekapcsolt részek együttműködését és a kritikus felhasználói folyamatokat is igazolnia kell.** Zöld unit tesztek vagy magas kódlefedettség önmagukban nem elegendők a rendszerhelyesség bizonyításához.

| Szint | Mit igazol? | AEKI-app példa |
| --- | --- | --- |
| Unit | Egy elkülönített egység viselkedése | A bemenet pozitív egész mennyiséget követel |
| Integráció | Összekapcsolt részek működése, szükséges üzleti sorrendje és időzítése | RTK Query mutation → invalidálás → készlet újralekérése → megváltozott UI |
| E2E | Kritikus felhasználói folyamat működő böngésző, backend és valódi tesztadatbázis együttműködésével | Belépés → keresés → foglalás → saját foglalás megjelenése → csökkent készlet |

Kötelezően ellenőrizendő, ahol az adott funkció érintett:

- Esemény csak sikeres adatbázis-commit után indulhat; rollback után nem küldünk sikeres készletváltozást.
- Az aktuális keresési feltételekhez tartozó eredmény látható; régi válasz nem írhatja felül.
- Foglalás után a kapcsolódó szerveradat-cache frissül, és a felület a helyes készletet mutatja.
- Párhuzamos vagy ismételt művelet nem okoz dupla foglalást, negatív készletet vagy dupla felszabadítást.

A pontos belső metódushívási sorrend csak akkor tesztelendő, ha maga is a szerződés része. Egyébként a publikus eredményt, időzítési határt és mellékhatásgaranciát vizsgáljuk. A kontrollált hálózatot használó frontend-integrációs teszt nem valódi backend-E2E; a mock/fake által elfedett integrációt külön, valós adapterekkel ellenőrizzük.

TDD mindhárom szinten alkalmazható. Minden funkciónál a kockázatok alapján választjuk ki és egyeztetjük a szükséges tesztelési határokat; nem kell minden esetet mindhárom szinten megismételni. A review a tesztek tényleges hatókörét és az általuk nem igazolt garanciákat is rögzíti.

A TDD munkamenetét a fenti lépések rögzítik. Elakadásnál egy rávezető kérdés; a tanuló kódját nem írjuk meg helyette.

## 3. TypeScript mint szerződés

- `strict` típusellenőrzés. Publikus portnak explicit bemenet, eredmény és hibapolitika van.
- Lehetetlen állapotok kizárása discriminated unionnel, például success/error eredmény és teljes esetkezelés.
- Külső HTTP-, WebSocket- és brokeradat ellenőrzés előtt nem megbízható. Schema-validáció után léphet be a típusos alkalmazásba.
- `any`, ellenőrizetlen assertion és non-null assertion nem lehet a szerződéshiba elfedésének eszköze.
- Transporttípus, domainérték és tárolási modell külön feladat. ORM entity nem automatikusan publikus response.
- A `number` nem bizonyít pozitív egész mennyiséget. Ellenőrzött konstruktor/parser és szükség esetén branded domainérték adja a belépési garanciát.
- Az interface nem futásidejű Nest DI-token. A porthoz külön token vagy absztrakt osztály szükséges.

A TS-típus fordításkor ellenőriz, az adatot nem validálja futáskor. Forrás: [TypeScript type assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions).

## 4. OpenAPI az endpointok szerződéséhez

**Javasolt megoldás: spec-first.** Az appgyökér `contracts/openapi.yaml` fájlja a HTTP-szerződés technikai forrása. Előbb egy művelet szerződését írjuk le, aztán TDD-vel implementáljuk. Nem hozunk létre vele párhuzamosan egy külön, kézzel karbantartott Swagger-szerződést.

Minden HTTP művelethez tartozzon: egyedi operationId; path/query/header/cookie és request body; siker- és hibaválaszok; státuszkódok; security követelmény; példa; mennyiségi korlát, ahol releváns. Az Idempotency-Key és a session-cookie is része a foglalás szerződésének.

Javasolt pipeline:

1. Verziózott OpenAPI dokumentum validálása.
2. Transport TypeScript-típusok generálása `packages/api-contracts/` alá; generált fájlt nem kézzel javítunk.
3. A schema alapján kompatibilis runtime validáció bekötése a Nest HTTP-határra és szükség szerint a kliensre. A schema-korlátok és a tényleges validator működése ugyanazon példákkal tesztelt.
4. RTK Query endpointok a generált szerződést használják; cache-tag és UI-viselkedés az alkalmazás felelőssége.
5. HTTP-integrációs tesztek ellenőrzik a tényleges request/response megfelelést, beleértve a hibaválaszokat.
6. CI ellenőrzi, hogy újragenerálás után nincs eltérés, a típusellenőrzés és szerződéstesztek sikeresek. Breaking change külön review és szükség esetén ADR.

A validációs/codegen eszközt az első endpoint előtt kipróbáljuk és verzióját rögzítjük. Az OpenAPI-verziót a teljes toolchain kompatibilitása alapján választjuk; a támogatást nem feltételezzük. A dokumentáció megjeleníthető Swagger UI-val; a Nest annotációkból történő generálás egy alternatív code-first stratégia, amelyre áttéréshez külön döntés szükséges.

OpenAPI a HTTP-felülethez tartozik. A WebSocket- és brokereseményeknek külön verziózott schemaszerződés és kompatibilitási teszt kell; később AsyncAPI is választható. A készletkonkurencia és tranzakció üzleti garanciáját OpenAPI önmagában nem biztosítja.

Források: [OpenAPI specifikáció](https://spec.openapis.org/oas/v3.1.1.html), [Nest OpenAPI támogatás](https://docs.nestjs.com/openapi/introduction).

## 5. ADR a döntésekhez

Helye: `docs/architecture/adr/NNNN-rovid-cim.md`. Egy érdemi döntés egy rekord: státusz, dátum, kontextus, döntés, alternatívák, pozitív/negatív következmények, ellenőrzés és review trigger.

Elfogadott rekordok: [ADR-0001 – Engineering alapelvek](adr/0001-engineering-principles.hu.md), [ADR-0002 – Együttműködés és teljes folyamat tesztelése](adr/0002-integration-and-e2e-testing.hu.md). Későbbi jelöltek: konkrét OpenAPI-toolchain; atomi készletfoglalás; monolit és értesítő különválasztása; broker/deduplikáció; cache-stratégia. Apró fájlnév- vagy formázási választáshoz nem szükséges ADR.

Egy leváltott döntést nem törlünk: Superseded státuszt kap, és hivatkozik az új ADR-re. A Linear kezeli a vállalást és státuszt, az ADR a verziózott technikai indoklást.

## 6. C4 a különböző kontextusokhoz

| Nézet | Kérdés | Dokumentum |
| --- | --- | --- |
| System Context | Ki használja a rendszert; mi a határa és a külső kapcsolata? | [01-system-context.hu.md](01-system-context.hu.md) |
| Container | Milyen alkalmazások és adattárolók futnak; hogyan kapcsolódnak? | [02-containers.hu.md](02-containers.hu.md) |
| Component, szükség esetén | Hogyan épül fel egy kiválasztott container? | Csak a megértéshez szükséges részről, külön fájlban |
| Dynamic, szükség esetén | Hogyan működik egy konkrét folyamat? | Például foglalás/idempotencia; külön fájlban |

A C4 kommunikálja a nagyobb kontextust, nem kényszeríti ki a kód architektúráját. Strukturális változáskor a releváns diagramot és ADR-t a kóddal együtt frissítjük. A megtervezett és implementált elemek státuszát jelöljük. Forrás: [C4 model](https://c4model.com/).

## 7. Hogyan kapcsolódik mindez egy konkrét funkcióhoz?

Példa: `POST /api/reservations`.

1. Követelmény: az utolsó darabot két vásárló közül csak egy foglalhatja le.
2. ADR: kiválasztott DB-megoldás indoklása, alternatívák és következmények.
3. OpenAPI: kérés, mennyiségi korlát, hitelesítés, idempotenciakulcs és 201/400/401/409 válaszok.
4. TypeScript: ellenőrzött bemenet, publikus atomi művelet, explicit eredmény.
5. Egyeztetett DB-integrációs határon TDD: két párhuzamos kérés eredménye egy siker és egy készlethiány.
6. SOLID review: a service nem ismeri a konkrét SQL-t; az adapter teljesíti a port garanciáját.
7. C4: architektúraváltozáskor a megfelelő nézetet frissítjük; új endpoint miatt önmagában nem rajzoljuk át a Context diagramot.

Az endpoint státuszai itt tervezési példa; az első OpenAPI-szeletben rögzítjük a teljes pontos szerződést. Nincs még megírt teszt vagy kész endpoint.
