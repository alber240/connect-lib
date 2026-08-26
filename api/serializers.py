from rest_framework import serializers
from .models import County, Institution, Suggestion, News, Comment, Rating

# ... your existing serializers ...

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
