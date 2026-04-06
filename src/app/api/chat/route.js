import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { message, category = 'general' } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0 || message.length > 500) {
      return NextResponse.json({ error: 'Invalid message. Maximum 500 characters allowed.' }, { status: 400 });
    }

    const context = await getSystemContext(supabase);

    let response;
    const apiKey = process.env.GROQ_API_KEY;

    if (apiKey) {
      try {
        const { data: historyData, error: historyError } = await supabase
          .from('chatbot_conversations')
          .select('user_message, bot_response')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(6); // Keep last 6 for context

        if (historyError) console.error('History fetch error:', historyError);
        const history = (historyData || []).reverse();

        const systemMessage = `You are a helpful AI Assistant for TranspaSys (Barangay Transparency System). 
        Category: ${category}
        
        CONTEXT:
        ${context}
        
        RULES:
        1. Base answers ONLY on the CONTEXT.
        2. Be concise and professional.
        3. Use ₱ for currency.
        4. If info is missing, say "I don't have that information right now."
        5. Prioritize the 'Date/Year' fields.`;

        const messages = [{ role: 'system', content: systemMessage }];
        history.forEach((item) => {
          messages.push({ role: 'user', content: item.user_message });
          messages.push({ role: 'assistant', content: item.bot_response });
        });
        messages.push({ role: 'user', content: message.trim() });

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages,
            temperature: 0.6,
            max_tokens: 400,
          }),
        });

        if (!groqRes.ok) throw new Error(`Groq API returned ${groqRes.status}`);
        
        const result = await groqRes.json();
        response = result.choices?.[0]?.message?.content || getFallbackResponse(context);
      } catch (error) {
        console.error('Chat API Error:', error);
        response = getFallbackResponse(context);
      }
    } else {
      response = getFallbackResponse(context);
    }

    // Save conversation in background (non-blocking)
    supabase.from('chatbot_conversations').insert({
      user_id: user.id,
      user_message: message.trim(),
      bot_response: response,
      category,
    }).then(({ error }) => { if (error) console.error('Failed to save log:', error); });

    return NextResponse.json({ response });
  } catch (globalError) {
    console.error('Global Chat Exception:', globalError);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getFallbackResponse(context) {
  return `I'm currently operating in offline mode. Based on our latest records:\n\n${context}\n\nIs there anything specific you'd like to know about these?`;
}

async function getSystemContext(supabase) {
  try {
    const currentYear = new Date().getFullYear();
    const [{ data: budgets }, { data: events }] = await Promise.all([
      supabase.from('budgets').select('year,category,allocated_amount,spent_amount').order('year', { ascending: false }).limit(10),
      supabase.from('events').select('title,event_date,location,status,description').order('event_date', { ascending: false }).limit(10)
    ]);

    let context = `YEAR: ${currentYear}\n\nBUDGETS:\n`;
    if (budgets?.length) {
      budgets.forEach((b) => {
        const remaining = Number(b.allocated_amount) - Number(b.spent_amount);
        context += `- ${b.year} ${b.category}: Allocated ₱${Number(b.allocated_amount).toLocaleString()}, Spent ₱${Number(b.spent_amount).toLocaleString()}, Rem. ₱${remaining.toLocaleString()}\n`;
      });
    } else {
      context += 'No budget data.\n';
    }

    context += '\nEVENTS:\n';
    if (events?.length) {
      events.forEach((e) => {
        context += `- ${e.title} (${new Date(e.event_date).toLocaleDateString()}): ${e.location}. ${e.status}.\n`;
      });
    } else {
      context += 'No events.\n';
    }

    context += '\nHOURS: Mon-Fri, 8AM-5PM.';
    return context;
  } catch (error) {
    console.error('Context fetch error:', error);
    return "Barangay information is currently being updated.";
  }
}

