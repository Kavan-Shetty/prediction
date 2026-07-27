# 🚀 Predictor Institutional Golang CLOB Engine (`/backend-go`)

This microservice is the **Central Limit Order Book (CLOB) Price-Time Priority Matching Engine** for Predictor, written in **Golang**. It is designed to match virtual cash prediction orders in **sub-2 milliseconds** and broadcast real-time Level-2 order book depth over WebSockets to 25,000+ simultaneous users.

---

## 🏛️ Architecture Overview

```text
[ React Frontend (Vercel) ]
     │      ▲
     │      │ (REST & WebSockets /ws/orderbook/:id)
     ▼      │
[ Golang CLOB Engine (:8080) ] ◄── (REST Webhook) ── [ Python AI News Oracle ]
     │                                                     │
     ▼                                                     ▼
[ Redis In-Memory Cache ]                              [ Supabase PostgreSQL ]
```

### Key Modules
1. **`internal/clob/orderbook.go`**: Thread-safe Level-2 Order Book using `sync.RWMutex`. Sorts Bids (highest price first) and Asks (lowest price first).
2. **`internal/clob/engine.go`**: Institutional **Price-Time Priority** order matching loop. When a Buy or Sell limit order arrives, it matches against resting liquidity, generates fills (`Trade`), and updates 24h volume.
3. **`internal/clob/amm.go`**: **Automated Market Maker (AMM) Bot**. When a new prediction market is listed across our 50 target countries, the AMM seeds an initial ladder of bids and asks around the baseline probability so human users never encounter an empty order book.
4. **`cmd/server/main.go`**: **Fiber v2** HTTP server and **gorilla/websocket** broadcast hub.

---

## ⚡ API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/orders/create` | Submit a Limit or Market order. Returns instant fills and new Level-2 depth. |
| `GET` | `/api/v1/markets/:id/orderbook` | Get Level-2 order book depth for any market ID. |
| `POST` | `/api/v1/admin/markets/create` | Ingestion webhook for the Python AI sidecar to auto-create and seed markets. |
| `WS` | `/ws/orderbook/:id` | Live WebSocket stream broadcasting Level-2 depth changes in real-time. |

---

## 🐳 Running with Docker

Because this service is built with a multi-stage Dockerfile, you do not even need Golang installed on your host machine!

```bash
# Build the 15MB lightweight Docker image
docker build -t predictor-clob-go .

# Run the container on port 8080
docker run -p 8080:8080 predictor-clob-go
```

## 🛠️ Running locally with Go (if installed)

```bash
go mod download
go run cmd/server/main.go
```
