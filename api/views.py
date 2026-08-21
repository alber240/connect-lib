from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import models
from .models import County, Institution, Suggestion, News
from .serializers import (
    CountySerializer, InstitutionSerializer, InstitutionDetailSerializer,
    SuggestionSerializer, NewsSerializer
)

class CountyViewSet(viewsets.ReadOnlyModelViewSet):
    """View all 15 counties"""
    queryset = County.objects.all()
    serializer_class = CountySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    lookup_field = 'name'

class InstitutionViewSet(viewsets.ModelViewSet):
    """View, search, and filter institutions"""
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'county__name', 'is_verified', 'is_featured']
    search_fields = ['name', 'description', 'address', 'category']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return InstitutionDetailSerializer
        return InstitutionSerializer
    
    @action(detail=False, methods=['get'])
    def by_county(self, request):
        """Get institutions filtered by county name"""
        county_name = request.query_params.get('county', None)
        if not county_name:
            return Response(
                {"error": "Please provide a county name"},
                status=status.HTTP_400_BAD_REQUEST
            )
        county = get_object_or_404(County, name__iexact=county_name)
        institutions = self.queryset.filter(county=county)
        serializer = self.get_serializer(institutions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Advanced search with multiple filters"""
        query = request.query_params.get('q', '')
        category = request.query_params.get('category', '')
        county = request.query_params.get('county', '')
        
        queryset = self.queryset
        
        if query:
            queryset = queryset.filter(
                models.Q(name__icontains=query) |
                models.Q(description__icontains=query) |
                models.Q(address__icontains=query)
            )
        if category:
            queryset = queryset.filter(category=category)
        if county:
            queryset = queryset.filter(county__name__iexact=county)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class SuggestionViewSet(viewsets.ModelViewSet):
    """Handle user suggestions"""
    queryset = Suggestion.objects.all()
    serializer_class = SuggestionSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            "message": "Thank you! Your suggestion has been submitted for review.",
            "suggestion": serializer.data
        }, status=status.HTTP_201_CREATED)

class NewsViewSet(viewsets.ReadOnlyModelViewSet):
    """View news and updates"""
    queryset = News.objects.filter(is_published=True)
    serializer_class = NewsSerializer
    filter_backends = [filters.SearchFilter]
    filterset_fields = ['category', 'county__name']
    search_fields = ['title', 'content']
    ordering = ['-created_at']