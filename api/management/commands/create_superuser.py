from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Create a superuser if none exists'

    def handle(self, *args, **options):
        username = 'connectlib'
        email = 'bigchicha74@gmail.com'
        password = 'Staff,,123'

        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            self.stdout.write(self.style.SUCCESS(f'✅ Superuser "{username}" created!'))
        else:
            self.stdout.write(self.style.WARNING(f'⚠️ Superuser "{username}" already exists.'))