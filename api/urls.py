from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import dashboard_views
from . import engagement_views
from . import password_reset_views

# ==================== ROUTER REGISTRATION ====================
router = DefaultRouter()
router.register(r'counties', views.CountyViewSet)
router.register(r'institutions', views.InstitutionViewSet)
router.register(r'suggestions', views.SuggestionViewSet)
router.register(r'news', views.NewsViewSet)

# ==================== URL PATTERNS ====================
urlpatterns = [
    # ===== API Routes =====
    path('', include(router.urls)),
    
    # ===== Authentication =====
    path('register/', views.register, name='register'),
    path('token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', views.CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('user/', views.get_user, name='get_user'),  # 🔑 User endpoint for frontend
    
    # ===== Dashboard Routes =====
    # Stats
    path('dashboard/stats/', dashboard_views.dashboard_stats, name='dashboard_stats'),
    
    # Institutions
    path('dashboard/institutions/', dashboard_views.dashboard_institutions, name='dashboard_institutions'),
    path('dashboard/institutions/<int:pk>/', dashboard_views.dashboard_institution_detail, name='dashboard_institution_detail'),
    
    # Suggestions
    path('dashboard/suggestions/', dashboard_views.dashboard_suggestions, name='dashboard_suggestions'),
    path('dashboard/suggestions/<int:pk>/action/', dashboard_views.dashboard_suggestion_action, name='dashboard_suggestion_action'),
    path('dashboard/suggestions/<int:pk>/delete/', dashboard_views.dashboard_suggestion_delete, name='dashboard_suggestion_delete'),
    
    # News
    path('dashboard/news/', dashboard_views.dashboard_news, name='dashboard_news'),
    path('dashboard/news/<int:pk>/', dashboard_views.dashboard_news_detail, name='dashboard_news_detail'),
    
    # ===== Engagement Routes =====
    # Likes
    path('like/', engagement_views.toggle_like, name='toggle_like'),
    
    # Comments
    path('comments/', engagement_views.get_comments, name='get_comments'),
    path('comments/create/', engagement_views.create_comment, name='create_comment'),
    
    # Ratings
    path('rating/', engagement_views.submit_rating, name='submit_rating'),
    path('rating/<int:institution_id>/', engagement_views.get_institution_ratings, name='get_institution_ratings'),
    
    # Favorites
    path('favorites/', engagement_views.get_favorites, name='get_favorites'),
    path('favorites/toggle/', engagement_views.toggle_favorite, name='toggle_favorite'),
    
    # Password Reset
    path('password-reset/request/', password_reset_views.request_password_reset, name='password_reset_request'),
    path('password-reset/confirm/', password_reset_views.confirm_password_reset, name='password_reset_confirm'),
]