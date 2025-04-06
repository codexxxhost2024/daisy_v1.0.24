/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEEPGRAM_API_KEY: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_SERVICE_ROLE: string;
  readonly VITE_SUPABASE_JWT: string;
  readonly VITE_S3_BUCKET_NAME: string;
  readonly VITE_S3_ACCESS_KEY_ID: string;
  readonly VITE_S3_SECRET_ACCESS_KEY: string;
  // Add other environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
