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


CREATE OR REPLACE VIEW v_matriks AS
SELECT 
    req.id_recommendation_request,
    req.customers_id_customer,
    ps.products_id_product AS id_produk,
    p.model_name AS nama_laptop,
    
    -- C1: Harga (Diambil dari product_store)
    ps.price AS nilai_c1,
    MAX(CASE WHEN rw.criteria_id_criteria = 1 THEN rw.weight ELSE 0 END) AS bobot_c1,
    
    -- C2 sampai C8 (Diambil dari sub_criteria)
    MAX(CASE WHEN sc.criteria_id_criteria = 2 THEN sc.value_numeric ELSE 0 END) AS nilai_c2,
    MAX(CASE WHEN rw.criteria_id_criteria = 2 THEN rw.weight ELSE 0 END) AS bobot_c2,
    
    MAX(CASE WHEN sc.criteria_id_criteria = 3 THEN sc.value_numeric ELSE 0 END) AS nilai_c3,
    MAX(CASE WHEN rw.criteria_id_criteria = 3 THEN rw.weight ELSE 0 END) AS bobot_c3,
    
    MAX(CASE WHEN sc.criteria_id_criteria = 4 THEN sc.value_numeric ELSE 0 END) AS nilai_c4,
    MAX(CASE WHEN rw.criteria_id_criteria = 4 THEN rw.weight ELSE 0 END) AS bobot_c4,
    
    MAX(CASE WHEN sc.criteria_id_criteria = 5 THEN sc.value_numeric ELSE 0 END) AS nilai_c5,
    MAX(CASE WHEN rw.criteria_id_criteria = 5 THEN rw.weight ELSE 0 END) AS bobot_c5,
    
    MAX(CASE WHEN sc.criteria_id_criteria = 6 THEN sc.value_numeric ELSE 0 END) AS nilai_c6,
    MAX(CASE WHEN rw.criteria_id_criteria = 6 THEN rw.weight ELSE 0 END) AS bobot_c6,
    
    MAX(CASE WHEN sc.criteria_id_criteria = 7 THEN sc.value_numeric ELSE 0 END) AS nilai_c7,
    MAX(CASE WHEN rw.criteria_id_criteria = 7 THEN rw.weight ELSE 0 END) AS bobot_c7,
    
    MAX(CASE WHEN sc.criteria_id_criteria = 8 THEN sc.value_numeric ELSE 0 END) AS nilai_c8,
    MAX(CASE WHEN rw.criteria_id_criteria = 8 THEN rw.weight ELSE 0 END) AS bobot_c8

FROM recommendation_requests req
JOIN product_store ps ON ps.price BETWEEN req.budget_min AND req.budget_max
JOIN products p ON ps.products_id_product = p.id_product
JOIN product_criteria pc ON p.id_product = pc.products_id_product
JOIN sub_criteria sc ON pc.sub_criteria_id_sub_criteria = sc.id_sub_criteria
JOIN recommendation_weight rw ON req.id_recommendation_request = rw.recommendation_requests_id_recommendation_request
GROUP BY req.id_recommendation_request, req.customers_id_customer, ps.products_id_product, p.model_name, ps.price;


CREATE OR REPLACE VIEW v_wp AS
WITH VektorS AS (
    SELECT 
        id_recommendation_request, 
        id_produk, 
        nama_laptop,
        (
            POW(nilai_c1, -bobot_c1) *  -- COST
            POW(nilai_c2, bobot_c2) *   -- BENEFIT
            POW(nilai_c3, bobot_c3) *   -- BENEFIT
            POW(nilai_c4, bobot_c4) *   -- BENEFIT
            POW(nilai_c5, -bobot_c5) *  -- COST
            POW(nilai_c6, bobot_c6) *   -- BENEFIT
            POW(nilai_c7, bobot_c7) *   -- BENEFIT
            POW(nilai_c8, bobot_c8)     -- BENEFIT
        ) AS skor_s
    FROM v_matriks
)
SELECT 
    id_recommendation_request, 
    id_produk, 
    nama_laptop, 
    skor_s,
    (skor_s / SUM(skor_s) OVER(PARTITION BY id_recommendation_request)) AS skor_akhir_wp
FROM VektorS;


CREATE OR REPLACE VIEW v_topsis_pembagi AS
SELECT 
    id_recommendation_request,
    SQRT(SUM(POW(nilai_c1, 2))) AS bagi_c1,
    SQRT(SUM(POW(nilai_c2, 2))) AS bagi_c2,
    SQRT(SUM(POW(nilai_c3, 2))) AS bagi_c3,
    SQRT(SUM(POW(nilai_c4, 2))) AS bagi_c4,
    SQRT(SUM(POW(nilai_c5, 2))) AS bagi_c5,
    SQRT(SUM(POW(nilai_c6, 2))) AS bagi_c6,
    SQRT(SUM(POW(nilai_c7, 2))) AS bagi_c7,
    SQRT(SUM(POW(nilai_c8, 2))) AS bagi_c8
FROM v_matriks
GROUP BY id_recommendation_request;

