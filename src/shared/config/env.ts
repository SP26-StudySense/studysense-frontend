import { z } from 'zod';

const envSchema = z.object({
  // Application
  NEXT_PUBLIC_APP_NAME: z.string().default('StudySense'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // API
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:5000/api'),
  NEXT_PUBLIC_API_TIMEOUT: z.coerce.number().default(30000),

  // Auth
  NEXT_PUBLIC_AUTH_TOKEN_KEY: z.string().default('sss_access_token'),
  NEXT_PUBLIC_AUTH_REFRESH_KEY: z.string().default('sss_refresh_token'),

  // Feature Flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.coerce.boolean().default(false),
  NEXT_PUBLIC_ENABLE_AI_RECOMMENDATIONS: z.coerce.boolean().default(true),
});

type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_API_TIMEOUT: process.env.NEXT_PUBLIC_API_TIMEOUT,
    NEXT_PUBLIC_AUTH_TOKEN_KEY: process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY,
    NEXT_PUBLIC_AUTH_REFRESH_KEY: process.env.NEXT_PUBLIC_AUTH_REFRESH_KEY,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    NEXT_PUBLIC_ENABLE_AI_RECOMMENDATIONS: process.env.NEXT_PUBLIC_ENABLE_AI_RECOMMENDATIONS,
  });

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

export const env = getEnv();
