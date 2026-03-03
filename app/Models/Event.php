<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'event_date',
        'location',
        'max_participants',
        'status',
    ];

    protected $casts = [
        'event_date' => 'datetime',
    ];

    public function participants()
    {
        return $this->hasMany(EventParticipant::class);
    }

    public function getParticipantCountAttribute()
    {
        return $this->participants()->count();
    }

    public function isUserRegistered($userId)
    {
        return $this->participants()
            ->where('user_id', $userId)
            ->exists();
    }

    public function canRegister()
    {
        if (!$this->max_participants) {
            return true;
        }
        return $this->participants()->count() < $this->max_participants;
    }
}
