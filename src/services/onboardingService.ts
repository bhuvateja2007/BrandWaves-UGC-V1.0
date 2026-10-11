import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { OnboardingAnswers, OnboardingPersona } from '../lib/onboardingTypes';

export interface CreatorSocialAccount {
  id?: string;
  user_id: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'portfolio' | 'other';
  handle: string;
  profile_url?: string | null;
  verification_status: 'unverified' | 'pending' | 'verified';
  created_at?: string;
  updated_at?: string;
}

export interface OnboardingRecord {
  id?: string;
  user_id: string;
  persona: string;
  profession?: string | null;
  discovery_source?: string | null;
  discovery_source_other?: string | null;
  interests?: string[];
  responses: Record<string, any>;
  completed_at?: string | null;
}

export interface LoadedOnboardingState {
  answers: OnboardingAnswers;
  persona: OnboardingPersona | null;
  completed: boolean;
  socialAccounts?: CreatorSocialAccount[];
}

const LOCAL_STORAGE_KEY_PREFIX = 'brandwaves_onboarding_answers_';

/**
 * Normalizes user-entered social handles:
 * - Strips leading/trailing whitespace
 * - Removes URL prefixes (e.g., https://instagram.com/, @, www.tiktok.com/@)
 * - Removes leading '@' symbols
 * - Strips trailing query parameters and slashes
 */
export function normalizeHandle(handle?: string | null): string {
  if (!handle) return '';
  let cleaned = handle.trim();

  // Strip common URL prefixes
  cleaned = cleaned.replace(/^https?:\/\/(www\.)?(instagram\.com|tiktok\.com|youtube\.com|x\.com|twitter\.com)\/(@)?/i, '');
  cleaned = cleaned.replace(/^(instagram\.com|tiktok\.com|youtube\.com|x\.com|twitter\.com)\/(@)?/i, '');

  // Strip query params or trailing slash
  cleaned = cleaned.split('?')[0].split('#')[0].replace(/\/+$/, '');

  // Strip all leading '@' characters
  cleaned = cleaned.replace(/^@+/, '');

  return cleaned.trim();
}

/**
 * Normalizes user-entered URLs
 */
