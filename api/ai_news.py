import openai
import requests
from bs4 import BeautifulSoup
from .models import News

# Configure OpenAI (you'll need an API key)
openai.api_key = os.environ.get('OPENAI_API_KEY')

def fetch_news_from_rss(url):
    """Fetch news from RSS feed"""
    response = requests.get(url)
    # Parse RSS and return articles
    # ...

def summarize_article(content):
    """Summarize article using AI"""
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Summarize this news article in 2-3 sentences."},
                {"role": "user", "content": content}
            ],
            max_tokens=100
        )
        return response.choices[0].message.content
    except Exception as e:
        return content[:200] + "..."

def categorize_article(content):
    """Categorize article using AI"""
    categories = ['announcement', 'update', 'event', 'alert', 'general']
    # Use AI to determine category
    # ...

def generate_news_from_sources():
    """Main function to fetch, summarize, and publish news"""
    sources = [
        'https://www.emansion.gov.lr/rss',
        'https://www.liberianobserver.com/feed',
        # ... more sources
    ]
    
    for source in sources:
        articles = fetch_news_from_rss(source)
        for article in articles:
            summary = summarize_article(article.content)
            category = categorize_article(article.content)
            
            News.objects.create(
                title=article.title,
                content=summary,
                category=category,
                source=source,
                is_published=True
            )