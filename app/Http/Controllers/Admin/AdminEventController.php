<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Activity;
use Illuminate\Http\Request;

class AdminEventController extends Controller
{
    public function index()
    {
        $events = Event::withCount('participants')->paginate(15);
        $pageData = ['events' => $events];
        return view('layouts.app', compact('pageData'));
    }

    public function create()
    {
        return view('layouts.app', ['pageData' => []]);
    }

    public function store(Request $request)
    {
        if ($request->has('event_date')) {
            $request->merge(['event_date' => str_replace('T', ' ', $request->event_date)]);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'event_date' => 'required|date_format:Y-m-d H:i',
            'location' => 'required|string|max:255',
            'max_participants' => 'nullable|integer|min:1',
            'status' => 'required|in:upcoming,ongoing,completed,cancelled',
        ]);

        Event::create($validated);
        Activity::logActivity(auth()->id(), 'Created new event', 'event_created', $validated['title']);

        return redirect()->route('admin.events.index')->with('success', 'Event created successfully');
    }

    public function edit(Event $event)
    {
        $pageData = ['event' => $event];
        return view('layouts.app', compact('pageData'));
    }

    public function update(Request $request, Event $event)
    {
        if ($request->has('event_date')) {
            $request->merge(['event_date' => str_replace('T', ' ', $request->event_date)]);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'event_date' => 'required|date_format:Y-m-d H:i',
            'location' => 'required|string|max:255',
            'max_participants' => 'nullable|integer|min:1',
            'status' => 'required|in:upcoming,ongoing,completed,cancelled',
        ]);

        $event->update($validated);
        Activity::logActivity(auth()->id(), 'Updated event', 'event_updated', $event->title);

        return redirect()->route('admin.events.index')->with('success', 'Event updated successfully');
    }

    public function destroy(Event $event)
    {
        Activity::logActivity(auth()->id(), 'Deleted event', 'event_deleted', $event->title);
        $event->delete();

        return redirect()->route('admin.events.index')->with('success', 'Event deleted successfully');
    }

    public function participants(Event $event)
    {
        $participants = EventParticipant::where('event_id', $event->id)
            ->with('user')
            ->paginate(20);
        $pageData = ['event' => $event, 'participants' => $participants];
        return view('layouts.app', compact('pageData'));
    }
}
