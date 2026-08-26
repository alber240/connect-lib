from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db import models
from .models import Like, Comment, Rating, Institution

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_like(request):
    content_type = request.data.get('content_type')
    content_id = request.data.get('content_id')
    
    if not content_type or not content_id:
        return Response(
            {'error': 'Missing content_type or content_id'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = request.user
    
    like = Like.objects.filter(
        user=user,
        content_type=content_type,
        content_id=content_id
    ).first()
    
    if like:
        like.delete()
        liked = False
        message = 'Like removed'
    else:
        Like.objects.create(
            user=user,
            content_type=content_type,
            content_id=content_id
        )
        liked = True
        message = 'Liked!'
    
    count = Like.objects.filter(
        content_type=content_type,
        content_id=content_id
    ).count()
    
    return Response({
        'liked': liked,
        'count': count,
        'message': message
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def get_comments(request):
    content_type = request.query_params.get('type')
    content_id = request.query_params.get('id')
    
    if not content_type or not content_id:
        return Response(
            {'error': 'Missing type or id'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    comments = Comment.objects.filter(
        content_type=content_type,
        content_id=content_id,
        parent__isnull=True
    ).order_by('-created_at')
    
    data = []
    for comment in comments:
        data.append({
            'id': comment.id,
            'user_username': comment.user.username,
            'content': comment.content,
            'created_at': comment.created_at.isoformat(),
            'updated_at': comment.updated_at.isoformat(),
        })
    
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_comment(request):
    content_type = request.data.get('type')
    content_id = request.data.get('id')
    content = request.data.get('content')
    
    if not content_type or not content_id or not content:
        return Response(
            {'error': 'Missing required fields'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    comment = Comment.objects.create(
        user=request.user,
        content_type=content_type,
        content_id=content_id,
        content=content
    )
    
    return Response({
        'id': comment.id,
        'user_username': comment.user.username,
        'content': comment.content,
        'created_at': comment.created_at.isoformat(),
        'updated_at': comment.updated_at.isoformat(),
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_rating(request):
    institution_id = request.data.get('institution')
    rating_value = request.data.get('rating')
    review = request.data.get('review', '')
    
    if not institution_id or not rating_value:
        return Response(
            {'error': 'Missing institution or rating'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        institution = Institution.objects.get(id=institution_id)
    except Institution.DoesNotExist:
        return Response(
            {'error': 'Institution not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    rating, created = Rating.objects.update_or_create(
        user=request.user,
        institution=institution,
        defaults={'rating': rating_value, 'review': review}
    )
    
    avg_result = Rating.objects.filter(institution=institution).aggregate(
        avg=models.Avg('rating')
    )
    avg_rating = avg_result['avg'] or 0
    
    total_ratings = Rating.objects.filter(institution=institution).count()
    
    return Response({
        'rating': {
            'id': rating.id,
            'rating': rating.rating,
            'review': rating.review,
        },
        'average_rating': avg_rating,
        'total_ratings': total_ratings,
        'message': 'Rating submitted successfully!'
    })
