package clob

import (
	"sort"
	"sync"
	"time"

	"github.com/kavan-shetty/prediction/backend-go/internal/models"
)

// OrderBook manages thread-safe Level-2 Bids and Asks for a single market outcome
type OrderBook struct {
	mu        sync.RWMutex
	MarketID  string
	Outcome   string
	Bids      []*models.Order // Sorted highest price first (Best Bid)
	Asks      []*models.Order // Sorted lowest price first (Best Ask)
	LastPrice int64
	Volume24h int64
}

// NewOrderBook creates a new initialized Level-2 Order Book in RAM
func NewOrderBook(marketID, outcome string) *OrderBook {
	return &OrderBook{
		MarketID:  marketID,
		Outcome:   outcome,
		Bids:      make([]*models.Order, 0),
		Asks:      make([]*models.Order, 0),
		LastPrice: 50, // Default baseline 50 cents (50% implied probability)
	}
}

// AddOrder inserts an order into the book and re-sorts by Price-Time priority
func (ob *OrderBook) AddOrder(order *models.Order) {
	if order.Side == models.Buy {
		ob.Bids = append(ob.Bids, order)
		// Sort descending by Price, then ascending by Timestamp (earliest first)
		sort.Slice(ob.Bids, func(i, j int) bool {
			if ob.Bids[i].Price == ob.Bids[j].Price {
				return ob.Bids[i].Timestamp.Before(ob.Bids[j].Timestamp)
			}
			return ob.Bids[i].Price > ob.Bids[j].Price
		})
	} else {
		ob.Asks = append(ob.Asks, order)
		// Sort ascending by Price, then ascending by Timestamp
		sort.Slice(ob.Asks, func(i, j int) bool {
			if ob.Asks[i].Price == ob.Asks[j].Price {
				return ob.Asks[i].Timestamp.Before(ob.Asks[j].Timestamp)
			}
			return ob.Asks[i].Price < ob.Asks[j].Price
		})
	}
}

// RemoveOrder deletes an order by ID when cancelled or completely filled
func (ob *OrderBook) RemoveOrder(orderID string) {
	for i, o := range ob.Bids {
		if o.ID == orderID {
			ob.Bids = append(ob.Bids[:i], ob.Bids[i+1:]...)
			return
		}
	}
	for i, o := range ob.Asks {
		if o.ID == orderID {
			ob.Asks = append(ob.Asks[:i], ob.Asks[i+1:]...)
			return
		}
	}
}

// GetSnapshot returns a thread-safe aggregated Level-2 depth chart for WebSockets
func (ob *OrderBook) GetSnapshot() *models.OrderBookSnapshot {
	ob.mu.RLock()
	defer ob.mu.RUnlock()

	bidsMap := make(map[int64]*models.Level2Entry)
	for _, o := range ob.Bids {
		remaining := o.Shares - o.FilledShares
		if remaining <= 0 {
			continue
		}
		entry, exists := bidsMap[o.Price]
		if !exists {
			entry = &models.Level2Entry{Price: o.Price, Shares: 0, OrdersCount: 0}
			bidsMap[o.Price] = entry
		}
		entry.Shares += remaining
		entry.OrdersCount++
	}

	asksMap := make(map[int64]*models.Level2Entry)
	for _, o := range ob.Asks {
		remaining := o.Shares - o.FilledShares
		if remaining <= 0 {
			continue
		}
		entry, exists := asksMap[o.Price]
		if !exists {
			entry = &models.Level2Entry{Price: o.Price, Shares: 0, OrdersCount: 0}
			asksMap[o.Price] = entry
		}
		entry.Shares += remaining
		entry.OrdersCount++
	}

	bidsSlice := make([]models.Level2Entry, 0, len(bidsMap))
	for _, e := range bidsMap {
		bidsSlice = append(bidsSlice, *e)
	}
	sort.Slice(bidsSlice, func(i, j int) bool { return bidsSlice[i].Price > bidsSlice[j].Price })

	asksSlice := make([]models.Level2Entry, 0, len(asksMap))
	for _, e := range asksMap {
		asksSlice = append(asksSlice, *e)
	}
	sort.Slice(asksSlice, func(i, j int) bool { return asksSlice[i].Price < asksSlice[j].Price })

	return &models.OrderBookSnapshot{
		MarketID:  ob.MarketID,
		Outcome:   ob.Outcome,
		Timestamp: time.Now().UnixMilli(),
		Bids:      bidsSlice,
		Asks:      asksSlice,
		LastPrice: ob.LastPrice,
		Volume24h: ob.Volume24h,
	}
}
