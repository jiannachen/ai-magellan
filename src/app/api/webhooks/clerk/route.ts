import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { db } from '@/lib/db/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Clerk Webhook 事件类型
type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    first_name?: string;
    last_name?: string;
    username?: string;
    image_url?: string;
  };
};

export async function POST(req: Request) {
  // 获取 Clerk Webhook Secret
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET environment variable');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  // 获取请求头
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // 验证必要的头信息
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // 获取请求体
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // 创建新的 Svix 实例验证 webhook
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: ClerkWebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // 处理事件
  const eventType = evt.type;
  console.log(`Received Clerk webhook: ${eventType}`);

  try {
    if (eventType === 'user.created') {
      // 用户创建事件
      const { id, email_addresses, first_name, last_name, username, image_url } = evt.data;

      const email = email_addresses[0]?.email_address || `${id}@clerk.local`;
      const name = [first_name, last_name].filter(Boolean).join(' ') || username || 'User';

      // 创建用户记录
      await db.insert(users).values({
        id,
        email,
        name,
        image: image_url,
      });

      console.log(`✅ Created user: ${id} (${email})`);
    } else if (eventType === 'user.updated') {
      // 用户更新事件
      const { id, email_addresses, first_name, last_name, username, image_url } = evt.data;

      const email = email_addresses[0]?.email_address || `${id}@clerk.local`;
      const name = [first_name, last_name].filter(Boolean).join(' ') || username || 'User';

      // 更新用户记录（使用upsert逻辑）
      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, id),
      });

      if (existingUser) {
        await db
          .update(users)
          .set({
            email,
            name,
            image: image_url,
          })
          .where(eq(users.id, id));
      } else {
        await db.insert(users).values({
          id,
          email,
          name,
          image: image_url,
        });
      }

      console.log(`✅ Updated user: ${id} (${email})`);
    } else if (eventType === 'user.deleted') {
      // 用户删除事件
      const { id } = evt.data;

      // 删除用户记录（级联删除相关数据）
      await db.delete(users).where(eq(users.id, id));

      console.log(`✅ Deleted user: ${id}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);

    // 处理邮箱唯一性冲突
    if (error.code === 'P2002' && eventType === 'user.created') {
      const { id, first_name, last_name, username, image_url } = evt.data;
      const name = [first_name, last_name].filter(Boolean).join(' ') || username || 'User';

      try {
        // 使用备用邮箱重试
        await db.insert(users).values({
          id,
          email: `${id}@clerk.duplicate`,
          name,
          image: image_url,
        });

        console.log(`⚠️ Created user with duplicate email fallback: ${id}`);
        return NextResponse.json({ success: true });
      } catch (retryError) {
        console.error('Failed to create user with fallback:', retryError);
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
