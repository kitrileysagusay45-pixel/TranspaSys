<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Activity;
use Illuminate\Http\Request;

class AdminAnnouncementController extends Controller
{
    public function index()
    {
        $announcements = Announcement::with('author')->paginate(15);
        $pageData = ['announcements' => $announcements];
        return view('layouts.app', compact('pageData'));
    }

    public function create()
    {
        return view('layouts.app', ['pageData' => []]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'is_published' => 'sometimes|boolean',
        ]);

        $validated['created_by'] = auth()->id();
        if ($request->has('is_published')) {
            $validated['published_at'] = now();
        }

        Announcement::create($validated);
        Activity::logActivity(auth()->id(), 'Posted new announcement', 'announcement_created', $validated['title']);

        return redirect()->route('admin.announcements.index')->with('success', 'Announcement posted successfully');
    }

    public function edit(Announcement $announcement)
    {
        $pageData = ['announcement' => $announcement];
        return view('layouts.app', compact('pageData'));
    }

    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'is_published' => 'sometimes|boolean',
        ]);

        if ($request->has('is_published')) {
            $validated['published_at'] = now();
        }

        $announcement->update($validated);
        Activity::logActivity(auth()->id(), 'Updated announcement', 'announcement_updated', $announcement->title);

        return redirect()->route('admin.announcements.index')->with('success', 'Announcement updated successfully');
    }

    public function destroy(Announcement $announcement)
    {
        Activity::logActivity(auth()->id(), 'Deleted announcement', 'announcement_deleted', $announcement->title);
        $announcement->delete();

        return redirect()->route('admin.announcements.index')->with('success', 'Announcement deleted successfully');
    }
}
