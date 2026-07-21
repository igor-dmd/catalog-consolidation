PRAGMA foreign_keys = OFF;

CREATE TABLE SellerProduct_text_reference_migration (
  Id INTEGER PRIMARY KEY,
  ProductId INTEGER NOT NULL,
  SellerName TEXT NOT NULL,
  SellerProductId TEXT NOT NULL,
  FOREIGN KEY (ProductId) REFERENCES Product (Id)
);

INSERT INTO SellerProduct_text_reference_migration (
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
FROM SellerProduct;

DROP TABLE SellerProduct;

ALTER TABLE SellerProduct_text_reference_migration
RENAME TO SellerProduct;

PRAGMA foreign_keys = ON;
