<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatbotConversation;
use Illuminate\Http\Request;

class AdminChatbotController extends Controller
{
    public function logs()
    {
        $conversations = ChatbotConversation::with('user')->latest()->paginate(200);
        $pageData = ['conversations' => $conversations];
        return view('layouts.app', compact('pageData'));
    }

    public function filterByCategory($category)
    {
        $conversations = ChatbotConversation::with('user')->latest()->paginate(200);
        $pageData = ['conversations' => $conversations];
        return view('layouts.app', compact('pageData'));
    }
}
