# IKEA Product Finder – architektúra és mappaszerkezet

Állapot: javaslat, 2026. október 1. Nem scaffold és nem jóváhagyott Linear-állapotváltozás.

Elfogadott engineering alapelvek: [SOLID, TDD, TypeScript/OpenAPI szerződések, ADR és C4](engineering-principles.hu.md). Ezek a mappaszerkezet alkalmazására is vonatkoznak; maga a struktúra továbbra is javaslat.

## Javasolt felépítés

Egy monorepo, benne React webalkalmazás és moduláris NestJS backend, PostgreSQL adattárolással. A monorepo a kód együtt tárolásáról szól; a moduláris monolit a backend futási és modulhatárairól. A frontend és a backend ettől még külön buildelhető és telepíthető.

A jelenlegi workspace tananyagot és saját tanulószervert tartalmaz. Csaba kifejezett utasítása alapján a gyakorlóapp gyökere az `AEKI/` mappa. A projekt dokumentumai már ide kerültek; a leendő alkalmazás saját függőségei és indítóparancsai is ide tartoznak majd. A lent szereplő fa a javasolt appgyökér tartalma; az alkalmazáskód még nem készült el.

```text
AEKI/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── store.ts
│   │   │   │   ├── api.ts
│   │   │   │   ├── hooks.ts
│   │   │   │   └── router.tsx
│   │   │   ├── features/
│   │   │   │   ├── products/
│   │   │   │   │   ├── products.api.ts
│   │   │   │   │   ├── ProductSearchPage.tsx
│   │   │   │   │   ├── ProductDetailsPage.tsx
│   │   │   │   │   ├── ProductCard.tsx
│   │   │   │   │   └── ProductSearchPage.test.tsx
│   │   │   │   ├── reservations/
│   │   │   │   ├── inventory/
│   │   │   │   └── auth/
│   │   │   ├── shared/
│   │   │   │   └── ui/
│   │   │   └── main.tsx
│   │   └── package.json
│   └── api/
│       ├── src/
│       │   ├── modules/
│       │   │   ├── products/
│       │   │   │   ├── dto/
│       │   │   │   ├── products.module.ts
│       │   │   │   ├── products.controller.ts
│       │   │   │   ├── products.service.ts
│       │   │   │   ├── products.repository.ts
│       │   │   │   └── products.service.spec.ts
│       │   │   ├── reservations/
│       │   │   ├── inventory/
│       │   │   └── auth/
│       │   ├── database/
│       │   ├── common/
│       │   │   ├── filters/
│       │   │   └── interceptors/
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── migrations/
│       ├── test/
│       │   ├── http/
│       │   └── database/
│       └── package.json
├── e2e/
├── compose.yaml
├── package.json
├── package-lock.json
├── .env.example
└── README.md
```

A fa a bővülő célstruktúrát mutatja; az első keresős szelethez csak a ténylegesen használt részeket hozzuk létre. ORM választása után a migráció helyét annak konvencióihoz igazítjuk.

## Miért üzleti funkció szerint szervezzük?

