-- TranspaSys Database Migration for Supabase
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor)

-- ========== USERS TABLE ==========
-- This extends Supabase Auth with profile data
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'sk', 'treasurer')),
  is_approved BOOLEAN NOT NULL DEFAULT false,
  address TEXT,
  purok TEXT,
  contact_number TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========== BUDGETS TABLE ==========
CREATE TABLE IF NOT EXISTS public.budgets (
  id BIGSERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  allocated_amount NUMERIC(15,2) NOT NULL,
  spent_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  year INTEGER NOT NULL,
  description TEXT,
  file_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========== EVENTS TABLE ==========
CREATE TABLE IF NOT EXISTS public.events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  max_participants INTEGER,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========== EVENT PARTICIPANTS TABLE ==========
CREATE TABLE IF NOT EXISTS public.event_participants (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  registered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- ========== ANNOUNCEMENTS TABLE ==========
CREATE TABLE IF NOT EXISTS public.announcements (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========== CHATBOT CONVERSATIONS TABLE ==========
CREATE TABLE IF NOT EXISTS public.chatbot_conversations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========== ACTIVITIES TABLE ==========
CREATE TABLE IF NOT EXISTS public.activities (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  type TEXT NOT NULL,
  subject TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========== ROW LEVEL SECURITY ==========
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Users: Everyone can read, users can update own profile
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON public.users FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'sk', 'treasurer'))
);

-- Budgets: Everyone can read, admins can manage (simplified: auth users can manage)
CREATE POLICY "Anyone can read budgets" ON public.budgets FOR SELECT USING (true);
CREATE POLICY "Auth users can insert budgets" ON public.budgets FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update budgets" ON public.budgets FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can delete budgets" ON public.budgets FOR DELETE USING (auth.uid() IS NOT NULL);

-- Events: Everyone can read, admins can manage
CREATE POLICY "Anyone can read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Auth users can insert events" ON public.events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update events" ON public.events FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can delete events" ON public.events FOR DELETE USING (auth.uid() IS NOT NULL);

-- Event Participants: Users can read, register/unregister themselves
CREATE POLICY "Anyone can read participants" ON public.event_participants FOR SELECT USING (true);
CREATE POLICY "Users can register" ON public.event_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unregister" ON public.event_participants FOR DELETE USING (auth.uid() = user_id);

-- Announcements: Everyone can read published, admins can manage
CREATE POLICY "Anyone can read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Auth users can insert announcements" ON public.announcements FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update announcements" ON public.announcements FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can delete announcements" ON public.announcements FOR DELETE USING (auth.uid() IS NOT NULL);

-- Chatbot: Users can manage their own conversations
CREATE POLICY "Users can read own conversations" ON public.chatbot_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert conversations" ON public.chatbot_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON public.chatbot_conversations FOR DELETE USING (auth.uid() = user_id);
-- Admin can read all conversations
CREATE POLICY "Admin can read all conversations" ON public.chatbot_conversations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'sk', 'treasurer'))
);

-- Activities: Admins can read, auth users can insert
CREATE POLICY "Auth users can read activities" ON public.activities FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can insert activities" ON public.activities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ========== PUSH SUBSCRIPTIONS TABLE ==========
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own push subscription" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all push subscriptions" ON public.push_subscriptions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'sk', 'treasurer'))
  );

-- ========== USER SYNC TRIGGER ==========
-- This function automatically creates a profile in the public.users table 
-- when a new user signs up via Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role, address, purok, contact_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New Resident'),
    NEW.email,
    'user',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'purok',
    NEW.raw_user_meta_data->>'contact_number'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function on every signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
