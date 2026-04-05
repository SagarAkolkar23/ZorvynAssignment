<div align="center">

# 💰 Finance Management Backend

**A production-grade, multi-tenant financial management API built with Node.js, Express, and PostgreSQL.**

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-Docs-85EA2D?style=flat-square&logo=swagger&logoColor=black)
![Jest](https://img.shields.io/badge/Jest-Testing-C21325?style=flat-square&logo=jest&logoColor=white)

[📖 API Docs](https://docs.google.com/document/d/1Lg9I36TGFOSlOOJgP_AydZY2AcIbqbML/edit?usp=sharing&ouid=109749702535358964480&rtpof=true&sd=true) 

</div>

---

## 🧠 Overview

This is a **complete backend system** for managing financial records across multiple users and dashboards. It goes far beyond basic CRUD — implementing a multi-tenant architecture, 4-tier role-based access control, a full analytics engine, and production patterns like transaction-safe operations, Zod validation, and rate limiting.

> Built as a submission for the **Finance Data Processing & Access Control Backend** assignment.

### Why this stands out

| ❌ Basic backends do... | ✅ This backend does... |
|---|---|
| Store income/expense records | Ledger-style records — analytics always accurate |
| Simple auth | JWT + bcrypt with RBAC middleware chain |
| One user per resource | Multi-tenant — one dashboard, many users, each with a role |
| Fixed filter | Reusable `buildDateFilter()` across all endpoints |
| Raw DB errors | Structured JSON error responses with error codes |

---

## ⚡ Quick Start

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm or yarn

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/your-username/finance-backend.git
cd finance-backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env — see Environment Variables section below

# 5. Start the server
npm run dev       # Development with hot reload (nodemon)
npm start         # Production
```

Server starts at `http://localhost:3000`
Swagger docs at `http://localhost:3000/api/docs`

### Environment Variables

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/financedb
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

## 🗺️ Architecture

### Request Lifecycle

```
Client Request
     │
     ▼
Express Router ──► Rate Limiter (auth: 10 req/15min, api: 100 req/15min)
     │
     ▼
Middleware Chain
     ├── verifyToken()     → validates JWT, attaches user to req
     ├── requireRole()     → checks user's role in user_finances table
     └── validate(schema)  → Zod schema validation, returns 400 on failure
     │
     ▼
Controller
     ├── Business logic
     ├── PostgreSQL queries (transaction-safe where needed)
     └── Structured JSON response
     │
     ▼
{ success: true, message: "...", data: {} }
```

### Project Structure

```
finance-backend/
├── src/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection pool
│   ├── middleware/
│   │   ├── auth.js              # JWT verification (verifyToken)
│   │   ├── rbac.js              # Role-based access (requireRole)
│   │   ├── validate.js          # Zod validation middleware
│   │   └── rateLimiter.js       # express-rate-limit configs
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── finance.controller.js
│   │   ├── record.controller.js
│   │   └── analytics.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── finance.routes.js
│   │   ├── record.routes.js
│   │   └── analytics.routes.js
│   ├── schemas/                 # Zod validation schemas
│   ├── utils/
│   │   └── buildDateFilter.js   # Reusable date filtering utility
│   └── app.js
├── migrations/                  # SQL migration files
├── tests/                       # Jest + Supertest integration tests
├── .env.example
└── package.json
```

---

## 🗃️ Data Model

```
users
  id (UUID PK), name, email, password_hash, created_at

finances                          ← the dashboard / workspace
  id (UUID PK), name, description, created_at

user_finances                     ← multi-tenant join table
  user_id (FK), finance_id (FK), role ('owner'|'admin'|'analyst'|'viewer')

records                           ← ledger entries (never store computed totals)
  id, finance_id (FK), user_id (FK),
  type ('income'|'expense'), amount (DECIMAL 12,2),
  category_id (FK), date (DATE), notes (TEXT), created_at

categories                        ← scoped per finance (no cross-tenant leakage)
  id, finance_id (FK), name, created_at
```

### Relationships

```
User ◄──── user_finances (role) ────► Finance
                                          │
                                       Records
                                          │
                                      Categories
```

> **Key design decision:** Totals are never stored. All summary figures are computed at query time from ledger records, guaranteeing accuracy even after edits or deletes.

---

## 🔐 Authentication

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Sagar Akolkar",
  "email": "sagar@example.com",
  "password": "securepassword123"
}
```

**What happens:**
1. Zod validates input
2. Email uniqueness check
3. `bcrypt.hash(password, 12)`
4. **Transaction:** create user → create default finance dashboard → insert `user_finances` with `role = 'owner'`
5. Sign JWT
6. Return `{ token, user, finance }`

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "sagar@example.com",
  "password": "securepassword123"
}
```

All protected routes require:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🛡️ Role-Based Access Control (RBAC)

### Hierarchy

```
Owner (4) > Admin (3) > Analyst (2) > Viewer (1)
```

### Permission Matrix

| Action | Owner | Admin | Analyst | Viewer |
|--------|-------|-------|---------|--------|
| View records | ✅ | ✅ | ✅ | ✅ |
| Access analytics | ✅ | ✅ | ✅ | ❌ |
| Create / Update record | ✅ | ✅ | ❌ | ❌ |
| Delete record | ✅ | ✅ | ❌ | ❌ |
| Add user to finance | ✅ | ✅* | ❌ | ❌ |
| Assign Admin role | ✅ | ❌ | ❌ | ❌ |
| Delete finance | ✅ | ❌ | ❌ | ❌ |

\* Admin can only assign Analyst or Viewer roles

### How it's enforced

```js
// Applied per-route as middleware
router.post(
  '/finances/:id/records',
  verifyToken,            // 1. Valid JWT?
  requireRole('admin'),   // 2. Is user admin or above in this finance?
  validate(recordSchema), // 3. Is input valid?
  createRecord            // 4. Business logic
);
```

---

## 💰 Record Management

### Create Record

```http
POST /api/finances/:financeId/records
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "expense",
  "amount": 1500.00,
  "category": "Food",
  "date": "2025-06-15",
  "notes": "Team lunch"
}
```

> Categories are auto-created if they don't exist — no need to pre-register them.

### Get Records (with filtering & pagination)

```http
GET /api/finances/:financeId/records
    ?page=1
    &limit=10
    &type=expense
    &category=Food
    &dateFilter=month          # day | week | month | year | custom
    &startDate=2025-06-01      # used when dateFilter=custom
    &endDate=2025-06-30
    &sortBy=date
    &order=desc
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "records": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 47,
      "totalPages": 5
    }
  }
}
```

### Update / Delete Record

```http
PUT    /api/finances/:financeId/records/:recordId
DELETE /api/finances/:financeId/records/:recordId
```

Both require `admin` role or above. Partial updates are supported on `PUT`.

---

## 📊 Analytics System

All analytics endpoints support the same date filtering via `?dateFilter=day|week|month|year|custom`.

### 1. Finance Summary

```http
GET /api/finances/:financeId/analytics/summary?dateFilter=month
```

```json
{
  "data": {
    "totalIncome": 85000.00,
    "totalExpense": 42300.00,
    "netBalance": 42700.00,
    "period": "month"
  }
}
```

→ Powers **dashboard summary cards**

---

### 2. Category Breakdown

```http
GET /api/finances/:financeId/analytics/category-breakdown?type=expense&dateFilter=month
```

```json
{
  "data": {
    "breakdown": [
      { "category": "Rent",   "total": 25000.00 },
      { "category": "Food",   "total": 12000.00 },
      { "category": "Travel", "total": 5300.00  }
    ]
  }
}
```

→ Powers **pie charts**

---

### 3. Income vs Expense Trends

```http
GET /api/finances/:financeId/analytics/trends?dateFilter=month&groupBy=week
```

```json
{
  "data": {
    "trends": [
      { "date": "2025-06-02", "income": 20000, "expense": 8000 },
      { "date": "2025-06-09", "income": 15000, "expense": 12000 },
      { "date": "2025-06-16", "income": 30000, "expense": 9500 },
      { "date": "2025-06-23", "income": 20000, "expense": 12800 }
    ]
  }
}
```

→ Powers **line / area charts**

---

### 4. Category Trends Over Time

```http
GET /api/finances/:financeId/analytics/category-trends?dateFilter=month
```

```json
{
  "data": {
    "trends": [
      { "date": "2025-06-02", "category": "Food",   "total": 3200 },
      { "date": "2025-06-02", "category": "Travel",  "total": 1100 },
      { "date": "2025-06-09", "category": "Food",   "total": 2800 }
    ]
  }
}
```

→ Powers **stacked bar charts**

---

### Analytics → Chart Mapping

| Dashboard Element | API Endpoint |
|---|---|
| Summary cards (income / expense / balance) | `GET /analytics/summary` |
| Pie chart (spending by category) | `GET /analytics/category-breakdown` |
| Line / area chart (trends over time) | `GET /analytics/trends` |
| Stacked bar chart (category breakdown over time) | `GET /analytics/category-trends` |

---

### 📊 Live Dashboard Preview

> The four analytics APIs feed directly into this dashboard. Toggle between Week / Month / Year to see data update across all panels.

<details>
<summary><b>Click to expand — Interactive Analytics Dashboard</b></summary>

<br/>

<!--DASHBOARD_START-->
<div align="center">

```
⚡ This dashboard is interactive — open in a browser that renders HTML inside markdown,
   or copy the HTML block below into an .html file to run it locally.
```

</div>

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Finance Dashboard</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8f9fa;color:#1a1a2e;padding:24px}
  h1{font-size:20px;font-weight:600;margin-bottom:4px}
  .sub{font-size:13px;color:#666;margin-bottom:20px}
  .filter-row{display:flex;gap:6px;margin-bottom:20px}
  .fbtn{font-size:12px;padding:5px 14px;border-radius:20px;border:1px solid #ddd;background:#fff;color:#555;cursor:pointer;transition:all .15s}
  .fbtn.active{background:#1a1a2e;color:#fff;border-color:#1a1a2e}
  .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}
  .card{background:#fff;border-radius:10px;padding:16px;border:1px solid #eee}
  .clabel{font-size:12px;color:#888;margin-bottom:6px}
  .cval{font-size:24px;font-weight:600}
  .cval.income{color:#1a9e6b}.cval.expense{color:#e24b4a}.cval.balance{color:#185fa5}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
  .box{background:#fff;border-radius:10px;padding:16px;border:1px solid #eee}
  .box.full{grid-column:1/-1}
  .btitle{font-size:13px;font-weight:600;margin-bottom:2px}
  .bsub{font-size:11px;color:#999;font-family:monospace;margin-bottom:12px}
  .cwrap{position:relative;width:100%}
  .legend{display:flex;flex-wrap:wrap;gap:12px;margin-top:10px;font-size:11px;color:#666}
  .dot{width:10px;height:10px;border-radius:2px;display:inline-block;margin-right:4px;vertical-align:middle}
  @media(max-width:600px){.cards,.grid2{grid-template-columns:1fr}.box.full{grid-column:1}}
</style>
</head>
<body>
<h1>💰 Finance Dashboard</h1>
<p class="sub">Live demo — data served by the four analytics API endpoints</p>

<div class="filter-row">
  <button class="fbtn" onclick="setFilter('week',this)">Week</button>
  <button class="fbtn active" onclick="setFilter('month',this)">Month</button>
  <button class="fbtn" onclick="setFilter('year',this)">Year</button>
</div>

<div class="cards">
  <div class="card"><div class="clabel">Total income · GET /analytics/summary</div><div class="cval income" id="c-income">₹85,000</div></div>
  <div class="card"><div class="clabel">Total expense · GET /analytics/summary</div><div class="cval expense" id="c-expense">₹42,300</div></div>
  <div class="card"><div class="clabel">Net balance · GET /analytics/summary</div><div class="cval balance" id="c-balance">₹42,700</div></div>
</div>

<div class="grid2">
  <div class="box">
    <div class="btitle">Spending by category</div>
    <div class="bsub">GET /analytics/category-breakdown</div>
    <div class="cwrap" style="height:210px"><canvas id="pieChart"></canvas></div>
    <div class="legend" id="pie-legend"></div>
  </div>
  <div class="box">
    <div class="btitle">Category comparison</div>
    <div class="bsub">GET /analytics/category-breakdown</div>
    <div class="cwrap" style="height:210px"><canvas id="barChart"></canvas></div>
  </div>
  <div class="box full">
    <div class="btitle">Income vs Expense over time</div>
    <div class="bsub">GET /analytics/trends</div>
    <div class="cwrap" style="height:200px"><canvas id="lineChart"></canvas></div>
    <div class="legend">
      <span><span class="dot" style="background:#1a9e6b"></span>Income</span>
      <span><span class="dot" style="background:#e24b4a"></span>Expense</span>
    </div>
  </div>
  <div class="box full">
    <div class="btitle">Category trends over time (stacked)</div>
    <div class="bsub">GET /analytics/category-trends</div>
    <div class="cwrap" style="height:200px"><canvas id="stackedChart"></canvas></div>
    <div class="legend" id="stacked-legend"></div>
  </div>
</div>

<script>
const PAL=['#185fa5','#1a9e6b','#e24b4a','#ba7517','#8b3ec8','#0e7e7e'];
const DATA={
  week:{
    summary:{income:21000,expense:9800,balance:11200},
    cats:{labels:['Food','Transport','Bills','Shopping','Health'],data:[3200,1800,2500,1400,900]},
    trends:{labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],income:[4000,2500,5000,3000,4500,1000,1000],expense:[1500,1200,2000,1800,1600,900,800]},
    stacked:{labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],datasets:[{label:'Food',data:[800,600,900,700,850,400,350]},{label:'Transport',data:[300,250,400,350,250,100,150]},{label:'Bills',data:[400,0,700,0,500,0,0]},{label:'Shopping',data:[0,350,0,750,0,400,0]}]}
  },
  month:{
    summary:{income:85000,expense:42300,balance:42700},
    cats:{labels:['Rent','Food','Travel','Shopping','Utilities','Health'],data:[25000,12000,5300,4800,3200,2000]},
    trends:{labels:['Wk 1','Wk 2','Wk 3','Wk 4'],income:[20000,15000,30000,20000],expense:[8000,12000,9500,12800]},
    stacked:{labels:['Wk 1','Wk 2','Wk 3','Wk 4'],datasets:[{label:'Rent',data:[25000,0,0,0]},{label:'Food',data:[3200,2800,3100,2900]},{label:'Travel',data:[0,3200,0,2100]},{label:'Shopping',data:[1200,0,2600,1000]}]}
  },
  year:{
    summary:{income:960000,expense:520000,balance:440000},
    cats:{labels:['Rent','Food','Travel','Shopping','Utilities','Health','Education'],data:[300000,120000,55000,60000,38000,28000,20000]},
    trends:{labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],income:[72000,68000,88000,75000,82000,90000,78000,85000,92000,80000,75000,95000],expense:[42000,38000,45000,40000,43000,48000,39000,44000,50000,42000,40000,52000]},
    stacked:{labels:['Q1','Q2','Q3','Q4'],datasets:[{label:'Rent',data:[75000,75000,75000,75000]},{label:'Food',data:[28000,30000,32000,30000]},{label:'Travel',data:[8000,18000,22000,7000]},{label:'Shopping',data:[10000,15000,12000,23000]}]}
  }
};
let cur='month',charts={};
function fmt(n){return'₹'+n.toLocaleString('en-IN')}
function setFilter(f,btn){
  cur=f;
  document.querySelectorAll('.fbtn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const d=DATA[f];
  document.getElementById('c-income').textContent=fmt(d.summary.income);
  document.getElementById('c-expense').textContent=fmt(d.summary.expense);
  document.getElementById('c-balance').textContent=fmt(d.summary.balance);
  Object.values(charts).forEach(c=>c.destroy());
  charts={};
  build(f);
}
function build(f){
  const d=DATA[f];
  charts.pie=new Chart(document.getElementById('pieChart'),{type:'doughnut',data:{labels:d.cats.labels,datasets:[{data:d.cats.data,backgroundColor:PAL,borderWidth:2,borderColor:'#fff',hoverOffset:6}]},options:{responsive:true,maintainAspectRatio:false,cutout:'62%',plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${fmt(c.raw)}`}}}}});
  document.getElementById('pie-legend').innerHTML=d.cats.labels.map((l,i)=>`<span><span class="dot" style="background:${PAL[i]}"></span>${l}</span>`).join('');
  charts.bar=new Chart(document.getElementById('barChart'),{type:'bar',data:{labels:d.cats.labels,datasets:[{data:d.cats.data,backgroundColor:PAL,borderRadius:4,borderWidth:0}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${fmt(c.raw)}`}}},scales:{x:{ticks:{callback:v=>'₹'+(v>=1000?Math.round(v/1000)+'k':v),maxTicksLimit:5}},y:{grid:{display:false},ticks:{font:{size:11}}}}}});
  charts.line=new Chart(document.getElementById('lineChart'),{type:'line',data:{labels:d.trends.labels,datasets:[{label:'Income',data:d.trends.income,borderColor:'#1a9e6b',backgroundColor:'rgba(26,158,107,0.12)',tension:0.4,fill:true,pointRadius:4,pointBackgroundColor:'#1a9e6b',borderWidth:2},{label:'Expense',data:d.trends.expense,borderColor:'#e24b4a',backgroundColor:'rgba(226,75,74,0.1)',tension:0.4,fill:true,pointRadius:4,pointBackgroundColor:'#e24b4a',borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.dataset.label}: ${fmt(c.raw)}`}}},scales:{x:{grid:{display:false}},y:{ticks:{callback:v=>'₹'+(v>=1000?Math.round(v/1000)+'k':v),maxTicksLimit:5}}}}});
  charts.stacked=new Chart(document.getElementById('stackedChart'),{type:'bar',data:{labels:d.stacked.labels,datasets:d.stacked.datasets.map((ds,i)=>({label:ds.label,data:ds.data,backgroundColor:PAL[i],borderRadius:i===d.stacked.datasets.length-1?4:0,borderWidth:0}))},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.dataset.label}: ${fmt(c.raw)}`}}},scales:{x:{stacked:true,grid:{display:false}},y:{stacked:true,ticks:{callback:v=>'₹'+(v>=1000?Math.round(v/1000)+'k':v),maxTicksLimit:5}}}}});
  document.getElementById('stacked-legend').innerHTML=d.stacked.datasets.map((ds,i)=>`<span><span class="dot" style="background:${PAL[i]}"></span>${ds.label}</span>`).join('');
}
build('month');
</script>
</body>
</html>
```

</details>

---

## 📦 Response Format

### Success

```json
{
  "success": true,
  "message": "Record created successfully",
  "data": { ... }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "message": "You don't have permission to perform this action",
    "code": "FORBIDDEN"
  }
}
```

### HTTP Status Codes

| Situation | Code |
|---|---|
| Success (read) | `200 OK` |
| Success (created) | `201 Created` |
| Validation failure | `400 Bad Request` |
| Missing / invalid JWT | `401 Unauthorized` |
| Insufficient role | `403 Forbidden` |
| Resource not found | `404 Not Found` |
| Rate limit exceeded | `429 Too Many Requests` |
| Server error | `500 Internal Server Error` |

---

## 🚫 Rate Limiting

| Route Group | Window | Max Requests |
|---|---|---|
| `/api/auth/*` | 15 minutes | 10 (brute-force protection) |
| All other routes | 15 minutes | 100 |

---

## ✅ Validation

Every endpoint uses a **Zod schema** applied via middleware. This keeps controllers clean and ensures consistent error handling.

```js
const createRecordSchema = z.object({
  type:     z.enum(['income', 'expense']),
  amount:   z.number().positive(),
  date:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.string().min(1).max(100),
  notes:    z.string().max(500).optional()
});
```

Validation errors return structured field-level errors, not generic 400s.

---

## 📡 Full API Reference

> Interactive docs at `http://localhost:3000/api/docs` (Swagger UI)

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | None | Register + auto-create finance dashboard |
| `POST` | `/api/auth/login` | None | Login, receive JWT |
| `GET`  | `/api/auth/me` | JWT | Get current user |

### Finances

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET`    | `/api/finances` | Any | List all your finances |
| `POST`   | `/api/finances` | Any | Create new finance dashboard |
| `GET`    | `/api/finances/:id` | Viewer+ | Finance details |
| `PUT`    | `/api/finances/:id` | Admin+ | Update finance |
| `DELETE` | `/api/finances/:id` | Owner | Delete finance |
| `POST`   | `/api/finances/:id/users` | Admin+ | Add user |
| `PATCH`  | `/api/finances/:id/users/:userId` | Owner | Change user role |
| `DELETE` | `/api/finances/:id/users/:userId` | Owner | Remove user |

### Records

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET`    | `/api/finances/:id/records` | Viewer+ | List records (filter + paginate) |
| `POST`   | `/api/finances/:id/records` | Admin+ | Create record |
| `PUT`    | `/api/finances/:id/records/:rId` | Admin+ | Update record |
| `DELETE` | `/api/finances/:id/records/:rId` | Admin+ | Delete record |

### Analytics (Analyst+ role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/finances/:id/analytics/summary` | Income, expense, net balance |
| `GET` | `/api/finances/:id/analytics/category-breakdown` | Per-category totals |
| `GET` | `/api/finances/:id/analytics/trends` | Time-series income vs expense |
| `GET` | `/api/finances/:id/analytics/category-trends` | Category-wise over time |

---

## 🧪 Testing

```bash
npm test               # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

### Coverage

- **Auth flows:** register, login, duplicate email, wrong password, expired JWT
- **RBAC:** viewer blocked from writes, analyst blocked from admin actions
- **Records:** full CRUD, filtering, pagination edge cases
- **Analytics:** summary accuracy, category aggregation, trends grouping
- **Validation:** missing fields, wrong types, invalid dates

---

## 🧠 Design Decisions

| Decision | Reason |
|---|---|
| **Ledger records, no stored totals** | Analytics always reflect the current state — edits/deletes are automatically accounted for |
| **RBAC at middleware AND DB level** | Defense in depth — role is checked before the controller runs, and the DB query verifies finance membership |
| **Reusable `buildDateFilter()`** | Single source of truth for date logic — used across 4+ analytics endpoints |
| **Zod in middleware, not controllers** | Controllers stay focused on business logic; validation failures short-circuit before any DB access |
| **Categories scoped per finance** | Prevents cross-tenant category leakage |
| **PostgreSQL transactions on multi-step ops** | Prevents partial writes (e.g. user registered but dashboard not created) |
| **In-memory rate limiting** | Sufficient for single-instance; Redis is the noted upgrade path for distributed environments |

---

## 🚀 Scalability

**Already implemented:**
- Indexed queries on `finance_id`, `user_id`, `date`, `type`
- Pagination on all list endpoints — no unbounded queries
- Modular controller architecture — straightforward to extract into services

**Planned improvements:**
- Redis-backed rate limiting (for multi-instance deployments)
- Response caching for analytics endpoints
- Cursor-based pagination for high-volume record lists
- Read replicas for analytics query offloading

---

## 📌 Assumptions

- A user always has at least one finance dashboard (created automatically on registration)
- Amounts are stored in decimal; currency handling is out of scope (single-currency assumed)
- Soft delete is not implemented — deletions are hard deletes (noted as future improvement)
- Rate limiting is in-memory and will reset on server restart

---

## 📬 Contact

**Sagar Akolkar**
B.Tech CSE · SIH 2025 National Winner · Freelance Dev @ Pit Labs

📧 akolkarsagar14@gmail.com
📱 +91 73918 53204

---

<div align="center">

Built with intent — not just CRUD. Every design decision has a reason.

</div>
