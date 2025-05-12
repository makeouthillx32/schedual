// types/api.ts
import { NextRequest } from 'next/server';

/**
 * Type definitions for API route handlers
 */

// Base context type for all dynamic route handlers
export type RouteContext<T extends Record<string, string>> = {
  params: T;
};

// Specific route context types
export type ChannelRouteContext = RouteContext<{
  channel_id: string;
}>;

// Channel with message context (for nested dynamic routes)
export type ChannelMessageRouteContext = RouteContext<{
  channel_id: string;
  message_id: string;
}>;

// Route handler types for different HTTP methods
export type GetRouteHandler<T extends Record<string, string>> = (
  req: NextRequest,
  context: RouteContext<T>
) => Promise<Response>;

export type PostRouteHandler<T extends Record<string, string>> = (
  req: NextRequest,
  context: RouteContext<T>
) => Promise<Response>;

// You can add more specific handler types as needed