from django.contrib import admin
from .models import Anime, Genres, Users, Seasons, Ratings, Locations

admin.site.register(Anime)
admin.site.register(Genres)
admin.site.register(Users)
admin.site.register(Seasons)
admin.site.register(Ratings)
admin.site.register(Locations)
