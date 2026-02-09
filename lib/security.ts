// lib/security.ts
import { z } from "zod";

// 1. Input Sanitization (Basic XSS Prevention)
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

// 2. Password Strength Validator
export const validatePassword = (password: string): { valid: boolean; message: string } => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) return { valid: false, message: "Password must be at least 8 characters long." };
  if (!hasUpperCase) return { valid: false, message: "Password must contain at least one uppercase letter." };
  if (!hasLowerCase) return { valid: false, message: "Password must contain at least one lowercase letter." };
  if (!hasNumbers) return { valid: false, message: "Password must contain at least one number." };
  if (!hasSpecialChar) return { valid: false, message: "Password must contain at least one special character." };

  return { valid: true, message: "Password is secure." };
};

// 3. Rate Limiter (In-Memory Token Bucket for Edge/Serverless)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export const checkRateLimit = (identifier: string, limit: number = 10, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(identifier) || { count: 0, lastReset: now };

  if (now - record.lastReset > windowMs) {
    record.count = 0;
    record.lastReset = now;
  }

  if (record.count >= limit) return false;

  record.count += 1;
  rateLimitMap.set(identifier, record);
  return true;
};

// 4. Additional Security Utilities

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate UUID format
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Generate CSRF token
 */
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

/**
 * Mask sensitive data for logging
 */
export const maskSensitiveData = (data: string, visibleChars: number = 4): string => {
  if (data.length <= visibleChars * 2) {
    return "*".repeat(data.length);
  }
  return `${data.slice(0, visibleChars)}${"*".repeat(data.length - visibleChars * 2)}${data.slice(-visibleChars)}`;
};

/**
 * Safe JSON parse with error handling
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
};
