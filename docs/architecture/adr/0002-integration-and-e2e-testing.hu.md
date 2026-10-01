# ADR-0002: Együttműködés és teljes folyamat tesztelése

- Státusz: Accepted.
- Dátum: 2026-10-01.
- Döntéshozó: Csaba, kifejezett „vegyük fel alapelvbe” utasítása alapján.
- Kiegészíti: [ADR-0001](0001-engineering-principles.hu.md); nem váltja le.
- Canonical módszertani rekord: belső Linear-rekord.

## Kontextus

Az elkülönített egységek helyes működéséből nem következik automatikusan, hogy megfelelően vannak összekapcsolva. Az adatlekérés, cache-frissítés, tranzakció, eseményküldés és UI-frissítés sorrendje és időzítése önálló hibaforrás. A Memory Game tapasztalata alapján ezt kifejezett engineering alapelvvé tesszük.

## Döntés

Unit tesztek mellett integrációs tesztek igazolják az összekapcsolt részek együttműködését. A kritikus felhasználói folyamatokhoz valódi böngésző–backend–tesztadatbázis E2E ellenőrzés tartozik.

Az üzletileg szükséges sorrendet és időzítést, adatmegőrzést és mellékhatásokat ellenőrizzük. Belső metódushívási sorrendet csak akkor rögzítünk, ha az maga is a publikus szerződés része. A megfigyelhető működés a mérce, nem egy kiválasztott implementáció lépéseinek lemásolása.

TDD unit, integrációs és E2E szinten is alkalmazható. A határokat tesztírás előtt egyeztetjük; ugyanazt az esetet nem kell minden szinten duplikálni. Zöld unit tesztek és magas coverage önmagukban nem bizonyítják a rendszerhelyességet.

## Alternatívák

- Csak unit tesztek: gyorsak és célzottak, de nem ellenőrzik a valódi összekapcsolást.
- Minden eset kizárólag E2E: szélesebb hatókör, de lassabb visszajelzés és nehezebb hibaizolálás.
- Minden belső hívás sorrendjének mock alapú rögzítése: pontos az adott implementációra, de törékeny refaktoráláskor, és nem bizonyítja a valódi adapterek együttműködését.

## Következmények

Pozitív: lefedett cache-/UI-frissítés, tranzakciós és időzítési hibák; ellenőrizhető kritikus folyamatok; a tesztek hatóköre világos.

Negatív: integrációs környezet, tesztadatok és kontrollált idő/hálózat szükséges. E2E tesztek futásideje nagyobb; stabilitásukat izolált adatokkal és determinisztikus várakozással kell biztosítani.

## Ellenőrzés és review trigger

AEKI-példák: sikeres foglalás után friss készlet jelenik meg; régi keresési válasz nem lesz aktuális; sikertelen tranzakció után nincs sikeres esemény; versengő foglalásokból csak az elérhető mennyiség teljesül.

Review trigger: új együttműködési határ, cache-/időzítés-/perzisztenciahiba, zöld unit tesztek mellett hibás teljes folyamat, túlzott mocking vagy instabil E2E tesztek.

Alkalmazás: [engineering útmutató](../engineering-principles.hu.md). Ez a rekord követelményt rögzít, nem elvégzett tesztfuttatást.
