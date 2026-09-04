from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Avg, Count
from .models import Like, Comment, Rating, Institution, Favorite
from .serializers import RatingSerializer, CommentSerializer, InstitutionSerializer


# ==================== LIKE VIEWS ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_like(request):
    """Toggle like on a content item (institution, news, etc.)"""
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


# ==================== COMMENT VIEWS ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def get_comments(request):
    """Get all comments for a content item"""
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
    """Create a new comment on a content item"""
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


# ==================== RATING VIEWS ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_rating(request):
    """Submit or update a rating and review for an institution"""
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

    # Create or update rating
    rating, created = Rating.objects.update_or_create(
        user=request.user,
        institution=institution,
        defaults={'rating': rating_value, 'review': review}
    )

    # Calculate averages
    rating_stats = Rating.objects.filter(institution=institution).aggregate(
        average_rating=Avg('rating'),
        total_ratings=Count('id')
    )

    # Update institution's average rating
    institution.average_rating = rating_stats['average_rating'] or 0
    institution.total_ratings = rating_stats['total_ratings'] or 0
    institution.save()

    return Response({
        'rating': RatingSerializer(rating).data,
        'average_rating': institution.average_rating,
        'total_ratings': institution.total_ratings,
        'message': 'Rating submitted successfully!'
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def get_institution_ratings(request, institution_id):
    """Get all ratings for an institution"""
    try:
        institution = Institution.objects.get(id=institution_id)
    except Institution.DoesNotExist:
        return Response(
            {'error': 'Institution not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    ratings = Rating.objects.filter(institution=institution).order_by('-created_at')
    user_rating = None

    # If user is authenticated, get their rating
    if request.user.is_authenticated:
        user_rating = ratings.filter(user=request.user).first()

    serializer = RatingSerializer(ratings, many=True)

    return Response({
        'ratings': serializer.data,
        'average_rating': institution.average_rating,
        'total_ratings': institution.total_ratings,
        'user_rating': RatingSerializer(user_rating).data if user_rating else None
    })


# ==================== FAVORITE VIEWS ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_favorite(request):
    """Toggle favorite status for an institution"""
    institution_id = request.data.get('institution')

    if not institution_id:
        return Response(
            {'error': 'Missing institution'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        institution = Institution.objects.get(id=institution_id)
    except Institution.DoesNotExist:
        return Response(
            {'error': 'Institution not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    favorite = Favorite.objects.filter(
        user=request.user,
        institution=institution
    ).first()

    if favorite:
        favorite.delete()
        favorited = False
        message = 'Removed from favorites'
    else:
        Favorite.objects.create(
            user=request.user,
            institution=institution
        )
        favorited = True
        message = 'Added to favorites'

    total_favorites = Favorite.objects.filter(institution=institution).count()

    return Response({
        'favorited': favorited,
        'message': message,
        'total_favorites': total_favorites
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_favorites(request):
    """Get user's favorite institutions"""
    favorites = Favorite.objects.filter(user=request.user).select_related('institution')
    institutions = [fav.institution for fav in favorites]
    serializer = InstitutionSerializer(institutions, many=True)
    return Response(serializer.data)