Egy keresési módosítás frontendje a `features/products/`, backendje a `modules/products/` alatt található. Egy funkcióhoz tartozó fájlok és unit tesztek közel maradnak egymáshoz. A Redux útmutató feature mappákat javasol; a Nest feature module-jai összetartozó képességeket csoportosítanak. [Redux Style Guide](https://redux.js.org/style-guide/#structure-files-as-feature-folders-with-single-file-logic), [Nest Modules](https://docs.nestjs.com/modules).

Modulon belül elkülönülnek a technikai felelősségek:

- Controller: HTTP-bemenet és válasz, a service meghívása.
- DTO/pipe: a bemenet futásidejű ellenőrzése.
- Service: üzleti művelet és annak szabályai.
- Repository: a művelethez szükséges SQL és adatbázisgarancia.

A repository az üzleti művelethez igazodjon, például atomi foglaláshoz. A service nem végezheti külön, védelem nélkül a készlet ellenőrzését és csökkentését. A több entitást érintő tranzakcióhoz egy összehangolt tranzakciós határ szükséges; nem külön-külön commitoló repositoryhívások.

A Products, Inventory és Reservations modul a saját műveleteit birtokolja, és Nest exportokon át meghívható felületet ad. Más modul belső repositoryjához közvetlen hozzáférés helyett publikus műveletet hívunk. A mappák önmagukban nem kényszerítik ki ezt: importellenőrzés és review szükséges. Egy általános CRUD repository vagy minden service mellé készített interface nem cél; absztrakciót a valódi tesztelési vagy integrációs határ indokoljon.

## RTK Query és frontend állapot

Az `app/api.ts` a backendhez tartozó közös RTK Query API-alap; a feature fájlok `injectEndpoints` segítségével adják hozzá saját végpontjaikat. Így termék-, készlet- és foglalásváltozásnál ugyanazon API-n belül tudunk tag alapján invalidálni. Külön API slice másik backendhez lehet indokolt. [RTK Query createApi](https://redux-toolkit.js.org/rtk-query/api/createApi).

Termékadat és foglalás RTK Query cache-be kerül. A gépelés közbeni input lokális state; az alkalmazott keresési feltételek URL-állapotok. Redux slice közös kliensállapothoz kellhet, például összehasonlításra kijelölt termékazonosítókhoz. Nem kell automatikusan minden feature-höz slice.

A `shared/ui/` üzletfüggetlen elemeké, például Button és Input. ProductCard a products feature része. A shared/common mappákba csak több helyen ténylegesen használt kódot emelünk ki, üzleti döntést nem rejtünk el bennük.

Frontend és backend között API-szerződést osztunk meg, nem Nest service-t, ORM entityt vagy adatbáziskapcsolatot. Az elfogadott OpenAPI-elvhez javasolt appgyökér-bővítés:

```text
contracts/openapi.yaml                 # HTTP-szerződés, spec-first javaslat
packages/api-contracts/src/generated/  # Generált transporttípusok
scripts/                              # Spec-validáció és generálás
docs/architecture/adr/                 # Döntésrekordok
docs/architecture/*.md                 # Külön C4 nézetek és útmutató
```

A runtime schema-validáció bekötését és a generátorokat az első endpoint előtt ellenőrizzük; a TypeScript-típus önmagában nem runtime validáció. Domainportok az üzleti modulban maradnak; Nest DI-token és infrastruktúra-adapter a modulhoz közel él. A módszertani dokumentáció az `AEKI/docs/` mappában van; appscaffold még nem készült.

## Előnyök és hátrányok

| Döntés | Előny | Hátrány / kezelendő kockázat |
| --- | --- | --- |
| Monorepo | Egy commitban együtt változhat API és UI; közös tooling | Workspaces és több build konfigurációja; kerülni kell az alkalmazások belső kódjának keresztimportját |
| Moduláris monolit | Egyszerű helyi indítás, hiba követése és DB-tranzakció | Backendmodulok együtt települnek; külön skálázás és folyamatonkénti hibaszigetelés korlátozott |
| Feature alapú mappák | Egy funkció módosítása könnyebben követhető | Határokat kell választani; rossz importokkal körkörös függőség alakulhat ki |
| Controller/service/repository | Elkülönített HTTP-, üzleti és DB-felelősség | Egyszerű műveletnél is több fájl; túlzott absztrakció elrejtheti a lényeget |
| RTK Query | Egységes adatlekérés, cache és invalidálás | Query-argumentumokat, tag-eket és sessionváltást tudatosan kell kezelni |
| Unit teszt a kód mellett | A viselkedés dokumentációja közel van a funkcióhoz | Build/test fájlkizárást kell konfigurálni; DB-garanciát külön integrációs teszt bizonyít |

Kezdéshez npm workspaces elegendő a két app kezelésére. Nx/Turborepo akkor érdemes, ha a buildfolyamat és a csomagok száma már indokolja. Az npm workspaces több helyi package-et fog össze egy gyökérprojektben. [npm Workspaces](https://docs.npmjs.com/cli/using-npm/workspaces/).

## Mikor változtatnék rajta?

A B02-ben az értesítő `apps/notifications/` alá kerül külön NestJS-alkalmazásként. Saját futás, konfiguráció és tartós deduplikáció; brokerrel kap foglalási eseményt. Nem hívja/importálja az API belső service-eit, és nem módosítja a foglalás tábláit. Eseményszerződés közös csomagban megosztható.

Teljes microservice-felbontást akkor választanék, ha külön release-, skálázási, csapat- vagy hibaszigetelési igény bizonyítható. Interjúgyakorlatként az értesítő kiemelése elegendő az elosztott hibák, retry és deduplikáció megismeréséhez. Az első keresőhöz nincs szükség minden domain/application/infrastructure réteg vagy message bus előzetes bevezetésére.
