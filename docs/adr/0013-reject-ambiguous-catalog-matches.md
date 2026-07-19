# Reject ambiguous catalog matches

If a seller product entry matches more than one existing catalog product by normalized `Name + Brand`, the importer will reject that entry with an ambiguous catalog match reason. It will not create a seller product link when the canonical product cannot be chosen safely.

**Consequences**

The importer does not try to repair pre-existing catalog duplication as part of this exercise. Ambiguous catalog state is surfaced in the import report so an operator can resolve the catalog data before retrying.

