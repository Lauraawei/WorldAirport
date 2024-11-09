# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.signup_view, name='home'),  
    path('map/', views.map_view, name='map'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('update_location/', views.update_location, name='update_location'),
    path('signup/', views.signup_view, name='signup'),
]
