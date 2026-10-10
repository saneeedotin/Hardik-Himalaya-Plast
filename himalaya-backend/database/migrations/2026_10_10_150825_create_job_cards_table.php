<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_cards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('work_order_id');
            $table->uuid('workstation_id');
            $table->uuid('assigned_user_id')->nullable();
            $table->uuid('die_id')->nullable();
            $table->string('status')->default('QUEUED'); // QUEUED, ACTIVE, COMPLETED
            $table->double('good_qty')->default(0);
            $table->double('scrap_qty')->default(0);
            $table->dateTime('started_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('work_order_id')->references('id')->on('work_orders')->onDelete('cascade');
            $table->foreign('workstation_id')->references('id')->on('workstations')->onDelete('restrict');
            // Assuming users table uses string/UUID ids, otherwise we'd need to adjust
            // $table->foreign('assigned_user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_cards');
    }
};
