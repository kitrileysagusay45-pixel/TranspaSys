'use server';

import { createClient } from '@supabase/supabase-js';
import { sendRegistrationEmail } from '@/lib/email';
import { headers } from 'next/headers';

export async function customRegisterAction(formData) {
  try {
    const headersList = await headers();
    const originUrl = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // Check for the required service role key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { success: false, error: "Server missing SUPABASE_SERVICE_ROLE_KEY. Cannot generate backend signup limits." };
    }

    // Must use '@supabase/supabase-js' standard client with Service Role Key to bypass RLS and access admin APIs.
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { email, password, name, address, purok, barangay, city, province, contact } = formData;

    // Generate the magical token via Supabase Admin API without triggering the default SMTP
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: {
        data: {
          name,
          address,
          purok,
          barangay,
          city,
          province,
          contact_number: contact,
        },
        redirectTo: `${originUrl}/auth/callback`
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Build our own verification URL using the hashed token
    // This bypasses Supabase's redirect flow entirely and gives us full control
    const tokenHash = data.properties.hashed_token;
    const confirmationUrl = `${originUrl}/verify-success?token_hash=${tokenHash}&type=signup`;

    // Forward link manually to Brevo SMTP
    const sent = await sendRegistrationEmail(email, confirmationUrl);

    if (!sent) {
      return { success: false, error: "Account created but failed to send verification email. Please contact support." };
    }

    return { success: true };
  } catch (err) {
    console.error("Custom Register Error:", err);
    return { success: false, error: err.message || "An internal server error occurred." };
  }
}
