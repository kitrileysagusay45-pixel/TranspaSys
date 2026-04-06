'use server';

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { sendRegistrationEmail } from '@/lib/email';
import { headers } from 'next/headers';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

export async function customRegisterAction(formData) {
  try {
    const headersList = await headers();
    const originUrl = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { success: false, error: "Server missing SUPABASE_SERVICE_ROLE_KEY." };
    }

    const supabaseAdmin = getAdminClient();
    const { email, password, name, address, purok, barangay, city, province, contact } = formData;

    if (password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters." };
    }

    // Try to generate a signup link
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: {
        data: {
          name, address, purok, barangay, city, province, contact_number: contact,
        },
        redirectTo: `${originUrl}/api/auth/callback`
      }
    });

    if (error) {
      // If "already registered", check if user was soft-deleted from public.users
      if (error.message.includes('already been registered')) {
        // Look up the existing auth user
        const { data: { users: existingUsers } } = await supabaseAdmin.auth.admin.listUsers();
        const existingAuth = existingUsers?.find(u => u.email === email);
        
        if (existingAuth) {
          // Check if they have a public.users profile
          const { data: existingProfile } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('id', existingAuth.id)
            .single();
          
          if (!existingProfile) {
            // User was soft-deleted! Re-create their profile and resend verification
            const { error: initialUpsertError } = await supabaseAdmin.from('users').upsert({
              id: existingAuth.id,
              name, email, role: 'user', address, purok,
              contact_number: contact,
              email_verified: !!existingAuth.email_confirmed_at
            });

            if (initialUpsertError && (initialUpsertError.code === 'PGRST204' || initialUpsertError.message?.includes('column'))) {
              console.warn("Registration re-activation: Schema mismatch, retrying with minimal columns");
              await supabaseAdmin.from('users').upsert({
                id: existingAuth.id,
                name, email, role: 'user'
              });
            }

            // Generate a new magic link for re-verification
            const { data: reData, error: reError } = await supabaseAdmin.auth.admin.generateLink({
              type: 'magiclink',
              email,
              options: { redirectTo: `${originUrl}/api/auth/callback` }
            });

            if (!reError && reData?.properties?.hashed_token) {
              const confirmUrl = `${originUrl}/verify-success?token_hash=${reData.properties.hashed_token}&type=magiclink`;
              await sendRegistrationEmail(email, confirmUrl);
            }

            return { success: true, message: "Account re-activated! Check your email." };
          }
        }
      }
      return { success: false, error: error.message };
    }

    // Build verification URL
    const tokenHash = data.properties.hashed_token;
    const confirmationUrl = `${originUrl}/verify-success?token_hash=${tokenHash}&type=signup`;

    // Ensure the profile exists in public.users immediately
    // This is what makes the user appear in the admin User Management instantly
    const userId = data.user.id;
    let { error: profileError } = await supabaseAdmin.from('users').upsert({
      id: userId, name, email, role: 'user', address, purok,
      contact_number: contact, email_verified: false
    });

    if (profileError && (profileError.code === 'PGRST204' || profileError.message?.includes('column'))) {
      console.warn("New registration: Schema mismatch, retrying with minimal columns");
      const { error: retryError } = await supabaseAdmin.from('users').upsert({
        id: userId, name, email, role: 'user', email_verified: false
      });
      profileError = retryError;
    }

    if (profileError) {
      console.error("Critical Profile Sync Error during registration:", profileError);
      // We still proceed since auth user is created, but log it
    }

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

export async function deleteUserAction(userId) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { success: false, error: "Server missing SUPABASE_SERVICE_ROLE_KEY." };
    }

    const supabaseAdmin = getAdminClient();

    // 1. Delete from public.users table
    await supabaseAdmin.from('users').delete().eq('id', userId);

    // 2. Delete from Supabase Auth
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      console.error("Failed to delete auth user:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Delete User Error:", err);
    return { success: false, error: err.message || "An internal server error occurred." };
  }
}

export async function resendVerificationAction() {
  try {
    const headersList = await headers();
    const originUrl = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { success: false, error: "Server missing SUPABASE_SERVICE_ROLE_KEY." };
    }

    // Safely get the current session user using browser cookies
    const supabaseSession = await createServerClient();
    const { data: { user: currentUser } } = await supabaseSession.auth.getUser();
    if (!currentUser) {
      return { success: false, error: "Not authenticated." };
    }

    // Use admin client to generate the magic link
    const supabaseAdmin = getAdminClient();

    // Generate a new magic link
    const { data: reData, error: reError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: currentUser.email,
      options: { redirectTo: `${originUrl}/api/auth/callback` }
    });

    if (reError) {
      return { success: false, error: reError.message };
    }

    if (reData?.properties?.hashed_token) {
      const confirmUrl = `${originUrl}/verify-success?token_hash=${reData.properties.hashed_token}&type=magiclink`;
      await sendRegistrationEmail(currentUser.email, confirmUrl);
      return { success: true };
    }

    return { success: false, error: "Failed to generate link." };
  } catch (err) {
    console.error("Resend Verification Error:", err);
    return { success: false, error: err.message || "An internal server error occurred." };
  }
}
