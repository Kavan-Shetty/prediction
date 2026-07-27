package clob

import (
	"fmt"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/kavan-shetty/prediction/backend-go/internal/models"
)

// Engine manages all active prediction market order books in RAM
type Engine struct {
	mu     sync.RWMutex
	books  map[string]*OrderBook // Key: "marketID:outcome" e.g. "pub-1:YES"
	trades []models.Trade
}

// NewEngine initializes the central matching engine
func NewEngine() *Engine {
	return &Engine{
		books:  make(map[string]*OrderBook),
		trades: make([]models.Trade, 0),
	}
}

// GetOrCreateBook retrieves or creates a Level-2 Order Book in RAM
func (e *Engine) GetOrCreateBook(marketID, outcome string) *OrderBook {
	key := fmt.Sprintf("%s:%s", marketID, outcome)
	e.mu.Lock()
	defer e.mu.Unlock()

	ob, exists := e.books[key]
	if !exists {
		ob = NewOrderBook(marketID, outcome)
		e.books[key] = ob
	}
	return ob
}

// SubmitOrder processes an incoming order using Price-Time Priority in <1ms
func (e *Engine) SubmitOrder(incoming *models.Order) ([]models.Trade, *models.OrderBookSnapshot) {
	ob := e.GetOrCreateBook(incoming.MarketID, incoming.Outcome)
	ob.mu.Lock()
	defer ob.mu.Unlock()

	newTrades := make([]models.Trade, 0)

	if incoming.Side == models.Buy {
		// Try to match against existing Asks (Sell Orders)
		for len(ob.Asks) > 0 {
			bestAsk := ob.Asks[0]
			// If limit buy price is lower than lowest sell price, no match possible
			if incoming.Type == models.Limit && incoming.Price < bestAsk.Price {
				break
			}

			needed := incoming.Shares - incoming.FilledShares
			available := bestAsk.Shares - bestAsk.FilledShares
			tradeShares := needed
			if available < needed {
				tradeShares = available
			}

			// Execute Fill
			incoming.FilledShares += tradeShares
			bestAsk.FilledShares += tradeShares

			trade := models.Trade{
				ID:          uuid.New().String(),
				BuyOrderID:  incoming.ID,
				SellOrderID: bestAsk.ID,
				MarketID:    incoming.MarketID,
				Outcome:     incoming.Outcome,
				Price:       bestAsk.Price,
				Shares:      tradeShares,
				BuyerID:     incoming.UserID,
				SellerID:    bestAsk.UserID,
				Timestamp:   time.Now(),
			}
			newTrades = append(newTrades, trade)

			// Update Order Book stats
			ob.LastPrice = bestAsk.Price
			ob.Volume24h += (bestAsk.Price * tradeShares) / 100 // In Virtual Dollars

			// Remove fully filled ask from book
			if bestAsk.FilledShares >= bestAsk.Shares {
				bestAsk.Status = models.Filled
				ob.Asks = ob.Asks[1:]
			} else {
				bestAsk.Status = models.Partial
			}

			if incoming.FilledShares >= incoming.Shares {
				incoming.Status = models.Filled
				break
			}
		}
	} else {
		// Try to match against existing Bids (Buy Orders)
		for len(ob.Bids) > 0 {
			bestBid := ob.Bids[0]
			// If limit sell price is higher than highest buy price, no match possible
			if incoming.Type == models.Limit && incoming.Price > bestBid.Price {
				break
			}

			needed := incoming.Shares - incoming.FilledShares
			available := bestBid.Shares - bestBid.FilledShares
			tradeShares := needed
			if available < needed {
				tradeShares = available
			}

			// Execute Fill
			incoming.FilledShares += tradeShares
			bestBid.FilledShares += tradeShares

			trade := models.Trade{
				ID:          uuid.New().String(),
				BuyOrderID:  bestBid.ID,
				SellOrderID: incoming.ID,
				MarketID:    incoming.MarketID,
				Outcome:     incoming.Outcome,
				Price:       bestBid.Price,
				Shares:      tradeShares,
				BuyerID:     bestBid.UserID,
				SellerID:    incoming.UserID,
				Timestamp:   time.Now(),
			}
			newTrades = append(newTrades, trade)

			// Update Order Book stats
			ob.LastPrice = bestBid.Price
			ob.Volume24h += (bestBid.Price * tradeShares) / 100

			// Remove fully filled bid from book
			if bestBid.FilledShares >= bestBid.Shares {
				bestBid.Status = models.Filled
				ob.Bids = ob.Bids[1:]
			} else {
				bestBid.Status = models.Partial
			}

			if incoming.FilledShares >= incoming.Shares {
				incoming.Status = models.Filled
				break
			}
		}
	}

	// If order is not fully filled and is a LIMIT order, rest it on the order book
	if incoming.FilledShares < incoming.Shares && incoming.Type == models.Limit {
		if incoming.FilledShares > 0 {
			incoming.Status = models.Partial
		} else {
			incoming.Status = models.Open
		}
		if incoming.Side == models.Buy {
			ob.Bids = append(ob.Bids, incoming)
		} else {
			ob.Asks = append(ob.Asks, incoming)
		}
	}

	e.mu.Lock()
	e.trades = append(e.trades, newTrades...)
	e.mu.Unlock()

	return newTrades, ob.GetSnapshot()
}
