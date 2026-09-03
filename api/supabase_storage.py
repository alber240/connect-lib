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
        
        if self.supabase_url and self.supabase_key:
            self.client = create_client(self.supabase_url, self.supabase_key)
        else:
            self.client = None
        
        self.bucket_url = f"{self.supabase_url}/storage/v1/object/public/{self.bucket}" if self.supabase_url else None

    def _get_client(self):
        if self.client is None:
            raise ValueError("Supabase client not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY.")
        return self.client

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
        client = self._get_client()
        
        if hasattr(content, 'read'):
            content.seek(0)
            file_content = content.read()
        else:
            file_content = content
        
        try:
            # Upload to the 'covers' folder
            upload_path = f"covers/{name}"
            
            client.storage.from_(self.bucket).upload(
                upload_path,
                file_content,
                {'content-type': self._get_content_type(name)}
            )
            
            # Return the path without the bucket name
            return f"covers/{name}"
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
        # Clean the path
        name = self._clean_path(name)
        url = f"{self.bucket_url}/{name}"
        response = requests.get(url)
        if response.status_code == 200:
            return ContentFile(response.content)
        raise FileNotFoundError(f"File {name} not found in Supabase")

    def exists(self, name):
        name = self._clean_path(name)
        url = f"{self.bucket_url}/{name}"
        response = requests.head(url)
        return response.status_code == 200

    def delete(self, name):
        try:
            client = self._get_client()
            name = self._clean_path(name)
            client.storage.from_(self.bucket).remove([name])
            return True
        except Exception as e:
            print(f"Delete error: {e}")
            return False

    def url(self, name):
        """Get public URL for file"""
        # Clean the path - this is the most important fix!
        name = self._clean_path(name)
        return f"{self.bucket_url}/{name}"

    def _clean_path(self, name):
        """Remove duplicate bucket names from the path"""
        # Remove any duplicate bucket name prefixes
        if name.startswith(f"{self.bucket}/{self.bucket}/"):
            name = name.replace(f"{self.bucket}/{self.bucket}/", f"{self.bucket}/", 1)
        
        # If it starts with 'institutions/' but shouldn't (since it's already the bucket)
        if name.startswith(f"{self.bucket}/"):
            # This is correct, keep it
            pass
        
        # If it starts with just the bucket name without slash
        if name.startswith(f"{self.bucket}"):
            # Add the slash if missing
            if not name.startswith(f"{self.bucket}/"):
                name = name.replace(f"{self.bucket}", f"{self.bucket}/", 1)
        
        # Make sure it has 'covers/' at the beginning
        if not name.startswith('covers/'):
            # If it doesn't have covers/, add it
            if name.startswith(f"{self.bucket}/"):
                # Remove the bucket prefix and add covers/
                name = name.replace(f"{self.bucket}/", "covers/", 1)
            else:
                name = f"covers/{name}"
        
        return name