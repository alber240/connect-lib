from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
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
        <hr>
        <p><strong>Status:</strong> ✅ Running</p>
        <p><strong>Version:</strong> 1.0.0</p>
        <p><strong>Storage:</strong> Local Disk (Render)</p>
    """)

urlpatterns = [
    path('', root_view, name='root'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Also serve media files in production when DEBUG is False
# This is needed for Render to serve media files
if not settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)