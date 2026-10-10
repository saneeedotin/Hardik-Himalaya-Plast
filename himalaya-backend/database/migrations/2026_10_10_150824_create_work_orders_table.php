<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('work_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('work_order_number')->unique();
            $table->uuid('sales_order_id')->nullable();
            $table->uuid('fg_item_id');
            $table->double('planned_qty');
            $table->double('produced_qty')->default(0);
            $table->string('status')->default('PENDING'); // PENDING, IN_PROGRESS, COMPLETED
            $table->string('fg_batch_number')->nullable();
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();
            $table->timestamps();

            $table->foreign('sales_order_id')->references('id')->on('sales_orders')->onDelete('set null');
            $table->foreign('fg_item_id')->references('id')->on('items')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_orders');
    }
};
