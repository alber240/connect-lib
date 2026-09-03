from rest_framework import serializers
from .models import County, Institution, Suggestion, News, Comment, Rating, Media
from django.utils import timezone

class CountySerializer(serializers.ModelSerializer):
    institution_count = serializers.IntegerField(source='institutions.count', read_only=True)
    
    class Meta:
        model = County
        fields = ['id', 'name', 'description', 'capital', 'population', 'institution_count']

class InstitutionSerializer(serializers.ModelSerializer):
    county_name = serializers.CharField(source='county.name', read_only=True)
    
    class Meta:
        model = Institution
        fields = [
            'id', 'name', 'category', 'county', 'county_name',
            'district', 'address', 'phone', 'phone2', 'email', 'website',
            'description', 'services', 'opening_hours',
            'latitude', 'longitude', 'google_maps_link',
            'is_verified', 'is_featured', 'source', 'cover_image',
            'video_url', 'likes', 'average_rating', 'total_ratings',
            'created_at', 'updated_at'
        ]

class InstitutionDetailSerializer(serializers.ModelSerializer):
    county_name = serializers.CharField(source='county.name', read_only=True)
    media_files = serializers.SerializerMethodField()
    
    class Meta:
        model = Institution
        fields = '__all__'
    
    def get_media_files(self, obj):
        return MediaSerializer(obj.media_files.all(), many=True).data

class SuggestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Suggestion
        fields = ['id', 'institution_name', 'suggestion_type', 'current_info', 
                  'new_info', 'suggester_name', 'suggester_phone', 'suggester_email',
                  'status', 'admin_notes', 'created_at', 'updated_at']

class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = ['id', 'title', 'content', 'category', 'county', 'institution', 
                  'source', 'featured_image', 'video_url', 'is_published', 
                  'created_at', 'updated_at']

class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ['id', 'institution', 'media_type', 'file', 'video_url', 
                  'title', 'caption', 'is_cover', 'order', 'uploaded_at']

class CommentSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'user_id', 'user_username', 'content_type', 'content_id', 
                  'content', 'parent', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']

class RatingSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Rating
        fields = ['id', 'user', 'user_username', 'institution', 'rating', 'review', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']
        
        
class NewsSerializer(serializers.ModelSerializer):
    is_expired = serializers.SerializerMethodField()
    source_domain = serializers.SerializerMethodField()
    
    class Meta:
        model = News
        fields = ['id', 'title', 'content', 'category', 'county', 'institution', 
                  'source', 'source_url', 'source_domain', 'featured_image', 'video_url', 
                  'is_published', 'is_expired', 'expires_at', 'created_at', 'updated_at']
    
    def get_is_expired(self, obj):
        return obj.is_expired()
    
    def get_source_domain(self, obj):
        if obj.source:
            try:
                from urllib.parse import urlparse
                domain = urlparse(obj.source).netloc
                return domain.replace('www.', '')
            except:
                return None
        return None