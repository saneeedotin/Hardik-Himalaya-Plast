<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ShiftHandover extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'shift_date',
        'shift_type',
        'workstation_id',
        'outgoing_operator_id',
        'incoming_operator_id',
        'scrap_generated_qty',
        'notes',
        'status',
        'accepted_at',
    ];

    protected $casts = [
        'shift_date' => 'datetime',
        'accepted_at' => 'datetime',
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

    public function outgoingOperator()
    {
        return $this->belongsTo(User::class, 'outgoing_operator_id');
    }

    public function incomingOperator()
    {
        return $this->belongsTo(User::class, 'incoming_operator_id');
    }
}
