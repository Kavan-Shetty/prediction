import pytest
from core.amm import CPMMEngine

def test_cpmm_equal_pools():
    # Initial state: 1000 YES, 1000 NO
    outcomes = [
        {"id": "yes", "shares_pool": 1000.0},
        {"id": "no", "shares_pool": 1000.0}
    ]
    
    # Buy YES for $100
    shares_bought, new_pools = CPMMEngine.calculate_trade(outcomes, "yes", 100.0)
    
    # K = 1,000,000
    # No pool becomes 1100
    # Yes pool becomes 1,000,000 / 1100 = 909.09
    # Shares bought = 1000 - 909.09 = 90.91
    
    assert round(shares_bought, 2) == 90.91
    assert new_pools["no"] == 1100.0
    assert round(new_pools["yes"], 2) == 909.09
    
    # Test new prices
    prices = CPMMEngine.calculate_prices(new_pools)
    assert prices["yes"] + prices["no"] == 1.0
    assert prices["yes"] > 0.50 # Price of YES should go up

def test_cpmm_three_outcomes():
    # 3 outcomes, equal pools
    outcomes = [
        {"id": "A", "shares_pool": 1000.0},
        {"id": "B", "shares_pool": 1000.0},
        {"id": "C", "shares_pool": 1000.0}
    ]
    
    # Buy A for $100
    shares_bought, new_pools = CPMMEngine.calculate_trade(outcomes, "A", 100.0)
    
    assert new_pools["B"] == 1100.0
    assert new_pools["C"] == 1100.0
    
    # Initial K = 1,000,000,000
    # New B * C = 1,210,000
    # New A = 1,000,000,000 / 1,210,000 = 826.446
    # Shares bought = 1000 - 826.446 = 173.55
    assert round(shares_bought, 2) == 173.55
    
    prices = CPMMEngine.calculate_prices(new_pools)
    assert round(prices["A"] + prices["B"] + prices["C"], 4) == 1.0

def test_negative_trade():
    outcomes = [{"id": "yes", "shares_pool": 1000.0}, {"id": "no", "shares_pool": 1000.0}]
    with pytest.raises(ValueError, match="positive"):
        CPMMEngine.calculate_trade(outcomes, "yes", -50.0)

def test_invalid_outcome():
    outcomes = [{"id": "yes", "shares_pool": 1000.0}, {"id": "no", "shares_pool": 1000.0}]
    with pytest.raises(ValueError, match="not found"):
        CPMMEngine.calculate_trade(outcomes, "maybe", 100.0)
