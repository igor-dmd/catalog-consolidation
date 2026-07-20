PRAGMA foreign_keys = OFF;

CREATE TABLE SellerProducts_text_reference_migration (
  Id INTEGER PRIMARY KEY,
  ProductId INTEGER NOT NULL,
  SellerName TEXT NOT NULL,
  SellerProductId TEXT NOT NULL,
  FOREIGN KEY (ProductId) REFERENCES Products (Id)
);

INSERT INTO SellerProducts_text_reference_migration (
  Id,
  ProductId,
  SellerName,
  SellerProductId
)
SELECT
  Id,
  ProductId,
  SellerName,
  CAST(SellerProductId AS TEXT)
FROM SellerProducts;

DROP TABLE SellerProducts;

ALTER TABLE SellerProducts_text_reference_migration
RENAME TO SellerProducts;

PRAGMA foreign_keys = ON;
