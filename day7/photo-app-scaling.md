# Day 7 Assignment: Scaling SnapShare

## 1. Assumptions and daily active users

SnapShare has 10,000,000 registered users. Assume 10% of registered users are active daily, each active user uploads one photo per day and views 50 feed pages per day. Assume 365 days per year and use approximately 100,000 seconds per day for request-rate estimates. Each original photo is 2 MB, and each thumbnail is 50 KB. These estimates exclude storage overhead, backups, and any additional copies of photos.

**Daily active users (DAU):**

10,000,000 × 10% = **1,000,000 active users per day**

## 2. Traffic and storage estimates

### Uploads per second

1,000,000 active users × 1 upload = 1,000,000 uploads per day.

1,000,000 ÷ 100,000 = **10 uploads per second on average**

### Feed views per second

1,000,000 active users × 50 feed pages = 50,000,000 feed views per day.

50,000,000 ÷ 100,000 = **500 feed views per second on average**

Using a peak factor of 5:

500 × 5 = **2,500 feed views per second at peak**

For planning, uploads could also peak at approximately 50 per second if they follow the same 5× peak assumption.

### Photo storage per year

Original photos:

1,000,000 photos/day × 2 MB = 2,000,000 MB/day, or approximately 2 TB/day.

2 TB × 365 = **730 TB per year**

Thumbnails:

1,000,000 thumbnails/day × 50 KB = 50 GB/day.

50 GB × 365 = **18.25 TB per year**

Total new photo and thumbnail storage:

730 TB + 18.25 TB = **748.25 TB per year**, approximately, using decimal storage units.

This is the storage for one year's uploads before replication, backups, and other overhead.

## 3. Read-heavy or write-heavy?

SnapShare is **read-heavy** because users generate approximately 50 feed views for every photo upload. The architecture should optimize feed delivery with caching, a CDN, and database read replicas while keeping photo uploads reliable.

## 4. Why photos should use object storage

Photos should be stored in object storage rather than directly inside the database because image files are large and would consume substantial database storage and bandwidth. Object storage is designed for large files and can scale independently. The database should store photo metadata, such as the photo ID, owner, caption, timestamp, and object-storage key or URL.

## 5. Architecture diagram

```text
                  USERS / BROWSERS
                         |
                        DNS
                         |
             +-----------+------------+
             |                        |
       Static content            API requests
             |                        |
            CDN                 LOAD BALANCER
                                      |
                         +------------+------------+
                         |                         |
                    APP SERVER 1              APP SERVER 2
                         |                         |
                         +------------+------------+
                                      |
                    +-----------------+------------------+
                    |                 |                  |
                REDIS CACHE      DATABASE PRIMARY   OBJECT STORAGE
                    |                 |              Original photos
                    |                 |              and thumbnails
                    |            Replication
                    |                 |
                    |           READ REPLICA
                    |
                    +---- App servers check cache

                    APP SERVER
                         |
                    MESSAGE QUEUE
                         |
                  THUMBNAIL WORKER
                         |
                  OBJECT STORAGE
```

## 6. What each component solves

- **DNS:** Directs users to the appropriate service address.
- **CDN:** Delivers cached static assets and photo thumbnails from locations closer to users.
- **Load balancer:** Distributes API requests across healthy application servers.
- **Application servers:** Authenticate users, validate uploads, manage feed requests, and coordinate other services.
- **Redis cache:** Stores frequently accessed feed data and metadata in memory to reduce database load and latency.
- **Primary database:** Stores authoritative photo metadata and handles writes.
- **Read replica:** Serves eligible read queries to reduce load on the primary database.
- **Object storage:** Stores original photos and generated thumbnails as scalable file objects.
- **Message queue:** Holds thumbnail-generation jobs so uploads do not have to wait for image processing.
- **Thumbnail worker:** Processes queued jobs, creates smaller versions of photos, and saves them to object storage.

## 7. Photo upload flow

1. A user selects a photo and submits it through the application.
2. The load balancer routes the API request to a healthy application server.
3. The application server authenticates the user and validates the file type and size.
4. The original photo is uploaded to object storage, and its storage key is obtained.
5. The application server saves the photo metadata and storage key in the primary database.
6. The server invalidates or updates affected feed-cache entries and places a thumbnail-generation job on the message queue.
7. The application confirms that the photo has been uploaded, without waiting for thumbnail generation to finish.
8. A thumbnail worker retrieves the job and downloads the original photo from object storage.
9. The worker generates a 50 KB thumbnail and saves it to object storage.
10. The worker updates the photo metadata or thumbnail status if required; the CDN can then serve the thumbnail to users.
11. When another user views a feed, the application checks the cache first, retrieves missing data from the database or read replica, and returns photo URLs that can be served through the CDN.

## 8. Trade-offs

**Caching versus freshness:** Redis improves feed response times and reduces database traffic, but cached feeds can become stale. Cache invalidation or short time-to-live (TTL) values help balance speed and freshness.

**Read replicas versus consistency:** Read replicas support more feed reads, but replication lag may cause a recently uploaded photo to be temporarily absent from a feed. The application can read recent changes from the primary when necessary.

**Asynchronous thumbnails versus immediate availability:** A queue allows the upload response to return quickly and protects the application from slow image processing, but thumbnails may not be available immediately if workers are busy.

**CDN performance versus invalidation complexity:** A CDN reduces latency and origin traffic, but updated or deleted photos may remain cached until the cache expires or is invalidated.

## Conclusion

SnapShare should use a read-optimized architecture with multiple stateless application servers, a load balancer, Redis caching, a primary database and read replica, object storage, a CDN, and an asynchronous thumbnail-processing queue. This design separates photo storage from metadata, supports high feed traffic, and allows each component to scale as demand grows.
