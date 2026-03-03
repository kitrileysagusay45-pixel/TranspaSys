<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Event;
use App\Models\Budget;

class UserDashboardController extends Controller
{
    public function index()
    {
        $latestAnnouncements = Announcement::published()->latest()->take(5)->get();
        $upcomingEvents = Event::where('status', 'upcoming')
            ->orderBy('event_date')
            ->take(5)
            ->get();

        $currentYear = now()->year;
        $currentYearBudget = Budget::where('year', $currentYear)->sum('allocated_amount');
        $currentYearSpent = Budget::where('year', $currentYear)->sum('spent_amount');

        $pageData = [
            'latestAnnouncements' => $latestAnnouncements,
            'upcomingEvents' => $upcomingEvents,
            'currentYearBudget' => $currentYearBudget,
            'currentYearSpent' => $currentYearSpent,
        ];

        return view('layouts.app', compact('pageData'));
    }
}
