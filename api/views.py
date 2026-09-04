from rest_framework import viewsets, status, filters
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import models
from django.contrib.auth.models import User
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
    
    def get_serializer_context(self):
        """Pass request to serializer for is_favorited field"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
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


# ============ AUTHENTICATION VIEWS ============

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user"""
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    password2 = request.data.get('password2')

    # Validate input
    if not username or not password or not password2:
        return Response(
            {'error': 'All fields are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if password != password2:
        return Response(
            {'error': 'Passwords do not match'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'Username already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if email and User.objects.filter(email=email).exists():
        return Response(
            {'error': 'Email already registered'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create user
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    return Response(
        {'message': 'User created successfully'},
        status=status.HTTP_201_CREATED
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    """Get current authenticated user info"""
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_authenticated': True,
    })


# ============ JWT TOKEN VIEWS (if not using djangorestframework_simplejwt built-in) ============

# If you're using djangorestframework_simplejwt, import these
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Otherwise, these are the built-in views
class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token obtain view"""
    pass


class CustomTokenRefreshView(TokenRefreshView):
    """Custom token refresh view"""
    pass