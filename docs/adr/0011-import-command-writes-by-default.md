# Import command writes by default

The `import` command will commit accepted entries by default and print a structured JSON result that includes `productsInserted`, `productsMatched`, `sellerLinksCreated`, `sellerLinksSkipped`, and `entriesRejected`. A dry-run mode is useful for production operations, but it is deferred because the assessment's required behavior is to save consolidated products to the catalog database.

**Consequences**

The implementation may internally compute an import plan before writing so a future dry-run option can reuse the same behavior. The public CLI should remain non-interactive and predictable: running `import` performs the import, while reporting makes the outcome auditable.

