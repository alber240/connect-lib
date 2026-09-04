from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Count, Q
from django.contrib.auth.models import User
from .models import Institution, County, Suggestion, News, Media
from .serializers import (
    InstitutionSerializer, SuggestionSerializer, NewsSerializer
)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics"""
    stats = {
        'total_institutions': Institution.objects.count(),
        'total_counties': County.objects.count(),
        'total_suggestions': Suggestion.objects.count(),
        'pending_suggestions': Suggestion.objects.filter(status='pending').count(),
        'total_news': News.objects.count(),
        'total_users': User.objects.count(),
        'verified_institutions': Institution.objects.filter(is_verified=True).count(),
        'featured_institutions': Institution.objects.filter(is_featured=True).count(),
        'institutions_by_category': list(
            Institution.objects.values('category')
            .annotate(count=Count('id'))
            .order_by('-count')
        ),
        'institutions_by_county': list(
            Institution.objects.values('county__name')
            .annotate(count=Count('id'))
            .order_by('-count')
        ),
        'recent_institutions': InstitutionSerializer(
            Institution.objects.order_by('-created_at')[:5], 
            many=True
        ).data,
        'recent_suggestions': SuggestionSerializer(
            Suggestion.objects.order_by('-created_at')[:5], 
            many=True
        ).data,
    }
    return Response(stats)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def dashboard_institutions(request):
    """Manage institutions"""
    if request.method == 'GET':
        institutions = Institution.objects.all().order_by('-created_at')
        serializer = InstitutionSerializer(institutions, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = InstitutionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def dashboard_institution_detail(request, pk):
    """Get, update or delete institution"""
    try:
        institution = Institution.objects.get(pk=pk)
    except Institution.DoesNotExist:
        return Response({'error': 'Institution not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = InstitutionSerializer(institution)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = InstitutionSerializer(institution, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        institution.delete()
        return Response({'message': 'Institution deleted'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_suggestions(request):
    """Get all suggestions"""
    status_filter = request.query_params.get('status', None)
    if status_filter:
        suggestions = Suggestion.objects.filter(status=status_filter).order_by('-created_at')
    else:
        suggestions = Suggestion.objects.all().order_by('-created_at')
    serializer = SuggestionSerializer(suggestions, many=True)
    return Response(serializer.data)

 # api/dashboard_views.py - Update suggestion_action

from .services.email_service import EmailService

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def dashboard_suggestion_action(request, pk):
    """Approve or reject a suggestion"""
    try:
        suggestion = Suggestion.objects.get(pk=pk)
    except Suggestion.DoesNotExist:
        return Response(
            {'error': 'Suggestion not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    action = request.data.get('action')
    admin_notes = request.data.get('admin_notes', '')

    if action not in ['approve', 'reject']:
        return Response(
            {'error': 'Invalid action'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if action == 'approve':
        suggestion.status = 'approved'
        # Create institution from suggestion
        county = County.objects.filter(name__icontains=suggestion.county).first()
        if county:
            Institution.objects.create(
                name=suggestion.institution_name,
                category=suggestion.category or 'other',
                county=county,
                description=suggestion.new_info,
                is_verified=False,
            )
    else:
        suggestion.status = 'rejected'

    suggestion.admin_notes = admin_notes
    suggestion.save()

    # Send email notification
    if suggestion.suggester_email:
        user = User.objects.filter(email=suggestion.suggester_email).first()
        if user:
            EmailService.send_suggestion_status(user, suggestion)

    return Response({
        'message': f'Suggestion {action}d successfully',
        'status': suggestion.status
    })

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def dashboard_news(request):
    """Manage news"""
    if request.method == 'GET':
        news = News.objects.all().order_by('-created_at')
        serializer = NewsSerializer(news, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = NewsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def dashboard_news_detail(request, pk):
    """Get, update or delete news"""
    try:
        news_item = News.objects.get(pk=pk)
    except News.DoesNotExist:
        return Response({'error': 'News not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = NewsSerializer(news_item)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        # Allow partial updates
        serializer = NewsSerializer(news_item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        news_item.delete()
        return Response({'message': 'News deleted'}, status=status.HTTP_204_NO_CONTENT)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def dashboard_suggestion_delete(request, pk):
    """Delete a suggestion"""
    try:
        suggestion = Suggestion.objects.get(pk=pk)
        suggestion.delete()
        return Response({'message': 'Suggestion deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except Suggestion.DoesNotExist:
        return Response({'error': 'Suggestion not found'}, status=status.HTTP_404_NOT_FOUND)