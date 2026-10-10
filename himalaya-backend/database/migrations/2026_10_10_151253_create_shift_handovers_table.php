<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shift_handovers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->dateTime('shift_date');
            $table->string('shift_type');
            $table->uuid('workstation_id');
            $table->uuid('outgoing_operator_id');
            $table->uuid('incoming_operator_id')->nullable();
            $table->double('scrap_generated_qty')->default(0);
            $table->text('notes')->nullable();
            $table->string('status')->default('PENDING');
            $table->dateTime('accepted_at')->nullable();
            $table->timestamps();

            $table->foreign('workstation_id')->references('id')->on('workstations')->onDelete('cascade');
            $table->foreign('outgoing_operator_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('incoming_operator_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shift_handovers');
    }
};
