<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class DowntimeLog extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'workstation_id',
        'job_card_id',
        'reason_code',
        'start_time',
        'end_time',
        'duration_mins',
        'notes',
        'logged_by_id',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    public function workstation()
    {
        return $this->belongsTo(Workstation::class);
    }

    public function jobCard()
    {
        return $this->belongsTo(JobCard::class);
    }

    public function loggedBy()
    {
        return $this->belongsTo(User::class, 'logged_by_id');
    }
}
