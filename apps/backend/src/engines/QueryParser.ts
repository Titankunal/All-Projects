/**
 * DATA STRUCTURES & ALGORITHMS (DSA) EXPLANATION: TRIE (PREFIX TREE)
 * 
 * Why Use a Trie?
 * A Trie is an efficient information retrieval data structure. In this Query Parser, 
 * we use it for keyword detection because:
 * 1. Fast Lookup: It provides O(k) time complexity for searching a word of length 'k', 
 *    independent of how many words are in the dictionary.
 * 2. Space Efficiency: Common prefixes are shared between different words in the tree,
 *    which is more efficient than storing hundreds of strings in a flat array.
 * 3. Pattern Recognition: It allows us to quickly identify if any substring of the 
 *    user's query matches our curated list of architectural keywords.
 * 
 * Implementation:
 * - TrieNode: Represents a character in a word. It holds child nodes in a Map.
 * - Metadata: When a node marks the 'end of a word', it carries semantic data 
 *   (category, feature, or scale type).
 * - Multi-word Support: We handle phrases like "uber eats" or "real-time" by 
 *   inserting them into the Trie with spaces.
 */

export type Category = 'restaurant' | 'ecommerce' | 'social' | 'fintech' | 'healthcare' | 'logistics' | 'saas' | 'gaming' | 'generic';
export type Feature = 'payments' | 'auth' | 'realtime' | 'notifications' | 'search' | 'media-upload' | 'analytics';
export type Scale = 'small' | 'medium' | 'large';

export interface ParseResult {
  raw: string;
  normalized: string;
  appName: string;
  category: Category;
  features: Feature[];
  scale: Scale;
  confidence: number;
}

interface TrieMetadata {
  category?: Category;
  feature?: Feature;
  scale?: Scale;
}

class TrieNode {
  children: Map<string, TrieNode> = new Map();
  metadata: TrieMetadata = {};
  isEndOfWord: boolean = false;
}

class KeywordTrie {
  private root: TrieNode = new TrieNode();

  /**
   * Time Complexity: O(k) where k is the length of the word.
   * Space Complexity: O(k) for new nodes.
   */
  insert(word: string, metadata: TrieMetadata): void {
    let current = this.root;
    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }
    current.isEndOfWord = true;
    current.metadata = { ...current.metadata, ...metadata };
  }

  /**
   * Time Complexity: O(k) where k is the length of the word.
   */
  search(word: string): TrieMetadata | null {
    let current = this.root;
    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) return null;
      current = current.children.get(char)!;
    }
    return current.isEndOfWord ? current.metadata : null;
  }
}

export class QueryParser {
  private trie: KeywordTrie;

  constructor() {
    this.trie = new KeywordTrie();
    this.initializeKeywords();
  }

  /**
   * Populates the Trie with architectural and business keywords.
   */
  private initializeKeywords(): void {
    // Categories
    const categories: Record<Category, string[]> = {
      restaurant: ['food', 'delivery', 'menu', 'uber eats', 'doordash', 'kitchen', 'restaurant', 'ordering', 'zomato', 'swiggy'],
      ecommerce: ['shop', 'store', 'amazon', 'ebay', 'buy', 'cart', 'product', 'marketplace', 'retail', 'shopify'],
      social: ['chat', 'friends', 'facebook', 'instagram', 'twitter', 'tiktok', 'post', 'feed', 'message', 'social', 'whatsapp'],
      fintech: ['bank', 'money', 'payment', 'wallet', 'crypto', 'stock', 'invest', 'trading', 'ledger', 'fintech', 'blockchain'],
      healthcare: ['doctor', 'clinic', 'medical', 'patient', 'hospital', 'telehealth', 'health', 'ehr', 'pharmacy'],
      logistics: ['ship', 'track', 'cargo', 'fleet', 'truck', 'warehouse', 'supply', 'delivery', 'logistics', 'uber for x'],
      saas: ['dashboard', 'crm', 'enterprise', 'b2b', 'tool', 'workflow', 'collaboration', 'software', 'saas', 'jira'],
      gaming: ['play', 'game', 'multiplayer', 'lobby', 'matchmaking', 'leaderboard', 'steam', 'twitch', 'gaming', 'pubg'],
      generic: ['app', 'system', 'architecture', 'service', 'platform']
    };

    // Features
    const features: Record<Feature, string[]> = {
      payments: ['stripe', 'paypal', 'checkout', 'card', 'billing', 'subscription', 'transaction', 'payout'],
      auth: ['login', 'signin', 'auth', 'jwt', 'oauth', 'permissions', 'rbac', 'iam', 'mfa'],
      realtime: ['socket', 'live', 'instant', 'sync', 'websocket', 'stream', 'push', 'real-time', 'realtime'],
      notifications: ['alert', 'email', 'sms', 'notification', 'push'],
      search: ['elastic', 'find', 'filter', 'browse', 'algolia', 'discovery', 'search'],
      'media-upload': ['photo', 'video', 's3', 'file', 'storage', 'cdn', 'upload', 'image', 'gallery'],
      analytics: ['graph', 'report', 'stats', 'metrics', 'insight', 'data', 'dashboard', 'monitoring']
    };

    // Scales
    const scales: Record<Scale, string[]> = {
      small: ['mvp', 'prototype', 'startup', 'local', 'simple', 'small'],
      medium: ['growth', 'scalable', 'regional', 'medium', 'distributed'],
      large: ['global', 'enterprise', 'infinite', 'high-traffic', 'massive', 'billions', 'netflix-scale', 'large-scale', 'high traffic']
    };

    // Multi-pass insertion into Trie
    Object.entries(categories).forEach(([cat, words]) => 
      words.forEach(w => this.trie.insert(w, { category: cat as Category }))
    );
    Object.entries(features).forEach(([feat, words]) => 
      words.forEach(w => this.trie.insert(w, { feature: feat as Feature }))
    );
    Object.entries(scales).forEach(([scale, words]) => 
      words.forEach(w => this.trie.insert(w, { scale: scale as Scale }))
    );
  }

