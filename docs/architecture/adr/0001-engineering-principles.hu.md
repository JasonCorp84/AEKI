# ADR-0001: Engineering alapelvek az AEKI Product Finderhez

- Státusz: Accepted – az alapelvekre vonatkozó döntés.
- Dátum: 2026-10-01.
- Döntéshozó: Csaba, kifejezett utasítás alapján.
- Canonical módszertani rekord: belső Linear-rekord.

## Kontextus

Az app az AEKI interjúfelkészülés gyakorlóprojektje. A kereséstől a készletfoglalásig összefüggő rendszerben szeretnénk saját kódolást, tesztelést, szerződéstervezést és architekturális gondolkodást gyakorolni. A mappaszerkezet és framework-választás önmagában nem biztosít helyes, fenntartható működést.

## Döntés

1. SOLID alapján tervezünk és review-zunk; indokolt határokon kis üzleti portok és infrastruktúra-adapterek vannak.
2. TDD-vel, egy viselkedésenként haladunk: egyeztetett publikus tesztelési határ → megfigyelt RED → minimális GREEN → külön review és szükséges refaktorálás.
3. A TypeScript-típusok explicit statikus szerződések. Külső adatoknál runtime validáció kell; üzleti invariánsokat tesztek és megfelelő adattárolási korlátok is védenek.
4. Minden HTTP endpoint OpenAPI-szerződést kap; implementációjának megfelelését ellenőrizzük.
5. Érdemi architekturális döntéshez ADR készül alternatívákkal és következményekkel.
6. Külön C4 Context és Container diagram tartja láthatóvá a rendszer kontextusát; szükség szerint további nézetek készülnek.

Ez a döntés nem fogadja el automatikusan a korábbi teljes mappastruktúrát vagy egy konkrét OpenAPI-generátort. A spec-first munkamenet és annak toolingja az [alkalmazási útmutatóban](../engineering-principles.hu.md) leírt javaslat, az első szelet során ellenőrzendő.

## Alternatívák

- Ad hoc implementáció utólag írt tesztekkel és dokumentációval: kisebb indulási ráfordítás, de nem szolgálja a kívánt TDD- és szerződésgyakorlást.
- Minden részhez előre teljes absztrakciós réteg és diagram: sok kezdeti adminisztráció és hipotetikus bővítési pont, kevés működési bizonyíték.

## Következmények

Pozitív: viselkedéshez kötött tesztek; nyilvánvalóbb felelősségek; ellenőrizhető API; visszakereshető döntések és kompromisszumok; interjún elmagyarázható rendszer.

Negatív: spec, generálás, validáció, teszt és dokumentáció összehangolásának költsége. Rosszul választott portok és implementációhoz kötött tesztek lassíthatják a változtatást. Az elvek alkalmazását review ellenőrzi, nem a fájlok puszta jelenléte.

## Ellenőrzés és review trigger

Megfigyelt RED/GREEN; strict típusellenőrzés; runtime adatvalidáció; HTTP request/response szerződésellenőrzés; SOLID review; a változáshoz releváns ADR és aktuális C4 nézet.

Felülvizsgálat: új szolgáltatáshatár, breaking API change, szerződés és runtime eltérése, refaktorálást akadályozó teszt vagy bizonyíthatóan hátrányos absztrakció. Későbbi változtatás új ADR-rel leválthatja ezt a döntést.
