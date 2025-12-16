#!/bin/bash

# This script replaces Prisma imports with Drizzle imports in all TypeScript files

echo "Replacing Prisma imports with Drizzle imports..."

# Find all TypeScript files that import from prisma
files=$(grep -rl "from '@/lib/prisma'" src/ --include="*.ts" --include="*.tsx" 2>/dev/null)
files2=$(grep -rl "from \"@/lib/prisma\"" src/ --include="*.ts" --include="*.tsx" 2>/dev/null)
files3=$(grep -rl "from '@/lib/db/db'" src/ scripts/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules")

all_files=$(echo -e "$files\n$files2\n$files3" | sort -u | grep -v "^$")

count=0
for file in $all_files; do
  if [ -f "$file" ]; then
    # Replace prisma imports
    sed -i "s|from '@/lib/prisma'|from '@/lib/db/db'|g" "$file"
    sed -i 's|from "@/lib/prisma"|from "@/lib/db/db"|g' "$file"

    # Replace prisma with db
    sed -i 's/{ prisma }/{ db }/g' "$file"
    sed -i 's/prisma\./db./g' "$file"

    echo "✓ Updated: $file"
    ((count++))
  fi
done

echo ""
echo "Replacement complete! Updated $count files."
echo ""
echo "Note: You still need to:"
echo "1. Add Drizzle-specific imports (eq, and, sql, etc.)"
echo "2. Convert query syntax from Prisma to Drizzle"
echo "3. Update field names from snake_case to camelCase"
