// src/types/env.d.ts
namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;    
    // You can add other environment variables here later
  }
}   // readonly NEXT_PUBLIC_API_URL: string;