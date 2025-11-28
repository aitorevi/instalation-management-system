export interface EnvironmentVariables {
  PUBLIC_SUPABASE_URL: string;
  PUBLIC_SUPABASE_ANON_KEY: string;
  PUBLIC_APP_URL: string;
}

export function validateEnvironment(): EnvironmentVariables {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const appUrl = import.meta.env.PUBLIC_APP_URL;

  if (!supabaseUrl) {
    throw new Error('PUBLIC_SUPABASE_URL is not defined in environment variables');
  }

  if (!supabaseAnonKey) {
    throw new Error('PUBLIC_SUPABASE_ANON_KEY is not defined in environment variables');
  }

  if (!appUrl) {
    throw new Error('PUBLIC_APP_URL is not defined in environment variables');
  }

  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error('PUBLIC_SUPABASE_URL is not a valid URL');
  }

  try {
    new URL(appUrl);
  } catch {
    throw new Error('PUBLIC_APP_URL is not a valid URL');
  }

  return {
    PUBLIC_SUPABASE_URL: supabaseUrl,
    PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
    PUBLIC_APP_URL: appUrl
  };
}
