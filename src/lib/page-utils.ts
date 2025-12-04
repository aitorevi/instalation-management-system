import type { AstroGlobal } from 'astro';
import type { User } from './supabase';

export function getUser(astro: Readonly<AstroGlobal>): User {
  return astro.locals.user;
}

export function requireAdmin(astro: Readonly<AstroGlobal>): User {
  const user = getUser(astro);

  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }

  return user;
}

export function requireInstaller(astro: Readonly<AstroGlobal>): User {
  const user = getUser(astro);

  if (user.role !== 'installer') {
    throw new Error('Installer access required');
  }

  return user;
}
