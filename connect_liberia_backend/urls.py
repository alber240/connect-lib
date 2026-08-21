from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

def root_view(request):
    return HttpResponse("""
        <h1>🇱🇷 Connect Liberia API</h1>
        <p>API is running!</p>
        <ul>
            <li><a href="/admin/">Admin Panel</a></li>
            <li><a href="/api/">API Root</a></li>
            <li><a href="/api/token/">Get Token</a></li>
        </ul>
    """)

urlpatterns = [
    path('', root_view),  # <-- Add this
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]