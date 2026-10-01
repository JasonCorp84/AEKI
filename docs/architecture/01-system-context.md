# AEKI Product Finder – C4 System Context

The three user roles appear in the top row, with the system below them. Arrows represent usage relationships. The demo currently has no external system integrations.

```mermaid
C4Context
    title AEKI Product Finder – System Context

    Person(visitor, "Visitor", "Browses without signing in.")
    Person(customer, "Customer", "Manages their own reservations.")
    Person(employee, "Store Employee", "Manages stock.")

    System(finder, "AEKI Product Finder", "Product search, stock availability and reservations.")

    Rel(visitor, finder, "Browses")
    Rel(customer, finder, "Searches and reserves")
    Rel(employee, finder, "Updates stock")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

This is C4 level 1. The [Container diagram](02-containers.md) describes the system's internal applications and data store.

[Requirements](../planning/AEKI-product-search-app-requirements.hu.md) · [Mermaid C4 syntax](https://mermaid.js.org/syntax/c4.html).
