/**
 * DATA STRUCTURES & ALGORITHMS (DSA) EXPLANATION: ARRAY + HASH MAP FOR GROUPING
 * 
 * Why Use this Pattern?
 * In REST API design, endpoints are naturally grouped by resource or category. 
 * We use an Array for storage and a Map (HashMap) for efficient template lookup:
 * 1. O(1) Template Retrieval: The HashMap allows us to fetch all endpoint 
 *    blueprints for a specific category (e.g., 'ecommerce') in constant time.
 * 2. Sequential Processing: Arrays are perfect for storing the final list of 
 *    endpoints because we often iterate over them to generate documentation, 
 *    build router files, or render UIs.
 * 3. Categorical Organization: By grouping blueprints in a Map, we keep the 
 *    codebase modular. Adding a new category only requires adding one entry 
 *    to the Map, without touching the core generation logic.
 * 
 * Implementation:
 * - `templates`: A Map where Category keys point to an Array of blueprint objects.
 * - `APIEndpoint`: The final flat structure used for the system's output.
 */

import { Category, ParseResult } from './QueryParser';

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface APIEndpoint {
  method: HTTPMethod;
  path: string;
  description: string;
  auth: boolean;
  requestBody?: Record<string, string>;
  queryParams?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  responseExample: Record<string, any>;
  statusCodes: Record<number, string>;
}

export interface APIDesign {
  baseUrl: string;
  version: "v1";
  authStrategy: string;
  rateLimiting: string;
  endpoints: APIEndpoint[];
}

export class APIDesignGenerator {
  private templates: Map<Category, APIEndpoint[]> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // Restaurant Group
    this.templates.set('restaurant', [
      {
        method: 'GET',
        path: '/restaurants',
        description: 'Search and list restaurants near the user.',
        auth: false,
        queryParams: [{ name: 'lat', type: 'float', required: true, description: 'Latitude' }],
        responseExample: { success: true, count: 20, data: [{ id: 'uuid', name: 'Pizza Hub' }] },
        statusCodes: { 200: 'Success', 400: 'Invalid coordinates' }
      },
      {
        method: 'GET',
        path: '/restaurants/:id/menu',
        description: 'Fetch menu categories and items for a restaurant.',
        auth: false,
        responseExample: { restaurant_id: 'uuid', categories: [{ name: 'Sides', items: [] }] },
        statusCodes: { 200: 'Success', 404: 'Restaurant not found' }
      },
      {
        method: 'POST',
        path: '/orders',
        description: 'Place a new food order.',
        auth: true,
        requestBody: { restaurant_id: 'uuid', items: 'array of {id, qty}', payment_methodId: 'string' },
        responseExample: { order_id: 'uuid', status: 'pending', estimated_delivery: '2024-03-13T09:00:00Z' },
        statusCodes: { 201: 'Order placed', 402: 'Payment failed' }
      }
    ]);

    // Ecommerce Group
    this.templates.set('ecommerce', [
      {
        method: 'GET',
        path: '/products',
        description: 'Browse product catalog with filters.',
        auth: false,
        queryParams: [{ name: 'category', type: 'string', required: false, description: 'Filter by category' }],
        responseExample: { products: [{ id: 'uuid', price: 99.99, slug: 'nike-air-max' }] },
        statusCodes: { 200: 'Success' }
      },
      {
        method: 'POST',
        path: '/orders/checkout',
        description: 'Complete purchase and initiate shipping.',
        auth: true,
        requestBody: { cart_id: 'uuid', address_id: 'uuid', gateway: 'stripe' },
        responseExample: { transaction_id: 'uuid', shipment_tracking: 'TRK123' },
        statusCodes: { 200: 'Checkout success', 409: 'Stock mismatch' }
      }
    ]);

    // Social Group
    this.templates.set('social', [
      {
        method: 'GET',
        path: '/feed',
        description: 'Retrieve personalized activity feed for the user.',
        auth: true,
        queryParams: [{ name: 'cursor', type: 'string', required: false, description: 'Pagination marker' }],
        responseExample: { posts: [{ id: 'uuid', author: 'John', content: 'Hello!' }], next_cursor: '...' },
        statusCodes: { 200: 'Success' }
      },
      {
        method: 'POST',
        path: '/posts/:id/like',
        description: 'Like or unlike a post.',
        auth: true,
        responseExample: { status: 'liked', total_likes: 42 },
        statusCodes: { 200: 'Toggled success' }
      }
    ]);

    // Fintech Group
    this.templates.set('fintech', [
      {
        method: 'GET',
        path: '/accounts/balance',
        description: 'Fetch current balance for all user wallets.',
        auth: true,
        responseExample: { accounts: [{ type: 'savings', balance: 5000.50, currency: 'USD' }] },
        statusCodes: { 200: 'Success' }
      },
      {
        method: 'POST',
        path: '/transactions/transfer',
        description: 'Peer-to-peer fund transfer.',
        auth: true,
        requestBody: { recipient_id: 'uuid', amount: 'number', note: 'string' },
        responseExample: { transaction_id: 'uuid', timestamp: '2024-03-13T08:30:00Z', new_balance: 4900.50 },
        statusCodes: { 200: 'Transfer completed', 403: 'Insufficient funds' }
      }
    ]);

