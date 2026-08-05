export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export async function fetchGroups() {
  const res = await fetch(`${BASE_URL}/groups`);
  if (!res.ok) throw new Error('Failed to fetch groups');
  return res.json();
}

export async function createGroup(name: string) {
  const res = await fetch(`${BASE_URL}/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error('Failed to create group');
  return res.json();
}

export async function joinGroup(invite_code: string) {
  const res = await fetch(`${BASE_URL}/groups/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invite_code })
  });
  if (!res.ok) throw new Error('Failed to join group');
  return res.json();
}

export async function fetchGroupMarkets(group_id: string) {
  const res = await fetch(`${BASE_URL}/markets/group/${group_id}`);
  if (!res.ok) throw new Error('Failed to fetch markets');
  return res.json();
}

export async function createMarket(group_id: string, question: string, outcomes: { text: string }[]) {
  const res = await fetch(`${BASE_URL}/markets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ group_id, question, outcomes })
  });
  if (!res.ok) throw new Error('Failed to create market');
  return res.json();
}

export async function fetchMarketDetail(market_id: string) {
  const res = await fetch(`${BASE_URL}/markets/detail/${market_id}`);
  if (!res.ok) throw new Error('Failed to fetch market details');
  return res.json();
}

export async function placeTrade(market_id: string, outcome_id: string, amount: number) {
  const res = await fetch(`${BASE_URL}/trades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ market_id, outcome_id, amount })
  });
  if (!res.ok) throw new Error('Failed to place trade');
  return res.json();
}

export async function deleteMarket(market_id: string) {
  const res = await fetch(`${BASE_URL}/markets/${market_id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete market');
  return res.json();
}
