from django.core.management.base import BaseCommand
from api.ai_news import fetch_and_summarize_news

class Command(BaseCommand):
    help = 'Fetch and summarize news from all Liberian sources'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Starting AI News Aggregation...'))
        count = fetch_and_summarize_news()
        self.stdout.write(self.style.SUCCESS(f'Added {count} new articles'))
