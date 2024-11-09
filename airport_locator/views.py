from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.http import JsonResponse
from django.contrib.gis.geos import Point
from django import forms
from .models import Profile, Airport
import json
from django.contrib.auth.models import User

# View that reads the location and passes it to the map
def map_view(request):
    if request.user.is_authenticated:
        # Get the user profile and location
        user_profile = Profile.objects.get(user=request.user)
        location = user_profile.location
        
        # Get all airports
        airports = Airport.objects.all()
        airports_data = [
            {
                "name": airport.name,
                "city": airport.city,
                "country": airport.country,
                "latitude": airport.location.y,
                "longitude": airport.location.x
            }
            for airport in airports
        ]
        
        # Serialize airports_data to JSON
        context = {
            'user': request.user,
            'location': location,
            'airports_data': json.dumps(airports_data)  # Serialize as JSON here
        }
        return render(request, 'map.html', context)
    else:
        return redirect('login')


# Login view with form styling
def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('map')
    else:
        form = AuthenticationForm()
    
    # Add form-control class to each form field
    for field in form.fields.values():
        field.widget.attrs['class'] = 'form-control'

    return render(request, 'login.html', {'form': form})


# Logout view
def logout_view(request):
    logout(request)
    return redirect('login')


# Update user's location view (via Geolocation API)
def update_location(request):
    if request.method == 'POST':
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')

        # Retrieve the profile and update the location
        user_profile = Profile.objects.get(user=request.user)
        user_profile.location = Point(float(longitude), float(latitude))
        user_profile.save()

        return JsonResponse({'success': True})
    return JsonResponse({'success': False})


# Custom form class inside views.py
class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={'class': 'form-control'}))

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']

    def save(self, commit=True):
        user = super().save(commit=False)
        if commit:
            user.save()  # Save the user, including the email
        return user

# Sign up view with form styling
def signup_view(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()  # Create the user with the email field
            login(request, user)  # Automatically log the user in after registration
            
            # Create a profile for the user (optional)
            Profile.objects.create(user=user)
            
            return redirect('map')  # Redirect to the map page after registration
    else:
        form = CustomUserCreationForm()

    # Add form-control class to each form field
    for field in form.fields.values():
        field.widget.attrs['class'] = 'form-control'

    return render(request, 'signup.html', {'form': form})
