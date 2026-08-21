from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import dashboard_views

router = DefaultRouter()
router.register(r'counties', views.CountyViewSet)
router.register(r'institutions', views.InstitutionViewSet)
router.register(r'suggestions', views.SuggestionViewSet)
router.register(r'news', views.NewsViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # Dashboard endpoints
    path('dashboard/stats/', dashboard_views.dashboard_stats),
    path('dashboard/institutions/', dashboard_views.dashboard_institutions),
    path('dashboard/institutions/<int:pk>/', dashboard_views.dashboard_institution_detail),
    path('dashboard/suggestions/', dashboard_views.dashboard_suggestions),
    path('dashboard/suggestions/<int:pk>/action/', dashboard_views.dashboard_suggestion_action),
    path('dashboard/suggestions/<int:pk>/delete/', dashboard_views.dashboard_suggestion_delete),  # <-- Add this
    path('dashboard/news/', dashboard_views.dashboard_news),
    path('dashboard/news/<int:pk>/', dashboard_views.dashboard_news_detail),
]