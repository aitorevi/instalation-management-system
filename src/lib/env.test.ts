import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateEnvironment } from './env';

describe('validateEnvironment', () => {
  const originalEnv = import.meta.env;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    import.meta.env = originalEnv;
  });

  it('should return environment variables when all are valid', () => {
    import.meta.env = {
      ...originalEnv,
      PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      PUBLIC_APP_URL: 'http://localhost:4321'
    };

    const result = validateEnvironment();

    expect(result).toEqual({
      PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      PUBLIC_APP_URL: 'http://localhost:4321'
    });
  });

  it('should throw error when PUBLIC_SUPABASE_URL is missing', () => {
    import.meta.env = {
      ...originalEnv,
      PUBLIC_SUPABASE_URL: undefined,
      PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      PUBLIC_APP_URL: 'http://localhost:4321'
    };

    expect(() => validateEnvironment()).toThrow(
      'PUBLIC_SUPABASE_URL is not defined in environment variables'
    );
  });

  it('should throw error when PUBLIC_SUPABASE_ANON_KEY is missing', () => {
    import.meta.env = {
      ...originalEnv,
      PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      PUBLIC_SUPABASE_ANON_KEY: undefined,
      PUBLIC_APP_URL: 'http://localhost:4321'
    };

    expect(() => validateEnvironment()).toThrow(
      'PUBLIC_SUPABASE_ANON_KEY is not defined in environment variables'
    );
  });

  it('should throw error when PUBLIC_APP_URL is missing', () => {
    import.meta.env = {
      ...originalEnv,
      PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      PUBLIC_APP_URL: undefined
    };

    expect(() => validateEnvironment()).toThrow(
      'PUBLIC_APP_URL is not defined in environment variables'
    );
  });

  it('should throw error when PUBLIC_SUPABASE_URL is not a valid URL', () => {
    import.meta.env = {
      ...originalEnv,
      PUBLIC_SUPABASE_URL: 'invalid-url',
      PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      PUBLIC_APP_URL: 'http://localhost:4321'
    };

    expect(() => validateEnvironment()).toThrow('PUBLIC_SUPABASE_URL is not a valid URL');
  });

  it('should throw error when PUBLIC_APP_URL is not a valid URL', () => {
    import.meta.env = {
      ...originalEnv,
      PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      PUBLIC_APP_URL: 'invalid-url'
    };

    expect(() => validateEnvironment()).toThrow('PUBLIC_APP_URL is not a valid URL');
  });
});
