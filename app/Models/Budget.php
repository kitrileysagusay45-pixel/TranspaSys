<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    use HasFactory;

    protected $appends = ['remaining', 'percentage_used'];

    protected $fillable = [
        'category',
        'allocated_amount',
        'spent_amount',
        'year',
        'description',
        'file_path',
    ];

    protected $casts = [
        'allocated_amount' => 'decimal:2',
        'spent_amount' => 'decimal:2',
        'year' => 'integer',
    ];

    public function getPercentageUsedAttribute()
    {
        if ($this->allocated_amount == 0) {
            return 0;
        }
        return round(($this->spent_amount / $this->allocated_amount) * 100, 2);
    }

    public function getRemainingAttribute()
    {
        return $this->allocated_amount - $this->spent_amount;
    }
}
