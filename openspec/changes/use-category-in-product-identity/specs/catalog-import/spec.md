## MODIFIED Requirements

### Requirement: Product identity normalization
The system SHALL normalize catalog product identity using cleaned `Name + Brand + Category`.

#### Scenario: Matching by normalized name, brand, and category
- **WHEN** a seller product entry has a name, brand, and category that match an existing catalog product after trimming, whitespace collapse, and case-insensitive comparison
- **THEN** the system links the seller product entry to the existing catalog product instead of inserting a new catalog product

#### Scenario: Brandless product identity
- **WHEN** a seller product entry has a missing or `null` brand
- **THEN** the system treats the normalized brand as an empty identity component and does not match a branded catalog product by name and category alone

#### Scenario: Categoryless product identity
- **WHEN** a seller product entry has a missing or `null` category
- **THEN** the system treats the normalized category as an empty identity component and does not match a categorized catalog product by name and brand alone

#### Scenario: Category distinguishes catalog products
- **WHEN** a valid seller product entry has a name and brand that match an existing catalog product but its category does not match after normalization
- **THEN** the system inserts a new catalog product using cleaned source values without case normalization, translation, or synonym rewriting

#### Scenario: New catalog product insertion
- **WHEN** a valid seller product entry does not match any existing catalog product by normalized name, brand, and category
- **THEN** the system inserts a new catalog product using cleaned source values without case normalization, translation, or synonym rewriting

#### Scenario: Ambiguous catalog match
- **WHEN** a seller product entry matches multiple existing catalog products by normalized name, brand, and category
- **THEN** the system rejects the entry as ambiguous, does not create a seller product link for it, and continues importing other valid entries
