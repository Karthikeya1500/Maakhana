# ER Diagram — Maakhana Food

## Overview
This Entity-Relationship diagram shows the database schema for the Maakhana Food platform. All tables, columns, types, and relationships are defined below.

---

```mermaid
erDiagram
    USERS {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar name
        varchar phone
        enum role "CUSTOMER, HOMECHEF, ADMIN"
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    CUSTOMERS {
        uuid id PK
        uuid user_id FK
        varchar delivery_address
        text favorite_chefs "JSON array"
        int order_count
        timestamp created_at
        timestamp updated_at
    }

    HOMECHEFS {
        uuid id PK
        uuid user_id FK
        uuid state_id FK
        text specialties "JSON array"
        text bio
        boolean is_approved
        decimal average_rating
        int total_orders
        timestamp approved_at
        timestamp created_at
        timestamp updated_at
    }

    STATES {
        uuid id PK
        varchar name UK
        text description
        text famous_dishes "JSON array"
        varchar image_url
        timestamp created_at
    }

    FOOD_ITEMS {
        uuid id PK
        varchar name
        text description
        decimal price
        varchar image_url
        varchar category
        boolean is_veg
        boolean is_available
        uuid chef_id FK
        uuid state_id FK
        timestamp created_at
        timestamp updated_at
    }

    ORDERS {
        uuid id PK
        uuid customer_id FK
        uuid chef_id FK
        decimal total_amount
        enum status "PLACED, CONFIRMED, PREPARING, READY, DELIVERED, CANCELLED"
        varchar delivery_address
        uuid payment_id FK
        uuid state_id FK
        timestamp placed_at
        timestamp delivered_at
        timestamp updated_at
    }

    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid food_item_id FK
        varchar food_name
        int quantity
        decimal price_per_unit
        decimal subtotal
    }

    CART {
        uuid id PK
        uuid customer_id FK
        decimal total_amount
        timestamp created_at
        timestamp updated_at
    }

    CART_ITEMS {
        uuid id PK
        uuid cart_id FK
        uuid food_item_id FK
        int quantity
        decimal price_per_unit
        decimal subtotal
    }

    PAYMENTS {
        uuid id PK
        uuid order_id FK
        uuid customer_id FK
        decimal amount
        enum method "UPI, CARD, COD, WALLET"
        enum status "PENDING, PROCESSING, SUCCESS, FAILED, REFUNDED"
        varchar transaction_id
        timestamp paid_at
        timestamp created_at
        timestamp updated_at
    }

    REVIEWS {
        uuid id PK
        uuid customer_id FK
        uuid chef_id FK
        uuid order_id FK
        int rating "1 to 5"
        text comment
        timestamp created_at
        timestamp updated_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        enum type "NEW_ORDER, ORDER_CONFIRMED, ORDER_PREPARING, ORDER_DELIVERED, CHEF_APPROVED, CHEF_REJECTED, SYSTEM"
        varchar title
        text message
        boolean is_read
        timestamp created_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        varchar action
        varchar entity_type
        uuid entity_id
        jsonb details
        varchar ip_address
        timestamp created_at
    }

    %% ===== RELATIONSHIPS =====

    USERS ||--o| CUSTOMERS : "has profile"
    USERS ||--o| HOMECHEFS : "has profile"

    CUSTOMERS ||--o| CART : "has one"
    CUSTOMERS ||--o{ ORDERS : "places"
    CUSTOMERS ||--o{ REVIEWS : "writes"
    CUSTOMERS ||--o{ PAYMENTS : "makes"

    HOMECHEFS ||--o{ FOOD_ITEMS : "lists"
    HOMECHEFS ||--o{ ORDERS : "receives"
    HOMECHEFS ||--o{ REVIEWS : "receives"

    HOMECHEFS }o--|| STATES : "native of"

    STATES ||--o{ FOOD_ITEMS : "categorizes"

    ORDERS ||--o{ ORDER_ITEMS : "contains"
    ORDERS ||--o| PAYMENTS : "paid by"

    CART ||--o{ CART_ITEMS : "contains"
    CART_ITEMS }o--|| FOOD_ITEMS : "references"

    ORDER_ITEMS }o--|| FOOD_ITEMS : "references"

    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ AUDIT_LOGS : "generates"

    ORDERS }o--|| STATES : "from state"
```

---

## Table Summary
| Table            | Description                                                              | Key Relationships                           |
|------------------|--------------------------------------------------------------------------|---------------------------------------------|
| `USERS`          | All platform users (customers, home chefs, admins)                       | → Customer, HomeChef, Notifications          |
| `CUSTOMERS`      | Customer-specific profile data (extends User)                            | ← User (1:1), → Cart, Orders, Reviews       |
| `HOMECHEFS`      | Chef-specific profile with state, approval status                        | ← User (1:1), → FoodItems, Orders, Reviews  |
| `STATES`         | Indian states (e.g., Punjab, Tamil Nadu, West Bengal)                    | → FoodItems, HomeChefs                        |
| `FOOD_ITEMS`     | Food listings by home chefs with pricing and availability                | ← HomeChef, State                             |
| `ORDERS`         | Customer orders with status and delivery info                            | ← Customer, Chef → OrderItems, Payment       |
| `ORDER_ITEMS`    | Individual items within an order with quantity and pricing                | ← Order, → FoodItem                          |
| `CART`           | Shopping cart per customer                                               | ← Customer (1:1), → CartItems                |
| `CART_ITEMS`     | Items in the cart referencing food items                                  | ← Cart, → FoodItem                           |
| `PAYMENTS`       | Payment records for orders with method and status                        | ← Order (1:1), Customer                      |
| `REVIEWS`        | Customer ratings and reviews for chefs (one per order)                   | ← Customer, Chef, Order                      |
| `NOTIFICATIONS`  | In-app notifications for all user events                                 | ← User                                       |
| `AUDIT_LOGS`     | Tamper-proof log of all system actions for compliance                     | ← User                                       |

---

## Key Indexes
| Table          | Index                                    | Purpose                              |
|----------------|------------------------------------------|--------------------------------------|
| `FOOD_ITEMS`   | `(state_id, is_available)`               | Fast state-based food browsing       |
| `FOOD_ITEMS`   | `(chef_id, is_available)`                | Chef's active food listings          |
| `ORDERS`       | `(customer_id, status)`                  | Customer order history               |
| `ORDERS`       | `(chef_id, status)`                      | Chef incoming orders                 |
| `HOMECHEFS`    | `(state_id, is_approved)`                | Find approved chefs by state         |
| `REVIEWS`      | `(chef_id, rating)`                      | Chef rating aggregation              |
| `NOTIFICATIONS`| `(user_id, is_read)`                     | Unread notification count            |
| `AUDIT_LOGS`   | `(entity_type, entity_id)`               | Entity audit trail lookup            |
| `PAYMENTS`     | `(order_id, status)`                     | Payment status lookup                |
