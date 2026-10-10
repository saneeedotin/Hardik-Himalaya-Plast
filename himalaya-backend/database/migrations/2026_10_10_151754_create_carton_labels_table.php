<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carton_labels', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('carton_code')->unique();
            $table->uuid('delivery_note_id');
            $table->uuid('batch_id');
            $table->double('quantity');
            $table->boolean('scanned')->default(false);
            $table->uuid('scanned_by_id')->nullable();
            $table->dateTime('scanned_at')->nullable();
            $table->boolean('dispatch_confirmed')->default(false);
            $table->boolean('dispatch_override')->default(false);
            $table->text('dispatch_override_note')->nullable();
            $table->timestamps();

            $table->foreign('delivery_note_id')->references('id')->on('delivery_notes')->onDelete('cascade');
            $table->foreign('batch_id')->references('id')->on('batches')->onDelete('restrict');
            $table->foreign('scanned_by_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carton_labels');
    }
};
