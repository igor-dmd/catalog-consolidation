# Do not commit confidential assessment assets

The public submission repository will not include the supplied assessment PDFs, original SQLite database, or original import file. The solution will accept external `--db` and `--input` paths, while repository tests and examples use small synthetic fixtures that mirror the schema and edge cases needed to explain the behavior.

**Consequences**

This respects the guideline document's confidentiality notice and keeps the public repository reviewable without redistributing proprietary assessment material. The README should explain how to run the importer with local assessment files without naming them as committed assets.

