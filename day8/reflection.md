# Day 8 Reflection

The most difficult concept in this assignment was understanding how to prevent two customers from buying the same seat when their requests arrive almost simultaneously. Initially, checking whether a seat was available seemed sufficient. I learned that two requests could both see the seat as available before either request updates it. This is a race condition. Using an atomic database update and a transaction helps ensure that only one customer can successfully reserve the seat.

I overcame this challenge by breaking the design into smaller steps: defining requirements, estimating traffic, identifying API endpoints, designing database tables, and drawing the system architecture. Calculating normal traffic separately from the concert-sale surge helped me understand why caching, a waiting room, horizontal scaling, and careful database writes are important.

I would improve the capstone by making the demonstration more practical. For example, I would show two customers attempting to reserve the same seat and demonstrate how the system rejects the second reservation. I would also connect each architecture component to the specific problem it solves. These are planned improvements; I have not received specific individual feedback to quote.

Next, I want to learn how to build a backend using Node.js and Express, connect it to PostgreSQL, and test concurrent requests. This would help me turn a design document into a working application.
