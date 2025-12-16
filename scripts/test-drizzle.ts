import { db } from '../src/lib/db/db';
import { categories, websites } from '../src/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

async function testDrizzleConnection() {
  console.log('🔍 Testing Drizzle ORM connection...\n');

  try {
    // Test 1: Simple count query
    console.log('Test 1: Counting categories...');
    const [categoryCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(categories);
    console.log(`✅ Found ${categoryCount.count} categories\n`);

    // Test 2: Query with relations
    console.log('Test 2: Fetching categories with children...');
    const categoriesWithChildren = await db.query.categories.findMany({
      limit: 3,
      with: {
        children: true,
      },
    });
    console.log(`✅ Fetched ${categoriesWithChildren.length} categories with relations\n`);

    // Test 3: Count websites
    console.log('Test 3: Counting websites...');
    const [websiteCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(websites);
    console.log(`✅ Found ${websiteCount.count} websites\n`);

    // Test 4: Query with filter
    console.log('Test 4: Querying approved websites...');
    const approvedWebsites = await db.query.websites.findMany({
      where: eq(websites.status, 'approved'),
      limit: 5,
    });
    console.log(`✅ Found ${approvedWebsites.length} approved websites (limited to 5)\n`);

    console.log('🎉 All tests passed! Drizzle ORM is working correctly.\n');
    console.log('Summary:');
    console.log(`  - Categories: ${categoryCount.count}`);
    console.log(`  - Websites: ${websiteCount.count}`);
    console.log(`  - Database connection: ✅ Working`);
    console.log(`  - Query builder: ✅ Working`);
    console.log(`  - Relations: ✅ Working`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testDrizzleConnection();
