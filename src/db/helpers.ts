import type Database from "better-sqlite3";

export function createLegacyAssessmentSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE Products (
      Id INTEGER PRIMARY KEY,
      Name TEXT NOT NULL,
      Brand TEXT,
      Category TEXT
    );

    CREATE TABLE SellerProducts (
      Id INTEGER PRIMARY KEY,
      ProductId INTEGER NOT NULL,
      SellerName TEXT NOT NULL,
      SellerProductId INTEGER NOT NULL,
      FOREIGN KEY (ProductId) REFERENCES Products (Id)
    );
  `);
}

export function createMigratedAssessmentSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE Products (
      Id INTEGER PRIMARY KEY,
      Name TEXT NOT NULL,
      Brand TEXT,
      Category TEXT
    );

    CREATE TABLE SellerProducts (
      Id INTEGER PRIMARY KEY,
      ProductId INTEGER NOT NULL,
      SellerName TEXT NOT NULL,
      SellerProductId TEXT NOT NULL,
      FOREIGN KEY (ProductId) REFERENCES Products (Id)
    );

    CREATE UNIQUE INDEX SellerProducts_seller_reference_unique
    ON SellerProducts (SellerName, SellerProductId);
  `);
}
