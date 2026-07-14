-- CreateTable
CREATE TABLE `brands` (
    `id_brand` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(20) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `brands_name_key`(`name`),
    PRIMARY KEY (`id_brand`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stores` (
    `id_store` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `address` VARCHAR(250) NOT NULL,
    `city` VARCHAR(50) NOT NULL,
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `phone` VARCHAR(12) NOT NULL,
    `is_active` TINYINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `stores_phone_key`(`phone`),
    PRIMARY KEY (`id_store`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `id_customer` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `latitude` DECIMAL(10, 7) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `customers_email_key`(`email`),
    PRIMARY KEY (`id_customer`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id_user` INTEGER NOT NULL AUTO_INCREMENT,
    `stores_id_store` INTEGER NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(10) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_stores_id_store_fkey`(`stores_id_store`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id_product` INTEGER NOT NULL AUTO_INCREMENT,
    `brands_id_brand` INTEGER NOT NULL,
    `model_name` VARCHAR(200) NOT NULL,
    `screen_size` DECIMAL(4, 1) NULL,
    `processor` VARCHAR(100) NOT NULL,
    `ram` VARCHAR(20) NOT NULL,
    `storage` VARCHAR(10) NOT NULL,
    `battery` VARCHAR(50) NULL,
    `weight` VARCHAR(6) NOT NULL,
    `release_year` VARCHAR(4) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `products_brands_id_brand_fkey`(`brands_id_brand`),
    PRIMARY KEY (`id_product`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_store` (
    `id_product_store` INTEGER NOT NULL AUTO_INCREMENT,
    `products_id_product` INTEGER NOT NULL,
    `stores_id_store` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,
    `stock` INTEGER NOT NULL,
    `is_available` TINYINT NOT NULL,
    `update_at` DATETIME(3) NOT NULL,

    INDEX `product_store_products_id_product_fkey`(`products_id_product`),
    INDEX `product_store_stores_id_store_fkey`(`stores_id_store`),
    INDEX `product_store_price_idx`(`price`),
    INDEX `product_store_products_id_product_stores_id_store_idx`(`products_id_product`, `stores_id_store`),
    PRIMARY KEY (`id_product_store`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `criteria` (
    `id_criteria` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(2) NOT NULL,
    `name` VARCHAR(20) NOT NULL,
    `type` VARCHAR(10) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_criteria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sub_criteria` (
    `id_sub_criteria` INTEGER NOT NULL AUTO_INCREMENT,
    `criteria_id_criteria` INTEGER NOT NULL,
    `description` VARCHAR(100) NOT NULL,
    `value_numeric` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sub_criteria_criteria_id_criteria_fkey`(`criteria_id_criteria`),
    INDEX `sub_criteria_value_numeric_idx`(`value_numeric`),
    PRIMARY KEY (`id_sub_criteria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_criteria` (
    `id_product_criteria` INTEGER NOT NULL AUTO_INCREMENT,
    `products_id_product` INTEGER NOT NULL,
    `sub_criteria_id_sub_criteria` INTEGER NOT NULL,

    INDEX `product_criteria_products_id_product_fkey`(`products_id_product`),
    INDEX `product_criteria_sub_criteria_id_sub_criteria_fkey`(`sub_criteria_id_sub_criteria`),
    PRIMARY KEY (`id_product_criteria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recommendation_requests` (
    `id_recommendation_request` INTEGER NOT NULL AUTO_INCREMENT,
    `customers_id_customer` INTEGER NOT NULL,
    `kebutuhan` VARCHAR(100) NOT NULL,
    `budget_min` INTEGER NOT NULL,
    `budget_max` INTEGER NOT NULL,
    `status` VARCHAR(9) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_lat` DECIMAL(10, 8) NULL,
    `user_lng` DECIMAL(11, 8) NULL,

    INDEX `recommendation_requests_customers_id_customer_fkey`(`customers_id_customer`),
    PRIMARY KEY (`id_recommendation_request`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recommendation_weight` (
    `id_recommendation_weight` INTEGER NOT NULL AUTO_INCREMENT,
    `recommendation_requests_id_recommendation_request` INTEGER NOT NULL,
    `criteria_id_criteria` INTEGER NOT NULL,
    `weight` DECIMAL(5, 4) NOT NULL,

    INDEX `recommendation_weight_recommendation_requests_id_recommenda_fkey`(`recommendation_requests_id_recommendation_request`),
    INDEX `recommendation_weight_sub_criteria_id_sub_criteria_fkey`(`criteria_id_criteria`),
    PRIMARY KEY (`id_recommendation_weight`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recommendation_result` (
    `id_recommendation_result` INTEGER NOT NULL AUTO_INCREMENT,
    `recommendation_requests_id_recommendation_request` INTEGER NOT NULL,
    `product_store_id_product_store` INTEGER NOT NULL,
    `method_used` VARCHAR(6) NOT NULL,
    `score` DECIMAL(10, 6) NOT NULL,
    `ranking` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `recommendation_result_product_store_id_product_store_fkey`(`product_store_id_product_store`),
    INDEX `recommendation_result_recommendation_requests_id_recommenda_fkey`(`recommendation_requests_id_recommendation_request`),
    PRIMARY KEY (`id_recommendation_result`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_stores_id_store_fkey` FOREIGN KEY (`stores_id_store`) REFERENCES `stores`(`id_store`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_brands_id_brand_fkey` FOREIGN KEY (`brands_id_brand`) REFERENCES `brands`(`id_brand`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_store` ADD CONSTRAINT `product_store_products_id_product_fkey` FOREIGN KEY (`products_id_product`) REFERENCES `products`(`id_product`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_store` ADD CONSTRAINT `product_store_stores_id_store_fkey` FOREIGN KEY (`stores_id_store`) REFERENCES `stores`(`id_store`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sub_criteria` ADD CONSTRAINT `sub_criteria_criteria_id_criteria_fkey` FOREIGN KEY (`criteria_id_criteria`) REFERENCES `criteria`(`id_criteria`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_criteria` ADD CONSTRAINT `product_criteria_products_id_product_fkey` FOREIGN KEY (`products_id_product`) REFERENCES `products`(`id_product`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_criteria` ADD CONSTRAINT `product_criteria_sub_criteria_id_sub_criteria_fkey` FOREIGN KEY (`sub_criteria_id_sub_criteria`) REFERENCES `sub_criteria`(`id_sub_criteria`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recommendation_requests` ADD CONSTRAINT `recommendation_requests_customers_id_customer_fkey` FOREIGN KEY (`customers_id_customer`) REFERENCES `customers`(`id_customer`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recommendation_weight` ADD CONSTRAINT `recommendation_weight_criteria_id_criteria_fkey` FOREIGN KEY (`criteria_id_criteria`) REFERENCES `criteria`(`id_criteria`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recommendation_weight` ADD CONSTRAINT `recommendation_weight_recommendation_requests_id_recommenda_fkey` FOREIGN KEY (`recommendation_requests_id_recommendation_request`) REFERENCES `recommendation_requests`(`id_recommendation_request`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recommendation_result` ADD CONSTRAINT `recommendation_result_product_store_id_product_store_fkey` FOREIGN KEY (`product_store_id_product_store`) REFERENCES `product_store`(`id_product_store`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recommendation_result` ADD CONSTRAINT `recommendation_result_recommendation_requests_id_recommenda_fkey` FOREIGN KEY (`recommendation_requests_id_recommendation_request`) REFERENCES `recommendation_requests`(`id_recommendation_request`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 1. VIEW DECISION MATRIX (Menggabungkan Harga C1 dan Kriteria C2-C8)
CREATE OR REPLACE VIEW v_decision_matrix AS
-- Bagian 1: Kriteria C1 (Harga) diambil langsung dari product_store
SELECT 
    ps.products_id_product AS product_id,
    ps.stores_id_store AS store_id,
    1 AS criteria_id,
    'C1' AS criteria_code,
    'cost' AS criteria_type,
    ps.price AS raw_value,
    ps.price AS price
FROM product_store ps
UNION ALL
-- Bagian 2: Kriteria C2-C8 diambil dari product_criteria dan sub_criteria
SELECT 
    ps.products_id_product AS product_id,
    ps.stores_id_store AS store_id,
    c.id_criteria AS criteria_id,
    c.code AS criteria_code,
    c.type AS criteria_type,
    sc.value_numeric AS raw_value,
    ps.price AS price
FROM product_store ps
JOIN product_criteria pc ON ps.products_id_product = pc.products_id_product
JOIN sub_criteria sc ON pc.sub_criteria_id_sub_criteria = sc.id_sub_criteria
JOIN criteria c ON sc.criteria_id_criteria = c.id_criteria;


-- 2. VIEW CRITERIA MINMAX (Untuk mencari nilai Max/Min SAW)
CREATE OR REPLACE VIEW v_criteria_minmax AS
SELECT 
    criteria_id,
    criteria_type,
    MAX(raw_value) AS max_value,
    MIN(raw_value) AS min_value
FROM v_decision_matrix
GROUP BY criteria_id, criteria_type;


-- 3. VIEW SAW NORMALIZED MATRIX (Normalisasi Benefit & Cost SAW)
CREATE OR REPLACE VIEW v_saw_normalized_matrix AS
SELECT 
    dm.product_id,
    dm.store_id,
    dm.criteria_id,
    dm.criteria_code,
    dm.criteria_type,
    dm.raw_value,
    dm.price,
    CASE 
        WHEN dm.criteria_type = 'benefit' THEN (dm.raw_value / mm.max_value)
        WHEN dm.criteria_type = 'cost' THEN (mm.min_value / dm.raw_value)
        ELSE 0 
    END AS normalized_value
FROM v_decision_matrix dm
JOIN v_criteria_minmax mm ON dm.criteria_id = mm.criteria_id;


-- 4. VIEW TOPSIS PEMBAGI (Mencari nilai akar kuadrat untuk pembagi TOPSIS)
CREATE OR REPLACE VIEW v_topsis_pembagi AS
SELECT 
    criteria_id,
    SQRT(SUM(POW(raw_value, 2))) AS pembagi
FROM v_decision_matrix
GROUP BY criteria_id;


-- 5. VIEW TOPSIS NORMALISASI (Membagi raw value dengan pembagi TOPSIS)
CREATE OR REPLACE VIEW v_topsis_normalisasi AS
SELECT 
    dm.product_id,
    dm.store_id,
    dm.criteria_id,
    dm.criteria_code,
    dm.criteria_type,
    dm.raw_value,
    dm.price,
    (dm.raw_value / tp.pembagi) AS normalized_value
FROM v_decision_matrix dm
JOIN v_topsis_pembagi tp ON dm.criteria_id = tp.criteria_id;