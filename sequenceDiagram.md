# Sequence Diagram — Maakhana Food

## Main Flow: End-to-End Order Placement (Customer Browses → Selects Food → Places Order → Payment → Notification)

This sequence diagram illustrates the complete lifecycle of an order — from a customer browsing food by state, adding items to cart, placing an order, through to payment processing and notification delivery.

---

```mermaid
sequenceDiagram
    actor C as Customer
    participant FE as Frontend (React)
    participant API as API Gateway
    participant Auth as Auth Controller
    participant FC as Food Controller
    participant FS as Food Service
    participant OC as Order Controller
    participant OS as Order Service
    participant CS as Cart Service
    participant PS as Payment Service
    participant DB as MongoDB
    participant NS as Notification Service

    Note over C, NS: Phase 1 — Customer Authentication

    C ->> FE: Open Maakhana Food App
    FE ->> API: POST /api/auth/login (email, password)
    API ->> Auth: handleLogin(credentials)
    Auth ->> DB: Find user by email
    DB -->> Auth: User document
    Auth ->> Auth: Verify password (bcrypt.compare)
    Auth ->> Auth: Generate JWT Token (userId, role: CUSTOMER)
    Auth -->> API: 200 OK { token, user }
    API -->> FE: Login successful
    FE -->> C: Redirect to Customer Dashboard

    Note over C, NS: Phase 2 — Browse Food by State

    C ->> FE: Select State "Tamil Nadu"
    FE ->> API: GET /api/food?state=tamil_nadu
    API ->> Auth: Validate JWT Token
    Auth -->> API: Token Valid (userId, role: CUSTOMER)
    API ->> FC: getFoodByState("tamil_nadu")
    FC ->> FS: findByState("tamil_nadu")
    FS ->> DB: SELECT food_items WHERE state = "tamil_nadu"
    DB -->> FS: List of food items
    FS -->> FC: FoodItem[] (filtered by state)
    FC -->> API: 200 OK { foods }
    API -->> FE: Food items list
    FE -->> C: Display Tamil Nadu food items

    Note over C, NS: Phase 3 — Add to Cart

    C ->> FE: Click "Add to Cart" on Masala Dosa
    FE ->> API: POST /api/cart/add { foodItemId, quantity: 2 }
    API ->> Auth: Validate JWT Token
    Auth -->> API: Token Valid (userId)
    API ->> CS: addToCart(userId, foodItemId, quantity)
    CS ->> DB: Find or create cart for userId
    DB -->> CS: Cart document
    CS ->> DB: UPSERT cart item (foodItemId, qty: 2)
    DB -->> CS: Cart updated
    CS -->> API: 200 OK { cart }
    API -->> FE: Cart updated
    FE -->> C: "Masala Dosa x2 added to cart"

    C ->> FE: Click "Add to Cart" on Filter Coffee
    FE ->> API: POST /api/cart/add { foodItemId, quantity: 1 }
    API ->> CS: addToCart(userId, foodItemId, quantity)
    CS ->> DB: UPSERT cart item (foodItemId, qty: 1)
    DB -->> CS: Cart updated
    CS -->> API: 200 OK { cart }
    API -->> FE: Cart updated
    FE -->> C: "Filter Coffee x1 added to cart"

    Note over C, NS: Phase 4 — Place Order

    C ->> FE: Click "Place Order"
    FE ->> API: POST /api/orders { cartId, deliveryAddress, paymentMethod }
    API ->> Auth: Validate JWT Token
    Auth -->> API: Token Valid (userId, role: CUSTOMER)
    API ->> OC: placeOrder(orderDto)
    OC ->> OS: createOrder(userId, cartId, deliveryAddress)

    Note right of OS: Order Validation (Chain of Responsibility)<br/>Validators: CartNotEmpty →<br/>ItemsAvailable → AddressValid →<br/>ChefActiveValidator

    OS ->> OS: Validate order (Chain of Responsibility)
    OS ->> DB: SELECT cart items with food details
    DB -->> OS: Cart items with pricing
    OS ->> OS: Calculate order total

    OS ->> DB: BEGIN TRANSACTION
    OS ->> DB: INSERT INTO orders (userId, items, total, status: PLACED)
    DB -->> OS: Order created (orderId)
    OS ->> DB: INSERT INTO order_items (orderId, foodItemId, qty, price)
    DB -->> OS: Order items created

    Note over C, NS: Phase 5 — Payment Processing

    OS ->> PS: processPayment(orderId, amount, paymentMethod)
    PS ->> PS: Validate payment details

    Note right of PS: Payment Strategy Pattern<br/>Selects processor based on method:<br/>UPI / Card / COD / Wallet

    PS ->> DB: INSERT INTO payments (orderId, amount, method, status: PROCESSING)
    DB -->> PS: Payment record created
    PS ->> PS: Simulate payment processing
    PS ->> DB: UPDATE payments SET status = SUCCESS
    DB -->> PS: Payment confirmed
    PS -->> OS: Payment successful (paymentId, transactionId)

    OS ->> DB: UPDATE orders SET status = CONFIRMED, paymentId
    DB -->> OS: Order confirmed
    OS ->> DB: DELETE cart items (clear cart)
    DB -->> OS: Cart cleared
    OS ->> DB: COMMIT TRANSACTION

    OS -->> OC: Order confirmed (orderId)
    OC -->> API: 201 Created { orderId, status: CONFIRMED }
    API -->> FE: Order confirmation
    FE -->> C: "Order placed successfully! Order #12345"

    Note over C, NS: Phase 6 — Notifications

    OS ->> NS: sendOrderNotification(order)
    NS ->> DB: INSERT INTO notifications (userId: chefId, type: NEW_ORDER, message)
    NS ->> DB: INSERT INTO notifications (userId: customerId, type: ORDER_CONFIRMED, message)
    NS -->> FE: Push notification to HomeChef
    NS -->> FE: Push notification to Customer
    FE -->> C: "Your order #12345 is confirmed!"

    Note over C, NS: Phase 7 — Chef Updates Order Status

    Note over C, NS: HomeChef sees new order and updates status

    NS ->> DB: SELECT order details for chef
    DB -->> NS: Order details

    OS ->> DB: UPDATE orders SET status = PREPARING
    OS ->> NS: sendStatusUpdate(orderId, PREPARING)
    NS -->> FE: Status update to Customer
    FE -->> C: "Your order is being prepared!"

    OS ->> DB: UPDATE orders SET status = READY
    OS ->> NS: sendStatusUpdate(orderId, READY)
    NS -->> FE: Status update to Customer
    FE -->> C: "Your order is ready!"

    OS ->> DB: UPDATE orders SET status = DELIVERED
    OS ->> NS: sendStatusUpdate(orderId, DELIVERED)
    NS -->> FE: Status update to Customer
    FE -->> C: "Your order has been delivered! Rate your chef."
```

---

## Flow Summary
| Phase                   | Description                                                                                                   | Key Patterns Used                   |
|-------------------------|---------------------------------------------------------------------------------------------------------------|-------------------------------------|
| **1. Authentication**   | Customer logs in with email/password. JWT token generated and returned for subsequent authenticated requests. | Singleton (DB connection)           |
| **2. Browse by State**  | Customer selects a state. Food items from that state are fetched and displayed dynamically.                   | Repository, Builder (query)         |
| **3. Add to Cart**      | Customer adds food items to their cart. Cart is persisted in the database per user.                           | Repository                          |
| **4. Place Order**      | Cart is converted to an order. Validated through a chain of validators. Order and items stored in DB.        | Chain of Responsibility, Factory    |
| **5. Payment**          | Payment processed based on selected method. Simulated payment gateway confirms transaction.                  | Strategy Pattern                    |
| **6. Notifications**    | Both chef and customer receive notifications about the new order and confirmation.                           | Observer Pattern                    |
| **7. Status Updates**   | Chef updates order status through lifecycle. Customer receives real-time status notifications.                | State Pattern, Observer             |
