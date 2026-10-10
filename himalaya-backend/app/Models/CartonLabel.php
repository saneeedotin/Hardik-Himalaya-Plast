<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CartonLabel extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'carton_code',
        'batch_id',
        'quantity',
        'status',
        'delivery_note_id',
        'scanned_by_id',
        'scanned_at',
        'scanned',
        'dispatch_confirmed',
        'dispatch_override',
        'dispatch_override_note',
    ];

    protected $casts = [
        'scanned_at' => 'datetime',
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

    public function batch()
    {
        return $this->belongsTo(Batch::class, 'batch_id');
    }

    public function scannedBy()
    {
        return $this->belongsTo(User::class, 'scanned_by_id');
    }

    public function deliveryNote()
    {
        return $this->belongsTo(DeliveryNote::class, 'delivery_note_id');
    }
}
