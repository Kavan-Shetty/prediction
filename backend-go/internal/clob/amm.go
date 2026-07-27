package clob

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/kavan-shetty/prediction/backend-go/internal/models"
)

// SeedMarketLiquidity deploys an Automated Market Maker (AMM) bot to seed initial order book depth
func (e *Engine) SeedMarketLiquidity(marketID string, initialPriceCents int64, bankroll int64) {
	botID := "amm-liquidity-bot-001"
	timestamp := time.Now()

	// Place a ladder of bids and asks around the initial baseline probability (e.g. 50 cents)
	// Example ladder: if initialPrice is 50, buy at 48, 46, 44, 40 and sell at 52, 54, 56, 60
	bidSpreads := []int64{2, 4, 6, 10}
	askSpreads := []int64{2, 4, 6, 10}

	for _, spread := range bidSpreads {
		price := initialPriceCents - spread
		if price <= 0 {
			price = 1
		}
		shares := (bankroll / 10) / price // Allocate 10% of bankroll per level

		order := &models.Order{
			ID:        fmt.Sprintf("amm-bid-%s-%d", uuid.New().String()[:8], price),
			UserID:    botID,
			MarketID:  marketID,
			Outcome:   "YES",
			Side:      models.Buy,
			Type:      models.Limit,
			Price:     price,
			Shares:    shares,
			Status:    models.Open,
			Timestamp: timestamp,
		}
		e.SubmitOrder(order)
	}

	for _, spread := range askSpreads {
		price := initialPriceCents + spread
		if price >= 100 {
			price = 99
		}
		shares := (bankroll / 10) / price

		order := &models.Order{
			ID:        fmt.Sprintf("amm-ask-%s-%d", uuid.New().String()[:8], price),
			UserID:    botID,
			MarketID:  marketID,
			Outcome:   "YES",
			Side:      models.Sell,
			Type:      models.Limit,
			Price:     price,
			Shares:    shares,
			Status:    models.Open,
			Timestamp: timestamp,
		}
		e.SubmitOrder(order)
	}
}
