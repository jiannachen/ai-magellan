import { config } from 'dotenv';
config();

import { db } from '../src/lib/db/db';
import { sql } from 'drizzle-orm';

async function checkDatabaseColumns() {
  console.log('检查数据库中所有表的实际列名格式...\n');

  try {
    // 查询所有用户表的列名
    const result = await db.execute(sql`
      SELECT
        table_name,
        column_name,
        data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name NOT LIKE 'pg_%'
        AND table_name NOT LIKE 'sql_%'
        AND table_name != '_prisma_migrations'
      ORDER BY table_name, ordinal_position
    `);

    const camelCaseColumns: Array<{table: string, column: string, dataType: string}> = [];
    let currentTable = '';

    for (const row of result.rows as any[]) {
      if (row.table_name !== currentTable) {
        console.log(`\n=== ${row.table_name} ===`);
        currentTable = row.table_name;
      }

      // 检查是否包含大写字母(驼峰命名)
      const hasCamelCase = /[A-Z]/.test(row.column_name);
      const marker = hasCamelCase ? ' ❌ (驼峰命名,需要改为下划线)' : ' ✓';

      console.log(`  ${row.column_name} (${row.data_type})${marker}`);

      if (hasCamelCase) {
        // 转换为下划线格式
        const snakeCase = row.column_name.replace(/([A-Z])/g, '_$1').toLowerCase();
        camelCaseColumns.push({
          table: row.table_name,
          column: row.column_name,
          dataType: row.data_type
        });
      }
    }

    console.log('\n\n==========================================');
    console.log('需要重命名的列汇总');
    console.log('==========================================\n');

    if (camelCaseColumns.length === 0) {
      console.log('✅ 太好了!数据库中所有列名都符合下划线命名规范!');
      console.log('   没有需要迁移的列。');
    } else {
      console.log(`发现 ${camelCaseColumns.length} 个驼峰命名的列需要重命名:\n`);

      const groupedByTable = camelCaseColumns.reduce((acc, col) => {
        if (!acc[col.table]) acc[col.table] = [];
        acc[col.table].push(col);
        return acc;
      }, {} as Record<string, typeof camelCaseColumns>);

      for (const [table, columns] of Object.entries(groupedByTable)) {
        console.log(`${table}:`);
        columns.forEach(col => {
          const snakeCase = col.column.replace(/([A-Z])/g, '_$1').toLowerCase();
          console.log(`  ${col.column} → ${snakeCase}`);
        });
        console.log('');
      }
    }

    process.exit(0);
  } catch (error: any) {
    console.error('错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkDatabaseColumns();
