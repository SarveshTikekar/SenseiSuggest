# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order (already done for clarity in this version)
#   * Make sure each model has one field with primary_key=True (handled by inspectdb or below)
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
from django.contrib.postgres.fields import ArrayField

# --- Your Application Models (reordered for ForeignKey dependencies) ---

class Locations(models.Model):
    locationid = models.AutoField(db_column='locationId', primary_key=True)
    country = models.CharField(max_length=50)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'locations'
    def __str__(self):
        return f"{self.locationid}"

class Users(models.Model):
    userid = models.AutoField(db_column='userId', primary_key=True)
    username = models.CharField(db_column='userName', unique=True, max_length=32)
    email = models.CharField(unique=True, max_length=255) # Added max_length
    hashedpassword = models.CharField(db_column='hashedPassword', max_length=255) # Added max_length
    profilepicture = models.CharField(db_column='profilePicture', blank=True, null=True, max_length=255) # Added max_length
    anime_watched_count = models.IntegerField(blank=True, null=True)
    anime_watching_count = models.IntegerField(blank=True, null=True)
    locationid = models.ForeignKey(Locations, models.DO_NOTHING, db_column='locationId')

    class Meta:
        managed = False
        db_table = 'users'
    def __str__(self):
        return f"{self.userid}"


class Anime(models.Model):
    animeid = models.AutoField(db_column='animeId', primary_key=True)
    animename = models.CharField(db_column='animeName', unique=True, max_length=255) # Added max_length
    is_adult_rated = models.BooleanField(blank=True, null=True)
    is_running = models.BooleanField(blank=True, null=True)
    releasedate = models.DateTimeField(db_column='releaseDate')
    description = models.CharField(max_length=500, blank=True, null=True)
    image_url_base_anime = models.CharField(blank=True, null=True, max_length=500) # Added max_length
    trailer_url_base_anime = models.CharField(blank=True, null=True, max_length=500) # Added max_length
    studio = models.CharField(blank=True, null=True, max_length=255) # Added max_length

    class Meta:
        managed = False
        db_table = 'anime'
    
    def __str__(self):
        return f"{self.animeid}"


class Genres(models.Model):
    genreid = models.AutoField(db_column='genreId', primary_key=True)
    name = models.CharField(unique=True, max_length=100) # Added max_length

    class Meta:
        managed = False
        db_table = 'genres'
    
    def __str__(self):
        return f"{self.genreid}"


class Ratings(models.Model):
    ratingid = models.AutoField(db_column='ratingId', primary_key=True)
    userid = models.ForeignKey(Users, models.DO_NOTHING, db_column='userId')
    animeid = models.ForeignKey(Anime, models.DO_NOTHING, db_column='animeId')
    score = models.IntegerField()
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    review_text = models.CharField(max_length=1000, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'ratings'
    
    def __str__(self):
        return f"{self.ratingid}"

class Seasons(models.Model):
    id = models.AutoField(db_column='id', primary_key=True)
    animeid = models.ForeignKey('Anime', models.DO_NOTHING, db_column='animeId', related_name='related_seasons')
    seasonnumber = models.IntegerField(db_column='seasonNumber') # <-- THIS MUST BE HERE
    seasonname = models.CharField(db_column='seasonName', max_length=255, blank=True, null=True)
    seasoninfo = models.CharField(db_column='seasonInfo', max_length=255, blank=True, null=True)
    seasontrailer = models.CharField(db_column='seasonTrailer', blank=True, null=True, max_length=500)
    seasonimage = models.CharField(db_column='seasonImage', blank=True, null=True, max_length=500)

    class Meta:
        managed = False
        db_table = 'seasons'
        unique_together = (('animeid', 'seasonnumber'),) # Keep unique_together for DB constraint representation

    def __str__(self):
        if self.animeid and hasattr(self.animeid, 'animename') and self.animeid.animename:
            return f"{self.animeid.animename} - Season {self.seasonnumber}"
        return f"Season {self.seasonnumber} (Anime ID: {self.animeid_id if self.animeid else 'N/A'})"

# --- Join Tables ---
class AnimeGenres(models.Model):
    pk = models.CompositePrimaryKey('animeid', 'genreid')
    animeid = models.ForeignKey(Anime, models.DO_NOTHING, db_column='animeId')
    genreid = models.ForeignKey('Genres', models.DO_NOTHING, db_column='genreId')
    class Meta:
        managed = False
        db_table = 'anime_genres'

class UserWatchedAnime(models.Model):
    pk = models.CompositePrimaryKey('userid', 'animeid')
    userid = models.ForeignKey('Users', models.DO_NOTHING, db_column='userId')
    animeid = models.ForeignKey(Anime, models.DO_NOTHING, db_column='animeId')
    class Meta:
        managed = False
        db_table = 'user_watched_anime'

class UserWatchingAnime(models.Model):
    pk = models.CompositePrimaryKey('userid', 'animeid')
    userid = models.ForeignKey('Users', models.DO_NOTHING, db_column='userId')
    animeid = models.ForeignKey(Anime, models.DO_NOTHING, db_column='animeId')
    class Meta:
        managed = False
        db_table = 'user_watching_anime'

# --- Django's Internal Models (leave as is, typically not registered in your admin.py) ---
# These are generated because they exist in your database from Django's own setup.

class AlembicVersion(models.Model):
    version_num = models.CharField(primary_key=True, max_length=32)

    class Meta:
        managed = False
        db_table = 'alembic_version'


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.SmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'