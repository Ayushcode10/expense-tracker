# 💸 Expense Tracker

A full-stack personal finance application built as a take-home assignment for **Studio Graphene**. Users can log, categorise, filter, and analyse their spending — with monthly budget tracking, a spending chart, and CSV export.

---

## 🔗 Links

| | |
|---|---|
| **Live Demo** | `https://expense-tracker-blue-gamma.vercel.app` |
| **API Base URL** | `https://expense-tracker-api-y7ob.onrender.com` |
| **GitHub Repository** | `https://github.com/Ayushcode10/expense-tracker` |

---

## ✨ Features

**Core**
- Add, edit, and delete expenses via a clean form and modal
- View all expenses sorted by newest date
- Filter by category, date range, or both simultaneously
- Summary panel showing total spent this month, highest single expense, and top spending category
- Historical month selector — view spending summaries for any of the past 24 months

**Bonus**
- Bar chart visualising total spending per category (Recharts)
- Monthly budget tracker — set per-category limits with live progress bars and over-budget alerts
- Export the currently visible (filtered) expense list to CSV
- Budget limits persisted in localStorage — survive page refresh
- Fully responsive — table layout on desktop, card layout on mobile
- Loading skeletons and contextual error states throughout
- Dual-layer validation — instant client-side feedback plus server-side enforcement

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | Component-based UI |
| Vite | Build tool and dev server |
| Axios | HTTP client with centralised API layer |
| Tailwind CSS | Utility-first responsive styling |
| Recharts | Bar chart visualisation |

### Backend
| Technology | Purpose |
|---|---|
| Spring Boot 3.2 | REST API framework |
| Spring Data JPA | ORM and query abstraction |
| H2 Database | In-memory SQL database (dev/demo) |
| Lombok | Compile-time boilerplate reduction |
| Bean Validation | Declarative request validation |

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  React Frontend                     │
│  Components → Custom Hooks → Axios Service Layer    │
└──────────────────────┬──────────────────────────────┘
                       │  HTTP / REST (JSON)
┌──────────────────────▼──────────────────────────────┐
│              Spring Boot Backend                    │
│  Controller → Service → Repository                  │
└──────────────────────┬──────────────────────────────┘
                       │  JPA / JDBC
