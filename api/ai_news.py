import feedparser
import os
from .models import News

# News sources
NEWS_SOURCES = [
    {'name': 'Liberian Observer', 'url': 'https://www.liberianobserver.com/feed'},
    {'name': 'FrontPage Africa', 'url': 'https://frontpageafricaonline.com/feed'},
    {'name': 'The New Dawn', 'url': 'https://thenewdawnliberia.com/feed'},
    {'name': 'Government of Liberia', 'url': 'https://www.emansion.gov.lr/rss'},
    {'name': 'UNMIL Liberia', 'url': 'https://unmil.unmissions.org/rss/feed'},
]

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
                    content = content[:300]
                    
                    News.objects.create(
                        title=entry.title,
                        content=content,
                        category='general',
                        source=entry.link,
                        is_published=True
                    )
                    new_articles += 1
                    print(f"  Added: {entry.title[:60]}...")
        except Exception as e:
            print(f"Error fetching {source['name']}: {e}")
    
    print("=" * 50)
    print(f"Added {new_articles} new articles")
    return new_articles
