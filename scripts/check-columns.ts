import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, {
  max: 1,
  connect_timeout: 10,
  idle_timeout: 20,
});

async function checkColumns() {
  console.log('检查所有表的列名格式...\n');

  const tables = [
    'users',
    'websites',
    'categories',
    'website_categories',
    'website_likes',
    'website_favorites',
    'website_reviews',
    'feedbacks',
    'footer_links'
  ];

  const allColumns: Array<{table: string, oldName: string, newName: string, dataType: string}> = [];

  for (const table of tables) {
    console.log(`\n=== ${table} 表 ===`);
    try {
      const result = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = ${table}
        ORDER BY ordinal_position
      `;

      if (result.length === 0) {
        console.log(`  (表不存在或为空)`);
        continue;
      }

      result.forEach((col: any) => {
        const hasUpperCase = /[A-Z]/.test(col.column_name);
        const newName = col.column_name.replace(/([A-Z])/g, '_$1').toLowerCase();
        const marker = hasUpperCase ? ' ❌ (需要改为下划线格式)' : ' ✓';
        console.log(`  ${col.column_name} (${col.data_type})${marker}`);

        if (hasUpperCase) {
          allColumns.push({
            table,
            oldName: col.column_name,
            newName,
            dataType: col.data_type
          });
        }
      });
    } catch (error: any) {
      console.error(`  错误: ${error.message || error}`);
      if (error.stack) {
        console.error(error.stack);
      }
    }
  }

  console.log('\n\n=== 需要重命名的列汇总 ===');
  if (allColumns.length === 0) {
    console.log('没有需要重命名的列！所有列名都符合下划线命名规范。');
  } else {
    allColumns.forEach(col => {
      console.log(`${col.table}.${col.oldName} → ${col.newName}`);
    });
  }

  await sql.end();
}

checkColumns().catch((error) => {
  console.error('执行失败:', error);
  process.exit(1);
});