┌──────────────────────▼──────────────────────────────┐
│               H2 In-Memory Database                 │
│  (swap to PostgreSQL for production persistence)    │
└─────────────────────────────────────────────────────┘
```

**Request flow:** The React frontend communicates with the Spring Boot backend exclusively through RESTful API calls. The backend follows a strict layered architecture — controllers handle HTTP concerns only, services own all business logic, and repositories handle data access. This separation means any layer can be swapped or tested independently.

---

## 🧠 Engineering Decisions

### Layered Backend Architecture
The backend is organised into `controller → service → repository` layers with clear boundaries. Controllers return `ResponseEntity` with explicit HTTP status codes (`201 Created`, `204 No Content`). Services contain all business logic. Repositories contain only database queries — nothing else.

### DTO Pattern
Request and response shapes are separate from the JPA entity. `ExpenseRequest` carries validation annotations; `ExpenseResponse` controls exactly which fields are exposed. This means renaming a database column never breaks the API contract.

### Validation Strategy
`@Valid` on controller method parameters triggers Bean Validation on every incoming request. A `@RestControllerAdvice` global exception handler catches `MethodArgumentNotValidException` and maps it to a consistent `400` response with a `fieldErrors` map — one error message per field. The frontend reads this map and renders inline errors without any additional parsing logic.

### Centralised Error Handling
All exceptions surface through a single `GlobalExceptionHandler`. `ResourceNotFoundException` maps to `404`. Validation failures map to `400`. An unhandled `Exception` catch-all returns `500`. Every response shares the same `ErrorResponse` shape — `status`, `message`, `timestamp`, `fieldErrors`.

### Custom React Hooks
Data fetching and state management are extracted into `useExpenses` and `useBudgets`. Components are purely presentational — they receive data and callbacks as props. This makes individual components easier to reason about, and means the data layer could switch from Axios to React Query without touching a single component.

### Budget Tracking — Frontend Computation
Budget progress is computed on the frontend from the unfiltered expense list rather than requiring a dedicated backend aggregation endpoint. A `useMemo` over `allExpenses` groups current-month spending by category in a single pass. This keeps the API surface small and makes budget numbers immediately consistent after any mutation.

### Responsive UI
The expense list renders as a full table on desktop and as stacked cards on mobile — two layouts driven by a single data source using Tailwind's `sm:` breakpoint prefix. No separate mobile components or conditional rendering logic needed.

---

## 📁 Project Structure

```
expense-tracker/
│
├── client/                        # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── SummaryCards/      # KPI cards — monthly total, highest expense, top category
│       │   ├── ExpenseForm/       # Add expense form with client-side validation
│       │   ├── EditExpenseModal/  # Edit expense modal with pre-populated fields
│       │   ├── FilterPanel/       # Category and date range filters
│       │   ├── ExpenseTable/      # Responsive table/card list + CSV export
│       │   ├── DeleteModal/       # Confirmation modal before deletion
│       │   ├── ExpenseChart/      # Recharts bar chart by category
│       │   └── BudgetTracker/     # Monthly budget inputs and progress bars
│       ├── hooks/
│       │   ├── useExpenses.js     # Expense state, API calls, filter logic, budget computation
│       │   └── useBudgets.js      # localStorage budget persistence
│       ├── services/
│       │   └── expenseService.js  # Axios instance and all API methods
│       ├── utils/
│       │   ├── constants.js       # Category list and colour map
│       │   └── formatters.js      # INR currency, date, and ISO string helpers
│       └── pages/
│           └── Dashboard.jsx      # Single page — composes all components
│
├── server/                        # Spring Boot backend
│   └── src/main/
│       ├── java/com/expensetracker/
│       │   ├── controller/        # REST endpoints, HTTP status codes
│       │   ├── service/           # Business logic
│       │   ├── repository/        # JPA queries
│       │   ├── model/             # Expense JPA entity
│       │   ├── dto/               # Request / response / error DTOs
│       │   ├── exception/         # ResourceNotFoundException + GlobalExceptionHandler
│       │   └── config/            # CORS configuration
│       └── resources/
│           ├── application.properties
│           └── data.sql           # Seed data — 18 sample expenses across 3 months
│
└── README.md
```

---

## 🔌 API Reference

**Base URL:** `http://localhost:8080`

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/expenses` | Get all expenses (filterable) |
| `POST` | `/api/expenses` | Create a new expense |
| `PUT` | `/api/expenses/{id}` | Update an existing expense |
| `DELETE` | `/api/expenses/{id}` | Delete an expense |
| `GET` | `/api/expenses/summary` | Get aggregated spending summary |

---

### `GET /api/expenses`

Optional query parameters:

| Parameter | Type | Description |
|---|---|---|
| `category` | `string` | Filter by category (case-insensitive) |
| `startDate` | `YYYY-MM-DD` | Range start (inclusive) |
| `endDate` | `YYYY-MM-DD` | Range end (inclusive) |

```
GET /api/expenses?category=Food&startDate=2026-06-01&endDate=2026-06-30
```

**`200 OK`**
```json
[
  {
    "id": 1,
    "amount": 850.00,
    "category": "Food",
    "date": "2026-06-01",
    "note": "Groceries at D-Mart",
    "createdAt": "2026-06-01T10:00:00"
  }
]
```

---

### `POST /api/expenses`

**Request body:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `amount` | `number` | ✅ | Greater than 0, max 2 decimal places |
| `category` | `string` | ✅ | Non-empty |
| `date` | `string` | ✅ | `YYYY-MM-DD` format |
| `note` | `string` | ❌ | Max 500 characters |

**`201 Created`** — returns the created expense object including generated `id` and `createdAt`.

---

### `PUT /api/expenses/{id}`
Same request body as `POST`. Returns **`200 OK`** with the updated expense, or **`404 Not Found`** if the ID does not exist.

### `DELETE /api/expenses/{id}`
Returns **`204 No Content`** on success, or **`404 Not Found`** if the ID does not exist.

---

### `GET /api/expenses/summary`

Optional query parameters: `month` (1–12) and `year`. Defaults to the current month.

**`200 OK`**
```json
{
  "totalThisMonth": 26980.00,
  "totalPerCategory": {
    "Rent": 15000.00,
    "Education": 4500.00,
    "Food": 1480.00
  },
  "highestExpense": 15000.00,
  "highestExpenseCategory": "Rent"
}
```

---

### Error Response Shape

All errors return a consistent structure:

```json
{
  "status": 400,
  "message": "Validation failed",
  "timestamp": "2026-06-07T14:30:00",
  "fieldErrors": {
    "amount": "Amount must be greater than 0",
    "category": "Category is required"
  }
}
```

---

## ⚙️ Local Setup

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | 18+ |
| Java | 17+ |
| Maven | 3.8+ — or use the included `mvnw` wrapper |

### 1. Clone

```bash
git clone https://github.com/your-username/expense-tracker.git
cd expense-tracker
```

### 2. Run the Backend

```bash
cd server
./mvnw spring-boot:run
```

Starts on `http://localhost:8080`. H2 console available at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:expensedb`, username: `sa`, no password).

