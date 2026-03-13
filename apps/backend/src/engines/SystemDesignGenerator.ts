/**
 * DATA STRUCTURES & ALGORITHMS (DSA) EXPLANATION: GRAPH ADJACENCY LIST
 * 
 * Why Use a Graph?
 * System design components are often interconnected or dependent on specific features. 
 * We use a Graph (implemented as an Adjacency List) to manage these dependencies because:
 * 1. Dependency Resolution: Some features (like 'notifications') require multiple 
 *    interconnected components (Service + Kafka). A graph allows us to traverse 
 *    and resolve these "requirement nodes" efficiently.
 * 2. Extensibility: Adding a new feature that depends on existing components 
 *    is just adding an edge in the adjacency list.
 * 3. Topological Order: In complex scenarios, we could use this graph to 
 *    determine the order in which components should be initialized or rendered.
 * 
 * Implementation:
 * - Adjacency List: A Map where keys are Feature names and values are arrays 
 *   of Component blueprints.
 * - Discovery: When a feature is detected in 'parsedQuery', we traverse the 
 *   list for that feature to "activate" all associated components safely.
 */

import { Category, Feature, Scale, ParseResult } from './QueryParser';

export type ComponentType = 'frontend' | 'backend' | 'database' | 'cache' | 'queue' | 'storage' | 'infra';

export interface Component {
  id: string;
  name: string;
  type: ComponentType;
  description: string;
  technology: string;
  responsibilities: string[];
}

export interface SystemArchitecture {
  title: string;
  overview: string;
  components: Component[];
  dataFlow: string[];
  scalabilityNotes: string[];
}

export class SystemDesignGenerator {
  // Graph Adjacency List: Feature -> Component Blueprints
  private featureGraph: Map<Feature, Partial<Component>[]> = new Map();

  constructor() {
    this.initializeFeatureGraph();
  }

  private initializeFeatureGraph(): void {
    this.featureGraph.set('payments', [{
      id: 'payment-svc',
      name: 'Payment Service',
      type: 'backend',
      description: 'Handles transaction processing and external gateway integration.',
      technology: 'Razorpay / Stripe, Node.js',
      responsibilities: ['Webhooks processing', 'Subscription management', 'Securing financial data']
    }]);

    this.featureGraph.set('realtime', [{
      id: 'ws-server',
      name: 'WebSocket Server',
      type: 'infra',
      description: 'Maintains persistent connections for bidirectional data flow.',
      technology: 'Socket.io, Go / Node.js',
      responsibilities: ['Live updates', 'Presence status', 'Real-time broadcasting']
    }]);

    this.featureGraph.set('notifications', [
      {
        id: 'notify-svc',
        name: 'Notification Service',
        type: 'backend',
        description: 'Multi-channel notification dispatcher.',
        technology: 'Node.js, Firebase Admin',
        responsibilities: ['FCM push tokens', 'Email templates', 'Retry logic']
      },
      {
        id: 'msg-queue',
        name: 'Message Broker',
        type: 'queue',
        description: 'Decouples notification triggers from delivery.',
        technology: 'Apache Kafka / RabbitMQ',
        responsibilities: ['Buffering bursts', 'Event sourcing', 'Reliable message delivery']
      }
    ]);

    this.featureGraph.set('media-upload', [
      {
        id: 'media-svc',
        name: 'Media Processing Service',
        type: 'backend',
        description: 'Handles image/video processing and CDN invalidation.',
        technology: 'Node.js, FFmpeg',
        responsibilities: ['Image resizing', 'Video transcoding', 'S3 Signed URLs']
      },
      {
        id: 'blob-storage',
        name: 'Object Storage',
        type: 'storage',
        description: 'Highly available storage for binary data.',
        technology: 'AWS S3 / Google Cloud Storage',
        responsibilities: ['Static assets', 'User uploads', 'Backup storage']
      }
    ]);

    this.featureGraph.set('search', [{
      id: 'search-engine',
      name: 'Search Service',
      type: 'infra',
      description: 'Provides full-text search and advanced filtering.',
      technology: 'Elasticsearch / OpenSearch',
      responsibilities: ['Indexing data', 'Fuzzy matching', 'Geospatial queries']
    }]);

    this.featureGraph.set('analytics', [{
      id: 'analytics-svc',
      name: 'Analytics Service',
      type: 'backend',
      description: 'Ingests and aggregates system metrics and user behavior.',
      technology: 'ClickHouse / BigQuery',
      responsibilities: ['Data aggregation', 'User funnel tracking', 'Performance monitoring']
    }]);
  }

  public generate(parsed: ParseResult): SystemArchitecture {
    const components: Component[] = this.getBaseComponents(parsed.appName);
    
    // Resolve Feature Graph Dependencies
    parsed.features.forEach(feature => {
      const featureComponents = this.featureGraph.get(feature);
      if (featureComponents) {
        featureComponents.forEach(comp => {
          // Avoid duplicate components (like a shared Kafka)
          if (!components.find(c => c.id === comp.id)) {
            components.push(comp as Component);
          }
        });
      }
    });

    return {
      title: `${parsed.appName} Architecture`,
      overview: `High-level system design for a ${parsed.category} platform at ${parsed.scale} scale, optimized for ${parsed.features.join(', ') || 'standard'} operations.`,
      components,
      dataFlow: this.getCategoryDataFlow(parsed.category),
      scalabilityNotes: this.getScalabilityNotes(parsed.scale)
    };
  }

