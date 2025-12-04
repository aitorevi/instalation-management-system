import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateEnvironment } from './env';

describe('validateEnvironment', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should return environment variables when all are valid', () => {
    vi.stubEnv('PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
    vi.stubEnv('PUBLIC_APP_URL', 'http://localhost:4321');

    const result = validateEnvironment();

    expect(result).toEqual({
      PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      PUBLIC_APP_URL: 'http://localhost:4321'
    });
  });

  it('should throw error when PUBLIC_SUPABASE_URL is missing', () => {
    vi.stubEnv('PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
    vi.stubEnv('PUBLIC_APP_URL', 'http://localhost:4321');

    expect(() => validateEnvironment()).toThrow(
      'PUBLIC_SUPABASE_URL is not defined in environment variables'
    );
  });

  it('should throw error when PUBLIC_SUPABASE_ANON_KEY is missing', () => {
    vi.stubEnv('PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('PUBLIC_APP_URL', 'http://localhost:4321');

    expect(() => validateEnvironment()).toThrow(
      'PUBLIC_SUPABASE_ANON_KEY is not defined in environment variables'
    );
  });

  it('should throw error when PUBLIC_APP_URL is missing', () => {
    vi.stubEnv('PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

    expect(() => validateEnvironment()).toThrow(
      'PUBLIC_APP_URL is not defined in environment variables'
    );
  });

  it('should throw error when PUBLIC_SUPABASE_URL is not a valid URL', () => {
    vi.stubEnv('PUBLIC_SUPABASE_URL', 'invalid-url');
    vi.stubEnv('PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
    vi.stubEnv('PUBLIC_APP_URL', 'http://localhost:4321');

    expect(() => validateEnvironment()).toThrow('PUBLIC_SUPABASE_URL is not a valid URL');
  });

  it('should throw error when PUBLIC_APP_URL is not a valid URL', () => {
    vi.stubEnv('PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
    vi.stubEnv('PUBLIC_APP_URL', 'invalid-url');

    expect(() => validateEnvironment()).toThrow('PUBLIC_APP_URL is not a valid URL');
  });
});
