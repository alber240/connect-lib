import feedparser
import os
import requests
from .models import News

# News sources
NEWS_SOURCES = [
    {'name': 'Liberian Observer', 'url': 'https://www.liberianobserver.com/feed'},
    {'name': 'FrontPage Africa', 'url': 'https://frontpageafricaonline.com/feed'},
    {'name': 'The New Dawn', 'url': 'https://thenewdawnliberia.com/feed'},
    {'name': 'Government of Liberia', 'url': 'https://www.emansion.gov.lr/rss'},
    {'name': 'UNMIL Liberia', 'url': 'https://unmil.unmissions.org/rss/feed'},
]

# OpenRouter API
OPENROUTER_API_KEY = os.environ.get('OPENROUTER_API_KEY')
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

def summarize_article(content):
    """Summarize article using OpenRouter AI"""
    if not OPENROUTER_API_KEY:
        return content[:200] + "..."
    
    try:
        response = requests.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://connect-lib.onrender.com",
                "X-Title": "Connect Liberia"
            },
            json={
                "model": "mistralai/mistral-7b-instruct:free",
                "messages": [
                    {"role": "system", "content": "Summarize this news article about Liberia in 2-3 short sentences. Be concise and informative."},
                    {"role": "user", "content": f"Summarize: {content}"}
                ],
                "max_tokens": 100,
                "temperature": 0.7
            },
            timeout=30
        )
        
        if response.status_code == 200:
            summary = response.json()['choices'][0]['message']['content'].strip()
            return summary
        else:
            print(f"API Error: {response.status_code}")
            return content[:200] + "..."
            
    except Exception as e:
        print(f"Summarization error: {e}")
        return content[:200] + "..."

def fetch_and_summarize_news():
    print("Starting AI News Aggregation...")
    print("=" * 50)
    
    new_articles = 0
    
    for source in NEWS_SOURCES:
        try:
            print(f"Fetching from: {source['name']}")
            feed = feedparser.parse(source['url'])
            
            for entry in feed.entries[:5]:
                if not News.objects.filter(title=entry.title).exists():
                    content = entry.summary if entry.summary else entry.description if entry.description else ''
                    content = content[:500]
                    
                    print(f"  🤖 Summarizing: {entry.title[:40]}...")
                    summary = summarize_article(content)
                    
                    News.objects.create(
                        title=entry.title[:255],
                        content=summary,
                        category='general',
                        source=entry.link,
                        is_published=True
                    )
                    new_articles += 1
                    print(f"  ✅ Added: {entry.title[:50]}...")
        except Exception as e:
            print(f"Error fetching {source['name']}: {e}")
    
    print("=" * 50)
    print(f"Added {new_articles} new articles")
    return new_articles