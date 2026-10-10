<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SalesOrder extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'order_number',
        'customer_name',
        'customer_id',
        'customer_gstin',
        'transaction_date',
        'delivery_date',
        'status',
        'approval_method',
        'total_amount',
        'notes',
        'proforma_ref',
        'proforma_sent_at',
        'confirmed_at',
        'confirmed_by_id',
    ];

    protected $casts = [
        'transaction_date' => 'datetime',
        'delivery_date' => 'datetime',
        'proforma_sent_at' => 'datetime',
        'confirmed_at' => 'datetime',
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

    public function items()
    {
        return $this->hasMany(SalesOrderItem::class);
    }

    public function workOrders()
    {
        return $this->hasMany(WorkOrder::class);
    }
}
