from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from leaflet.admin import LeafletGeoAdmin

from .models import Profile, Airport

User = get_user_model()

# Optional: Inline admin to manage user profiles directly from the user admin
class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'profile'
    fk_name = 'user'

# Extend the existing User admin to include the profile in the same form
class UserAdmin(BaseUserAdmin):
    inlines = (ProfileInline, )
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff')
    list_select_related = ('profile', )

    def get_inline_instances(self, request, obj=None):
        if not obj:
            return list()
        return super(UserAdmin, self).get_inline_instances(request, obj)

# Unregister the original User admin and register the extended
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

# Admin for Airport model using LeafletGeoAdmin for geographic fields
@admin.register(Airport)
class AirportAdmin(LeafletGeoAdmin):
    list_display = ('name', 'city', 'country', 'location')
    search_fields = ['name', 'city', 'country']
    list_filter = ('country',)  # Optional: for easier searching by country

# Register Profile admin if needed separately
# You might want to manage Profiles separately or via User admin using inlines.
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'location')
    search_fields = ['user__username', 'user__email']  # Search by user information

