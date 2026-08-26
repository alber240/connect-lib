from django.core.management import call_command
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Run migrations on deploy'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('🔄 Running migrations...'))
        call_command('migrate', '--noinput')
        self.stdout.write(self.style.SUCCESS('✅ Migrations completed!'))
