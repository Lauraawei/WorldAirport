from django.urls import path
from .views import (
    AirportListView,
    AirportDetailView,
    home_view,  
)
from . import views

urlpatterns = [
    path('', home_view, name='home'),  # Fixed extra comma
    path('map/', views.map_view, name='map'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('update_location/', views.update_location, name='update_location'),
    path('signup/', views.signup_view, name='signup'),
    path('airports/', AirportListView.as_view(), name='airport-list'),
    path('airports/<int:pk>/', AirportDetailView.as_view(), name='airport-detail'),
]
