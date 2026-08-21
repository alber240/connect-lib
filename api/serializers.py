from rest_framework import serializers
from .models import County, Institution, Suggestion, News

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
            'is_verified', 'is_featured', 'source'
        ]

class InstitutionDetailSerializer(serializers.ModelSerializer):
    county_name = serializers.CharField(source='county.name', read_only=True)
    
    class Meta:
        model = Institution
        fields = '__all__'

class SuggestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Suggestion
        fields = ['id', 'institution_name', 'suggestion_type', 'current_info', 
                  'new_info', 'suggester_name', 'suggester_phone', 'suggester_email',
                  'status', 'created_at']

class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = ['id', 'title', 'content', 'category', 'county', 'institution', 
                  'source', 'is_published', 'created_at']