import { db } from './firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { PLANS, DEFAULT_PLAN, PlanId } from './plans';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-token',
};

/**
 * Validates the API token and tracks usage.
 * @param req NextRequest object
 * @returns { success: boolean, userId: string, error?: string, tier?: string }
 */
export async function validateApiToken(req: NextRequest) {
  const token = req.headers.get('x-api-token');

  if (!token) {
    return { success: false, error: 'API token is required in x-api-token header' };
  }

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('apiToken', '==', token));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: 'Invalid API token' };
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    // Determine limit from centralized PLANS
    const tier = (userData.tier || 'free') as PlanId;
    const plan = PLANS[tier] || DEFAULT_PLAN;
    const limit = plan.dailyLimit;

    // Check usage limits
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    let usageData = userData.usage || {};
    let dailyUsage = usageData[today] || 0;

    if (dailyUsage >= limit) {
        return { success: false, error: `Daily limit reached (${limit}). Upgrade your plan for higher limits.` };
    }

    // Increment usage
    dailyUsage += 1;
    await updateDoc(doc(db, 'users', userId), {
        [`usage.${today}`]: dailyUsage,
        lastUsedAt: Date.now()
    });

    return { 
        success: true, 
        userId, 
        tier: userData.tier,
        remaining: limit - dailyUsage
    };

  } catch (err: any) {
    console.error('API Auth Error:', err);
    return { success: false, error: 'Internal server error during authentication' };
  }
}

/**
 * Helper to wrap API handlers with auth
 */
export async function withAuth(req: NextRequest, handler: (req: NextRequest, auth: any) => Promise<NextResponse>) {
    // For local requests without tokens (e.g. from the web dashboard), we might want to allow them
    // But for actual "API" usage, tokens are mandatory.
    // For now, let's keep it simple: Tokens are required for ALL requests through this wrapper.
    const authResult = await validateApiToken(req);
    
    if (!authResult.success) {
        return NextResponse.json({ 
            success: false, 
            error: authResult.error 
        }, { 
            status: 401, 
            headers: CORS 
        });
    }

    return handler(req, authResult);
}
