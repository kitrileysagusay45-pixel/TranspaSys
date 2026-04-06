import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message, category = 'general' } = await request.json();

  if (!message || message.length > 500) {
    return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
  }

  // Build system context from database
  const context = await getSystemContext(supabase);

  let response;
  const apiKey = process.env.GROQ_API_KEY;

  if (apiKey) {
    try {
      // Get recent history for context
      const { data: historyData } = await supabase
        .from('chatbot_conversations')
        .select('user_message, bot_response')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const history = (historyData || []).reverse();

      const systemMessage = `You are a helpful AI Assistant for a Barangay Management System called TranspaSys. 
      You are currently helping a resident in the '${category}' category.
      
      SYSTEM CONTEXT:
      ${context}
      
      **STRICT RULES**:
      1. ONLY answer based on the provided SYSTEM CONTEXT. If the information is not in the context, politely say you don't have that information.
      2. ONLY answer the user's specific question. Do not provide unrelated info.
      3. NO UNSOLICITED LISTS. If asked about budget, do NOT show events. If asked about events, do NOT show budget.
      4. **ACCURACY IS PARAMOUNT**: Double-check amounts and dates against the SYSTEM CONTEXT before responding.
      5. **CONTEXT AWARENESS**: Refer to the previous history of the conversation to provide relevant follow-up answers.
      6. **PRIVACY & SECURITY**: NEVER provide private user data, passwords, or personal details.
      7. **TRUST DATA FIELDS**: Always prioritize the 'Date' or 'Year' fields in the context over any years mentioned in Title strings.
      8. DO NOT dump the entire list unless the user asks for 'all' or 'the full' list/budget/events.
      9. BE CONCISE and professional.
      
      **EVENT FORMATTING**: - **[Event Title]**: [Date], [Location], Status: [Status], Description: [Description]
      **BUDGET FORMATTING**: - Year: [Year], Category: [Category], Allocated: ₱[Amount], Spent: ₱[Amount], Remaining: ₱[Amount]`;

      const messages = [{ role: 'system', content: systemMessage }];
      history.forEach((item) => {
        messages.push({ role: 'user', content: item.user_message });
        messages.push({ role: 'assistant', content: item.bot_response });
      });
      messages.push({ role: 'user', content: message });

      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      const result = await groqRes.json();
      response = result.choices?.[0]?.message?.content || getFallbackResponse(context);
    } catch (error) {
      console.error('Groq API Error:', error);
      response = getFallbackResponse(context);
    }
  } else {
    response = getFallbackResponse(context);
  }

  // Save conversation
  await supabase.from('chatbot_conversations').insert({
    user_id: user.id,
    user_message: message,
    bot_response: response,
    category,
  });

  return NextResponse.json({ response });
}

function getFallbackResponse(context) {
  return `I'm having trouble connecting to my brain right now, but here is what I see in the system:\n\n${context}\n\nHow else can I help you?`;
}

async function getSystemContext(supabase) {
  const currentYear = new Date().getFullYear();
  const { data: budgets } = await supabase.from('budgets').select('*').order('year', { ascending: false });
  const { data: events } = await supabase.from('events').select('*').order('event_date', { ascending: false });

  let context = `CURRENT YEAR: ${currentYear}\n\n`;

  context += 'ALL BUDGET DATA:\n';
  if (budgets && budgets.length > 0) {
    budgets.forEach((b) => {
      const remaining = Number(b.allocated_amount) - Number(b.spent_amount);
      context += `- Year: ${b.year}, Category: ${b.category}, Allocated: ₱${Number(b.allocated_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}, Spent: ₱${Number(b.spent_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}, Remaining: ₱${remaining.toLocaleString('en-PH', { minimumFractionDigits: 2 })}\n`;
    });
  } else {
    context += 'No budget data recorded in the system.\n';
  }

  context += '\nALL EVENTS DATA:\n';
  if (events && events.length > 0) {
    events.forEach((e) => {
      context += `- Title: ${e.title}, Date: ${new Date(e.event_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}, Location: ${e.location}, Status: ${e.status}. Description: ${e.description}\n`;
    });
  } else {
    context += 'No events recorded in the system.\n';
  }

  context += '\nOFFICE HOURS: Monday to Friday, 8:00 AM to 5:00 PM (Closed on weekends and holidays).\n';

  return context;
}
