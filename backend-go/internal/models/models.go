package models

import (
	"time"
)

type OrderSide string
type OrderType string
type OrderStatus string

const (
	Buy  OrderSide = "BUY"
	Sell OrderSide = "SELL"

	Limit  OrderType = "LIMIT"
	Market OrderType = "MARKET"

	Open      OrderStatus = "OPEN"
	Partial   OrderStatus = "PARTIAL"
	Filled    OrderStatus = "FILLED"
	Cancelled OrderStatus = "CANCELLED"
)

// Order represents a single Virtual Cash / EIP-712 limit or market order
type Order struct {
	ID           string      `json:"id"`
	UserID       string      `json:"userId"`
	MarketID     string      `json:"marketId"`
	Outcome      string      `json:"outcome"`      // "YES" or "NO"
	Side         OrderSide   `json:"side"`         // "BUY" or "SELL"
	Type         OrderType   `json:"type"`         // "LIMIT" or "MARKET"
	Price        int64       `json:"price"`        // In cents (1 to 99)
	Shares       int64       `json:"shares"`       // Total contract shares requested
	FilledShares int64       `json:"filledShares"` // Shares executed so far
	Status       OrderStatus `json:"status"`
	Timestamp    time.Time   `json:"timestamp"`
}

// Trade represents an executed fill between a Buyer and Seller in RAM
type Trade struct {
	ID          string    `json:"id"`
	BuyOrderID  string    `json:"buyOrderId"`
	SellOrderID string    `json:"sellOrderId"`
	MarketID    string    `json:"marketId"`
	Outcome     string    `json:"outcome"`
	Price       int64     `json:"price"`  // Execution price in cents
	Shares      int64     `json:"shares"` // Number of shares traded
	BuyerID     string    `json:"buyerId"`
	SellerID    string    `json:"sellerId"`
	Timestamp   time.Time `json:"timestamp"`
}

// Level2Entry represents a single price level aggregated in the order book
type Level2Entry struct {
	Price       int64 `json:"price"`
	Shares      int64 `json:"shares"`
	OrdersCount int   `json:"ordersCount"`
}

// OrderBookSnapshot represents the live Level-2 depth sent to frontend WebSockets
type OrderBookSnapshot struct {
	MarketID    string        `json:"marketId"`
	Outcome     string        `json:"outcome"`
	Timestamp   int64         `json:"timestamp"`
	Bids        []Level2Entry `json:"bids"` // Sorted highest price first
	Asks        []Level2Entry `json:"asks"` // Sorted lowest price first
	LastPrice   int64         `json:"lastPrice"`
	Volume24h   int64         `json:"volume24h"`
}

// MarketCreateRequest from our Python AI News sidecar
type MarketCreateRequest struct {
	ID               string `json:"id"`
	Title            string `json:"title"`
	Category         string `json:"category"`
	RegionScope      string `json:"regionScope"`      // e.g. "ASIA", "EUROPE", "GLOBAL"
	ResolutionSource string `json:"resolutionSource"` // e.g. "https://www.rbi.org.in"
	SeedLiquidity    int64  `json:"seedLiquidity"`    // Virtual Cash bankroll for AMM bot
}