    // Healthcare Group
    this.templates.set('healthcare', [
      {
        method: 'GET',
        path: '/doctors',
        description: 'List available doctors and specialities.',
        auth: false,
        responseExample: { doctors: [{ id: 'uuid', name: 'Dr. Smith', speciality: 'Cardiology' }] },
        statusCodes: { 200: 'Success' }
      },
      {
        method: 'POST',
        path: '/appointments',
        description: 'Book a consultation slot.',
        auth: true,
        requestBody: { doctor_id: 'uuid', slot_time: 'datetime' },
        responseExample: { appointment_id: 'uuid', status: 'confirmed' },
        statusCodes: { 201: 'Booked', 409: 'Slot taken' }
      }
    ]);

    // Logistics Group
    this.templates.set('logistics', [
      {
        method: 'POST',
        path: '/shipments',
        description: 'Create a new shipment request.',
        auth: true,
        requestBody: { pickup: 'address', destination: 'address', weight: 'kg' },
        responseExample: { tracking_number: 'SRCHR99', status: 'label_created' },
        statusCodes: { 201: 'Created' }
      },
      {
        method: 'GET',
        path: '/shipments/:id/track',
        description: 'Live tracking status of a shipment.',
        auth: false,
        responseExample: { status: 'in_transit', current_loc: { lat: 12.9, lng: 77.5 } },
        statusCodes: { 200: 'Success' }
      }
    ]);

    // SaaS Group
    this.templates.set('saas', [
      {
        method: 'GET',
        path: '/dashboard',
        description: 'Aggregate metrics for the organization dashboard.',
        auth: true,
        responseExample: { active_users: 150, uptime: '99.9%' },
        statusCodes: { 200: 'Success' }
      },
      {
        method: 'POST',
        path: '/organizations',
        description: 'Create a new tenant organization.',
        auth: true,
        requestBody: { name: 'string', plan: 'pro' },
        responseExample: { org_id: 'uuid', setup_url: 'https://...' },
        statusCodes: { 201: 'Org created' }
      }
    ]);

    // Gaming Group
    this.templates.set('gaming', [
      {
        method: 'GET',
        path: '/leaderboard',
        description: 'Top global players by rank.',
        auth: false,
        queryParams: [{ name: 'game_id', type: 'string', required: true, description: 'Filter by game' }],
        responseExample: { top_players: [{ rank: 1, player: 'Ninja', score: 9999 }] },
        statusCodes: { 200: 'Success' }
      },
      {
        method: 'POST',
        path: '/matches',
        description: 'Start a matchmaking request.',
        auth: true,
        requestBody: { mode: 'ranked', region: 'us-east' },
        responseExample: { match_id: 'uuid', search_status: 'searching' },
        statusCodes: { 200: 'Matchmaking started' }
      }
    ]);
  }

  public generate(parsed: ParseResult): APIDesign {
    const authEndpoints = this.getAuthEndpoints();
    const categoryEndpoints = this.templates.get(parsed.category) || [];
    
    return {
      baseUrl: 'https://api.srchr.io',
      version: 'v1',
      authStrategy: 'JWT bearer tokens with RSA-256 signing',
      rateLimiting: parsed.scale === 'large' ? '5000 req/min' : '100 req/min',
      endpoints: [...authEndpoints, ...categoryEndpoints]
    };
  }

  private getAuthEndpoints(): APIEndpoint[] {
    return [
      {
        method: 'POST',
        path: '/auth/register',
        description: 'Create a new user account.',
        auth: false,
        requestBody: { email: 'string', password: 'string', name: 'string' },
        responseExample: { id: 'uuid', email: 'user@example.com' },
        statusCodes: { 201: 'User created', 400: 'Bad Request', 409: 'Email exists' }
      },
      {
        method: 'POST',
        path: '/auth/login',
        description: 'Exchange credentials for JWT access and refresh tokens.',
        auth: false,
        requestBody: { email: 'string', password: 'string' },
        responseExample: { access_token: 'jwt_hash', refresh_token: 'uuid', expires_in: 3600 },
        statusCodes: { 200: 'Login Success', 401: 'Unauthorized' }
      },
      {
        method: 'POST',
        path: '/auth/refresh',
        description: 'Renew access token using a valid refresh token.',
        auth: false,
        requestBody: { refresh_token: 'uuid' },
        responseExample: { access_token: 'new_jwt_hash' },
        statusCodes: { 200: 'Refreshed', 401: 'Invalid Token' }
      },
      {
        method: 'GET',
        path: '/users/me',
        description: 'Get current authenticated user profile.',
        auth: true,
        responseExample: { id: 'uuid', email: 'user@example.com', roles: ['user'] },
        statusCodes: { 200: 'Success', 401: 'Missing Authorization' }
      }
    ];
  }
}
