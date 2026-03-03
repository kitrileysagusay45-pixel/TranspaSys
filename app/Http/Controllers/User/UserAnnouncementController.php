<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class UserAnnouncementController extends Controller
{
    public function index()
    {
        $announcements = Announcement::published()->latest()->paginate(15);
        $pageData = ['announcements' => $announcements];
        return view('layouts.app', compact('pageData'));
    }

    public function show(Announcement $announcement)
    {
        $annData = $announcement->load('author')->toArray();
        $pageData = ['announcement' => $annData];
        return view('layouts.app', compact('pageData'));
    }
}
