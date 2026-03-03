<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Budget;
use App\Models\Event;
use App\Models\Activity;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function index()
    {
        // Dashboard Overview Data
        $totalBudget = Budget::sum('allocated_amount');
        $totalSpent = Budget::sum('spent_amount');
        $totalEvents = Event::count();
        $totalUsers = User::where('role', 'user')->count();
        $recentActivities = Activity::with('user')->latest()->take(10)->get();

        // Budget by Year
        $currentYear = now()->year;
        $yearlyBudget = Budget::where('year', $currentYear)->sum('allocated_amount');
        $yearlySpent = Budget::where('year', $currentYear)->sum('spent_amount');

        // Events by Status
        $upcomingEvents = Event::where('status', 'upcoming')->count();
        $ongoingEvents = Event::where('status', 'ongoing')->count();
        $completedEvents = Event::where('status', 'completed')->count();

        $pageData = [
            'totalBudget' => $totalBudget,
            'totalSpent' => $totalSpent,
            'totalEvents' => $totalEvents,
            'totalUsers' => $totalUsers,
            'recentActivities' => $recentActivities,
            'yearlyBudget' => $yearlyBudget,
            'yearlySpent' => $yearlySpent,
            'upcomingEvents' => $upcomingEvents,
            'ongoingEvents' => $ongoingEvents,
            'completedEvents' => $completedEvents,
        ];

        return view('layouts.app', compact('pageData'));
    }
}
