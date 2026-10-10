<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('downtime_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workstation_id');
            $table->uuid('job_card_id')->nullable();
            $table->string('reason_code');
            $table->dateTime('start_time')->useCurrent();
            $table->dateTime('end_time')->nullable();
            $table->integer('duration_mins')->nullable();
            $table->text('notes')->nullable();
            $table->uuid('logged_by_id');
            $table->timestamps();

            // We drop foreign keys until all tables are fully migrated, or define them if certain tables are created.
            // In a fresh migration they will work since workstations and users exist.
            $table->foreign('workstation_id')->references('id')->on('workstations')->onDelete('cascade');
            $table->foreign('job_card_id')->references('id')->on('job_cards')->onDelete('cascade');
            $table->foreign('logged_by_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('downtime_logs');
    }
};
