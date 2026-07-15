# Laptop Recommendation Aggregator Backend API Documentation

Welcome to the API reference guide for the Laptop Recommendation Aggregator Backend. This system uses JWT-based authentication and Role-Based Access Control (RBAC).

---

## 1. Shared / Staff Authentication

Endpoints for staff users (Superadmin and Store Admin).

### POST `/api/shared/auth/login`
- **Description:** Login endpoint for system staff (Superadmin and Store Admin).
- **Authorization:** None.
- **Request Payload:**
  - **Type:** JSON (Body)
  ```json
  {
    "email": "admin@store.com",
    "password": "securepassword123"
  }
  ```
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "data": {
      "user": {
        "id": 1,
        "storeId": 2,
        "name": "Alex Admin",
        "email": "admin@store.com",
        "role": "admin",
        "createdAt": "2026-07-07T02:00:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request` if email or password is missing.
  - `401 Unauthorized` if invalid email or password is provided.

---

## 2. Superadmin API Endpoints

These endpoints are strictly restricted to staff with the **superadmin** role. 
All requests require the header: `Authorization: Bearer <superadmin_jwt_token>`.

### GET `/api/superadmin/brands`
- **Description:** Retrieves all brands registered in the system.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:** None (Query/Params/Body)
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "ASUS",
        "createdAt": "2026-07-07T02:00:00.000Z"
      }
    ]
  }
  ```
- **Error Responses:**
  - `401 Unauthorized` / `403 Forbidden` if unauthorized.

### GET `/api/superadmin/brands/:id`
- **Description:** Retrieves a specific brand by its ID.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:** `id` (Path parameter, integer)
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "ASUS",
      "createdAt": "2026-07-07T02:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `404 Not Found` if the brand does not exist.

### POST `/api/superadmin/brands`
- **Description:** Registers a new laptop brand. Name must be unique and ≤ 20 characters.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:**
  - **Type:** JSON (Body)
  ```json
  {
    "name": "ASUS"
  }
  ```
- **Success Response:**
  - **Status:** 201 Created
  ```json
  {
    "success": true,
    "message": "Brand created successfully.",
    "data": {
      "id": 1,
      "name": "ASUS",
      "createdAt": "2026-07-07T02:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request` if the name already exists or is missing.

### PUT `/api/superadmin/brands/:id`
- **Description:** Updates the name of an existing brand.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:** `id` (Path parameter, integer), and JSON body:
  ```json
  {
    "name": "ASUS ROG"
  }
  ```
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "message": "Brand updated successfully.",
    "data": {
      "id": 1,
      "name": "ASUS ROG",
      "createdAt": "2026-07-07T02:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `404 Not Found` if brand not found.

### DELETE `/api/superadmin/brands/:id`
- **Description:** Deletes an existing brand.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:** `id` (Path parameter, integer)
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "message": "Brand deleted successfully."
  }
  ```

---

### GET `/api/superadmin/stores`
- **Description:** Retrieves all retail stores registered in the system.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:** None
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "Laptop Zone",
        "address": "123 Tech Street",
        "city": "Jakarta",
        "phone": "081234567890",
        "isActive": 1,
        "createdAt": "2026-07-07T02:00:00.000Z"
      }
    ]
  }
  ```

### GET `/api/superadmin/stores/:id`
- **Description:** Retrieves a store by its ID.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:** `id` (Path parameter, integer)
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "Laptop Zone",
      "address": "123 Tech Street",
      "city": "Jakarta",
      "phone": "081234567890",
      "isActive": 1,
      "createdAt": "2026-07-07T02:00:00.000Z"
    }
  }
  ```

### POST `/api/superadmin/stores`
- **Description:** Adds a new retail store. Phone number must be unique and ≤ 12 characters.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:**
  - **Type:** JSON (Body)
  ```json
  {
    "name": "Laptop Zone",
    "address": "123 Tech Street",
    "city": "Jakarta",
    "phone": "081234567890",
    "isActive": 1,
    "latitude": -6.1754,
    "longitude": 106.8272
  }
  ```
- **Success Response:**
  - **Status:** 201 Created
  ```json
  {
    "success": true,
    "message": "Store created successfully.",
    "data": {
      "id": 1,
      "name": "Laptop Zone",
      "address": "123 Tech Street",
      "city": "Jakarta",
      "phone": "081234567890",
      "isActive": 1,
      "createdAt": "2026-07-07T02:00:00.000Z"
    }
  }
  ```

### PUT `/api/superadmin/stores/:id`
- **Description:** Updates store information.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:** `id` (Path parameter, integer), and JSON body:
  ```json
  {
    "name": "Laptop Zone Pro",
    "address": "123 Tech Street Suite A",
    "city": "Jakarta",
    "phone": "081234567891",
    "isActive": 1,
    "latitude": -6.1755,
    "longitude": 106.8273
  }
  ```
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "message": "Store updated successfully.",
    "data": {
      "id": 1,
      "name": "Laptop Zone Pro",
      "address": "123 Tech Street Suite A",
      "city": "Jakarta",
      "phone": "081234567891",
      "isActive": 1,
      "createdAt": "2026-07-07T02:00:00.000Z"
    }
  }
  ```

