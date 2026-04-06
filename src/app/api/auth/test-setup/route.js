import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not permitted in production' }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    const healthCheck = {};
    
    // Check if tables and specific columns exist
    const schemaAudit = [
      { table: 'users', columns: ['id', 'name', 'email', 'role', 'address', 'purok', 'contact_number', 'email_verified'] },
      { table: 'budgets', columns: ['id', 'category', 'allocated_amount', 'spent_amount', 'year', 'description', 'file_path'] },
      { table: 'events', columns: ['id', 'title', 'description', 'event_date', 'location', 'status', 'max_participants'] },
      { table: 'announcements', columns: ['id', 'title', 'content', 'created_by', 'is_published', 'published_at'] },
      { table: 'push_subscriptions', columns: ['user_id', 'subscription'] },
      { table: 'activities', columns: ['user_id', 'action', 'type', 'subject'] }
    ];

    for (const item of schemaAudit) {
      const { table, columns } = item;
      // Check table existence first
      const { error: tableError } = await supabase.from(table).select('count', { count: 'exact', head: true }).limit(1);
      
      const exists = !tableError || (tableError.code !== '42P01');
      healthCheck[table] = { exists, error: tableError ? `${tableError.code}: ${tableError.message}` : null, missing_columns: [] };

      if (exists) {
        // Check for specific columns by trying to select them
        for (const col of columns) {
          const { error: colError } = await supabase.from(table).select(col).limit(1);
          if (colError && colError.code === 'PGRST204') {
            healthCheck[table].missing_columns.push(col);
          }
        }
      }
    }

    const testAccounts = [
      { email: 'admin_test_123@example.com', password: 'Admin123!', role: 'admin', name: 'System Admin (Test)' },
      { email: 'user_test_456@example.com', password: 'User123!', role: 'user', name: 'Citizen (Test User)' }
    ];

    const results = [];

    // Only attempt to create test accounts if the users table exists
    if (healthCheck.users.exists) {
      for (const acc of testAccounts) {
        // 1. Create/Get Auth User
        const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
          email: acc.email,
          password: acc.password,
          email_confirm: true,
          user_metadata: { name: acc.name }
        });

        let userId = user?.id;

        if (authError) {
          if (authError.message.includes('already been registered')) {
            const { data: { users } } = await supabase.auth.admin.listUsers();
            userId = users.find(u => u.email === acc.email)?.id;
            
            if (userId) {
              // Force verify
              await supabase.auth.admin.updateUserById(userId, { 
                password: acc.password,
                email_confirm: true 
              });
            }
          } else {
            results.push({ email: acc.email, error: authError.message });
            continue;
          }
        }

        if (!userId) {
          results.push({ email: acc.email, error: 'Could not resolve user ID' });
          continue;
        }

        // 2. Ensure Profile exists and is verified/approved
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: userId,
            email: acc.email,
            name: acc.name,
            role: acc.role,
            is_approved: true,
            email_verified: true
          });

        results.push({ email: acc.email, success: !profileError, error: profileError?.message });
      }
    }

    const repairSql = `
-- COPY AND RUN THIS IN SUPABASE SQL EDITOR
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS purok TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS contact_number TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE public.budgets ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS max_participants INTEGER;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
NOTIFY pgrst, 'reload schema';
    `.trim();

    return NextResponse.json({ 
      success: true, 
      healthCheck, 
      results,
      repairSql,
      instruction: "If missing_columns contains items, please run the repairSql in your Supabase SQL Editor."
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
