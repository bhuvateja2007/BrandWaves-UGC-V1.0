import { PublicRole, UserRole } from '../types';

export const ALLOWED_PUBLIC_ROLES: PublicRole[] = ['customer', 'creator', 'brand_owner'];

/**
 * Validates standard email address format according to RFC 5322 specs
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email address is required.' };
  }
  const trimmed = email.trim();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }
  return { isValid: true };
}

/**
 * Validates password strength (minimum 8 chars for Phase 2 security)
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password) {
    return { isValid: false, error: 'Password is required.' };
  }
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long.' };
  }
  return { isValid: true };
}

/**
 * Validates password confirmation matches password exactly
 */
export function validatePasswordConfirmation(password: string, confirm: string): { isValid: boolean; error?: string } {
  if (!confirm) {
    return { isValid: false, error: 'Please confirm your password.' };
  }
  if (password !== confirm) {
    return { isValid: false, error: 'Passwords do not match.' };
  }
  return { isValid: true };
}

/**
 * Strict server/client public role allowlist validator.
 * Prevents self-assignment of 'admin' or arbitrary privileged roles.
 */
export function validatePublicRole(role: string): { isValid: boolean; role: PublicRole; error?: string } {
  if (role === 'admin' || role === 'moderator') {
    return { 
      isValid: false, 
      role: 'customer', 
      error: 'Administrative roles cannot be assigned through public registration.' 
    };
  }
  if (ALLOWED_PUBLIC_ROLES.includes(role as PublicRole)) {
    return { isValid: true, role: role as PublicRole };
  }
  return { 
    isValid: false, 
    role: 'customer', 
    error: `Invalid role selected. Permitted public roles: ${ALLOWED_PUBLIC_ROLES.join(', ')}.` 
  };
}

/**
 * Human-readable display label for each role
 */
export function getRoleDisplayName(role?: UserRole | string): string {
  switch (role) {
    case 'admin':
      return 'Platform Administrator';
    case 'brand_owner':
    case 'brand_admin':
      return 'Brand Owner';
    case 'creator':
      return 'Creator';
    case 'customer':
    case 'user':
    default:
      return 'Customer';
  }
}

/**
 * Resolves the primary dashboard / landing route according to authoritative role
 */
export function getRoleLandingRoute(role?: UserRole | string): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'brand_owner':
    case 'brand_admin':
      return '/dashboard'; // Brand Dashboard view
    case 'creator':
      return '/dashboard'; // Creator Dashboard view
    case 'customer':
    case 'user':
    default:
      return '/customer'; // Customer Portal Hub
  }
}

/**
 * Returns the intended user-facing destination route for an administrator
 * switching to user view, without modifying their administrative role.
 */
export function getUserLandingRoute(targetView: 'marketplace' | 'customer' | 'creator' | 'brand' = 'marketplace'): string {
  switch (targetView) {
    case 'customer':
      return '/customer';
    case 'creator':
      return '/creator';
    case 'brand':
      return '/brand';
    case 'marketplace':
    default:
      return '/';
  }
}

/**
 * Translates Supabase authentication errors into safe, user-friendly messages
 */
export function formatAuthError(err: any): string {
  if (!err) return 'An unexpected error occurred. Please try again.';
  const message = typeof err === 'string' ? err : err.message || '';

  if (message.includes('Invalid login credentials')) {
    return 'Invalid email address or password. Please verify your credentials.';
  }
  if (message.includes('Email not confirmed')) {
    return 'Your email address has not been verified yet. Please check your inbox or request a new verification link.';
  }
  if (message.includes('User already registered')) {
    return 'An account with this email address already exists. Please sign in or use password recovery.';
  }
  if (message.includes('rate limit')) {
    return 'Too many attempts. For security reasons, please wait a few minutes before trying again.';
  }
  if (message.includes('Password should be at least')) {
    return 'Password must be at least 8 characters long.';
  }
  return message || 'Authentication failed. Please check your details and try again.';
}
