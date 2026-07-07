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
    `phone` VARCHAR(12) NOT NULL,
    `is_active` TINYINT NOT NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
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
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
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
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id_product` INTEGER NOT NULL AUTO_INCREMENT,
    `brands_id_brand` INTEGER NOT NULL,
    `model_name` VARCHAR(200) NOT NULL,
    `screen_size` DECIMAL(3, 2) NOT NULL,
    `processor` VARCHAR(100) NOT NULL,
    `ram` VARCHAR(20) NOT NULL,
    `storage` VARCHAR(10) NOT NULL,
    `battery` VARCHAR(10) NOT NULL,
    `weight` DECIMAL(4, 2) NOT NULL,
    `release_year` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

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

    PRIMARY KEY (`id_sub_criteria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_criteria` (
    `id_product_criteria` INTEGER NOT NULL AUTO_INCREMENT,
    `products_id_product` INTEGER NOT NULL,
    `sub_criteria_id_sub_criteria` INTEGER NOT NULL,

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

    PRIMARY KEY (`id_recommendation_request`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recommendation_weight` (
    `id_recommendation_weight` INTEGER NOT NULL AUTO_INCREMENT,
    `recommendation_requests_id_recommendation_request` INTEGER NOT NULL,
    `sub_criteria_id_sub_criteria` INTEGER NOT NULL,
    `weight` DECIMAL(5, 4) NOT NULL,

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
ALTER TABLE `recommendation_weight` ADD CONSTRAINT `recommendation_weight_recommendation_requests_id_recommenda_fkey` FOREIGN KEY (`recommendation_requests_id_recommendation_request`) REFERENCES `recommendation_requests`(`id_recommendation_request`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recommendation_weight` ADD CONSTRAINT `recommendation_weight_sub_criteria_id_sub_criteria_fkey` FOREIGN KEY (`sub_criteria_id_sub_criteria`) REFERENCES `sub_criteria`(`id_sub_criteria`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recommendation_result` ADD CONSTRAINT `recommendation_result_recommendation_requests_id_recommenda_fkey` FOREIGN KEY (`recommendation_requests_id_recommendation_request`) REFERENCES `recommendation_requests`(`id_recommendation_request`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recommendation_result` ADD CONSTRAINT `recommendation_result_product_store_id_product_store_fkey` FOREIGN KEY (`product_store_id_product_store`) REFERENCES `product_store`(`id_product_store`) ON DELETE RESTRICT ON UPDATE CASCADE;