CREATE OR REPLACE VIEW v_topsis_akhir AS
WITH MatriksTernormalisasi AS (
    SELECT 
        m.id_recommendation_request, m.id_produk, m.nama_laptop,
        (m.nilai_c1 / p.bagi_c1) * m.bobot_c1 AS y_c1,
        (m.nilai_c2 / p.bagi_c2) * m.bobot_c2 AS y_c2,
        (m.nilai_c3 / p.bagi_c3) * m.bobot_c3 AS y_c3,
        (m.nilai_c4 / p.bagi_c4) * m.bobot_c4 AS y_c4,
        (m.nilai_c5 / p.bagi_c5) * m.bobot_c5 AS y_c5,
        (m.nilai_c6 / p.bagi_c6) * m.bobot_c6 AS y_c6,
        (m.nilai_c7 / p.bagi_c7) * m.bobot_c7 AS y_c7,
        (m.nilai_c8 / p.bagi_c8) * m.bobot_c8 AS y_c8
    FROM v_matriks m
    JOIN v_topsis_pembagi p ON m.id_recommendation_request = p.id_recommendation_request
),
SolusiIdeal AS (
    SELECT 
        id_recommendation_request,
        -- C1 COST
        MIN(y_c1) AS a_pos_c1, MAX(y_c1) AS a_neg_c1, 
        -- C2 BENEFIT
        MAX(y_c2) AS a_pos_c2, MIN(y_c2) AS a_neg_c2, 
        -- C3 BENEFIT
        MAX(y_c3) AS a_pos_c3, MIN(y_c3) AS a_neg_c3, 
        -- C4 BENEFIT
        MAX(y_c4) AS a_pos_c4, MIN(y_c4) AS a_neg_c4, 
        -- C5 COST
        MIN(y_c5) AS a_pos_c5, MAX(y_c5) AS a_neg_c5, 
        -- C6 BENEFIT
        MAX(y_c6) AS a_pos_c6, MIN(y_c6) AS a_neg_c6, 
        -- C7 BENEFIT
        MAX(y_c7) AS a_pos_c7, MIN(y_c7) AS a_neg_c7, 
        -- C8 BENEFIT
        MAX(y_c8) AS a_pos_c8, MIN(y_c8) AS a_neg_c8  
    FROM MatriksTernormalisasi
    GROUP BY id_recommendation_request
),
JarakIdeal AS (
    SELECT 
        t.id_recommendation_request, t.id_produk, t.nama_laptop,
        SQRT(POW(t.y_c1 - i.a_pos_c1, 2) + POW(t.y_c2 - i.a_pos_c2, 2) + POW(t.y_c3 - i.a_pos_c3, 2) + POW(t.y_c4 - i.a_pos_c4, 2) + POW(t.y_c5 - i.a_pos_c5, 2) + POW(t.y_c6 - i.a_pos_c6, 2) + POW(t.y_c7 - i.a_pos_c7, 2) + POW(t.y_c8 - i.a_pos_c8, 2)) AS d_pos,
        SQRT(POW(t.y_c1 - i.a_neg_c1, 2) + POW(t.y_c2 - i.a_neg_c2, 2) + POW(t.y_c3 - i.a_neg_c3, 2) + POW(t.y_c4 - i.a_neg_c4, 2) + POW(t.y_c5 - i.a_neg_c5, 2) + POW(t.y_c6 - i.a_neg_c6, 2) + POW(t.y_c7 - i.a_neg_c7, 2) + POW(t.y_c8 - i.a_neg_c8, 2)) AS d_neg
    FROM MatriksTernormalisasi t
    JOIN SolusiIdeal i ON t.id_recommendation_request = i.id_recommendation_request
)
SELECT 
    id_recommendation_request, 
    id_produk, 
    nama_laptop,
    (d_neg / (d_pos + d_neg)) AS skor_akhir_topsis
FROM JarakIdeal;

CREATE OR REPLACE VIEW v_saw AS
SELECT 
    id_recommendation_request, 
    id_produk, 
    nama_laptop,
    
    -- PENJABARAN NORMALISASI (UBAH MIN/MAX JIKA TIPE BERBEDA)
    (MIN(nilai_c1) OVER(PARTITION BY id_recommendation_request) / nilai_c1) AS norm_c1, -- COST
    (nilai_c2 / MAX(nilai_c2) OVER(PARTITION BY id_recommendation_request)) AS norm_c2, -- BENEFIT
    (nilai_c3 / MAX(nilai_c3) OVER(PARTITION BY id_recommendation_request)) AS norm_c3, -- BENEFIT
    (nilai_c4 / MAX(nilai_c4) OVER(PARTITION BY id_recommendation_request)) AS norm_c4, -- BENEFIT
    (MIN(nilai_c5) OVER(PARTITION BY id_recommendation_request) / nilai_c5) AS norm_c5, -- COST
    (nilai_c6 / MAX(nilai_c6) OVER(PARTITION BY id_recommendation_request)) AS norm_c6, -- BENEFIT
    (nilai_c7 / MAX(nilai_c7) OVER(PARTITION BY id_recommendation_request)) AS norm_c7, -- BENEFIT
    (nilai_c8 / MAX(nilai_c8) OVER(PARTITION BY id_recommendation_request)) AS norm_c8, -- BENEFIT

    -- HASIL AKHIR VEKTOR V
    (
        ((MIN(nilai_c1) OVER(PARTITION BY id_recommendation_request) / nilai_c1) * bobot_c1) +
        ((nilai_c2 / MAX(nilai_c2) OVER(PARTITION BY id_recommendation_request)) * bobot_c2) +
        ((nilai_c3 / MAX(nilai_c3) OVER(PARTITION BY id_recommendation_request)) * bobot_c3) +
        ((nilai_c4 / MAX(nilai_c4) OVER(PARTITION BY id_recommendation_request)) * bobot_c4) +
        ((MIN(nilai_c5) OVER(PARTITION BY id_recommendation_request) / nilai_c5) * bobot_c5) +
        ((nilai_c6 / MAX(nilai_c6) OVER(PARTITION BY id_recommendation_request)) * bobot_c6) +
        ((nilai_c7 / MAX(nilai_c7) OVER(PARTITION BY id_recommendation_request)) * bobot_c7) +
        ((nilai_c8 / MAX(nilai_c8) OVER(PARTITION BY id_recommendation_request)) * bobot_c8)
    ) AS skor_akhir_saw
FROM v_matriks;