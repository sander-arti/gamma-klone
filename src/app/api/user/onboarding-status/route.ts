/**
 * GET /api/user/onboarding-status
 *
 * Returns whether the current user should see the onboarding tour.
 * New users (onboarding_completed = false) will see the tour.
 */

import { createClient } from '@/lib/db/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has completed onboarding
    const { data: userRecord, error } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('[onboarding-status] Failed to fetch user:', error);
      // Default to not showing tour if we can't determine status
      return NextResponse.json({ shouldShowTour: false });
    }

    return NextResponse.json({
      shouldShowTour: !userRecord?.onboarding_completed,
    });
  } catch (error) {
    console.error('[onboarding-status] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
