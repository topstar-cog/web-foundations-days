# TicketHub: Ticketing System Design

## 1. Requirements

### Functional requirements
- Users can browse and search for events.
- Users can view event details and seat availability.
- Users can temporarily hold available seats.
- Users can create orders and make payments.
- Users can view their purchased tickets and order history.
- The system releases expired or abandoned seat holds.

### Non-functional requirements
- **Performance:** Event and seat searches should respond quickly under normal traffic.
- **Scalability:** The system must handle large traffic spikes during popular ticket sales.
- **Reliability:** Orders and payments must be recorded accurately, with recovery from failures.
- **Security:** Protect user accounts, restrict access to private orders, and avoid storing raw payment-card details.
- **Data consistency:** A seat must never be confirmed for more than one customer.
- **Fairness:** Use a waiting room, rate limiting, and controlled admission to manage heavy traffic.

## 2. Traffic and Capacity Estimates

TicketHub has 2 million registered users. On a normal day, 50,000 visitors view 10 pages each, and 5,000 tickets are sold.

### Normal-day traffic
- Daily page views = 50,000 × 10 = **500,000 page views/day**.
- Average page views per second = 500,000 ÷ 86,400 ≈ **5.8 page views/second**.
- Assuming a peak rate five times the daily average, normal peak traffic is approximately **29 page views/second**.
- Average ticket sales = 5,000 ÷ 86,400 ≈ **0.058 tickets/second**.

### Popular concert sale
- Buyer attempts = 200,000 in 10 minutes.
- Average buyer attempts per second = 200,000 ÷ 600 ≈ **333 attempts/second**.
- Available seats = **20,000**.
- Demand-to-supply ratio = 200,000 ÷ 20,000 = **10 buyers per seat**.
- Maximum possible successful sales = **20,000 tickets**.

For planning purposes, if each buyer makes four API requests during the sale, the system may receive approximately 333 × 4 = **1,332 API requests/second**. This is an assumption for capacity planning, not a measured value.

The system must be load-tested before the sale. A waiting room, caching, rate limiting, and controlled database writes will help manage the surge. Seat availability and final bookings must be verified against the authoritative database.

## 3. API Design

The API uses REST conventions and the base path `/api/v1`.

| HTTP Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/events` | List and search events |
| GET | `/api/v1/events/{eventId}` | Retrieve event details |
| GET | `/api/v1/events/{eventId}/seats` | View seat availability |
| POST | `/api/v1/events/{eventId}/holds` | Temporarily reserve available seats |
| POST | `/api/v1/orders` | Create an order |
| POST | `/api/v1/orders/{orderId}/payment` | Initiate payment |
| GET | `/api/v1/me/orders` | Retrieve the signed-in user's orders |
| GET | `/api/v1/me/tickets` | Retrieve purchased tickets |

### API behaviour and error handling

- `200 OK`: Request completed successfully.
- `201 Created`: A seat hold or order was created.
- `400 Bad Request`: Request data is invalid.
- `401 Unauthorized`: Authentication is required.
- `404 Not Found`: Event, seat, or order does not exist.
- `409 Conflict`: A requested seat is already held or sold.
- `429 Too Many Requests`: The client exceeded its rate limit.
- `500 Internal Server Error`: An unexpected server error occurred.

Seat-hold and order requests should support idempotency keys to prevent accidental duplicate operations when clients retry requests. Payment status must be verified with the payment provider before tickets are confirmed.

## 4. Data Model

TicketHub will use PostgreSQL, a relational database, to store users, events, seats, orders, and payments. Primary keys uniquely identify records, while foreign keys link related records.

### Database tables

| Table | Important columns | Purpose |
|---|---|---|
| `users` | `id` (PK), `email` (unique), `password_hash`, `created_at` | Stores customer accounts. |
| `events` | `id` (PK), `title`, `venue`, `starts_at`, `status` | Stores event information. |
| `seats` | `id` (PK), `event_id` (FK), `seat_label`, `price`, `status`, `hold_user_id` (FK), `hold_expires_at` | Tracks seats and their availability. |
| `orders` | `id` (PK), `user_id` (FK), `status`, `total_amount`, `currency`, `created_at` | Records customer orders. |
| `order_items` | `id` (PK), `order_id` (FK), `seat_id` (FK), `unit_price` | Links orders to the seats purchased. |
| `payments` | `id` (PK), `order_id` (FK), `provider_reference` (unique), `status`, `amount`, `currency` | Records payment attempts and outcomes. |

### Relationships

- One user can create many orders.
- One event can contain many seats.
- One order can contain multiple order items.
- Each order item refers to a specific seat.
- One order can have multiple payment attempts.
- A seat's `status` can be `available`, `held`, `sold`, or `blocked`.

The database should enforce a unique constraint on `(event_id, seat_label)` so that the same seat cannot be created twice for an event. Foreign keys maintain valid relationships between records.

Seat status changes must be protected by database transactions and atomic updates. These safeguards are explained in Section 6.

## 5. System Architecture

### Architecture diagram

```text
                    Customers
                        |
                   DNS / CDN
                        |
               Waiting Room / Queue
                        |
                 Load Balancer
                        |
              Application Servers
                 /           \
          Redis Cache     PostgreSQL
                              |
                     Read Replica
                              |
                  Queue / Background Workers
                     /               \
              Payment Provider   Notifications
