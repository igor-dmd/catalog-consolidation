# Explicit SQL migrations

Schema changes will live in explicit SQL migration files and the importer will apply them before consolidation. This makes the database changes reviewable and keeps the decision to adapt the supplied schema visible.

**Consequences**

The initial migration should minimally adapt `SellerProduct.SellerProductId` to store opaque text references and add uniqueness protection for seller links. The migration mechanism should stay simple because this is a take-home exercise, but the SQL artifacts should be clear enough to discuss during the interview.

