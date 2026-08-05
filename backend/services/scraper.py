import os
import json
import asyncio
import feedparser
from anthropic import Anthropic
from datetime import datetime
import uuid

# In-memory storage for the MVP, backed by a JSON file
PENDING_MARKETS_FILE = os.path.join(os.path.dirname(__file__), '../pending_markets.json')

RSS_FEEDS = [
    "https://news.google.com/rss/search?q=technology+announces+OR+plans+OR+expected&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=economy+inflation+OR+rates+OR+fed&hl=en-US&gl=US&ceid=US:en"
]

def load_pending_markets():
    if os.path.exists(PENDING_MARKETS_FILE):
        try:
            with open(PENDING_MARKETS_FILE, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            return []
    return []

def save_pending_markets(markets):
    with open(PENDING_MARKETS_FILE, 'w') as f:
        json.dump(markets, f, indent=4)

async def draft_market_with_ai(title, summary, link):
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    if not anthropic_key:
        print("Scraper Error: ANTHROPIC_API_KEY is not set.")
        return None

    client = Anthropic(api_key=anthropic_key)
    
    prompt = f"""
    You are an expert prediction market creator working for a platform like Kalshi or Polymarket.
    Analyze the following news article:
    Headline: {title}
    Summary: {summary}
    Source: {link}

    If this news contains a clear, objective future event that can be resolved as YES or NO by a specific date, draft a prediction market for it.
    If it is too vague, opinion-based, or not a future event, reply with exactly "REJECT".

    Otherwise, return ONLY a raw JSON object with the following schema, no markdown wrapping, no extra text:
    {{
        "marketTitle": "Will [Event] happen before [Date]?",
        "category": "Tech, Politics, Sports, or Economy",
        "region": "Global, USA, Europe, Asia",
        "yesPrice": 0.50, // Float between 0.10 and 0.90 representing implied probability
        "noPrice": 0.50, // 1.0 - yesPrice
        "resolvesAt": "Dec 31, 2026 • Official Source Name",
        "resolutionRules": "This market resolves to YES if..."
    }}
    """

    try:
        # We use Claude 3.5 Sonnet as requested by the user for superior JSON structuring
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=500,
            temperature=0.2,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        content = response.content[0].text.strip()
        if content == "REJECT":
            return None
            
        market_data = json.loads(content)
        market_data['id'] = f"draft-{uuid.uuid4().hex[:8]}"
        market_data['headline'] = title
        market_data['summary'] = summary
        market_data['sourceUrl'] = link
        market_data['status'] = 'pending'
        market_data['createdAt'] = datetime.utcnow().isoformat()
        
        return market_data
    except Exception as e:
        print(f"Error drafting market: {e}")
        return None

async def run_scraper_cycle():
    print(f"[{datetime.utcnow().isoformat()}] Starting scraper cycle...")
    
    pending_markets = load_pending_markets()
    # Check what URLs we already processed so we don't duplicate
    processed_urls = {m['sourceUrl'] for m in pending_markets}
    
    new_markets_drafted = 0
    
    for feed_url in RSS_FEEDS:
        feed = feedparser.parse(feed_url)
        for entry in feed.entries[:5]: # Take top 5 from each feed to prevent spam
            if entry.link in processed_urls:
                continue
                
            print(f"Analyzing: {entry.title}")
            draft = await draft_market_with_ai(entry.title, entry.description, entry.link)
            
            if draft:
                print(f"✅ Drafted Market: {draft['marketTitle']}")
                pending_markets.append(draft)
                processed_urls.add(entry.link)
                new_markets_drafted += 1
            else:
                print(f"❌ Rejected by AI")
                
            # Rate limit ourselves
            await asyncio.sleep(2)
            
    if new_markets_drafted > 0:
        save_pending_markets(pending_markets)
        print(f"Saved {new_markets_drafted} new drafts to pending queue.")
    
    print("Scraper cycle complete.")

async def start_scraper_daemon(interval_seconds=3600):
    """Run the scraper in the background every hour."""
    while True:
        try:
            await run_scraper_cycle()
        except Exception as e:
            print(f"Scraper daemon error: {e}")
        
        await asyncio.sleep(interval_seconds)
