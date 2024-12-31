import os
from pathlib import Path

# # Define library paths for Windows
# GDAL_LIBRARY_PATH = "C:/Users/Ocean/miniconda3/envs/awm_env/Library/bin/gdal.dll"
# GEOS_LIBRARY_PATH = "C:/Users/Ocean/miniconda3/envs/awm_env/Library/bin/geos_c.dll"

# # Set environment variables for GDAL and GEOS
# os.environ['GDAL_LIBRARY_PATH'] = GDAL_LIBRARY_PATH
# os.environ['GEOS_LIBRARY_PATH'] = GEOS_LIBRARY_PATH

# Set GDAL library path for Docker
os.environ['GDAL_LIBRARY_PATH'] = '/opt/conda/envs/awm_env/lib/libgdal.so'


# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
SECRET_KEY = 'django-insecure-=(j(4v@8(9a_eu1^c(2$p=4%45fwpb359*_a68=d$g=^c)p=-m'
DEBUG = True

# Set allowed hosts
ALLOWED_HOSTS = ['52.2.208.227', '*']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',
    'leaflet',
    'airport_locator',
    'rest_framework',
    'pwa',  # Add PWA functionality
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'WorldAirports.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'WorldAirports.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'airports_db',
        'USER': 'laurawei',
        'PASSWORD': 'jiaxin233',
        'HOST': 'db',
        'PORT': '5432',
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
# STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'airport_locator', 'static')]
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# PWA Configuration
PWA_APP_NAME = 'Airport Locator'
PWA_APP_DESCRIPTION = "A Progressive Web App for Airport Locator"
PWA_APP_THEME_COLOR = '#000000'
PWA_APP_BACKGROUND_COLOR = '#ffffff'
PWA_APP_DISPLAY = 'standalone'
PWA_APP_SCOPE = '/'
PWA_APP_START_URL = '/'
PWA_APP_ICONS = [
    {
        'src': '/static/icons/icon-192x192.png',
        'sizes': '192x192',
    },
    {
        'src': '/static/icons/icon-512x512.png',
        'sizes': '512x512',
    },
]
PWA_APP_LANG = 'en-US'
