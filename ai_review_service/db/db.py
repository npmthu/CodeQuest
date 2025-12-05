"""
Supabase client for database operations
"""
import os
from supabase import create_client, Client
from typing import Optional, Dict, Any, List


class SupabaseDB:
    def __init__(self):
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not supabase_url or not supabase_key:
            raise ValueError(
                "Missing Supabase configuration. "
                "Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env"
            )
        
        self.client: Client = create_client(supabase_url, supabase_key)
    
    def get_client(self) -> Client:
        """Get Supabase client instance"""
        return self.client


# Singleton instance
db = SupabaseDB()
