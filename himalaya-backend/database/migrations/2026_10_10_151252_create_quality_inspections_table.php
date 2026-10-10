<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quality_inspections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('report_number')->unique();
            $table->uuid('job_card_id')->nullable();
            $table->string('batch_number');
            $table->string('status')->default('DRAFT'); // DRAFT, PASS, REJECT, SCRAP, REWORK
            $table->integer('sample_size')->default(5);
            $table->string('inspector_name');
            $table->dateTime('inspected_at')->useCurrent();
            $table->text('rework_notes')->nullable();
            $table->json('qc_data')->nullable();
            $table->timestamps();

            $table->foreign('job_card_id')->references('id')->on('job_cards')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quality_inspections');
    }
};
