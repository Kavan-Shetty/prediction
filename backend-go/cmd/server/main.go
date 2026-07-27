package main

import (
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/websocket/v2"
	"github.com/google/uuid"
	"github.com/kavan-shetty/prediction/backend-go/internal/clob"
	"github.com/kavan-shetty/prediction/backend-go/internal/models"
)

// WebSocket Hub for live order book broadcasting
type Hub struct {
	mu          sync.RWMutex
	connections map[string]map[*websocket.Conn]bool // Key: marketID
}

func NewHub() *Hub {
	return &Hub{
		connections: make(map[string]map[*websocket.Conn]bool),
	}
}

func (h *Hub) Register(marketID string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if _, exists := h.connections[marketID]; !exists {
		h.connections[marketID] = make(map[*websocket.Conn]bool)
	}
	h.connections[marketID][conn] = true
	log.Printf("[WebSocket] Client connected to market: %s", marketID)
}

func (h *Hub) Unregister(marketID string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if conns, exists := h.connections[marketID]; exists {
		delete(conns, conn)
	}
	log.Printf("[WebSocket] Client disconnected from market: %s", marketID)
}

func (h *Hub) Broadcast(marketID string, snapshot *models.OrderBookSnapshot) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	conns, exists := h.connections[marketID]
	if !exists {
		return
	}
	payload, _ := json.Marshal(snapshot)
	for conn := range conns {
		if err := conn.WriteMessage(websocket.TextMessage, payload); err != nil {
			log.Printf("[WebSocket Error] Failed to send: %v", err)
			conn.Close()
		}
	}
}

func main() {
	engine := clob.NewEngine()
	hub := NewHub()

	// Seed initial 50-country demo markets with AMM liquidity
	engine.SeedMarketLiquidity("pub-15-ipl-2027", 52, 10000)
	engine.SeedMarketLiquidity("pub-1-us-election-2028", 32, 25000)

	app := fiber.New(fiber.Config{
		AppName: "Predictor Golang CLOB Engine v1.0",
	})

	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	// Health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
			"engine": "Golang CLOB Price-Time Priority",
			"uptime": time.Now().Unix(),
		})
	})

	// 1. Submit Order REST Endpoint (POST /api/v1/orders/create)
	app.Post("/api/v1/orders/create", func(c *fiber.Ctx) error {
		var req models.Order
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid order payload"})
		}
		if req.ID == "" {
			req.ID = uuid.New().String()
		}
		if req.Timestamp.IsZero() {
			req.Timestamp = time.Now()
		}

		trades, snapshot := engine.SubmitOrder(&req)
		
		// Broadcast updated Level-2 depth to all live WebSocket subscribers
		go hub.Broadcast(req.MarketID, snapshot)

		return c.JSON(fiber.Map{
			"status":   "success",
			"orderId":  req.ID,
			"trades":   trades,
			"snapshot": snapshot,
		})
	})

	// 2. Get Level-2 Order Book Snapshot (GET /api/v1/markets/:id/orderbook)
	app.Get("/api/v1/markets/:id/orderbook", func(c *fiber.Ctx) error {
		marketID := c.Params("id")
		outcome := c.Query("outcome", "YES")
		ob := engine.GetOrCreateBook(marketID, outcome)
		return c.JSON(ob.GetSnapshot())
	})

	// 3. Admin Market Creation Webhook from Python AI Sidecar (POST /api/v1/admin/markets/create)
	app.Post("/api/v1/admin/markets/create", func(c *fiber.Ctx) error {
		var req models.MarketCreateRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid market creation payload"})
		}
		
		// Initialize book and seed AMM liquidity
		engine.SeedMarketLiquidity(req.ID, 50, req.SeedLiquidity)
		log.Printf("[Admin] Created new market from AI oracle: %s (%s)", req.Title, req.Category)

		return c.JSON(fiber.Map{
			"status":   "created",
			"marketId": req.ID,
			"message":  fmt.Sprintf("Market '%s' seeded with $%d Virtual Cash liquidity", req.Title, req.SeedLiquidity),
		})
	})

	// 4. Live WebSocket Order Book Stream (WS /ws/orderbook/:id)
	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	app.Get("/ws/orderbook/:id", websocket.New(func(c *websocket.Conn) {
		marketID := c.Params("id")
		hub.Register(marketID, c)
		defer hub.Unregister(marketID, c)

		// Send initial snapshot immediately upon connecting
		ob := engine.GetOrCreateBook(marketID, "YES")
		c.WriteJSON(ob.GetSnapshot())

		for {
			// Keep connection alive and listen for client ping/messages
			_, _, err := c.ReadMessage()
			if err != nil {
				break
			}
		}
	}))

	log.Println("🚀 Predictor Golang CLOB Engine running on :8080...")
	log.Fatal(app.Listen(":8080"))
}