```

### Component explanations

1. **DNS and CDN:** Direct users to TicketHub and cache static assets such as images, stylesheets, and scripts to reduce load on the application servers.
2. **Waiting room and queue:** Control admission during popular sales, reducing sudden pressure on the booking system and helping manage fair access.
3. **Load balancer:** Distributes incoming requests across application servers.
4. **Application servers:** Handle event searches, authentication, seat holds, orders, and payment workflows. Multiple stateless servers can be added as traffic increases.
5. **Redis cache:** Stores frequently requested event details and other suitable read-only data. Seat availability must be confirmed against the authoritative database before a hold is granted.
6. **PostgreSQL primary database:** Stores the authoritative seat, order, and payment records. Transactions and atomic updates protect booking correctness.
7. **Read replica:** Serves suitable read queries to reduce load on the primary database. Booking decisions must use the primary database because replicas may have stale data.
8. **Queue and background workers:** Process tasks such as expiring abandoned holds, handling verified payment events, and sending notifications.
9. **Payment provider:** Processes payments and sends payment status updates. TicketHub verifies the outcome before confirming an order as paid.

### Handling the concert-sale surge

The waiting room limits how many users enter the booking flow at once. The CDN and cache reduce repeated read requests, while additional application servers handle more concurrent traffic. PostgreSQL remains responsible for final seat allocation. If the system cannot safely confirm a seat's status, it must not confirm the booking.
```

## 6. Preventing Double-Booking

TicketHub must ensure that two customers cannot hold or purchase the same seat at the same time.

### Atomic seat reservation

The application must not rely only on checking whether a seat is available before updating it. Two requests could read the same available status simultaneously. Instead, TicketHub uses an atomic conditional database update inside a transaction.

For example, in PostgreSQL:

```sql
UPDATE seats
SET status = 'held',
    hold_user_id = :user_id,
    hold_expires_at = CURRENT_TIMESTAMP + INTERVAL '5 minutes'
WHERE id = :seat_id
  AND event_id = :event_id
  AND (
    status = 'available'
    OR (
      status = 'held'
      AND hold_expires_at < CURRENT_TIMESTAMP
    )
  )
RETURNING id;
```

The application checks the result:

- If one row is returned, the reservation succeeded. The application records the hold or order within the same transaction and commits.
- If no row is returned, the seat is unavailable or the request is invalid. The transaction does not create a successful hold, and the API returns an appropriate error, such as `409 Conflict`.

When concurrent requests target the same seat, the database coordinates the updates so that only one request can successfully claim the seat under these conditions.

### Completing a booking safely

1. Hold the seat for five minutes.
2. Initiate payment and verify the payment outcome with the provider.
3. In a database transaction, confirm that

## 7. Design Trade-offs

### Waiting room versus immediate access
A waiting room controls traffic during popular sales and improves system stability, but customers may have to wait before entering the booking process.

### Strong consistency versus performance
Database transactions and atomic updates prevent double-booking, but they can limit booking throughput. Load testing and database optimization are needed to balance correctness and performance.

### Seat-hold duration versus availability
A five-minute hold gives customers time to pay, but seats remain unavailable to other buyers during that period. Expired holds must be released reliably.

### Read replicas versus data freshness
Read replicas reduce the load on the primary database, but replication delays can show outdated seat availability. All final booking decisions must use the primary database.

These trade-offs prioritize correct seat allocation while maintaining acceptable performance and fairness during peak demand.
