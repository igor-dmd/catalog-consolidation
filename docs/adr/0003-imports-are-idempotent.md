# Imports are idempotent

Running the same import file more than once must not create additional `Product` rows or duplicate `SellerProduct` links. This keeps the consolidation command safe to retry and makes the outcome easier to validate during the assessment.

**Consequences**

The implementation should protect catalog product identity by normalized `Name + Brand` and seller link identity by the seller plus the seller product reference. Database constraints are preferred where practical, with application checks used to keep behavior explicit and testable.