### DELETE `/api/superadmin/stores/:id`
- **Description:** Deletes an existing store.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:** `id` (Path parameter)
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "message": "Store deleted successfully."
  }
  ```

---

### GET `/api/superadmin/users`
- **Description:** Retrieves all staff users. Includes store associations.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:** None
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 2,
        "storeId": 1,
        "name": "Staff Budi",
        "email": "budi@store.com",
        "role": "admin",
        "createdAt": "2026-07-07T02:00:00.000Z",
        "store": {
          "id": 1,
          "name": "Laptop Zone"
        }
      }
    ]
  }
  ```

### GET `/api/superadmin/users/:id`
- **Description:** Retrieves a staff user details by ID.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:** `id` (Path parameter)
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "data": {
      "id": 2,
      "storeId": 1,
      "name": "Staff Budi",
      "email": "budi@store.com",
      "role": "admin",
      "createdAt": "2026-07-07T02:00:00.000Z",
      "store": {
        "id": 1,
        "name": "Laptop Zone"
      }
    }
  }
  ```

### POST `/api/superadmin/users`
- **Description:** Creates a new staff user (e.g. assigning a Store Admin to a store). Hashes the password using bcrypt.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:**
  - **Type:** JSON (Body)
  ```json
  {
    "storeId": 1,
    "name": "Staff Budi",
    "email": "budi@store.com",
    "password": "storepassword123",
    "role": "admin"
  }
  ```
- **Success Response:**
  - **Status:** 201 Created
  ```json
  {
    "success": true,
    "message": "User created successfully.",
    "data": {
      "id": 2,
      "storeId": 1,
      "name": "Staff Budi",
      "email": "budi@store.com",
      "role": "admin",
      "createdAt": "2026-07-07T02:05:00.000Z"
    }
  }
  ```

### PUT `/api/superadmin/users/:id`
- **Description:** Updates user details. Re-hashes password if provided.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:** `id` (Path parameter), and JSON body:
  ```json
  {
    "name": "Staff Budi Updated",
    "password": "newpassword456"
  }
  ```
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "message": "User updated successfully.",
    "data": {
      "id": 2,
      "storeId": 1,
      "name": "Staff Budi Updated",
      "email": "budi@store.com",
      "role": "admin",
      "createdAt": "2026-07-07T02:05:00.000Z"
    }
  }
  ```

### DELETE `/api/superadmin/users/:id`
- **Description:** Deletes a user account.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:** `id` (Path parameter)
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "message": "User deleted successfully."
  }
  ```

---

### GET `/api/superadmin/criteria`
- **Description:** Retrieves all SPK evaluation criteria with their respective sub-criteria.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:** None
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "code": "C1",
        "name": "RAM",
        "type": "benefit",
        "createdAt": "2026-07-07T02:00:00.000Z",
        "subCriteria": [
          {
            "id": 1,
            "criteriaId": 1,
            "description": "16 GB",
            "valueNumeric": 5
          }
        ]
      }
    ]
  }
  ```

### GET `/api/superadmin/criteria/:id`
- **Description:** Retrieves details for a specific criteria ID.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:** `id` (Path parameter)
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "code": "C1",
      "name": "RAM",
      "type": "benefit",
      "subCriteria": []
    }
  }
  ```

### POST `/api/superadmin/criteria`
- **Description:** Registers a new evaluation criteria. Code must be unique (e.g. C1). Type must be `benefit` or `cost`.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:**
  - **Type:** JSON (Body)
  ```json
  {
    "code": "C1",
    "name": "RAM",
    "type": "benefit"
  }
  ```
- **Success Response:**
  - **Status:** 201 Created
  ```json
  {
    "success": true,
    "message": "Criteria created successfully.",
    "data": {
      "id": 1,
      "code": "C1",
      "name": "RAM",
      "type": "benefit",
      "createdAt": "2026-07-07T02:10:00.000Z"
    }
  }
  ```

### PUT `/api/superadmin/criteria/:id`
- **Description:** Updates criteria properties.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:** `id` (Path parameter), JSON body:
  ```json
  {
    "name": "RAM Memory",
    "type": "benefit"
  }
  ```
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "message": "Criteria updated successfully.",
    "data": {
      "id": 1,
      "code": "C1",
      "name": "RAM Memory",
      "type": "benefit",
      "createdAt": "2026-07-07T02:10:00.000Z"
    }
  }
  ```

