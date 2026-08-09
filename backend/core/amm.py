from typing import List, Dict, Tuple

class CPMMEngine:
    """
    Constant Product Market Maker (CPMM) Engine.
    Implements the x * y = k invariant for prediction markets.
    """
    
    @staticmethod
    def calculate_trade(
        outcomes: List[Dict[str, float]], 
        target_outcome_id: str, 
        amount: float
    ) -> Tuple[float, Dict[str, float]]:
        """
        Calculates the result of a trade using CPMM.
        
        Args:
            outcomes: List of dicts with 'id' and 'shares_pool'
            target_outcome_id: The ID of the outcome being bought
            amount: The USD amount being invested
            
        Returns:
            Tuple of (shares_bought, dict_of_new_pools)
        """
        if amount <= 0:
            raise ValueError("Trade amount must be positive")
            
        target_outcome = next((o for o in outcomes if o["id"] == target_outcome_id), None)
        if not target_outcome:
            raise ValueError("Target outcome not found in market")
            
        # Calculate initial K (constant product)
        k = 1.0
        for o in outcomes:
            k *= o["shares_pool"]
            
        # Distribute investment into all other pools
        new_other_pools = {}
        for o in outcomes:
            if o["id"] != target_outcome_id:
                new_other_pools[o["id"]] = o["shares_pool"] + amount
                
        # Calculate new target pool to maintain K
        new_k_partial = 1.0
        for val in new_other_pools.values():
            new_k_partial *= val
            
        new_target_pool = k / new_k_partial
        shares_bought = target_outcome["shares_pool"] - new_target_pool
        
        if shares_bought <= 0:
            raise ValueError("Trade amount too small or slippage too high")
            
        updated_pools = new_other_pools.copy()
        updated_pools[target_outcome_id] = new_target_pool
        
        return round(shares_bought, 2), updated_pools

    @staticmethod
    def calculate_prices(pools: Dict[str, float]) -> Dict[str, float]:
        """
        Calculates the exact implied probabilities (prices) for each outcome
        using inverse proportionality, ensuring prices sum to 1.0.
        """
        inv_sum = sum(1.0 / p for p in pools.values())
        
        prices = {}
        for o_id, pool_val in pools.items():
            new_price = (1.0 / pool_val) / inv_sum
            prices[o_id] = round(new_price, 4)
            
        return prices