  /**
   * Parses the user query to extract system design intent.
   * @param query The raw input string from the user.
   */
  public parse(query: string): ParseResult {
    const raw = query;
    const normalized = query.toLowerCase().trim();
    
    // Extract App Name: Heuristic using the first two significant words
    const tokens = normalized.split(/\s+/).filter(t => t.length > 0);
    const appName = tokens.length > 0 
      ? tokens.slice(0, 2).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' ')
      : 'Untitled System';

    let detectedCategory: Category = 'generic'; // Default
    const detectedFeatures = new Set<Feature>();
    let detectedScale: Scale = 'medium'; // Default
    let matchCount = 0;

    /**
     * TOKEN SCANNING LOGIC
     * We use a sliding window of size 2 to check for multi-word phrases 
     * (e.g., "high traffic") in the Trie before checking single tokens.
     */
    for (let i = 0; i < tokens.length; i++) {
      let matched = false;

      // 1. Check for 2-word phrase
      if (i < tokens.length - 1) {
        const pair = `${tokens[i]} ${tokens[i+1]}`;
        const meta2 = this.trie.search(pair);
        if (meta2) {
          this.applyMeta(meta2, 
            detectedCategory,
            (cat) => detectedCategory = cat, 
            (feat) => detectedFeatures.add(feat), 
            (scale) => detectedScale = scale
          );
          matchCount += 2;
          matched = true;
          i++; // Skip next token as it's part of the pair
        }
      }

      // 2. Check for single word if no pair matched
      if (!matched) {
        const meta1 = this.trie.search(tokens[i]);
        if (meta1) {
          this.applyMeta(meta1, 
            detectedCategory,
            (cat) => detectedCategory = cat, 
            (feat) => detectedFeatures.add(feat), 
            (scale) => detectedScale = scale
          );
          matchCount++;
        }
      }
    }

    // Heuristics for confidence scoring
    // Starts at 0.1, adds 0.2 per match, caps at 0.98.
    const confidence = Math.min(0.1 + (matchCount * 0.15) + (detectedFeatures.size * 0.1), 0.98);

    return {
      raw,
      normalized,
      appName: appName.endsWith('App') ? appName : `${appName} App`,
      category: detectedCategory,
      features: Array.from(detectedFeatures),
      scale: detectedScale,
      confidence: parseFloat(confidence.toFixed(2))
    };
  }

  private applyMeta(
    meta: TrieMetadata, 
    currentCat: Category,
    setCat: (c: Category) => void, 
    addFeat: (f: Feature) => void, 
    setScale: (s: Scale) => void
  ): void {
    if (meta.category) {
      // Only overwrite if current is generic or the new one is specific
      if (currentCat === 'generic' || meta.category !== 'generic') {
        setCat(meta.category);
      }
    }
    if (meta.feature) addFeat(meta.feature);
    if (meta.scale) setScale(meta.scale);
  }
}
