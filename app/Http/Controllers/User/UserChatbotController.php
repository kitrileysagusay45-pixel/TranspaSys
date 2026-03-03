<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\ChatbotConversation;
use App\Models\Budget;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UserChatbotController extends Controller
{
    private $faqResponses = [
        'budget' => [
            'How is the budget allocated?' => 'The budget is allocated by category each year based on barangay priorities and needs.',
            'Can I see the budget details?' => 'Yes, you can view all budget information in the Budget Transparency section.',
        ],
        'events' => [
            'How do I register for events?' => 'Go to the event details and click the Register button to participate.',
            'Can I cancel my registration?' => 'Yes, you can unregister from events anytime in your Registered Events.',
        ],
        'office_hours' => [
            'What are the office hours?' => 'The barangay office is open Monday to Friday, 8:00 AM to 5:00 PM.',
            'When is the office closed?' => 'The office is closed on weekends and public holidays.',
        ],
        'contact' => [
            'How do I contact the barangay?' => 'You can reach us at the office during office hours or send a message through this chatbot.',
            'What is the office phone number?' => 'Please ask the barangay admin for contact details.',
        ],
        'sk_programs' => [
            'What SK programs are available?' => 'The SK offers youth development programs, sports activities, and community services.',
            'How do I join SK programs?' => 'Contact the SK office or check announcements for program details and registration.',
        ],
    ];

    public function index()
    {
        return view('user.chatbot.index');
    }

    public function getHistory()
    {
        $history = ChatbotConversation::where('user_id', auth()->id())
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'history' => $history
        ]);
    }

    public function clearHistory()
    {
        ChatbotConversation::where('user_id', auth()->id())->delete();
        return response()->json(['message' => 'History cleared successfully']);
    }

    public function chat(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:500',
            'category' => 'nullable|string|in:budget,events,office_hours,contact,sk_programs',
        ]);

        $category = $validated['category'] ?? 'general';

        $response = $this->generateBotResponse(
            $validated['message'],
            $category
        );

        ChatbotConversation::create([
            'user_id' => auth()->id(),
            'user_message' => $validated['message'],
            'bot_response' => $response,
            'category' => $category,
        ]);

        return response()->json([
            'response' => $response,
        ]);
    }

    private function generateBotResponse($message, $category)
    {
        $apiKey = env('GROQ_API_KEY');
        if (!$apiKey) {
            return $this->generateManualResponse($message, $category);
        }

        try {
            $client = new \GuzzleHttp\Client();
            $systemContext = $this->getSystemContext();

            // Fetch last 10 turns of history for context
            $historyItems = ChatbotConversation::where('user_id', auth()->id())
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->reverse();

            $systemMessage = "You are a helpful AI Assistant for a Barangay Management System called TranspaSys. 
            You are currently helping a resident in the '{$category}' category.
            
            SYSTEM CONTEXT:
            {$systemContext}
            
            **STRICT RULES**:
            1. ONLY answer the user's specific question. Do not provide info that was not asked for.
            2. NO UNSOLICITED LISTS. If asked about budget, do NOT show events. If asked about events, do NOT show budget.
            3. BE TARGETED. If asked a specific question (e.g., 'remaining education budget'), give ONLY that specific answer. 
            4. **CONTEXT AWARENESS**: Always refer to the previous messages in the conversation to understand follow-up questions like 'why?', 'how?', or 'tell me more'.
            5. **PRIVACY & SECURITY**: NEVER provide private user data, resident passwords, or personal details. If asked, explain politely that you are only authorized to provide public transparency data like budgets and events for security and privacy reasons. Do NOT suggest troubleshooting the database for these queries.
            6. **TRUST DATA FIELDS**: Always prioritize the 'Date' or 'Year' fields in the context over any years mentioned in the Title strings.
            7. DO NOT dump the entire list unless the user asks for 'all' or 'the full' list/budget/events.
            8. BE CONCISE. Get straight to the point. No AI lectures (e.g., do not explain why AI is used).
            
            Follow these formatting rules:
            - Start immediately with the answer or a 1-sentence intro if needed.
            - Use a SINGLE NEWLINE between list items.
            - Use a SINGLE NEWLINE between paragraphs.
            
            **EVENT FORMATTING**:
            If listing events, use exactly this format:
            - **[Event Title]**: [Date], [Location], Status: [Status], Description: [Description]
            
            **BUDGET FORMATTING**:
            If listing budgets, use a header 'Budget:' and then exactly this format:
            - Year: [Year], Category: [Category], Allocated: ₱[Amount], Spent: ₱[Amount], Remaining: ₱[Amount]
            
            If the information is not in the context, be honest but try to guide them on where to look in the system (e.g., 'Check the Budget Transparency page').";

            $messages = [
                ['role' => 'system', 'content' => $systemMessage]
            ];

            // Add history turns
            foreach ($historyItems as $item) {
                $messages[] = ['role' => 'user', 'content' => $item->user_message];
                $messages[] = ['role' => 'assistant', 'content' => $item->bot_response];
            }

            // Add current message
            $messages[] = ['role' => 'user', 'content' => $message];

            $response = $client->post('https://api.groq.com/openai/v1/chat/completions', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'model' => 'llama-3.1-8b-instant',
                    'messages' => $messages,
                    'temperature' => 0.7,
                    'max_tokens' => 500,
                ],
            ]);

            $result = json_decode($response->getBody(), true);
            return $result['choices'][0]['message']['content'] ?? $this->formatSystemDataForFallback($category);

        }
        catch (\Exception $e) {
            \Log::error('Groq API Error: ' . $e->getMessage());
            return $this->formatSystemDataForFallback($category);
        }
    }

    /**
     * If the AI fails, we still want to give a data-driven answer instead of a loop.
     */
    private function formatSystemDataForFallback($category)
    {
        $context = $this->getSystemContext();
        return "I'm having trouble connecting to my brain right now, but here is what I see in the system:\n\n" . $context . "\n\nHow else can I help you?";
    }

    private function getSystemContext()
    {
        $currentYear = now()->year;
        $budgets = Budget::orderBy('year', 'desc')->get();
        $events = Event::orderBy('event_date', 'desc')->get();

        $context = "CURRENT YEAR: {$currentYear}\n\n";

        $context .= "ALL BUDGET DATA:\n";
        if ($budgets->count() > 0) {
            foreach ($budgets as $b) {
                $context .= "- Year: {$b->year}, Category: {$b->category}, Allocated: ₱" . number_format($b->allocated_amount, 2) . ", Spent: ₱" . number_format($b->spent_amount, 2) . ", Remaining: ₱" . number_format($b->remaining, 2) . "\n";
            }
        }
        else {
            $context .= "No budget data recorded in the system.\n";
        }

        $context .= "\nALL EVENTS DATA:\n";
        if ($events->count() > 0) {
            foreach ($events as $e) {
                $status = $e->status;
                $context .= "- Title: {$e->title}, Date: " . $e->event_date->format('M d, Y') . ", Location: {$e->location}, Status: {$status}. Description: {$e->description}\n";
            }
        }
        else {
            $context .= "No events recorded in the system.\n";
        }

        $context .= "\nOFFICE HOURS: Monday to Friday, 8:00 AM to 5:00 PM (Closed on weekends and holidays).\n";

        return $context;
    }

    private function generateManualResponse($message, $category)
    {
        $message = strtolower($message);
        $currentYear = now()->year;

        // --- Budget Dynamic Logic ---
        if ($category === 'budget') {
            if (Str::contains($message, ['how many', 'count', 'categories', 'list', 'much'])) {
                $budgets = Budget::where('year', $currentYear)->get();
                $count = $budgets->count();

                if ($count > 0) {
                    $details = $budgets->map(function ($b) {
                        return "• {$b->category}: ₱" . number_format($b->allocated_amount, 2);
                    })->join("\n");

                    $total = $budgets->sum('allocated_amount');
                    $fmtTotal = '₱' . number_format($total, 2);

                    if (Str::contains($message, ['total', 'much']) && !Str::contains($message, ['categories', 'list'])) {
                        return "The total allocated budget for {$currentYear} is {$fmtTotal}.";
                    }

                    return "We have {$count} budget categories for {$currentYear}, totaling {$fmtTotal}:\n{$details}";
                }
                return "There are no budget categories recorded for {$currentYear} yet.";
            }

            if (Str::contains($message, ['spent', 'spending', 'used'])) {
                $spent = Budget::where('year', $currentYear)->sum('spent_amount');
                $fmtSpent = '₱' . number_format($spent, 2);
                return "So far, a total of {$fmtSpent} has been spent from the {$currentYear} budget.";
            }

            if (Str::contains($message, ['remaining', 'left', 'balance'])) {
                $total = Budget::where('year', $currentYear)->sum('allocated_amount');
                $spent = Budget::where('year', $currentYear)->sum('spent_amount');
                $remaining = $total - $spent;
                $fmtRem = '₱' . number_format($remaining, 2);
                return "The remaining balance for the {$currentYear} budget is {$fmtRem}.";
            }
        }

        // --- Events Dynamic Logic ---
        if ($category === 'events') {
            if (Str::contains($message, ['upcoming', 'next', 'what', 'list', 'events'])) {
                $events = Event::where('status', 'upcoming')->orderBy('event_date')->take(3)->get();
                if ($events->count() > 0) {
                    $list = $events->map(function ($e) {
                        return "• {$e->title} on " . $e->event_date->format('M d, Y');
                    })->join("\n");
                    return "Here are the upcoming events:\n" . $list;
                }
                return "There are no upcoming events scheduled at the moment.";
            }

            if (Str::contains($message, ['how many', 'count'])) {
                $count = Event::where('status', 'upcoming')->count();
                return "There are currently {$count} upcoming events scheduled.";
            }
        }

        // --- Standard FAQ Matching ---
        if (isset($this->faqResponses[$category])) {
            foreach ($this->faqResponses[$category] as $question => $answer) {
                if (stripos($message, strtolower(substr($question, 0, 5))) !== false) {
                    return $answer;
                }
            }
        }

        // Generic fallback responses
        $genericResponses = [
            'budget' => 'I can help with detailed budget information. Please ask about specific categories, total allocation, or spending.',
            'events' => 'I can help with event information. Ask about upcoming events, how many events we have, or registration.',
            'office_hours' => 'The barangay office hours are Monday to Friday, 8:00 AM to 5:00 PM.',
            'contact' => 'For more detailed inquiries, please visit the barangay office during office hours.',
            'sk_programs' => 'The SK offers youth programs and community services. Please visit the barangay for more details.',
        ];

        return $genericResponses[$category] ?? 'Thank you for your question. I am analyzing the system data to better assist you. Please contact the barangay office for official documents.';
    }
}
