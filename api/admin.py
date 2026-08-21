from django.contrib import admin
from .models import County, Institution, Suggestion, News

@admin.register(County)
class CountyAdmin(admin.ModelAdmin):
    list_display = ['name', 'capital', 'population']
    search_fields = ['name']

@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'county', 'is_verified', 'is_featured']
    list_filter = ['category', 'county', 'is_verified', 'is_featured']
    search_fields = ['name', 'address', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
@admin.register(Suggestion)
class SuggestionAdmin(admin.ModelAdmin):
    list_display = ['institution_name', 'suggestion_type', 'status', 'created_at']
    list_filter = ['suggestion_type', 'status']
    search_fields = ['institution_name']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'county', 'is_published', 'created_at']
    list_filter = ['category', 'county', 'is_published']
    search_fields = ['title', 'content']
    readonly_fields = ['created_at', 'updated_at']