### 3. Run the Frontend

```bash
cd client
cp .env.example .env.local   # set VITE_API_BASE_URL=http://localhost:8080
npm install
npm run dev
```

Starts on `http://localhost:5173`. Start the backend first — the frontend displays a connection error gracefully if the API is unreachable.

---

## 🔐 Environment Variables

### Frontend — `client/.env.local`

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080` | Backend API base URL |

### Backend — `application.properties`

| Property | Default | Description |
|---|---|---|
| `server.port` | `8080` | API server port |
| `cors.allowed-origins` | `http://localhost:5173` | Allowed frontend origin(s) |
| `spring.h2.console.enabled` | `true` | Disable in production |

---

## 🚀 Deployment

### Frontend → Vercel

1. Import the GitHub repository at [vercel.com](https://vercel.com)
2. Set **Root Directory** to `client`
3. Add environment variable: `VITE_API_BASE_URL = https://your-backend.onrender.com`
4. Deploy — Vite is auto-detected

### Backend → Render

1. Create a **Web Service** at [render.com](https://render.com) and connect the repository
2. Set **Root Directory** to `server`
3. **Build command:** `./mvnw clean package -DskipTests`
4. **Start command:** `java -jar target/expense-tracker-0.0.1-SNAPSHOT.jar`
5. Add environment variables:
   - `cors.allowed-origins` → your Vercel URL
   - `spring.h2.console.enabled` → `false`

> **Note on persistence:** H2 is in-memory — data resets on each restart. This is intentional for a demo deployment. For production persistence, the application is ready to switch to PostgreSQL: update the datasource properties and add the `postgresql` driver dependency to `pom.xml`. The application layer requires no other changes.
---
> **Note:** Render free instances spin down after periods of inactivity. The first request after inactivity may take 30–60 seconds while the backend wakes up.
---

## 📖 Key Learnings

Building this project end-to-end reinforced several concepts that are difficult to fully appreciate from tutorials alone:

- **Why DTOs matter** — early on I returned JPA entities directly from controllers. Switching to DTOs made it immediately clear how much cleaner the separation is: the database schema and API contract evolve independently.
- **React's stale closure problem** — debugging the date filter led me to understand exactly how `useEffect` dependency arrays and `useCallback` interact, and why using object references versus primitives as dependencies produces different behaviour.
- **Layered architecture in practice** — structuring the backend into controller / service / repository felt bureaucratic at the start. By the time I needed to change the summary aggregation logic, it was clear why the layers exist — I touched exactly one file.
- **Defensive frontend design** — the difference between "the filter is broken" and "there's no data in that date range" is a single, well-worded empty state. Small copy decisions have a large impact on perceived reliability.
- **BigDecimal for money** — learning through documentation that floating-point arithmetic is unsuitable for financial values, and that `BigDecimal` is the standard for anything involving currency.

---

## 🤖 AI-Assisted Development

I used AI tools during development in the following ways:

- **ChatGPT** — brainstorming the initial project architecture, debugging assistance during backend development, code reviews, and implementation guidance on Spring Boot patterns I was less familiar with.
- **Claude (Anthropic)** — frontend UX improvements (edit modal pattern, filter UX), UI refinements, and help diagnosing specific bugs such as the `useEffect` stale closure issue and the date filter not working due to mismatched seed data years.

All architectural decisions, backend implementation, API design, and integration work were completed and understood by me. AI tools were used as a development aid — similar to referencing documentation or Stack Overflow — not as a replacement for understanding the code I submitted.

---

## 🔮 Future Improvements

**Backend**
- JWT-based authentication with Spring Security — per-user expense isolation
- Pagination on `GET /api/expenses` for large datasets
- Recurring expense support with scheduled auto-entry
- Switch to PostgreSQL for durable production storage

**Frontend**
- Monthly trend line chart alongside the category bar chart
- Expense grouping by month in the table view
- Dark mode
- PWA manifest for mobile install

**Testing**
- JUnit 5 + Mockito unit tests for the service layer
- `@WebMvcTest` integration tests for each controller endpoint
- React Testing Library component tests

**Infrastructure**
- Docker Compose for single-command local setup
- GitHub Actions CI pipeline on pull requests

---

## 👤 Author

**Ayush Saxena**
B.Tech Computer Science, 2022–2026

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/Ayushcode10)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/ayushsaxena10)

---

*Built as a take-home assignment for Studio Graphene — Associate Software Engineer role.*
