from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class EmailService:
    """Service for sending emails"""
    
    @staticmethod
    def send_email(to_email, subject, template_name, context):
        """Send email using template"""
        try:
            html_message = render_to_string(f'emails/{template_name}', context)
            plain_message = strip_tags(html_message)
            
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[to_email],
                html_message=html_message,
                fail_silently=False,
            )
            logger.info(f"Email sent to {to_email}: {subject}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False
    
    @staticmethod
    def send_welcome_email(user):
        """Send welcome email to new user"""
        return EmailService.send_email(
            to_email=user.email,
            subject='Welcome to Connect Liberia! 🎉',
            template_name='welcome.html',
            context={
                'username': user.username,
            }
        )
    
    @staticmethod
    def send_password_reset(user, reset_link):
        """Send password reset email"""
        return EmailService.send_email(
            to_email=user.email,
            subject='Password Reset - Connect Liberia',
            template_name='password_reset.html',
            context={
                'username': user.username,
                'reset_link': reset_link,
            }
        )
    
    @staticmethod
    def send_suggestion_status(user, suggestion):
        """Send suggestion status update email"""
        return EmailService.send_email(
            to_email=user.email,
            subject=f'Suggestion Update: {suggestion.institution_name}',
            template_name='suggestion_status.html',
            context={
                'suggester_name': user.username,
                'institution_name': suggestion.institution_name,
                'status': suggestion.status,
                'admin_notes': suggestion.admin_notes or '',
            }
        )