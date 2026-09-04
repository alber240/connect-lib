from django.contrib import admin
from .models import County, Institution, Suggestion, News, Media, Like, Comment, Favorite, Rating

@admin.register(County)
class CountyAdmin(admin.ModelAdmin):
    list_display = ['name', 'capital', 'population']
    search_fields = ['name', 'capital']
    ordering = ['name']

@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'county', 'is_verified', 'is_featured', 'created_at']
    list_filter = ['category', 'county', 'is_verified', 'is_featured']
    search_fields = ['name', 'description', 'address']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'category', 'county', 'district')
        }),
        ('Contact Information', {
            'fields': ('address', 'phone', 'phone2', 'email', 'website')
        }),
        ('Details', {
            'fields': ('description', 'services', 'opening_hours')
        }),
        ('Location', {
            'fields': ('latitude', 'longitude', 'google_maps_link')
        }),
        ('Media', {
            'fields': ('cover_image', 'video_url')
        }),
        ('Verification', {
            'fields': ('is_verified', 'is_featured', 'source', 'source_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Suggestion)
class SuggestionAdmin(admin.ModelAdmin):
    list_display = ['institution_name', 'suggestion_type', 'status', 'created_at']
    list_filter = ['suggestion_type', 'status']
    search_fields = ['institution_name', 'suggester_name', 'suggester_email']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'is_published', 'is_expired', 'created_at']
    list_filter = ['category', 'is_published']
    search_fields = ['title', 'content']
    readonly_fields = ['created_at', 'updated_at', 'expires_at']

@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ['title', 'institution', 'media_type', 'is_cover']
    list_filter = ['media_type', 'is_cover']
    search_fields = ['title', 'caption']

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ['user', 'content_type', 'content_id', 'created_at']
    list_filter = ['content_type']

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'content_type', 'content_id', 'created_at']
    list_filter = ['content_type']

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'institution', 'created_at']
    search_fields = ['user__username', 'institution__name']

@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ['user', 'institution', 'rating', 'created_at']
    list_filter = ['rating']
    search_fields = ['user__username', 'institution__name', 'review']