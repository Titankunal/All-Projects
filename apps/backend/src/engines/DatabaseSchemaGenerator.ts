/**
 * DATA STRUCTURES & ALGORITHMS (DSA) EXPLANATION: HASH MAP (DICTIONARY)
 * 
 * Why Use a HashMap?
 * In this Schema Generator, we need to map a Category name to a specific set of 
 * table blueprints. A HashMap is the optimal choice because:
 * 1. O(1) Access: Retrieving the schema template for any category (e.g., 'fintech') 
 *    is a constant-time operation regardless of how many categories we support.
 * 2. Key-Value Association: It provides a clean, decoupled way to store 
 *    business logic associated with a specific key.
 * 3. Dynamic Lookup: It allows the generator to handle "generic" cases gracefully 
 *    by providing a default fallback if a key is not found in the map.
 * 
 * Implementation:
 * - The `templates` Map stores Category as the key and a list of `DBTable` 
 *   definitions as the value.
 */

import { Category, ParseResult } from './QueryParser';

export interface DBColumn {
  name: string;
  type: string;
  constraints: string[];
  description: string;
}

export interface DBTable {
  name: string;
  description: string;
  columns: DBColumn[];
  indexes: string[];
  relations: string[];
}

export interface DatabaseSchema {
  dbType: "PostgreSQL" | "MongoDB" | "MySQL";
  reasoning: string;
  tables: DBTable[];
  designNotes: string[];
}

