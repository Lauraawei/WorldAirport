from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('airport_locator.urls')),  # Your app's URLs
   path('pwa/', include('pwa.urls')),  # Include PWA URLs under '/pwa/'

]
