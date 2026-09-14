-- CineTrack Row Level Security (RLS) Migration
-- Enables RLS on all public tables and enforces strict PostgREST policies

-- 1. Enable RLS on all 4 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_media_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;

-- 2. Drop any legacy policies if present
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own logs" ON public.user_media_logs;
DROP POLICY IF EXISTS "Public logs viewable if user profile is public" ON public.user_media_logs;
DROP POLICY IF EXISTS "Users can insert own logs" ON public.user_media_logs;
DROP POLICY IF EXISTS "Users can update own logs" ON public.user_media_logs;
DROP POLICY IF EXISTS "Users can delete own logs" ON public.user_media_logs;

DROP POLICY IF EXISTS "Media items viewable by everyone" ON public.media_items;

DROP POLICY IF EXISTS "Anyone can submit feature requests" ON public.feature_requests;
DROP POLICY IF EXISTS "Only admins can view feature requests" ON public.feature_requests;
DROP POLICY IF EXISTS "Only admins can update feature requests" ON public.feature_requests;

-- 3. Profiles Policies
-- Public active profiles are viewable by everyone
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (is_public = true AND status = 'active');

-- Users can view their own profile even if private or suspended
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can only update their own non-admin profile (cannot elevate role)
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'user');

-- 4. User Media Logs Policies
-- Users can view their own logs
CREATE POLICY "Users can view own logs"
  ON public.user_media_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Anyone can view logs if the owner's profile is public and active
CREATE POLICY "Public logs viewable if user profile is public"
  ON public.user_media_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = user_media_logs.user_id
        AND profiles.is_public = true
        AND profiles.status = 'active'
    )
  );

-- Users can only insert, update, or delete their own logs
CREATE POLICY "Users can insert own logs"
  ON public.user_media_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
  ON public.user_media_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs"
  ON public.user_media_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Media Items Policies
-- Media cache is readable by everyone
CREATE POLICY "Media items viewable by everyone"
  ON public.media_items
  FOR SELECT
  USING (true);

-- No INSERT, UPDATE, or DELETE policies for anon/authenticated (server Drizzle superuser only)

-- 6. Feature Requests Policies
-- Anyone (anon or authenticated) can submit a feature request
CREATE POLICY "Anyone can submit feature requests"
  ON public.feature_requests
  FOR INSERT
  WITH CHECK (true);

-- Only admins can view feature requests
CREATE POLICY "Only admins can view feature requests"
  ON public.feature_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Only admins can update feature requests
CREATE POLICY "Only admins can update feature requests"
  ON public.feature_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
