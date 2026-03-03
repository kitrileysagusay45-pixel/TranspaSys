<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventParticipant;
use Illuminate\Http\Request;

class UserEventController extends Controller
{
    public function index()
    {
        $events = Event::where('status', 'upcoming')
            ->withCount('participants')
            ->orderBy('event_date')
            ->paginate(15);
        $pageData = ['events' => $events];
        return view('layouts.app', compact('pageData'));
    }

    public function show(Event $event)
    {
        $isRegistered = $event->isUserRegistered(auth()->id());
        $eventData = $event->toArray();
        $eventData['participants_count'] = $event->participants()->count();
        $eventData['can_register'] = $event->canRegister() || !$event->max_participants;
        $pageData = ['event' => $eventData, 'isRegistered' => $isRegistered];
        return view('layouts.app', compact('pageData'));
    }

    public function register(Event $event)
    {
        if ($event->isUserRegistered(auth()->id())) {
            return redirect()->back()->with('error', 'You are already registered for this event');
        }

        if (!$event->canRegister()) {
            return redirect()->back()->with('error', 'Event is full or registration is closed');
        }

        EventParticipant::create([
            'event_id' => $event->id,
            'user_id' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Successfully registered for the event');
    }

    public function unregister(Event $event)
    {
        EventParticipant::where('event_id', $event->id)
            ->where('user_id', auth()->id())
            ->delete();

        return redirect()->back()->with('success', 'Successfully unregistered from the event');
    }

    public function myEvents()
    {
        $events = Event::whereHas('participants', function ($query) {
            $query->where('user_id', auth()->id());
        })->paginate(15);
        $pageData = ['events' => $events];
        return view('layouts.app', compact('pageData'));
    }
}
