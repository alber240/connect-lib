from django.db import models

class County(models.Model):
    """The 15 counties of Liberia"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    capital = models.CharField(max_length=100, blank=True, null=True)
    population = models.CharField(max_length=50, blank=True, null=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']
        verbose_name_plural = "Counties"

class Institution(models.Model):
    """All institutions (hospitals, schools, govt offices, businesses)"""
    
    CATEGORY_CHOICES = [
        ('hospital', 'Hospital / Clinic'),
        ('school', 'School / University'),
        ('government', 'Government Office'),
        ('business', 'Business / Shop'),
        ('bank', 'Bank / Financial'),
        ('hotel', 'Hotel / Guesthouse'),
        ('ngo', 'NGO / Non-profit'),
        ('market', 'Market / Mall'),
        ('restaurant', 'Restaurant / Cafe'),
        ('church', 'Church / Mosque'),
        ('other', 'Other'),
        ('protected areas', 'Protected Areas'),
        ('park', 'Park'),
    ]
    
    cover_image = models.ImageField(upload_to='institutions/covers/', blank=True, null=True)
    video_url = models.URLField(blank=True, null=True, help_text="YouTube or Vimeo embed URL")
    
     
    # Basic Information
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    county = models.ForeignKey(County, on_delete=models.CASCADE, related_name='institutions')
    district = models.CharField(max_length=255, blank=True, null=True)
    
    # Contact Information
    address = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    phone2 = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    
    # Details
    description = models.TextField(blank=True, null=True)
    services = models.TextField(blank=True, null=True, help_text="List of services offered")
    opening_hours = models.CharField(max_length=255, blank=True, null=True)
    
    # Location (for maps)
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    google_maps_link = models.URLField(blank=True, null=True)
    
    # Verification & Source
    is_verified = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    source = models.URLField(blank=True, null=True, help_text="Where this info was obtained")
    source_notes = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['category']),
            models.Index(fields=['county']),
        ]

class Suggestion(models.Model):
    """User suggestions for adding/updating institutions"""
    
    TYPE_CHOICES = [
        ('add', 'Add New Institution'),
        ('update', 'Update Existing Institution'),
        ('remove', 'Remove Institution'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('duplicate', 'Duplicate Entry'),
    ]
    
    institution_name = models.CharField(max_length=255, help_text="Name of the institution")
    suggestion_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    current_info = models.TextField(blank=True, null=True, help_text="What's currently shown (for updates)")
    new_info = models.TextField(help_text="What should be added/changed")
    
    # Contact info of suggester
    suggester_name = models.CharField(max_length=255, blank=True, null=True)
    suggester_phone = models.CharField(max_length=50, blank=True, null=True)
    suggester_email = models.EmailField(blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.suggestion_type}: {self.institution_name} ({self.status})"
    
    class Meta:
        ordering = ['-created_at']

class News(models.Model):
    """News and updates about institutions and Liberia"""
    
    CATEGORY_CHOICES = [
        ('announcement', 'Announcement'),
        ('update', 'Update'),
        ('event', 'Event'),
        ('alert', 'Alert'),
        ('general', 'General'),
    ]
    
    title = models.CharField(max_length=255)
    content = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    county = models.ForeignKey(County, on_delete=models.SET_NULL, null=True, blank=True, related_name='news')
    institution = models.ForeignKey(Institution, on_delete=models.SET_NULL, null=True, blank=True, related_name='news')
    
    source = models.URLField(blank=True, null=True)
    is_published = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    featured_image = models.ImageField(upload_to='news/', blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "News"
        
class Media(models.Model):
    """Images and videos for institutions"""
    MEDIA_TYPES = [
        ('image', 'Image'),
        ('video', 'Video'),
    ]
    
    institution = models.ForeignKey('Institution', on_delete=models.CASCADE, related_name='media_files')
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES)
    file = models.FileField(upload_to='institutions/media/', blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    title = models.CharField(max_length=255, blank=True)
    caption = models.TextField(blank=True)
    is_cover = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.get_media_type_display()} - {self.institution.name}"

    class Meta:
        ordering = ['order']
        verbose_name_plural = "Media"