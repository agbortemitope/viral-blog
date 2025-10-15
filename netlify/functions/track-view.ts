import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const handler: Handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { postId, viewerId } = JSON.parse(event.body || '{}');

    if (!postId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Post ID is required' })
      };
    }

    // Get client IP and user agent
    const clientIP = event.headers['x-forwarded-for'] || event.headers['client-ip'] || null;
    const userAgent = event.headers['user-agent'] || null;

    // Check if this view already exists for this viewer/IP in the last 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data: existingView } = await supabase
      .from('post_views')
      .select('id')
      .eq('post_id', postId)
      .or(viewerId ? `viewer_id.eq.${viewerId}` : `ip_address.eq.${clientIP}`)
      .gt('created_at', twentyFourHoursAgo.toISOString())
      .limit(1)
      .single();

    if (existingView) {
      // View already recorded in the last 24 hours
      const { data: post } = await supabase
        .from('posts')
        .select('view_count')
        .eq('id', postId)
        .single();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          viewCount: post?.view_count || 0,
          alreadyViewed: true 
        })
      };
    }

    // Call the stored procedure to increment view count
    const { data, error } = await supabase
      .rpc('increment_post_view', {
        p_post_id: postId,
        p_viewer_id: viewerId,
        p_ip_address: clientIP,
        p_user_agent: userAgent
      });

    if (error) {
      throw error;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        viewCount: data,
        alreadyViewed: false 
      })
    };

  } catch (error) {
    console.error('Error tracking view:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};