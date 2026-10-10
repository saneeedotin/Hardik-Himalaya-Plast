<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('category'); // RAW_MATERIAL, FINISHED_GOODS, PACKAGING, SCRAP
            $table->string('uom'); // Meter, Kg, Nos
            $table->string('hsn_code')->nullable();
            $table->decimal('standard_cost', 15, 2)->default(0);
            $table->double('min_stock_level')->default(0);
            $table->json('qc_template')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
