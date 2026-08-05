import os
import json
import asyncio
import feedparser
from anthropic import Anthropic
from datetime import datetime
import uuid
import spacy
from textblob import TextBlob

# Load spaCy NLP model lazily to avoid startup crashes if not downloaded yet
nlp = None
def get_nlp():
    global nlp
    if nlp is None:
        try:
            nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("Warning: spaCy en_core_web_sm not found. Run: python -m spacy download en_core_web_sm")
            nlp = None
    return nlp

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


# --- TIER 1: Anthropic API ---
async def draft_with_anthropic(title, summary, link):
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    if not anthropic_key:
        raise ValueError("ANTHROPIC_API_KEY not set")

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
        "yesPrice": 0.50,
        "noPrice": 0.50,
        "resolvesAt": "Dec 31, 2026 • Official Source Name",
        "resolutionRules": "This market resolves to YES if..."
    }}
    """
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=500,
        temperature=0.2,
        messages=[{"role": "user", "content": prompt}]
    )
    
    content = response.content[0].text.strip()
    if content == "REJECT":
        return None
        
    return json.loads(content)


# --- TIER 2: Local spaCy NLP Heuristics ---
def draft_with_spacy(title, summary, link):
    local_nlp = get_nlp()
    if not local_nlp:
        return None
        
    doc = local_nlp(title)
    
    # Extract the main Entity (ORG, PERSON, GPE)
    main_entity = None
    for ent in doc.ents:
        if ent.label_ in ["ORG", "PERSON", "GPE"]:
            main_entity = ent.text
            break
            
    if not main_entity:
        return None # Too generic to build a heuristic template
        
    # Calculate implied probability using TextBlob sentiment polarity (-1.0 to 1.0)
    # If polarity is highly positive, probability shifts toward 90%. If negative, toward 10%.
    blob = TextBlob(title)
    polarity = blob.sentiment.polarity
    
    # Base is 0.50. Polarity (-1 to 1) shifts it by up to 0.40 in either direction.
    yes_price = 0.50 + (polarity * 0.40)
    yes_price = round(max(0.10, min(0.90, yes_price)), 2)
    no_price = round(1.0 - yes_price, 2)
        
    return {
        "marketTitle": f"Will {main_entity} successfully execute plans reported today?",
        "category": "Heuristic (Auto-Generated)",
        "region": "Global",
        "yesPrice": yes_price,
        "noPrice": no_price,
        "resolvesAt": "Dec 31, 2026 • News Source",
        "resolutionRules": f"This is a fallback market generated via NLP heuristics. It resolves to YES if {main_entity} successfully accomplishes the primary action mentioned in this headline: '{title}'."
    }


# --- The Resilience Wrapper ---
async def draft_market_with_resilience(title, summary, link):
    draft = None
    try:
        # Tier 1: Try Anthropic
        draft = await draft_with_anthropic(title, summary, link)
    except Exception as e:
        print(f"⚠️ Tier 1 (Anthropic) failed: {e}. Falling back to Tier 2 (spaCy)...")
        
        try:
            # Tier 2: Try Local NLP
            draft = draft_with_spacy(title, summary, link)
        except Exception as e2:
            print(f"❌ Tier 2 (spaCy) failed: {e2}")
            return None
            
    if not draft:
        return None
        
    # Append common metadata
    draft['id'] = f"draft-{uuid.uuid4().hex[:8]}"
    draft['headline'] = title
    draft['summary'] = summary
    draft['sourceUrl'] = link
    draft['status'] = 'pending'
    draft['createdAt'] = datetime.utcnow().isoformat()
    return draft


async def run_scraper_cycle():
    print(f"[{datetime.utcnow().isoformat()}] Starting scraper cycle...")
    
    pending_markets = load_pending_markets()
    processed_urls = {m['sourceUrl'] for m in pending_markets}
    new_markets_drafted = 0
    
    for feed_url in RSS_FEEDS:
        feed = feedparser.parse(feed_url)
        for entry in feed.entries[:5]: 
            if entry.link in processed_urls:
                continue
                
            print(f"Analyzing: {entry.title}")
            draft = await draft_market_with_resilience(entry.title, entry.description, entry.link)
            
            if draft:
                print(f"✅ Drafted Market: {draft['marketTitle']}")
                pending_markets.append(draft)
                processed_urls.add(entry.link)
                new_markets_drafted += 1
            else:
                print(f"❌ Rejected by AI/NLP")
                
            await asyncio.sleep(2)
            
    if new_markets_drafted > 0:
        save_pending_markets(pending_markets)
        print(f"Saved {new_markets_drafted} new drafts to pending queue.")
    
    print("Scraper cycle complete.")

async def start_scraper_daemon(interval_seconds=3600):
    while True:
        try:
            await run_scraper_cycle()
        except Exception as e:
            print(f"Scraper daemon error: {e}")
        await asyncio.sleep(interval_seconds)
