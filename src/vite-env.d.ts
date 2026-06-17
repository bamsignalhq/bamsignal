/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_PUBLIC_APP_URL?: string;
  readonly VITE_PAYSTACK_PUBLIC_KEY?: string;
  readonly NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?: string;
  readonly VITE_ENABLE_IMAGE_MODERATION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_BUILD_ID__: string;
