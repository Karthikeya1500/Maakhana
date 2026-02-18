# Class Diagram — Maakhana Food

## Overview
This class diagram shows the major classes, their attributes, methods, and relationships across the Maakhana Food platform. The design follows **Clean Architecture** (Controller → Service → Repository) with strong **OOP principles** and **design patterns**.

---

```mermaid
classDiagram
    direction TB

    %% ===== DOMAIN MODELS =====

    class User {
        <<abstract>>
        -id: string
        -email: string
        -passwordHash: string
        -name: string
        -phone: string
        -role: UserRole
        -isActive: boolean
        -createdAt: Date
        -updatedAt: Date
        +getProfile(): UserProfile
        +updateProfile(dto: UpdateProfileDto): void
        +deactivate(): void
        +authenticate(password: string): boolean
    }

    class UserRole {
        <<enumeration>>
        CUSTOMER
        HOMECHEF
        ADMIN
    }

    class Customer {
        -deliveryAddress: string
        -favoriteChefs: string[]
        -orderCount: number
        +browseFood(state: string): FoodItem[]
        +addToCart(foodItemId: string, qty: number): Cart
        +placeOrder(cartId: string, address: string): Order
        +rateChef(chefId: string, rating: number, review: string): Review
        +getOrderHistory(): Order[]
    }

    class HomeChef {
        -state: string
        -specialties: string[]
        -bio: string
        -isApproved: boolean
        -averageRating: number
        -totalOrders: number
        +addFoodItem(dto: CreateFoodDto): FoodItem
        +updateFoodItem(id: string, dto: UpdateFoodDto): FoodItem
        +deleteFoodItem(id: string): void
        +viewIncomingOrders(): Order[]
        +updateOrderStatus(orderId: string, status: OrderStatus): void
        +getChefStats(): ChefStats
    }

    class Admin {
        -permissions: string[]
        +approveChef(chefId: string): void
        +rejectChef(chefId: string, reason: string): void
        +manageUsers(): User[]
        +monitorOrders(): Order[]
        +viewAnalytics(): PlatformStats
        +deactivateUser(userId: string): void
    }

    class State {
        -id: string
        -name: string
        -description: string
        -famousDishes: string[]
        -imageUrl: string
        +getFoodItems(): FoodItem[]
        +getChefs(): HomeChef[]
        +getFoodCount(): number
    }

    class FoodItem {
        -id: string
        -name: string
        -description: string
        -price: number
        -imageUrl: string
        -category: string
        -isVeg: boolean
        -isAvailable: boolean
        -chefId: string
        -stateId: string
        -createdAt: Date
        -updatedAt: Date
        +updateDetails(dto: UpdateFoodDto): void
        +toggleAvailability(): void
        +getChef(): HomeChef
        +getState(): State
    }

    class Cart {
        -id: string
        -customerId: string
        -items: CartItem[]
        -totalAmount: number
        -createdAt: Date
        -updatedAt: Date
        +addItem(foodItemId: string, qty: number): void
        +removeItem(foodItemId: string): void
        +updateQuantity(foodItemId: string, qty: number): void
        +calculateTotal(): number
        +clear(): void
        +getItemCount(): number
    }

    class CartItem {
        -foodItemId: string
        -foodName: string
        -quantity: number
        -pricePerUnit: number
        -subtotal: number
    }

    class Order {
        -id: string
        -customerId: string
        -chefId: string
        -items: OrderItem[]
        -totalAmount: number
        -status: OrderStatus
        -deliveryAddress: string
        -paymentId: string
        -stateId: string
        -placedAt: Date
        -deliveredAt: Date
        -updatedAt: Date
        +updateStatus(status: OrderStatus): void
        +cancel(): void
        +getStateHandler(): OrderStateHandler
        +isDelivered(): boolean
        +calculateTotal(): number
    }

    class OrderItem {
        -foodItemId: string
        -foodName: string
        -quantity: number
        -pricePerUnit: number
        -subtotal: number
    }

    class OrderStatus {
        <<enumeration>>
        PLACED
        CONFIRMED
        PREPARING
        READY
        DELIVERED
        CANCELLED
    }

    class Payment {
        -id: string
        -orderId: string
        -customerId: string
        -amount: number
        -method: PaymentMethod
        -status: PaymentStatus
        -transactionId: string
        -paidAt: Date
        +process(): void
        +refund(): void
        +getReceipt(): PaymentReceipt
    }

    class PaymentMethod {
        <<enumeration>>
        UPI
        CARD
        COD
        WALLET
    }

    class PaymentStatus {
        <<enumeration>>
        PENDING
        PROCESSING
        SUCCESS
        FAILED
        REFUNDED
    }

    class Review {
        -id: string
        -customerId: string
        -chefId: string
        -orderId: string
        -rating: number
        -comment: string
        -createdAt: Date
        +update(rating: number, comment: string): void
    }

    class Notification {
        -id: string
        -userId: string
        -type: NotificationType
        -title: string
        -message: string
        -isRead: boolean
        -createdAt: Date
        +markAsRead(): void
    }

    class NotificationType {
        <<enumeration>>
        NEW_ORDER
        ORDER_CONFIRMED
        ORDER_PREPARING
        ORDER_DELIVERED
        CHEF_APPROVED
        CHEF_REJECTED
        SYSTEM
    }

    %% ===== SERVICE LAYER =====

    class AuthService {
        -userRepo: IUserRepository
        -jwtSecret: string
        +register(dto: RegisterDto): User
        +login(email: string, password: string): AuthToken
        +validateToken(token: string): TokenPayload
        +hashPassword(password: string): string
    }

    class FoodService {
        -foodRepo: IFoodRepository
        -stateRepo: IStateRepository
        +addFoodItem(chefId: string, dto: CreateFoodDto): FoodItem
        +updateFoodItem(id: string, dto: UpdateFoodDto): FoodItem
        +deleteFoodItem(id: string): void
        +findByState(state: string): FoodItem[]
        +searchFood(query: string): FoodItem[]
    }

    class OrderService {
        -orderRepo: IOrderRepository
        -cartService: CartService
        -paymentService: PaymentService
        -validationChain: OrderValidator
        +createOrder(dto: CreateOrderDto): Order
        +updateOrderStatus(orderId: string, status: OrderStatus): void
        +cancelOrder(orderId: string): void
        +getOrdersByCustomer(customerId: string): Order[]
        +getOrdersByChef(chefId: string): Order[]
    }

    class CartService {
        -cartRepo: ICartRepository
        +getCart(customerId: string): Cart
        +addToCart(customerId: string, foodItemId: string, qty: number): Cart
        +removeFromCart(customerId: string, foodItemId: string): Cart
        +clearCart(customerId: string): void
    }

    class PaymentService {
        -strategy: IPaymentStrategy
        -paymentRepo: IPaymentRepository
        +processPayment(orderId: string, amount: number, method: PaymentMethod): Payment
        +refundPayment(paymentId: string): Payment
        +setStrategy(strategy: IPaymentStrategy): void
    }

    class IPaymentStrategy {
        <<interface>>
        +pay(amount: number, details: PaymentDetails): PaymentResult
    }

    class UPIPaymentStrategy {
        +pay(amount: number, details: PaymentDetails): PaymentResult
    }

    class CardPaymentStrategy {
        +pay(amount: number, details: PaymentDetails): PaymentResult
    }

    class ReviewService {
        -reviewRepo: IReviewRepository
        +addReview(dto: CreateReviewDto): Review
        +getReviewsByChef(chefId: string): Review[]
        +calculateAverageRating(chefId: string): number
    }

    class NotificationService {
        -observers: INotificationObserver[]
        -notificationRepo: INotificationRepository
        +subscribe(observer: INotificationObserver): void
        +notify(event: OrderEvent): void
        +sendNotification(userId: string, notification: Notification): void
        +getUnreadCount(userId: string): number
    }

    class INotificationObserver {
        <<interface>>
        +onEvent(event: OrderEvent): void
    }

    %% ===== VALIDATION CHAIN =====

    class OrderValidator {
        <<abstract>>
        #next: OrderValidator
        +setNext(validator: OrderValidator): OrderValidator
        +validate(order: Order): ValidationResult
        #doValidate(order: Order): ValidationResult*
    }

    class CartNotEmptyValidator {
        #doValidate(order: Order): ValidationResult
    }

    class ItemsAvailableValidator {
        #doValidate(order: Order): ValidationResult
    }

    class AddressValidator {
        #doValidate(order: Order): ValidationResult
    }

    class ChefActiveValidator {
        #doValidate(order: Order): ValidationResult
    }

    %% ===== REPOSITORY INTERFACES =====

    class IUserRepository {
        <<interface>>
        +findById(id: string): User
        +findByEmail(email: string): User
        +save(user: User): User
        +update(user: User): void
        +findByRole(role: UserRole): User[]
    }

    class IFoodRepository {
        <<interface>>
        +findById(id: string): FoodItem
        +findByChef(chefId: string): FoodItem[]
        +findByState(state: string): FoodItem[]
        +save(food: FoodItem): FoodItem
        +update(food: FoodItem): void
        +delete(id: string): void
    }

    class IOrderRepository {
        <<interface>>
        +findById(id: string): Order
        +findByCustomer(customerId: string): Order[]
        +findByChef(chefId: string): Order[]
        +save(order: Order): Order
        +update(order: Order): void
    }

    class IStateRepository {
        <<interface>>
        +findAll(): State[]
        +findByName(name: string): State
        +findById(id: string): State
    }

    class ICartRepository {
        <<interface>>
        +findByCustomer(customerId: string): Cart
        +save(cart: Cart): Cart
        +update(cart: Cart): void
        +delete(customerId: string): void
    }

    class IPaymentRepository {
        <<interface>>
        +findByOrderId(orderId: string): Payment
        +save(payment: Payment): Payment
        +update(payment: Payment): void
    }

    class IReviewRepository {
        <<interface>>
        +findByChef(chefId: string): Review[]
        +findByCustomer(customerId: string): Review[]
        +save(review: Review): Review
    }

    %% ===== RELATIONSHIPS =====

    User <|-- Customer : extends
    User <|-- HomeChef : extends
    User <|-- Admin : extends
    User --> UserRole

    Customer "1" --> "1" Cart : has
    Customer "1" --> "*" Order : places
    Customer "1" --> "*" Review : writes

    HomeChef "1" --> "*" FoodItem : lists
    HomeChef "1" --> "*" Order : receives
    HomeChef "1" --> "*" Review : receives

    State "1" --> "*" FoodItem : categorizes
    State "1" --> "*" HomeChef : belongs to

    Cart "1" *-- "*" CartItem : contains
    Order "1" *-- "*" OrderItem : contains
    Order --> OrderStatus
    Order "1" --> "1" Payment : has

    Payment --> PaymentMethod
    Payment --> PaymentStatus

    Review --> Customer : written by
    Review --> HomeChef : about

    User "1" --> "*" Notification : receives
    Notification --> NotificationType

    %% Service layer relationships
    AuthService --> IUserRepository
    FoodService --> IFoodRepository
    FoodService --> IStateRepository
    OrderService --> IOrderRepository
    OrderService --> CartService
    OrderService --> PaymentService
    OrderService --> OrderValidator
    CartService --> ICartRepository
    PaymentService --> IPaymentStrategy
    PaymentService --> IPaymentRepository
    ReviewService --> IReviewRepository
    NotificationService --> INotificationObserver

    IPaymentStrategy <|.. UPIPaymentStrategy : implements
    IPaymentStrategy <|.. CardPaymentStrategy : implements

    OrderValidator <|-- CartNotEmptyValidator : extends
    OrderValidator <|-- ItemsAvailableValidator : extends
    OrderValidator <|-- AddressValidator : extends
    OrderValidator <|-- ChefActiveValidator : extends
```