  private getBaseComponents(appName: string): Component[] {
    return [
      {
        id: 'client-app',
        name: 'Client App',
        type: 'frontend',
        description: `Primary interface for ${appName} users.`,
        technology: 'React / Next.js / Flutter',
        responsibilities: ['User Interaction', 'State Management', 'API Integration']
      },
      {
        id: 'api-gateway',
        name: 'API Gateway',
        type: 'infra',
        description: 'Entry point for all client requests.',
        technology: 'Nginx / Kong',
        responsibilities: ['Rate Limiting', 'Authentication Routing', 'Request Logging']
      },
      {
        id: 'auth-svc',
        name: 'Auth Service',
        type: 'backend',
        description: 'Handles user identity and security tokens.',
        technology: 'Node.js, JWT',
        responsibilities: ['Token Generation', 'User Registration', 'Password Hashing']
      },
      {
        id: 'main-db',
        name: 'Primary Database',
        type: 'database',
        description: 'Source of truth for relational data.',
        technology: 'PostgreSQL',
        responsibilities: ['Data Persistence', 'ACID Transactions', 'Inventory/Profile management']
      },
      {
        id: 'cache-layer',
        name: 'Distributed Cache',
        type: 'cache',
        description: 'In-memory store for high-speed data retrieval.',
        technology: 'Redis',
        responsibilities: ['Session management', 'Query caching', 'Rate limiting counters']
      }
    ];
  }

  private getCategoryDataFlow(category: Category): string[] {
    const flows: Record<Category, string[]> = {
      restaurant: [
        '1. User searches for nearby restaurants via Search Service.',
        '2. Menu information is fetched from Cache (Redis) or Primary DB.',
        '3. Order is placed; Payment Service processes the transaction.',
        '4. WebSocket Server pushes live status to Client and Kitchen apps.',
        '5. Notification Service alerts delivery partner via Push/SMS.'
      ],
      ecommerce: [
        '1. User browses products; Search Service handles filtering and sorting.',
        '2. Items added to cart (synced via Cache layer).',
        '3. Checkout triggers Payment Service and Inventory update in Postgres.',
        '4. Order event emitted to Kafka for shipping and analytics.',
        '5. User receives order confirmation via Notification Service.'
      ],
      social: [
        '1. User uploads media to S3 via Media Service.',
        '2. Post metadata stored in Postgres; Feed generated using Redis/Cache.',
        '3. WebSocket Server notifies followers of new post in real-time.',
        '4. Analytics Service tracks engagement metrics (likes, shares).',
        '5. Push notifications sent for tagging and comments.'
      ],
      fintech: [
        '1. Secure login verified by Auth Service (MFA).',
        '2. Transaction initiated; stored in Immutable Postgres Ledger.',
        '3. Real-time balance updates pushed via WebSockets.',
        '4. Fraud detection service analyzes transaction patterns.',
        '5. Transaction receipt generated and stored in Object Storage.'
      ],
      healthcare: [
        '1. Patient books appointment; validated by Auth Service.',
        '2. EHR (Electronic Health Records) retrieved securely from DB.',
        '3. Telehealth session established via RTC signaling (infra).',
        '4. Medical reports uploaded to S3 with encryption at rest.',
        '5. Pharmacy alerted via Notification Service for prescription.'
      ],
      logistics: [
        '1. Fleet GPS updates streamed to WebSocket Server.',
        '2. Route optimization engine processes data in background.',
        '3. Warehouse updates inventory in Postgres.',
        '4. Delivery status changes published to Message Broker.',
        '5. Driver assigned via geospatial query in Search Service.'
      ],
      saas: [
        '1. Tenant signs in; API Gateway routes to specific cluster.',
        '2. Dynamic forms and workflows fetched from Postgres.',
        '3. Real-time collaboration status synced via WebSockets.',
        '4. Heavy reports processed asynchronously via Kafka + Workers.',
        '5. Analytics dashboard visualizes tenant data.'
      ],
      gaming: [
        '1. Player joins lobby; Matchmaking service finds peers.',
        '2. Game state synchronized at low latency via WebSockets.',
        '3. Leaderboard updates cached in Redis for instant retrieval.',
        '4. In-game purchases handled via Payment Service.',
        '5. Session metrics periodically dumped to Analytics Service.'
      ],
      generic: [
        '1. Client request enters through API Gateway.',
        '2. Auth Service validates session/token.',
        '3. Primary Backend processes business logic and DB queries.',
        '4. Critical data cached in Redis for subsequent requests.',
        '5. Response sent back to Client.'
      ]
    };
    return flows[category] || flows.generic;
  }

  private getScalabilityNotes(scale: Scale): string[] {
    const common = ['Horizontal scaling of stateless backend services.'];
    if (scale === 'large') {
      return [
        ...common,
        'Global CDN (CloudFront/Cloudflare) for edge delivery of frontend and media.',
        'Database Sharding and Read Replicas for massive throughput.',
        'Multi-region deployment for high availability and disaster recovery.',
        'Auto-scaling groups based on CPU/Memory/Request throughput.'
      ];
    }
    if (scale === 'medium') {
      return [
        ...common,
        'Connection pooling (PgBouncer) for database efficiency.',
        'Introduction of Message Queues (Kafka) for asynchronous processing.',
        'Multi-AZ (Availability Zone) deployment for redundancy.'
      ];
    }
    return [
      ...common,
      'Simple load balancing across 2-3 instances.',
      'Vertical scaling of database for simple management.',
      'Basic database indexing for performance.'
    ];
  }
}