### DELETE `/api/superadmin/criteria/:id`
- **Description:** Deletes criteria from the database.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:** `id` (Path parameter)
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "message": "Criteria deleted successfully."
  }
  ```

---

### GET `/api/superadmin/sub-criteria/criteria/:criteriaId`
- **Description:** Retrieves all sub-criteria mapping scales for a specific criteria ID.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:** `criteriaId` (Path parameter)
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "criteriaId": 1,
        "description": "16 GB",
        "valueNumeric": 5,
        "createdAt": "2026-07-07T02:00:00.000Z"
      }
    ]
  }
  ```

### GET `/api/superadmin/sub-criteria/:id`
- **Description:** Retrieves a single sub-criteria entry by its ID.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:** `id` (Path parameter)
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "criteriaId": 1,
      "description": "16 GB",
      "valueNumeric": 5
    }
  }
  ```

### POST `/api/superadmin/sub-criteria`
- **Description:** Adds a sub-criteria range. `valueNumeric` represents the score awarded to laptops mapping to this descriptor.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:**
  - **Type:** JSON (Body)
  ```json
  {
    "criteriaId": 1,
    "description": "16 GB",
    "valueNumeric": 5
  }
  ```
- **Success Response:**
  - **Status:** 201 Created
  ```json
  {
    "success": true,
    "message": "SubCriteria created successfully.",
    "data": {
      "id": 1,
      "criteriaId": 1,
      "description": "16 GB",
      "valueNumeric": 5,
      "createdAt": "2026-07-07T02:15:00.000Z"
    }
  }
  ```

### PUT `/api/superadmin/sub-criteria/:id`
- **Description:** Updates sub-criteria description or score value.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:** `id` (Path parameter), JSON body:
  ```json
  {
    "description": "16 GB (Dual Channel)",
    "valueNumeric": 5
  }
  ```
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "message": "SubCriteria updated successfully.",
    "data": {
      "id": 1,
      "criteriaId": 1,
      "description": "16 GB (Dual Channel)",
      "valueNumeric": 5,
      "createdAt": "2026-07-07T02:15:00.000Z"
    }
  }
  ```

### DELETE `/api/superadmin/sub-criteria/:id`
- **Description:** Deletes sub-criteria entry.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:** `id` (Path parameter)
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "message": "SubCriteria deleted successfully."
  }
  ```

---

### GET `/api/superadmin/products`
- **Description:** List all registered global master laptops along with brand and criteria mappings.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:** None
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "brandId": 1,
        "modelName": "ZenBook 14",
        "screenSize": "14.00",
        "processor": "AMD Ryzen 7",
        "ram": "16GB",
        "storage": "512GB",
        "battery": "67Wh",
        "weight": "1.39",
        "releaseYear": "2024-01-01T00:00:00.000Z",
        "createdAt": "2026-07-07T02:00:00.000Z",
        "brand": {
          "id": 1,
          "name": "ASUS"
        },
        "productCriteria": [
          {
            "id": 1,
            "productId": 1,
            "subCriteriaId": 1,
            "subCriteria": {
              "id": 1,
              "criteriaId": 1,
              "description": "16 GB",
              "valueNumeric": 5,
              "criteria": {
                "id": 1,
                "code": "C1",
                "name": "RAM",
                "type": "benefit"
              }
            }
          }
        ]
      }
    ]
  }
  ```

### GET `/api/superadmin/products/:id`
- **Description:** Retrieves details for a specific laptop model.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:** `id` (Path parameter)
- **Success Response:**
  - **Status:** 200 OK (Contains same format as list item)

### POST `/api/superadmin/products`
- **Description:** Adds a new laptop product to the global catalog. Mappings to SPK evaluation criteria are auto-resolved using specifications and saved in a single database transaction. Optionally uploads a product image to Cloudinary.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:**
  - **Type:** `multipart/form-data`
  - **Fields:**
    - `brandId` (text, required): Integer ID of the brand
    - `modelName` (text, required): Model name of the laptop
    - `screenSize` (text, optional): Decimal number (e.g. `14.0`)
    - `processor` (text, required): Processor model (e.g. `Intel Core i7`)
    - `ram` (text, required): RAM spec (e.g. `16GB`)
    - `storage` (text, required): Storage spec (e.g. `512GB`)
    - `battery` (text, optional): Battery spec (e.g. `65Wh`)
    - `weight` (text, required): Weight spec (e.g. `1.2`)
    - `releaseYear` (text, required): Release year (e.g. `2024`)
    - `image` (file, optional): Product image file (JPEG, JPG, PNG, WEBP)
