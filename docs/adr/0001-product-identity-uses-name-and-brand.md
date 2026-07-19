# Product identity uses name and brand

We define duplicate products by normalized `Name` and `Brand`, while treating `Category` as descriptive metadata rather than identity. The supplied input contains the same `Camera Canon EOS R6` product under both `Photography` and `Photo`, which makes category look seller-provided and noisy; using it for identity would create an avoidable duplicate catalog product.

