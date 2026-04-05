# 🚀 Finance Management Backend

A scalable, multi-tenant financial management backend built with **Node.js, Express, and PostgreSQL**, designed to support **role-based access control, analytics, and efficient data handling**.

---

# 🧠 Overview

This project implements a **complete backend system** for managing financial records across multiple users and dashboards.

It is designed with a strong focus on:

* Clean architecture
* Role-based access control (RBAC)
* Scalable database design
* Analytics-driven APIs
* Production-ready patterns

---

# 🏗️ Architecture

```
Client → Express API → Middleware → Controllers → PostgreSQL
```

### 🔹 Layers

* **Middleware**

  * Authentication (JWT)
  * Authorization (RBAC)
  * Validation (Zod)
  * Rate Limiting

* **Controllers**

  * Business logic
  * Database interaction
  * Response formatting

* **Database**

  * PostgreSQL (normalized schema)
  * Transaction-safe operations

---

# 🔐 Authentication Flow

## Register

* Creates a new user
* Automatically creates a finance dashboard
* Assigns `owner` role

## Login

* Validates credentials
* Returns JWT token for authenticated access

---

# 🛡️ Role-Based Access Control (RBAC)

### Roles

| Role    | Permissions            |
| ------- | ---------------------- |
| Owner   | Full control           |
| Admin   | Manage users & records |
| Analyst | View + analytics       |
| Viewer  | View only              |

### Hierarchy

```
Owner > Admin > Analyst > Viewer
```

### Access Rules

| Action        | Owner | Admin | Analyst | Viewer |
| ------------- | ----- | ----- | ------- | ------ |
| Create Record | ✅     | ✅     | ❌       | ❌      |
| Delete Record | ✅     | ✅     | ❌       | ❌      |
| Add Users     | ✅     | ✅*    | ❌       | ❌      |
| Assign Admin  | ✅     | ❌     | ❌       | ❌      |

*Admin can only assign Analyst/Viewer roles

---

# 🏢 Data Model

### Tables

* `users`
* `finances`
* `user_finances` (relationship + roles)
* `records`
* `categories`

### Relationships

```
User ↔ user_finances ↔ Finance
Finance → Records → Categories
```

---

# 💰 Record Management

## Features

* Create, update, delete financial records
* Custom + predefined categories
* Transaction-safe operations

## Flow

1. Validate input
2. Check user role
3. Handle category (existing/new)
4. Store transaction

---

# 📊 Analytics System

## 1. Finance Summary

* Total income
* Total expense
* Net balance

## 2. Category Breakdown

* Expense/income per category
* Used for pie charts

## 3. Trends API

* Time-based income vs expense
* Used for line graphs

## 4. Category Trends

* Category-wise trends over time
* Used for stacked charts

---

# 🎨 Graphical Representation

| Graph Type      | API Used           |
| --------------- | ------------------ |
| Dashboard Cards | Summary API        |
| Pie Chart       | Category Breakdown |
| Line Chart      | Trends API         |
| Stacked Chart   | Category Trends    |

---

# ⚙️ Filtering System

Reusable utility:

```
buildDateFilter()
```

Supports:

* Day
* Week
* Month
* Year
* Custom range

---

# 📦 Pagination

Implemented for record listing:

```
GET /records?page=1&limit=10
```

Response includes:

* total records
* total pages
* current page

---

# 🚫 Rate Limiting

Implemented using `express-rate-limit`

### 🔐 Auth Routes

* Strict limits
* Prevent brute force attacks

### 🌐 General APIs

* Moderate limits
* Prevent spam

---

# ✅ Validation

Implemented using **Zod**

### Flow

```
Request → Validation Middleware → Controller
```

### Benefits

* Clean controllers
* Strong input validation
* Consistent error handling

---

# 📦 Response Format

## Success

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

## Error

```json
{
  "success": false,
  "error": {
    "message": "...",
    "code": "..."
  }
}
```

---

# 🔄 Transactions

Used in:

* User registration
* Record creation
* Role updates

Ensures:

* Data consistency
* No partial operations

---

# 🧪 Testing

Basic **integration tests** implemented using:

* Jest
* Supertest

Tested flows:

* Authentication
* Record creation
* RBAC behavior

---

# 🚀 Scalability Considerations

### Current

* Indexed queries
* Pagination
* Modular architecture

### Future Improvements

* Redis-based rate limiting
* Caching layer
* Cursor-based pagination
* Microservices (if needed)

---

# 💡 Key Design Decisions

* Used **ledger-style records** instead of storing totals → ensures accurate analytics
* Implemented **RBAC at DB + middleware level** → stronger security
* Designed **reusable filtering utility** → avoids duplication
* Used **structured responses** → frontend-friendly APIs

---

# 🏁 Conclusion

This backend demonstrates:

* Multi-tenant system design
* Role-based access control
* Scalable API architecture
* Analytics-driven data processing

It goes beyond basic CRUD and focuses on **real-world backend engineering practices**.

---