- **Success Response:**
  - **Status:** 201 Created
  ```json
  {
    "success": true,
    "message": "Product created successfully.",
    "data": {
      "id": 1,
      "brandId": 1,
      "modelName": "Asus Zenbook 14",
      "imageUrl": "https://res.cloudinary.com/ecfyagfq/image/upload/v1720892010/spk_laptops/product_1.jpg",
      "screenSize": "14.0",
      "processor": "Intel Core i7",
      "ram": "16GB",
      "storage": "512GB",
      "battery": "65Wh",
      "weight": "1.2",
      "releaseYear": "2024",
      "createdAt": "2026-07-07T02:00:00.000Z",
      "brand": {
        "id": 1,
        "name": "ASUS"
      },
      "productCriteria": [
        {
          "id": 1,
          "productId": 1,
          "subCriteriaId": 8,
          "subCriteria": {
            "id": 8,
            "criteriaId": 2,
            "description": "16 GB",
            "valueNumeric": 5,
            "criteria": {
              "id": 2,
              "code": "C2",
              "name": "RAM",
              "type": "benefit"
            }
          }
        }
      ]
    }
  }
  ```

### PUT `/api/superadmin/products/:id`
- **Description:** Updates master specifications and rewrites the product criteria mapping table in a transaction if `subCriteriaIds` is supplied. Optionally uploads a new product image (which deletes the old image from Cloudinary).
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:**
  - **Type:** `multipart/form-data`
  - **Fields:**
    - `brandId` (text, optional): Integer ID of the brand
    - `modelName` (text, optional): Model name
    - `screenSize` (text, optional): Decimal number
    - `processor` (text, optional): Processor model
    - `ram` (text, optional): RAM spec
    - `storage` (text, optional): Storage spec
    - `battery` (text, optional): Battery spec
    - `weight` (text, optional): Weight spec
    - `releaseYear` (text, optional): Release year
    - `subCriteriaIds` (text, optional): JSON array `[1, 5, 9]` or comma-separated string `"1,5,9"`
    - `image` (file, optional): New product image file (JPEG, JPG, PNG, WEBP)
- **Success Response:**
  - **Status:** 200 OK (Returns updated product JSON)

### DELETE `/api/superadmin/products/:id`
- **Description:** Deletes master product and cascades deletion to criteria and inventory records in a transaction.
- **Authorization:** Bearer Token (Role: `superadmin`)
- **Request Payload:** `id` (Path parameter)
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "message": "Product deleted successfully."
  }
  ```

---

## 3. Store Admin (Admin) API Endpoints

These endpoints are strictly restricted to staff with the **admin** role. 
All requests require the header: `Authorization: Bearer <store_admin_jwt_token>`. 
The system automatically isolates actions based on the logged-in admin's `storeId`.

### GET `/api/admin/inventory/global-products`
- **Description:** Read global master products list. Store admins use this to view which laptops they can add to their store inventory.
- **Authorization:** Bearer Token (Role: `admin`)
- **Request Payload:** None
- **Success Response:**
  - **Status:** 200 OK (List of master products)

### GET `/api/admin/inventory/my-store`
- **Description:** Fetch inventory registered in the logged-in admin's store.
- **Authorization:** Bearer Token (Role: `admin`)
- **Request Payload:** None
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 12,
        "productId": 1,
        "storeId": 1,
        "price": 14500000,
        "stock": 8,
        "isAvailable": 1,
        "updatedAt": "2026-07-07T02:30:00.000Z",
        "product": {
          "id": 1,
          "modelName": "ZenBook 14",
          "brand": {
            "name": "ASUS"
          }
        }
      }
    ]
  }
  ```

### POST `/api/admin/inventory/add`
- **Description:** Adds a product to the admin's store inventory. 
- **Authorization:** Bearer Token (Role: `admin`)
- **Request Payload:**
  - **Type:** JSON (Body)
  ```json
  {
    "productId": 1,
    "price": 14500000,
    "stock": 8,
    "isAvailable": 1
  }
  ```
- **Success Response:**
  - **Status:** 201 Created
  ```json
  {
    "success": true,
    "message": "Product added to store inventory.",
    "data": {
      "id": 12,
      "productId": 1,
      "storeId": 1,
      "price": 14500000,
      "stock": 8,
      "isAvailable": 1,
      "updatedAt": "2026-07-07T02:30:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request` if already added, or values are missing.

### PUT `/api/admin/inventory/:id`
- **Description:** Updates the price, stock, or availability toggle (`isAvailable`: 0 or 1) of an inventory item.
- **Authorization:** Bearer Token (Role: `admin`)
- **Request Payload:** `id` (Path parameter representing `productStoreId`), and JSON body:
  ```json
  {
    "price": 14200000,
    "stock": 6,
    "isAvailable": 1
  }
  ```
- **Success Response:**
  - **Status:** 200 OK (Returns updated inventory record)
- **Error Responses:**
  - `403 Forbidden` if the inventory item does not belong to the admin's store.

