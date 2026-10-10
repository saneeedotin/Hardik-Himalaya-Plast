<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_notes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('dn_number')->unique();
            $table->uuid('sales_order_id');
            $table->string('customer_name');
            $table->string('transporter_name')->nullable();
            $table->string('vehicle_number')->nullable();
            $table->string('lr_number')->nullable();
            $table->string('status')->default('DRAFT'); // DRAFT, DISPATCHED, DELIVERED
            $table->dateTime('dispatched_at')->nullable();
            $table->timestamps();

            $table->foreign('sales_order_id')->references('id')->on('sales_orders')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_notes');
    }
};
