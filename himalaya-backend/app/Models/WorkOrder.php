<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class WorkOrder extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'work_order_number',
        'sales_order_id',
        'fg_item_id',
        'planned_qty',
        'produced_qty',
        'status',
        'fg_batch_number',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
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

    public function jobCards()
    {
        return $this->hasMany(JobCard::class);
    }

    public function fgItem()
    {
        return $this->belongsTo(Item::class, 'fg_item_id');
    }

    public function salesOrder()
    {
        return $this->belongsTo(SalesOrder::class);
    }
}