---

## Design Patterns in the Class Diagram
| Pattern                     | Where Applied                                      | Purpose                                                              |
|-----------------------------|-----------------------------------------------------|----------------------------------------------------------------------|
| **Strategy**                | `IPaymentStrategy` (UPI, Card processors)           | Swap payment processing algorithms at runtime                        |
| **Chain of Responsibility** | `OrderValidator` chain                              | Validate orders through a pipeline of sequential validators          |
| **Observer**                | `NotificationService` + `INotificationObserver`     | Decouple order events from notification consumers                    |
| **Template Method**         | `OrderService.createOrder()`                        | Define order creation steps with customizable sub-steps              |
| **State**                   | `OrderStatus` lifecycle                             | Manage order status transitions cleanly                              |
| **Factory**                 | User creation (Customer, HomeChef, Admin)            | Create appropriate user subclass based on registration role          |
| **Repository**              | `IFoodRepository`, `IOrderRepository`, etc.         | Abstract data access from business logic                             |
| **Builder**                 | Food search query building                          | Build dynamic queries for state/food filtering                       |
| **Singleton**               | Database connection, AuthService                    | Ensure single instance for shared resources                          |

## OOP Principles
| Principle         | Application                                                                                     |
|-------------------|-------------------------------------------------------------------------------------------------|
| **Encapsulation** | Private fields with public methods in all domain models (e.g., `Cart.addItem()`, `Order.updateStatus()`) |
| **Abstraction**   | Interfaces for repositories and strategies hide implementation details                          |
| **Inheritance**   | `Customer`, `HomeChef`, and `Admin` extend abstract `User`; validators extend `OrderValidator`  |
| **Polymorphism**  | `IPaymentStrategy` implementations swapped at runtime; `OrderValidator` chain processes any validator type |