export class DatabaseSchemaGenerator {
  private templates: Map<Category, DBTable[]> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // Restaurant Template
    this.templates.set('restaurant', [
      {
        name: 'restaurants',
        description: 'Stores restaurant metadata and operational status.',
        columns: [
          { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Unique identifier' },
          { name: 'name', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'Display name' },
          { name: 'owner_id', type: 'UUID', constraints: ['REFERENCES users(id)'], description: 'Owner relation' },
          { name: 'status', type: 'VARCHAR(50)', constraints: ['DEFAULT \'active\''], description: 'Open/Closed status' }
        ],
        indexes: ['CREATE INDEX idx_restaurant_owner ON restaurants(owner_id)'],
        relations: ['Many-to-One with users']
      },
      {
        name: 'menu_items',
        description: 'Catalog of food items per restaurant.',
        columns: [
          { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY'], description: 'Unique identifier' },
          { name: 'restaurant_id', type: 'UUID', constraints: ['REFERENCES restaurants(id)'], description: 'Parent restaurant' },
          { name: 'price', type: 'DECIMAL(12,2)', constraints: ['NOT NULL'], description: 'Item price' }
        ],
        indexes: ['CREATE INDEX idx_menu_restaurant ON menu_items(restaurant_id)'],
        relations: ['Many-to-One with restaurants']
      },
      {
        name: 'orders',
        description: 'High-level order tracking.',
        columns: [
          { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY'], description: 'Unique identifier' },
          { name: 'user_id', type: 'UUID', constraints: ['REFERENCES users(id)'], description: 'Customer' },
          { name: 'total_amount', type: 'DECIMAL(12,2)', constraints: ['NOT NULL'], description: 'Total price' }
        ],
        indexes: ['CREATE INDEX idx_order_user ON orders(user_id)'],
        relations: ['Many-to-One with users']
      }
    ]);

    // Ecommerce Template
    this.templates.set('ecommerce', [
      {
        name: 'products',
        description: 'Physical or digital goods for sale.',
        columns: [
          { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY'], description: 'Unique identifier' },
          { name: 'slug', type: 'VARCHAR(255)', constraints: ['UNIQUE', 'NOT NULL'], description: 'URL friendly name' },
          { name: 'stock_count', type: 'INTEGER', constraints: ['DEFAULT 0'], description: 'Inventory level' }
        ],
        indexes: ['CREATE UNIQUE INDEX idx_product_slug ON products(slug)'],
        relations: []
      }
    ]);

    // Social Template
    this.templates.set('social', [
      {
        name: 'posts',
        description: 'User-generated content.',
        columns: [
          { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY'], description: 'Unique identifier' },
          { name: 'author_id', type: 'UUID', constraints: ['REFERENCES users(id)'], description: 'Creator' },
          { name: 'content', type: 'TEXT', constraints: ['NOT NULL'], description: 'Post body' }
        ],
        indexes: ['CREATE INDEX idx_post_author ON posts(author_id)'],
        relations: ['Many-to-One with users']
      },
      {
        name: 'follows',
        description: 'Social graph connections.',
        columns: [
          { name: 'follower_id', type: 'UUID', constraints: ['REFERENCES users(id)'], description: 'User following' },
          { name: 'following_id', type: 'UUID', constraints: ['REFERENCES users(id)'], description: 'User being followed' }
        ],
        indexes: ['CREATE UNIQUE INDEX idx_follow_pair ON follows(follower_id, following_id)'],
        relations: ['Many-to-Many via users']
      }
    ]);

    // Fintech Template
    this.templates.set('fintech', [
      {
        name: 'accounts',
        description: 'Financial accounts representing balances.',
        columns: [
          { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY'], description: 'Unique identifier' },
          { name: 'balance', type: 'DECIMAL(20,2)', constraints: ['DEFAULT 0'], description: 'Current balance' },
          { name: 'currency', type: 'CHAR(3)', constraints: ['NOT NULL'], description: 'ISO currency code' }
        ],
        indexes: [],
        relations: ['Many-to-One with users']
      },
      {
        name: 'ledger_entries',
        description: 'Immutable record of all financial movements.',
        columns: [
          { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY'], description: 'Unique identifier' },
          { name: 'amount', type: 'DECIMAL(20,2)', constraints: ['NOT NULL'], description: 'Flow amount' }
        ],
        indexes: ['CREATE INDEX idx_ledger_account ON ledger_entries(id)'],
        relations: ['Audit log']
      }
    ]);

    // Healthcare Template
    this.templates.set('healthcare', [
      {
        name: 'patients',
        description: 'Medical profile of registered patients.',
        columns: [
          { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY'], description: 'Unique identifier' },
          { name: 'medical_history', type: 'JSONB', constraints: ['DEFAULT \'{}\''], description: 'Structured history' }
        ],
        indexes: [],
        relations: ['One-to-One with users']
      }
    ]);

    // Logistics Template
    this.templates.set('logistics', [
      {
        name: 'shipments',
        description: 'Tracking details for cargo.',
        columns: [
          { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY'], description: 'Unique identifier' },
          { name: 'current_lat', type: 'FLOAT8', constraints: [], description: 'Latitude' },
          { name: 'current_lng', type: 'FLOAT8', constraints: [], description: 'Longitude' }
        ],
        indexes: ['CREATE INDEX idx_shipment_geo ON shipments(current_lat, current_lng)'],
        relations: []
      }
    ]);

    // SaaS Template
    this.templates.set('saas', [
      {
        name: 'organizations',
        description: 'Multi-tenant containers for data.',
        columns: [
          { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY'], description: 'Unique identifier' },
          { name: 'subscription_tier', type: 'VARCHAR(50)', constraints: ['DEFAULT \'free\''], description: 'Plan level' }
        ],
        indexes: [],
        relations: []
      }
    ]);

    // Gaming Template
    this.templates.set('gaming', [
      {
        name: 'players',
        description: 'Gaming specific profile data.',
        columns: [
          { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY'], description: 'Unique identifier' },
          { name: 'xp', type: 'BIGINT', constraints: ['DEFAULT 0'], description: 'Experience points' }
        ],
        indexes: ['CREATE INDEX idx_player_xp ON players(xp DESC)'],
        relations: ['One-to-One with users']
      }
    ]);
  }

  public generate(parsed: ParseResult): DatabaseSchema {
    const baseTables = this.getBaseTables();
    const categoryTables = this.templates.get(parsed.category) || [];
    
    // Merge tables
    const allTables = [...baseTables, ...categoryTables];

    // Determine DB Type based on category/query
    let dbType: "PostgreSQL" | "MongoDB" | "MySQL" = "PostgreSQL";
    let reasoning = "PostgreSQL chosen for strict ACID compliance, robust relational integrity, and advanced JSONB support for hybrid document-relational models.";

    if (parsed.features.includes('realtime') || parsed.category === 'social') {
      reasoning += " Additionally, Postgres handles large-scale concurrent reads efficiently via read-replicas.";
    }

    return {
      dbType,
      reasoning,
      tables: allTables,
      designNotes: [
        `System uses UUID v4 for primary keys to allow for distributed generation and avoid ID exhaustion.`,
        `All timestamps use TIMESTAMPTZ to ensure timezone consistency across global deployments.`,
        `Foreign keys are enforced at the database level to maintain referential integrity.`,
        `Indexes are strategically placed on foreign keys and frequently filtered columns to optimize query performance at ${parsed.scale} scale.`
      ]
    };
  }

  private getBaseTables(): DBTable[] {
    return [
      {
        name: 'users',
        description: 'Core user accounts and identity information.',
        columns: [
          { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Global unique ID' },
          { name: 'email', type: 'VARCHAR(255)', constraints: ['UNIQUE', 'NOT NULL'], description: 'Unique login email' },
          { name: 'password_hash', type: 'TEXT', constraints: ['NOT NULL'], description: 'Bcrypt/Argon2 hashed password' },
          { name: 'created_at', type: 'TIMESTAMPTZ', constraints: ['DEFAULT NOW()'], description: 'Creation timestamp' },
          { name: 'updated_at', type: 'TIMESTAMPTZ', constraints: ['DEFAULT NOW()'], description: 'Last update timestamp' }
        ],
        indexes: ['CREATE UNIQUE INDEX idx_users_email ON users(email)'],
        relations: []
      },
      {
        name: 'refresh_tokens',
        description: 'Session management for OIDC/JWT flows.',
        columns: [
          { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY'], description: 'Token ID' },
          { name: 'user_id', type: 'UUID', constraints: ['REFERENCES users(id)', 'ON DELETE CASCADE'], description: 'Associated user' },
          { name: 'token', type: 'TEXT', constraints: ['NOT NULL'], description: 'Encrypted refresh token' },
          { name: 'expires_at', type: 'TIMESTAMPTZ', constraints: ['NOT NULL'], description: 'Expiration date' }
        ],
        indexes: ['CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id)'],
        relations: ['Many-to-One with users']
      }
    ];
  }
}
