<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class QualityInspection extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'report_number',
        'job_card_id',
        'batch_number',
        'status',
        'sample_size',
        'inspector_name',
        'inspected_at',
        'rework_notes',
        'qc_data',
    ];

    protected $casts = [
        'inspected_at' => 'datetime',
        'qc_data' => 'array',
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

    public function jobCard()
    {
        return $this->belongsTo(JobCard::class);
    }
}
