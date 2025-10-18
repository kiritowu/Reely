import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../db/schema'

/**
 * Drizzle ORM Database Connection
 * Uses Supabase Postgres connection string with proper pooling for serverless
 */

// Create a connection with proper pooling configuration for serverless
// Set max connections to 1 per instance and use max_lifetime to prevent stale connections
const client = postgres(process.env.DATABASE_URL!, { 
  prepare: false,  // Disable prepared statements for transaction pooler
  max: 1,          // Maximum 1 connection per serverless function instance
  idle_timeout: 20, // Close idle connections after 20 seconds
  max_lifetime: 60 * 30, // Close connections after 30 minutes
})

export const db = drizzle(client, { schema })

