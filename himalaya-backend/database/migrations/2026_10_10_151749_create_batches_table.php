<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('batches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('batch_number')->unique();
            $table->uuid('item_id');
            $table->double('quantity');
            $table->string('uom');
            $table->string('source'); // PURCHASE, EXTRUSION
            $table->uuid('parent_batch_id')->nullable();
            $table->timestamps();

            $table->foreign('item_id')->references('id')->on('items')->onDelete('restrict');
            // We can add self-referential foreign key for parent_batch_id if needed
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('batches');
    }
};
