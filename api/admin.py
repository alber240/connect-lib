from django.contrib import admin
from django.utils import timezone
from .models import News
from .ai_news import fetch_and_summarize_news

class NewsAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'created_at', 'is_expired_display', 'is_published']
    list_filter = ['category', 'is_published']
    search_fields = ['title', 'content']
    readonly_fields = ['expires_at', 'created_at', 'updated_at']
    actions = ['fetch_news_action', 'delete_expired_news', 'mark_as_published', 'mark_as_draft']

    def is_expired_display(self, obj):
        return obj.is_expired()
    is_expired_display.boolean = True
    is_expired_display.short_description = 'Expired'

    def fetch_news_action(self, request, queryset):
        count = fetch_and_summarize_news()
        self.message_user(request, f'✅ Added {count} new articles')
    fetch_news_action.short_description = "🔄 Fetch and summarize news"

    def delete_expired_news(self, request, queryset):
        expired = News.objects.filter(expires_at__lt=timezone.now())
        count = expired.count()
        expired.delete()
        self.message_user(request, f'🗑️ Deleted {count} expired articles')
    delete_expired_news.short_description = "🗑️ Delete expired news"

    def mark_as_published(self, request, queryset):
        queryset.update(is_published=True)
        self.message_user(request, f'✅ {queryset.count()} articles published')
    mark_as_published.short_description = "📤 Publish selected articles"

    def mark_as_draft(self, request, queryset):
        queryset.update(is_published=False)
        self.message_user(request, f'📝 {queryset.count()} articles marked as draft')
    mark_as_draft.short_description = "📝 Mark selected as draft"

    fieldsets = (
        ('Content', {
            'fields': ('title', 'content', 'category', 'county', 'institution')
        }),
        ('Media & Sources', {
            'fields': ('source', 'source_url', 'featured_image', 'video_url')
        }),
        ('Status', {
            'fields': ('is_published', 'is_published', 'expires_at', 'created_at', 'updated_at')
        }),
    )

admin.site.unregister(News)
admin.site.register(News, NewsAdmin)