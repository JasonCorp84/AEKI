# AEKI Product Finder – C4 System Context

A három szereplő felül, az általuk használt rendszer alattuk helyezkedik el. A nyilak használati kapcsolatokat jelölnek. A demóhoz jelenleg nincs külső rendszerintegráció.

```mermaid
C4Context
    title AEKI Product Finder – System Context

    Person(visitor, "Látogató", "Bejelentkezés nélkül böngészik.")
    Person(customer, "Vásárló", "Saját foglalásait kezeli.")
    Person(employee, "Áruházi munkatárs", "A készletet kezeli.")

    System(finder, "AEKI Product Finder", "Termékkeresés, készletjelzés és foglalás.")

    Rel(visitor, finder, "Böngészik")
    Rel(customer, finder, "Keres és foglal")
    Rel(employee, finder, "Készletet módosít")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

Ez a C4 első szintje: a rendszer belső felépítését a [Container diagram](02-containers.hu.md) mutatja. Követelmények: [appterv](../planning/AEKI-product-search-app-requirements.hu.md). Szintaxis: [Mermaid C4](https://mermaid.js.org/syntax/c4.html).