export function normalizeUrl(url?: string | null): string {
  if (!url) return '';
  let cleaned = url.trim();
  if (!cleaned) return '';
  if (!/^https?:\/\//i.test(cleaned) && cleaned.includes('.')) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned;
}

/**
 * Probes and loads saved onboarding data for a user
 */
export async function loadOnboardingData(userId: string): Promise<LoadedOnboardingState | null> {
  // Check local cache first as quick hydration
  let localData: LoadedOnboardingState | null = null;
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`);
    if (raw) {
      localData = JSON.parse(raw);
    }
  } catch {
    // Non-fatal
  }

  if (!isSupabaseConfigured || !userId) {
    return localData;
  }

  try {
    // 1. Fetch from onboarding_responses
    const { data: onboardingRow, error: onboardingError } = await supabase
      .from('onboarding_responses')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // 1b. Fetch from user_onboarding
    const { data: userOnboardingRow, error: userOnboardingError } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // 2. Fetch from profiles
    const { data: profileRow } = await supabase
      .from('profiles')
      .select('display_name, profession, instagram_handle, tiktok_handle, youtube_handle, portfolio_url, onboarding_completed')
      .eq('id', userId)
      .maybeSingle();

    // 3. Fetch from creator_social_accounts
    const { data: socialsData } = await supabase
      .from('creator_social_accounts')
      .select('*')
      .eq('user_id', userId);

    if (onboardingError && onboardingError.code !== 'PGRST116' && onboardingError.code !== '42P01') {
      console.warn('Notice querying onboarding_responses:', onboardingError.message);
    }
    if (userOnboardingError && userOnboardingError.code !== 'PGRST116' && userOnboardingError.code !== '42P01') {
      console.warn('Notice querying user_onboarding:', userOnboardingError.message);
    }

    const mergedAnswers: OnboardingAnswers = {
      ...(localData?.answers || {}),
      ...(userOnboardingRow?.answers || {}),
      ...(onboardingRow?.responses || {}),
    };

    if (profileRow?.profession && !mergedAnswers['profession']) {
      mergedAnswers['profession'] = profileRow.profession;
    }
    if (profileRow?.instagram_handle && !mergedAnswers['instagram_handle']) {
      mergedAnswers['instagram_handle'] = profileRow.instagram_handle;
    }
    if (profileRow?.tiktok_handle && !mergedAnswers['tiktok_handle']) {
      mergedAnswers['tiktok_handle'] = profileRow.tiktok_handle;
    }
    if (profileRow?.youtube_handle && !mergedAnswers['youtube_handle']) {
      mergedAnswers['youtube_handle'] = profileRow.youtube_handle;
    }
    if (profileRow?.portfolio_url && !mergedAnswers['portfolio_url']) {
      mergedAnswers['portfolio_url'] = profileRow.portfolio_url;
    }
    if (profileRow?.display_name && !mergedAnswers['display_name']) {
      mergedAnswers['display_name'] = profileRow.display_name;
    }

    const persona =
      (userOnboardingRow?.persona as OnboardingPersona) ||
      (onboardingRow?.persona as OnboardingPersona) ||
      localData?.persona ||
      null;
    const completed = Boolean(
      profileRow?.onboarding_completed ||
      userOnboardingRow?.completed_at ||
      userOnboardingRow?.onboarding_status === 'completed' ||
      onboardingRow?.completed_at ||
      localData?.completed
    );

    return {
      answers: mergedAnswers,
      persona,
      completed,
      socialAccounts: socialsData || undefined,
    };
  } catch (err) {
    console.warn('Fallback to local onboarding data:', err);
    return localData;
  }
}

/**
 * Saves onboarding data to Supabase and cache:
 * - Sanitizes and normalizes handles
 * - Writes to onboarding_responses
 * - Updates public.profiles (profession, handles, completion flags)
 * - Writes to creator_social_accounts (unverified status)
 */
export async function saveOnboardingData(options: {
  userId: string;
  role: string;
  answers: OnboardingAnswers;
  markCompleted?: boolean;
  currentStep?: number;
}): Promise<{ success: boolean; error?: string }> {
  const { userId, role, answers, markCompleted = false, currentStep = 1 } = options;

  // Derive persona
  const canonicalPersona: OnboardingPersona =
    role === 'creator'
      ? 'creator'
      : role === 'brand_owner' || role === 'brand_admin'
      ? 'brand_owner'
      : 'customer';

  // Normalize handles
  const igHandle = normalizeHandle(answers['instagram_handle'] as string);
  const ttHandle = normalizeHandle(answers['tiktok_handle'] as string);
  const ytHandle = normalizeHandle(answers['youtube_handle'] as string);
  const portfolioUrl = normalizeUrl(answers['portfolio_url'] as string);

  // Extract structured values
  const profession = (answers['profession'] as string) || null;
  const discoverySource = (answers['discovery_source'] as string) || null;
  const discoverySourceOther = (answers['discovery_source_other'] as string) || null;
  
  const interests: string[] = Array.isArray(answers['customer_interests'])
    ? (answers['customer_interests'] as string[])
    : Array.isArray(answers['interests'])
    ? (answers['interests'] as string[])
    : Array.isArray(answers['creator_niches'])
    ? (answers['creator_niches'] as string[])
    : [];

  // Update local cache
  try {
    const payload: LoadedOnboardingState = {
      answers,
      persona: canonicalPersona,
      completed: markCompleted,
    };
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(payload));
  } catch {
    // Non-fatal
  }

  if (!isSupabaseConfigured || !userId) {
    return { success: true };
  }

  try {
    // 1a. Upsert into user_onboarding (Phase 5 schema)
    try {
      const { error: userOnboardingError } = await supabase
        .from('user_onboarding')
        .upsert(
          {
            user_id: userId,
            persona: canonicalPersona,
            answers: answers,
            onboarding_status: markCompleted ? 'completed' : 'in_progress',
            current_step: currentStep,
            completed_at: markCompleted ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (userOnboardingError && userOnboardingError.code !== '42P01') {
        console.warn('Notice saving to user_onboarding:', userOnboardingError.message);
      }
    } catch {
      // Table may not be migrated yet in some dev environments
    }

    // 1b. Save to onboarding_responses (legacy schema compatibility)
    // Try RPC first
    let rpcSuccess = false;
    try {
      const { error: rpcError } = await supabase.rpc('save_onboarding_responses', {
        p_persona: canonicalPersona,
        p_profession: profession,
        p_discovery_source: discoverySource,
        p_discovery_source_other: discoverySourceOther,
        p_interests: interests,
        p_responses: answers,
        p_mark_completed: markCompleted,
      });

      if (!rpcError) {
        rpcSuccess = true;
      }
    } catch {
      // RPC may not be migrated yet in some dev environments
    }

    if (!rpcSuccess) {
      // Direct upsert to onboarding_responses
      const { error: tableError } = await supabase
        .from('onboarding_responses')
        .upsert(
          {
            user_id: userId,
            persona: canonicalPersona,
            profession,
            discovery_source: discoverySource,
            discovery_source_other: discoverySourceOther,
            interests,
            responses: answers,
            completed_at: markCompleted ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (tableError && tableError.code !== '42P01') {
        console.warn('Notice saving to onboarding_responses:', tableError.message);
      }
    }

    // 2. Update profiles table
    const profileUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (answers['display_name']) {
      profileUpdates.display_name = answers['display_name'];
    }
    if (profession) {
      profileUpdates.profession = profession;
    }
    if (igHandle) {
      profileUpdates.instagram_handle = igHandle;
    }
    if (ttHandle) {
      profileUpdates.tiktok_handle = ttHandle;
    }
    if (ytHandle) {
      profileUpdates.youtube_handle = ytHandle;
    }
    if (portfolioUrl) {
      profileUpdates.portfolio_url = portfolioUrl;
    }
    if (markCompleted) {
      profileUpdates.onboarding_completed = true;
      profileUpdates.onboarding_completed_at = new Date().toISOString();
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', userId);

    if (profileError) {
      console.warn('Notice updating profile attributes:', profileError.message);
    }

    // 3. For creators, upsert creator_social_accounts (explicitly marked 'unverified')
    if (role === 'creator') {
      const socialInserts: CreatorSocialAccount[] = [];

      if (igHandle) {
        socialInserts.push({
          user_id: userId,
          platform: 'instagram',
          handle: igHandle,
          profile_url: `https://instagram.com/${igHandle}`,
          verification_status: 'unverified',
        });
      }

      if (ttHandle) {
        socialInserts.push({
          user_id: userId,
          platform: 'tiktok',
          handle: ttHandle,
          profile_url: `https://tiktok.com/@${ttHandle}`,
          verification_status: 'unverified',
        });
      }

      if (ytHandle) {
        socialInserts.push({
          user_id: userId,
          platform: 'youtube',
          handle: ytHandle,
          profile_url: portfolioUrl || `https://youtube.com/@${ytHandle}`,
          verification_status: 'unverified',
        });
      }

      for (const social of socialInserts) {
        try {
          await supabase
            .from('creator_social_accounts')
            .upsert(social, { onConflict: 'user_id,platform' });
        } catch {
          // Table may not be provisioned yet in some dev environments
        }
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Failed to save onboarding data:', err);
    return { success: false, error: err.message || 'Failed to save onboarding data' };
  }
}
