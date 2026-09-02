import os
import requests
from django.core.files.storage import Storage
from django.core.files.base import ContentFile
from django.utils.deconstruct import deconstructible
from datetime import datetime

try:
    from supabase import create_client, Client
except ImportError:
    create_client = None
    Client = None

@deconstructible
class SupabaseStorage(Storage):
    def __init__(self, bucket='institutions'):
        self.bucket = bucket
        self.supabase_url = os.environ.get('SUPABASE_URL')
        self.supabase_key = os.environ.get('SUPABASE_ANON_KEY')
        self.bucket_url = f"{self.supabase_url}/storage/v1/object/public/{self.bucket}" if self.supabase_url else None

    def _get_client(self):
        if create_client is None:
            raise ImportError("supabase package is not installed")
        return create_client(self.supabase_url, self.supabase_key)

    def _get_content_type(self, name):
        ext = name.split('.')[-1].lower()
        content_types = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'svg': 'image/svg+xml',
            'pdf': 'application/pdf',
            'mp4': 'video/mp4',
            'webm': 'video/webm',
        }
        return content_types.get(ext, 'application/octet-stream')

    def _upload_to_supabase(self, name, content):
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Supabase credentials not configured")
        
        client = self._get_client()
        
        if hasattr(content, 'read'):
            content.seek(0)
            file_content = content.read()
        else:
            file_content = content
        
        # REMOVE ANY DUPLICATE BUCKET NAME FROM THE PATH
        if name.startswith(f"{self.bucket}/"):
            name = name[len(self.bucket) + 1:]
        
        try:
            client.storage.from_(self.bucket).upload(
                name,
                file_content,
                {'content-type': self._get_content_type(name)}
            )
            return name
        except Exception as e:
            print(f"Supabase upload error: {e}")
            raise

    def _save(self, name, content):
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        name_parts = name.split('.')
        ext = name_parts[-1] if len(name_parts) > 1 else ''
        name_without_ext = '.'.join(name_parts[:-1])
        
        clean_name = ''.join(c for c in name_without_ext if c.isalnum() or c in '._-')
        unique_name = f"{timestamp}_{clean_name}.{ext}" if ext else f"{timestamp}_{clean_name}"
        
        return self._upload_to_supabase(unique_name, content)

    def _open(self, name, mode='rb'):
        url = f"{self.bucket_url}/{name}"
        response = requests.get(url)
        if response.status_code == 200:
            return ContentFile(response.content)
        raise FileNotFoundError(f"File {name} not found in Supabase")

    def exists(self, name):
        url = f"{self.bucket_url}/{name}"
        response = requests.head(url)
        return response.status_code == 200

    def delete(self, name):
        try:
            client = self._get_client()
            client.storage.from_(self.bucket).remove([name])
            return True
        except Exception as e:
            print(f"Delete error: {e}")
            return False

    def url(self, name):
        # FINAL FIX: Remove ANY duplicate bucket name from the URL
        if name.startswith(f"{self.bucket}/"):
            name = name.replace(f"{self.bucket}/", "", 1)
        if name.startswith(f"{self.bucket}"):
            name = name.replace(f"{self.bucket}", "", 1)
        # Make sure we don't have double slashes
        if name.startswith('/'):
            name = name[1:]
        return f"{self.bucket_url}/{name}"