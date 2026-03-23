// scripts/algolia-index.ts

import { config as loadEnv } from 'dotenv';
import { algoliasearch } from 'algoliasearch';
import { getAllResearch, getAllInsights } from '../lib/content.ts';

// Support local development where values are stored in `.env.local`.
// In Vercel, environment variables are injected and this becomes a no-op.
loadEnv({ path: '.env.local' });

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const adminKey = process.env.ALGOLIA_ADMIN_KEY;

async function runIndexing() {
  try {
    if (!appId || !adminKey) {
      throw new Error('❌ Algolia ENV variables are missing. Check .env.local');
    }

    // ✅ Algolia client (Admin key used for indexing)
    const client = algoliasearch(appId, adminKey);

    console.log('🚀 Starting Algolia indexing...');

    const research = getAllResearch();
    const insights = getAllInsights();

    const records = [
      ...research.map((post) => ({
        objectID: `research-${post.slug}`,
        type: 'research',
        slug: post.slug,
        title: post.title,
        summary: post.summary,
        sector: post.sector,
        tags: post.tags,
        date: post.date,
        author: post.author,
        url: `/research/${post.slug}`,
      })),

      ...insights.map((post) => ({
        objectID: `insight-${post.slug}`,
        type: 'insight',
        slug: post.slug,
        title: post.title,
        thesis: post.thesis,
        category: post.category,
        date: post.date,
        author: post.author,
        url: `/insights/${post.slug}`,
      })),
    ];

    console.log(`📦 Preparing ${records.length} records...`);

    // ✅ Algolia v5 indexing
    // In algoliasearch v5, `initIndex()` isn't available; use `client.saveObjects`.
    await client.saveObjects({
      indexName: 'finnexus_content',
      objects: records,
    });

    console.log(`✅ Indexed ${records.length} records successfully.`);
  } catch (error) {
    console.error('❌ Algolia indexing failed:', error);
    process.exitCode = 1;
  }
}

runIndexing();