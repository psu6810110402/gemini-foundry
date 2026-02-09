// hooks/useRateLimit.ts
"use client";

import { useState, useCallback, useRef } from "react";

interface RateLimitState {
  isRateLimited: boolean;
  remainingTime: number;
  requestsRemaining: number;
}

interface UseRateLimitOptions {
  maxRequests?: number;      // Max requests allowed in the window
  windowMs?: number;         // Time window in milliseconds
  cooldownMs?: number;       // Cooldown time after hitting limit
}

/**
 * Client-side rate limiting hook to prevent API request spam
 * Default: 3 requests per minute, with 60s cooldown after limit
 */
export function useRateLimit(options: UseRateLimitOptions = {}) {
  const {
    maxRequests = 3,
    windowMs = 60000,      // 1 minute window
    cooldownMs = 60000,    // 60s cooldown after limit hit
  } = options;

  const [state, setState] = useState<RateLimitState>({
    isRateLimited: false,
    remainingTime: 0,
    requestsRemaining: maxRequests,
  });

  const requestTimestamps = useRef<number[]>([]);
  const cooldownTimer = useRef<NodeJS.Timeout | null>(null);
  const countdownTimer = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = () => {
    if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
    if (countdownTimer.current) clearInterval(countdownTimer.current);
  };

  const startCooldown = useCallback((duration: number) => {
    clearTimers();
    
    setState(prev => ({
      ...prev,
      isRateLimited: true,
      remainingTime: Math.ceil(duration / 1000),
    }));

    // Countdown timer
    countdownTimer.current = setInterval(() => {
      setState(prev => {
        const newTime = prev.remainingTime - 1;
        if (newTime <= 0) {
          clearTimers();
          return {
            isRateLimited: false,
            remainingTime: 0,
            requestsRemaining: maxRequests,
          };
        }
        return { ...prev, remainingTime: newTime };
      });
    }, 1000);

    // Full reset timer
    cooldownTimer.current = setTimeout(() => {
      clearTimers();
      requestTimestamps.current = [];
      setState({
        isRateLimited: false,
        remainingTime: 0,
        requestsRemaining: maxRequests,
      });
    }, duration);
  }, [cooldownMs, maxRequests]);

  /**
   * Check if a request can be made
   * @returns true if allowed, false if rate limited
   */
  const canMakeRequest = useCallback((): boolean => {
    if (state.isRateLimited) return false;

    const now = Date.now();
    // Remove expired timestamps
    requestTimestamps.current = requestTimestamps.current.filter(
      ts => now - ts < windowMs
    );

    return requestTimestamps.current.length < maxRequests;
  }, [state.isRateLimited, maxRequests, windowMs]);

  /**
   * Record a request and check if rate limited
   * @returns true if request was allowed, false if blocked
   */
  const recordRequest = useCallback((): boolean => {
    if (state.isRateLimited) return false;

    const now = Date.now();
    // Remove expired timestamps
    requestTimestamps.current = requestTimestamps.current.filter(
      ts => now - ts < windowMs
    );

    if (requestTimestamps.current.length >= maxRequests) {
      // Rate limit hit!
      startCooldown(cooldownMs);
      return false;
    }

    // Record this request
    requestTimestamps.current.push(now);
    
    setState(prev => ({
      ...prev,
      requestsRemaining: maxRequests - requestTimestamps.current.length,
    }));

    return true;
  }, [state.isRateLimited, maxRequests, windowMs, cooldownMs, startCooldown]);

  /**
   * Handle 429 response - trigger immediate cooldown
   */
  const handle429 = useCallback(() => {
    startCooldown(cooldownMs);
  }, [cooldownMs, startCooldown]);

  return {
    ...state,
    canMakeRequest,
    recordRequest,
    handle429,
  };
}