### DELETE `/api/admin/inventory/:id`
- **Description:** Removes a laptop model from the admin's store inventory.
- **Authorization:** Bearer Token (Role: `admin`)
- **Request Payload:** `id` (Path parameter representing `productStoreId`)
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "message": "Inventory item removed successfully."
  }
  ```

---

### GET `/api/admin/store-profile`
- **Description:** Retrieves information of the admin's store profile.
- **Authorization:** Bearer Token (Role: `admin`)
- **Request Payload:** None
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "Laptop Zone",
      "address": "123 Tech Street",
      "city": "Jakarta",
      "phone": "081234567890",
      "isActive": 1
    }
  }
  ```

### PUT `/api/admin/store-profile`
- **Description:** Updates address, phone, or name of the store.
- **Authorization:** Bearer Token (Role: `admin`)
- **Request Payload:**
  - **Type:** JSON (Body)
  ```json
  {
    "name": "Laptop Zone Superstore",
    "address": "123 Tech Street B1",
    "city": "Jakarta",
    "phone": "081234567899",
    "latitude": -6.1754,
    "longitude": 106.8272
  }
  ```
- **Success Response:**
  - **Status:** 200 OK (Returns updated store details)

---

### GET `/api/admin/reports/summary`
- **Description:** Fetch report statistics for the store admin. Displays total products, active stock count, average price in store, and how many times their inventory items have featured in customer recommendations requests.
- **Authorization:** Bearer Token (Role: `admin`)
- **Request Payload:** None
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "data": {
      "totalProducts": 15,
      "totalStock": 110,
      "avgPrice": 16750000.0,
      "availableCount": 12,
      "recommendationAppearances": 57
    }
  }
  ```

---

## 4. Customer API Endpoints

Endpoints for register, catalog browsing, profile editing, and SPK recommendation.

### POST `/api/customer/auth/register`
- **Description:** Registers a new customer account. Hashes passwords securely.
- **Authorization:** None
- **Request Payload:**
  - **Type:** JSON (Body)
  ```json
  {
    "name": "Jane Customer",
    "email": "jane@customer.com",
    "password": "customerpassword123"
  }
  ```
- **Success Response:**
  - **Status:** 201 Created
  ```json
  {
    "success": true,
    "message": "Customer registered successfully.",
    "data": {
      "customer": {
        "id": 1,
        "name": "Jane Customer",
        "email": "jane@customer.com",
        "createdAt": "2026-07-07T02:40:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request` if email is already taken.

### POST `/api/customer/auth/login`
- **Description:** Authenticates a customer and issues a JWT token.
- **Authorization:** None
- **Request Payload:**
  - **Type:** JSON (Body)
  ```json
  {
    "email": "jane@customer.com",
    "password": "customerpassword123"
  }
  ```
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "data": {
      "customer": {
        "id": 1,
        "name": "Jane Customer",
        "email": "jane@customer.com",
        "createdAt": "2026-07-07T02:40:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

---

### GET `/api/customer/catalog`
- **Description:** Browses all laptop models and shows which stores sell them at what price.
- **Authorization:** None
- **Request Payload:** (Optional URL Query string filters: `brandId`, `search`, `userLat`, and `userLng`)
  - **Examples:** `/api/customer/catalog?brandId=1` or `/api/customer/catalog?search=ryzen&userLat=-6.1754&userLng=106.8272`
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "modelName": "ZenBook 14",
        "brand": {
          "name": "ASUS"
        },
        "productStores": [
          {
            "id": 12,
            "price": 14500000,
            "stock": 8,
            "distanceInKm": 15.34,
            "store": {
              "name": "Laptop Zone",
              "city": "Jakarta",
              "latitude": "-6.20880000",
              "longitude": "106.84560000",
              "distanceInKm": 15.34
            }
          }
        ]
      }
    ]
  }
  ```

### GET `/api/customer/catalog/:id`
- **Description:** Fetches specific laptop specifications, criteria tags, and price offerings across stores.
- **Authorization:** None
- **Request Payload:** `id` (Path parameter)
- **Success Response:**
  - **Status:** 200 OK (Contains comprehensive product details JSON)

---

### GET `/api/customer/profile`
- **Description:** Retrieve customer profile details.
- **Authorization:** Bearer Token (Role: `customer`)
- **Request Payload:** None
- **Success Response:**
  - **Status:** 200 OK
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "Jane Customer",
      "email": "jane@customer.com",
      "createdAt": "2026-07-07T02:40:00.000Z"
    }
  }
  ```

### PUT `/api/customer/profile`
- **Description:** Updates customer's profile info. Hashes password if submitted.
- **Authorization:** Bearer Token (Role: `customer`)
- **Request Payload:**
  - **Type:** JSON (Body)
  ```json
  {
    "name": "Jane Customer Updated",
    "email": "jane_new@customer.com",
    "password": "mynewpassword789",
    "latitude": -6.1754,
    "longitude": 106.8272
  }
  ```
- **Success Response:**
  - **Status:** 200 OK (Returns updated profile JSON)

---

### POST `/api/customer/spk/requests`
- **Description:** Submits budget criteria and criteria weights to generate laptop recommendations. The backend isolates the calculations in a single atomic MySQL transaction that generates Top 10 results for three methods simultaneously (**SAW**, **WP**, and **TOPSIS**). The engine filters products strictly within the real currency budget and calculates normalized scores using direct Criteria ID weights.
- **Authorization:** Bearer Token (Role: `customer`)
- **Request Payload:**
  - **Type:** JSON (Body)
  - **Fields:**
    - `customerId` (Integer, Optional): ID of the customer (resolved from authentication token if omitted).
    - `kebutuhan` (String, Required): Description of the user's specific laptop requirements or use-case context.
    - `budgetMin` (Integer, Required): The minimum budget limit specified in real currency (e.g. `3000000` IDR). Must not be a 1-5 scale.
    - `budgetMax` (Integer, Required): The maximum budget limit specified in real currency (e.g. `10000000` IDR). Must not be a 1-5 scale.
    - `userLat` (Float/Decimal, Optional): Latitude of the customer's location for distance calculations. If not provided, fallback to the profile coordinates.
    - `userLng` (Float/Decimal, Optional): Longitude of the customer's location for distance calculations. If not provided, fallback to the profile coordinates.
    - `weights` (Array of Objects, Required): Criteria weights mapping. Weights map directly to main criteria IDs:
      - `criteriaId` (Integer, Required): The main Criteria ID (e.g., `1` for Harga, `2` for RAM, `3` for Storage, `4` for Battery, `5` for Berat, `6` for Processor, `7` for Ukuran Layar, `8` for Tahun Rilis).
      - `weight` (Float/Decimal, Required): Weight value for the corresponding criteria (e.g. `0.20`).
  - **Example:**
  ```json
  {
    "customerId": 1,
    "kebutuhan": "Laptop untuk desain grafis ringan dan tugas kampus",
    "budgetMin": 3000000,
    "budgetMax": 10000000,
    "userLat": -6.9825,
    "userLng": 110.4284,
    "weights": [
      { "criteriaId": 1, "weight": 0.20 },
      { "criteriaId": 2, "weight": 0.15 },
      { "criteriaId": 3, "weight": 0.15 },
      { "criteriaId": 4, "weight": 0.10 },
      { "criteriaId": 5, "weight": 0.10 },
      { "criteriaId": 6, "weight": 0.15 },
      { "criteriaId": 7, "weight": 0.05 },
      { "criteriaId": 8, "weight": 0.10 }
    ]
  }
  ```
- **Success Response:**
  - **Status:** 201 Created
  - **Fields in Response:**
    - `id` (Integer): The newly created Recommendation Request ID (`req_id`).
    - `recommendationWeights` (Array): Detailed criteria weights mapped to the request.
    - `recommendationResults` (Array): Calculations for the top 10 recommended laptop alternatives generated simultaneously for **SAW**, **WP**, and **TOPSIS**, sorted by rank. Each result includes:
      - `id` (Integer): The result record ID.
      - `requestId` (Integer): The ID of the associated recommendation request.
      - `productStoreId` (Integer): The ID of the product-store inventory mapping (`product_store_id`).
      - `methodUsed` (String): The calculation method used (`SAW`, `WP`, or `TOPSIS`).
      - `score` (Decimal): The calculated SPK score.
      - `ranking` (Integer): The ordinal ranking of the recommendation (1-10).
    - `calculationDetails` (Object): The intermediate calculation data retrieved from MySQL Views for visual normalization in the frontend:
      - `rawMatrix` (Array): Raw matrix data (`v_matriks`) including actual laptop criteria values and corresponding weights.
      - `sawDetails` (Array): Normalization process and intermediate scores for SAW (`v_saw`).
      - `wpDetails` (Array): Intermediate S-vectors and final scores for WP (`v_wp`).
      - `topsisPembagi` (Array): TOPSIS square root divisor values for all criteria (`v_topsis_pembagi`).
      - `topsisDetails` (Array): Calculated relative closeness/scores for TOPSIS (`v_topsis_akhir`).
  - **Example:**
  ```json
  {
    "success": true,
    "message": "Recommendation calculated successfully.",
    "data": {
      "id": 101,
      "customerId": 1,
      "kebutuhan": "Laptop untuk desain grafis ringan dan tugas kampus",
      "budgetMin": 3000000,
      "budgetMax": 10000000,
      "status": "SUCCESS",
      "userLat": "-6.98250000",
      "userLng": "110.42840000",
      "createdAt": "2026-07-11T02:45:00.000Z",
      "recommendationWeights": [
        {
          "id": 201,
          "requestId": 101,
          "criteriaId": 1,
          "weight": "0.2000",
          "criteria": {
            "id": 1,
            "code": "C1",
            "name": "Harga",
            "type": "cost",
            "createdAt": "2026-07-07T02:00:00.000Z"
          }
        },
        {
          "id": 202,
          "requestId": 101,
          "criteriaId": 2,
          "weight": "0.1500",
          "criteria": {
            "id": 2,
            "code": "C2",
            "name": "RAM",
            "type": "benefit",
            "createdAt": "2026-07-07T02:00:00.000Z"
          }
        },
        {
          "id": 203,
          "requestId": 101,
          "criteriaId": 3,
          "weight": "0.1500",
          "criteria": {
            "id": 3,
            "code": "C3",
            "name": "Storage",
            "type": "benefit",
            "createdAt": "2026-07-07T02:00:00.000Z"
          }
        },
        {
          "id": 204,
          "requestId": 101,
          "criteriaId": 4,
          "weight": "0.1000",
          "criteria": {
            "id": 4,
            "code": "C4",
            "name": "Battery",
            "type": "benefit",
            "createdAt": "2026-07-07T02:00:00.000Z"
          }
        },
        {
          "id": 205,
          "requestId": 101,
          "criteriaId": 5,
          "weight": "0.1000",
          "criteria": {
            "id": 5,
            "code": "C5",
            "name": "Berat",
            "type": "cost",
            "createdAt": "2026-07-07T02:00:00.000Z"
          }
        },
        {
          "id": 206,
          "requestId": 101,
          "criteriaId": 6,
          "weight": "0.1500",
          "criteria": {
            "id": 6,
            "code": "C6",
            "name": "Processor",
            "type": "benefit",
            "createdAt": "2026-07-07T02:00:00.000Z"
          }
        },
        {
          "id": 207,
          "requestId": 101,
          "criteriaId": 7,
          "weight": "0.0500",
          "criteria": {
            "id": 7,
            "code": "C7",
            "name": "Ukuran Layar",
            "type": "benefit",
            "createdAt": "2026-07-07T02:00:00.000Z"
          }
        },
        {
          "id": 208,
          "requestId": 101,
          "criteriaId": 8,
          "weight": "0.1000",
          "criteria": {
            "id": 8,
            "code": "C8",
            "name": "Tahun Rilis",
            "type": "benefit",
            "createdAt": "2026-07-07T02:00:00.000Z"
          }
        }
      ],
      "recommendationResults": [
        {
          "id": 501,
          "requestId": 101,
          "productStoreId": 12,
          "methodUsed": "TOPSIS",
          "score": "0.892400",
          "ranking": 1,
          "createdAt": "2026-07-11T02:45:00.000Z",
          "productStore": {
            "id": 12,
            "productId": 3,
            "storeId": 1,
            "price": 8500000,
            "stock": 5,
            "isAvailable": 1,
            "updatedAt": "2026-07-07T02:30:00.000Z",
            "distanceInKm": 5.43,
            "product": {
              "id": 3,
              "brandId": 1,
              "modelName": "VivoBook 14",
              "screenSize": "14.0",
              "processor": "Intel Core i5",
              "ram": "8GB",
              "storage": "512GB",
              "battery": "42Wh",
              "weight": "1.4",
              "releaseYear": "2023",
              "createdAt": "2026-07-07T02:00:00.000Z",
              "brand": {
                "id": 1,
                "name": "ASUS"
              }
            },
            "store": {
              "id": 1,
              "name": "Laptop Zone",
              "address": "123 Tech Street",
              "city": "Jakarta",
              "latitude": "-6.20880000",
              "longitude": "106.84560000",
              "phone": "081234567890",
              "isActive": 1,
              "createdAt": "2026-07-07T02:00:00.000Z",
              "distanceInKm": 5.43
            }
          }
        },
        {
          "id": 502,
          "requestId": 101,
          "productStoreId": 12,
          "methodUsed": "SAW",
          "score": "0.920000",
          "ranking": 1,
          "createdAt": "2026-07-11T02:45:00.000Z",
          "productStore": {
            "id": 12,
            "productId": 3,
            "storeId": 1,
            "price": 8500000,
            "stock": 5,
            "isAvailable": 1,
            "updatedAt": "2026-07-07T02:30:00.000Z",
            "distanceInKm": 5.43,
            "product": {
              "id": 3,
              "brandId": 1,
              "modelName": "VivoBook 14",
              "screenSize": "14.0",
              "processor": "Intel Core i5",
              "ram": "8GB",
              "storage": "512GB",
              "battery": "42Wh",
              "weight": "1.4",
              "releaseYear": "2023",
              "createdAt": "2026-07-07T02:00:00.000Z",
              "brand": {
                "id": 1,
                "name": "ASUS"
              }
            },
            "store": {
              "id": 1,
              "name": "Laptop Zone",
              "address": "123 Tech Street",
              "city": "Jakarta",
              "latitude": "-6.20880000",
              "longitude": "106.84560000",
              "phone": "081234567890",
              "isActive": 1,
              "createdAt": "2026-07-07T02:00:00.000Z",
              "distanceInKm": 5.43
            }
          }
        },
        {
          "id": 503,
          "requestId": 101,
          "productStoreId": 12,
          "methodUsed": "WP",
          "score": "0.854300",
          "ranking": 1,
          "createdAt": "2026-07-11T02:45:00.000Z",
          "productStore": {
            "id": 12,
            "productId": 3,
            "storeId": 1,
            "price": 8500000,
            "stock": 5,
            "isAvailable": 1,
            "updatedAt": "2026-07-07T02:30:00.000Z",
            "distanceInKm": 5.43,
            "product": {
              "id": 3,
              "brandId": 1,
              "modelName": "VivoBook 14",
              "screenSize": "14.0",
              "processor": "Intel Core i5",
              "ram": "8GB",
              "storage": "512GB",
              "battery": "42Wh",
              "weight": "1.4",
              "releaseYear": "2023",
              "createdAt": "2026-07-07T02:00:00.000Z",
              "brand": {
                "id": 1,
                "name": "ASUS"
              }
            },
            "store": {
              "id": 1,
              "name": "Laptop Zone",
              "address": "123 Tech Street",
              "city": "Jakarta",
              "latitude": "-6.20880000",
              "longitude": "106.84560000",
              "phone": "081234567890",
              "isActive": 1,
              "createdAt": "2026-07-07T02:00:00.000Z",
              "distanceInKm": 5.43
            }
          }
        }
      ],
      "calculationDetails": {
        "rawMatrix": [
          {
            "id_recommendation_request": 101,
            "customers_id_customer": 1,
            "id_produk": 2,
            "nama_laptop": "Inspiron 14 5430",
            "nilai_c1": 4491000,
            "bobot_c1": 0.25,
            "nilai_c2": 3,
            "bobot_c2": 0.2,
            "nilai_c3": 2,
            "bobot_c3": 0.2,
            "nilai_c4": 2,
            "bobot_c4": 0.1,
            "nilai_c5": 3,
            "bobot_c5": 0.05,
            "nilai_c6": 3,
            "bobot_c6": 0.1,
            "nilai_c7": 3,
            "bobot_c7": 0.05,
            "nilai_c8": 4,
            "bobot_c8": 0.05
          }
        ],
        "sawDetails": [
          {
            "id_recommendation_request": 101,
            "id_produk": 58,
            "nama_laptop": "Sword 16 HX",
            "norm_c1": 0.6023,
            "norm_c2": 0.6,
            "norm_c3": 0.75,
            "norm_c4": 0.6,
            "norm_c5": 0.5,
            "norm_c6": 0.8,
            "norm_c7": 0.8,
            "norm_c8": 1,
            "skor_akhir_saw": 0.67558611
          }
        ],
        "wpDetails": [
          {
            "id_recommendation_request": 101,
            "id_produk": 90,
            "nama_laptop": "Surface Laptop Studio 2",
            "skor_s": 0.03572652,
            "skor_akhir_wp": 0.00075931
          }
        ],
        "topsisPembagi": [
          {
            "id_recommendation_request": 101,
            "bagi_c1": 211660207.01,
            "bagi_c2": 107.48,
            "bagi_c3": 80.38,
            "bagi_c4": 100.71,
            "bagi_c5": 125.66,
            "bagi_c6": 130.48,
            "bagi_c7": 120.82,
            "bagi_c8": 136.76
          }
        ],
        "topsisDetails": [
          {
            "id_recommendation_request": 101,
            "id_produk": 2,
            "nama_laptop": "Inspiron 14 5430",
            "skor_akhir_topsis": 0.47736129
          }
        ]
      }
    }
  }

### GET `/api/customer/spk/requests`
- **Description:** Retrieve the list of all recommendation requests submitted by the customer.
- **Authorization:** Bearer Token (Role: `customer`)
- **Request Payload:** None
- **Success Response:**
  - **Status:** 200 OK (List of recommendation requests)

### GET `/api/customer/spk/requests/:id`
- **Description:** Retrieve details of a specific recommendation request including complete SAW, WP, and TOPSIS ranked alternatives.
- **Authorization:** Bearer Token (Role: `customer`)
- **Request Payload:** `id` (Path parameter)
- **Success Response:**
  - **Status:** 200 OK (Contains same detail payload format as creation endpoint)
- **Error Responses:**
  - `403 Forbidden` if request does not belong to the active customer.
