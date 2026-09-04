import feedparser
import os
import requests
import re
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from api.models import News

# News sources
NEWS_SOURCES = [
    {'name': 'Liberian Observer', 'url': 'https://www.liberianobserver.com/feed'},
    {'name': 'FrontPage Africa', 'url': 'https://frontpageafricaonline.com/feed'},
    {'name': 'The New Dawn', 'url': 'https://thenewdawnliberia.com/feed'},
    {'name': 'Government of Liberia', 'url': 'https://www.emansion.gov.lr/rss'},
    {'name': 'UNMIL Liberia', 'url': 'https://unmil.unmissions.org/rss/feed'},
]

class Command(BaseCommand):
    help = 'Fetch and summarize news from RSS feeds using AI'

    def handle(self, *args, **options):
        """Main command handler - DO NOT RETURN ANYTHING"""
        self.stdout.write('🔄 Starting AI News Aggregation...')
        self.stdout.write('=' * 50)
        
        new_articles = 0
        
        for source in NEWS_SOURCES:
            try:
                self.stdout.write(f'📰 Fetching from: {source["name"]}')
                feed = feedparser.parse(source['url'])
                
                for entry in feed.entries[:5]:
                    # Check if news already exists
                    if News.objects.filter(title=entry.title).exists():
                        continue
                    
                    # Extract content
                    content = ''
                    if hasattr(entry, 'summary') and entry.summary:
                        content = entry.summary
                    elif hasattr(entry, 'description') and entry.description:
                        content = entry.description
                    
                    # Clean HTML
                    content = re.sub(r'<[^>]+>', ' ', content)
                    content = re.sub(r'\s+', ' ', content).strip()
                    content = content[:500]  # Limit length
                    
                    # Get image if available
                    featured_image = None
                    if hasattr(entry, 'media_content') and entry.media_content:
                        featured_image = entry.media_content[0].get('url')
                    elif hasattr(entry, 'media_thumbnail') and entry.media_thumbnail:
                        featured_image = entry.media_thumbnail[0].get('url')
                    
                    self.stdout.write(f'  🤖 Summarizing: {entry.title[:40]}...')
                    summary = self.summarize_article(content)
                    
                    # Create news item
                    News.objects.create(
                        title=entry.title[:255],
                        content=summary,
                        category='general',
                        source=source['name'],
                        source_url=entry.link,
                        featured_image=featured_image,
                        is_published=True,
                        expires_at=datetime.now() + timedelta(hours=48)
                    )
                    new_articles += 1
                    self.stdout.write(f'  ✅ Added: {entry.title[:50]}...')
                    
            except Exception as e:
                self.stderr.write(f'❌ Error fetching {source["name"]}: {e}')
        
        self.stdout.write('=' * 50)
        self.stdout.write(f'✅ Added {new_articles} new articles')
        # DO NOT RETURN ANYTHING - Django BaseCommand expects None

    def summarize_article(self, content):
        """Summarize article using OpenRouter AI"""
        # Get API key from environment
        openrouter_api_key = os.environ.get('OPENROUTER_API_KEY')
        openrouter_url = "https://openrouter.ai/api/v1/chat/completions"
        
        if not openrouter_api_key:
            self.stdout.write('⚠️ No OpenRouter API key found, using truncation')
            return content[:200] + "..."
        
        try:
            response = requests.post(
                openrouter_url,
                headers={
                    "Authorization": f"Bearer {openrouter_api_key}",
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
                self.stderr.write(f'⚠️ API Error: {response.status_code}')
                return content[:200] + "..."
                
        except Exception as e:
            self.stderr.write(f'⚠️ Summarization error: {e}')
            return content[:200] + "..."