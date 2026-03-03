<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Activity;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index()
    {
        $users = User::paginate(20);
        $pageData = ['users' => $users];
        return view('layouts.app', compact('pageData'));
    }

    public function approve(User $user)
    {
        $user->update(['is_approved' => true]);
        Activity::logActivity(auth()->id(), 'Approved user account', 'user_approved', $user->name);

        return redirect()->back()->with('success', 'User account approved successfully');
    }

    public function deactivate(User $user)
    {
        $user->update(['is_approved' => false]);
        Activity::logActivity(auth()->id(), 'Deactivated user account', 'user_deactivated', $user->name);

        return redirect()->back()->with('success', 'User account deactivated successfully');
    }

    public function assignRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => 'required|in:user,admin,sk,treasurer',
        ]);

        $user->update($validated);
        Activity::logActivity(auth()->id(), 'Assigned role to user', 'role_assigned', $user->name);

        return redirect()->back()->with('success', 'User role updated successfully');
    }
}
