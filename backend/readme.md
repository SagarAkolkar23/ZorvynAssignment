🚀 Setup & Running Guide
Everything you need to get the Finance Management Backend running locally from scratch.

Prerequisites
Make sure you have these installed before starting:
ToolVersionCheckNode.js>= 18node -vnpm>= 9npm -vPostgreSQL>= 14psql --version

Step 1 — Clone the Repository
git clone -> https://github.com/SagarAkolkar23/ZorvynAssignment.git
cd backend

Step 2 — Install Dependencies
npm install

Step 3 — Set Up PostgreSQL Database
Open your PostgreSQL shell and create the database:
psql -U postgres
sqlCREATE DATABASE Zorvyn;
\q

If you already have a database named Zorvyn, skip this step.

Step 4 — Configure Environment Variables
Create a .env file in the root of the project:
cp .env.example .env
Then open .env and set it to exactly this:

PORT=3005
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DB_HOST=localhost
DB_PORT=5432
DB_USER=userName
DB_PASSWORD=password
DB_NAME=Database name

Note: JWT_SECRET can be any long random string. In production, use something like openssl rand -hex 64 to generate one.



Step 5 — Start the Server
Development (hot reload with nodemon):
npm run dev
Production:
npm start
You should see:
🚀 Server running on http://localhost:3005
📦 Connected to PostgreSQL — Zorvyn
📖 API Docs available at http://localhost:3005/api-docs

Verify It's Working
Test the health check endpoint:
curl http://localhost:3005/api/health
Expected response:
json{
"success": true,
"message": "Server is running"
}

Quick API Test
Register a new user
curl -X POST http://localhost:3005/api/auth/register \
 -H "Content-Type: application/json" \
 -d '{
"name": "Sagar Akolkar",
"email": "sagar@example.com",
"password": "securepassword123"
}'
Login
curl -X POST http://localhost:3005/api/auth/login \
 -H "Content-Type: application/json" \
 -d '{
"email": "sagar@example.com",
"password": "securepassword123"
}'
Copy the token from the response and use it in subsequent requests:
curl http://localhost:3005/api/finances \
 -H "Authorization: Bearer YOUR_TOKEN_HERE"

API Documentation
Swagger UI is available at:
http://localhost:3005/api-docs
All endpoints, request schemas, and response formats are documented there. No external tool needed.


Project Structure
finance-backend/
├── src/
│ ├── config/
│ │ └── database.js # PostgreSQL connection (uses .env)
│ ├── middleware/
│ │ ├── auth.js # JWT verification
│ │ ├── rbac.js # Role-based access control
│ │ ├── validate.js # Zod input validation
│ │ └── rateLimiter.js # Rate limiting config
│ ├── controllers/
│ │ ├── auth.controller.js
│ │ ├── finance.controller.js
│ │ ├── record.controller.js
│ │ └── analytics.controller.js
│ ├── routes/
│ │ ├── auth.routes.js
│ │ ├── finance.routes.js
│ │ ├── record.routes.js
│ │ └── analytics.routes.js
│ ├── schemas/ # Zod validation schemas
│ ├── utils/
│ │ └── buildDateFilter.js # Reusable date filter utility
│ └── app.js
├── migrations/ # SQL migration files
├── tests/ # Jest + Supertest tests
├── .env.example # Environment variable template
├── .env # Your local config (not committed)
├── .gitignore
└── package.json

Troubleshooting
ECONNREFUSED — cannot connect to PostgreSQL
PostgreSQL is not running. Start it:


Environment Variables Reference
PORT 3005
JWT_SECRET any long stringSecret used to sign JWT tokens — keep this private
DB_HOST localhost
DB_PORT 5432  
DB_USER username 
DB_PASSWORD password 
DB_NAME DatabaseName


Once the server is running, head to http://localhost:3005/api-docs for the full interactive API reference.
