from django.db import models
from django.contrib.auth.models import User

# ... your existing models ...

class Like(models.Model):
    CONTENT_TYPES = [
        ('institution', 'Institution'),
        ('news', 'News'),
        ('media', 'Media'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES)
    content_id = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'content_type', 'content_id']

    def __str__(self):
        return f"{self.user.username} likes {self.content_type} {self.content_id}"

class Comment(models.Model):
    CONTENT_TYPES = [
        ('institution', 'Institution'),
        ('news', 'News'),
        ('media', 'Media'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES)
    content_id = models.PositiveIntegerField()
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} on {self.content_type} {self.content_id}"

class Rating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings')
    institution = models.ForeignKey('Institution', on_delete=models.CASCADE, related_name='ratings')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    review = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'institution']

    def __str__(self):
        return f"{self.user.username} rated {self.institution.name} {self.rating}★"
