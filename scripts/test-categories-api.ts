/**
 * Test script to check categories API response
 */

async function testCategoriesAPI() {
  try {
    console.log('Testing categories API...\n');

    const response = await fetch('http://localhost:3002/api/categories?includeSubcategories=true');
    const data = await response.json();

    console.log('API Response Status:', data.status);
    console.log('API Response Message:', data.message);
    console.log('\nNumber of top-level categories:', data.data?.length || 0);

    // Check first few categories structure
    if (data.data && Array.isArray(data.data)) {
      console.log('\n=== First 3 Categories ===');
      data.data.slice(0, 3).forEach((cat: any, index: number) => {
        console.log(`\n${index + 1}. ${cat.name} (ID: ${cat.id})`);
        console.log(`   parent_id: ${cat.parent_id}`);
        console.log(`   children count: ${cat.children?.length || 0}`);
        if (cat.children && cat.children.length > 0) {
          console.log('   children:');
          cat.children.forEach((child: any) => {
            console.log(`     - ${child.name} (ID: ${child.id}, parent_id: ${child.parent_id})`);
          });
        }
      });

      // Check if there are any categories with parent_id !== null (should be none)
      const categoriesWithParent = data.data.filter((cat: any) => cat.parent_id !== null);
      console.log(`\n=== Categories with parent_id !== null: ${categoriesWithParent.length} ===`);
      if (categoriesWithParent.length > 0) {
        console.log('⚠️ WARNING: Found categories with parent_id in top level:');
        categoriesWithParent.slice(0, 5).forEach((cat: any) => {
          console.log(`  - ${cat.name} (ID: ${cat.id}, parent_id: ${cat.parent_id})`);
        });
      }
    }
  } catch (error) {
    console.error('Error testing categories API:', error);
  }
}

testCategoriesAPI();
