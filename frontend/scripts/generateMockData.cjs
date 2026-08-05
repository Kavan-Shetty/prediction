const fs = require('fs');
const path = require('path');

const CATEGORIES = ['Economy & RBI', 'AI & Tech', 'Sports', 'Politics & Law', 'Crypto & DeFi', 'Entertainment'];
const REGIONS = ['India & South Asia', 'USA & Americas', 'Europe & UK', 'Asia-Pacific', 'Global'];
const SOURCES = ['Economic Times', 'TechCrunch', 'Reuters', 'Bloomberg', 'IGN News', 'ESPN Cricinfo', 'Financial Times', 'CoinDesk'];
const LOCATIONS = ['Mumbai, India 🇮🇳', 'Silicon Valley, USA 🇺🇸', 'London, UK 🇬🇧', 'Tokyo, Japan 🇯🇵', 'Brussels, Belgium 🇪🇺', 'New Delhi, India 🇮🇳', 'New York, USA 🇺🇸'];

const TEMPLATES = [
  { cat: 'AI & Tech', texts: ['Google announces {x}', 'OpenAI releases {x}', 'Anthropic upgrades {x}', 'Apple integrates {x} into iOS'] },
  { cat: 'Economy & RBI', texts: ['Federal Reserve announces {x}', 'RBI Governor addresses {x}', 'Inflation data reveals {x}', 'Unemployment rate impacts {x}'] },
  { cat: 'Sports', texts: ['Real Madrid signs {x}', 'CSK wins {x}', 'Olympics {x} debate', 'FIFA {x} controversy'] },
  { cat: 'Crypto & DeFi', texts: ['Bitcoin hits {x}', 'Ethereum upgrades {x}', 'Solana network {x}', 'SEC approves {x}'] },
  { cat: 'Entertainment', texts: ['Netflix renews {x}', 'Disney acquires {x}', 'Box office {x} shattered', 'Oscar {x} predictions'] },
  { cat: 'Politics & Law', texts: ['Senate passes {x}', 'Supreme Court rules on {x}', 'Election {x} tightened', 'EU Parliament debates {x}'] },
];

const NOUNS = ['new AI model', 'interest rate hike', 'record revenue', 'antitrust lawsuit', 'major software update', 'crypto spot ETF', 'defense budget proposal', 'climate regulation', 'gaming console', 'championship title'];

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateMockData(count) {
  const news = [];
  const markets = {};

  for (let i = 0; i < count; i++) {
    const category = random(CATEGORIES);
    const templateObj = TEMPLATES.find(t => t.cat === category) || TEMPLATES[0];
    const template = random(templateObj.texts);
    const noun = random(NOUNS);
    
    const headline = template.replace('{x}', noun) + ' in surprise move';
    const source = random(SOURCES);
    const location = random(LOCATIONS);
    const region = random(REGIONS);
    
    const id = `news-gen-${i}`;
    const marketId = `market-gen-${i}`;
    const yesPrice = (Math.random() * 0.8 + 0.1).toFixed(2);
    const noPrice = (1 - parseFloat(yesPrice)).toFixed(2);
    
    const item = {
      id,
      headline,
      summary: `According to recent reports from ${source}, analysts are closely watching the fallout. This event is currently driving massive market volatility and regulatory scrutiny globally.`,
      source,
      location,
      timeAgo: `${Math.floor(Math.random() * 59) + 1}m ago`,
      category,
      region,
      marketId,
      marketTitle: `Will ${headline.slice(0, 40)} happen before Dec 31?`,
      yesPrice: parseFloat(yesPrice),
      noPrice: parseFloat(noPrice),
      priceChange24h: (Math.random() > 0.5 ? '+' : '-') + (Math.random() * 10).toFixed(1) + '%',
      isPositive: Math.random() > 0.5,
      ammLiquidity: `$${Math.floor(Math.random() * 90 + 10)},000 Virtual Cash`,
      resolvesAt: 'Dec 31, 2026 • Verified Primary Source'
    };
    
    news.push(item);
    
    markets[marketId] = {
      id: marketId,
      title: item.marketTitle,
      category,
      region,
      volume: `$${Math.floor(Math.random() * 5000) + 100},000`,
      closingIn: `${Math.floor(Math.random() * 11) + 1}m ${Math.floor(Math.random() * 29) + 1}d`,
      creator: 'Oracle Bot',
      contracts: [
        { 
          id: `c-${marketId}-yes`, 
          text: 'Yes', 
          prob: `${Math.round(yesPrice * 100)}%`, 
          price: `${Math.round(yesPrice * 100)}¢`, 
          yesPrice: parseFloat(yesPrice), 
          noPrice: parseFloat(noPrice),
          yesShares: `${Math.floor(Math.random() * 40 + 10)},000`,
          noShares: `${Math.floor(Math.random() * 40 + 10)},000`,
          change: item.priceChange24h
        },
        { 
          id: `c-${marketId}-no`, 
          text: 'No', 
          prob: `${Math.round(noPrice * 100)}%`, 
          price: `${Math.round(noPrice * 100)}¢`, 
          yesPrice: parseFloat(noPrice), 
          noPrice: parseFloat(yesPrice),
          yesShares: `${Math.floor(Math.random() * 40 + 10)},000`,
          noShares: `${Math.floor(Math.random() * 40 + 10)},000`,
          change: item.priceChange24h
        }
      ]
    };
  }
  
  return { news, markets };
}

const data = generateMockData(80); // Generate 80 items

const dataDir = path.join(__dirname, '../src/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(path.join(dataDir, 'mockNews.json'), JSON.stringify(data.news, null, 2));
fs.writeFileSync(path.join(dataDir, 'mockMarkets.json'), JSON.stringify(data.markets, null, 2));

console.log('Mock data generated successfully!');
