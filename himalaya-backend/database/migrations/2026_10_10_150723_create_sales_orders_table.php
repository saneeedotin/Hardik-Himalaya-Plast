<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('order_number')->unique();
            $table->string('customer_name');
            $table->uuid('customer_id')->nullable();
            $table->string('customer_gstin')->nullable();
            $table->dateTime('transaction_date')->useCurrent();
            $table->dateTime('delivery_date');
            $table->string('status')->default('DRAFT'); // DRAFT, PROFORMA_SENT, CONFIRMED, IN_PRODUCTION
            $table->string('approval_method'); // WHATSAPP, EMAIL, PHONE, VERBAL
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->string('proforma_ref')->nullable();
            $table->dateTime('proforma_sent_at')->nullable();
            $table->dateTime('confirmed_at')->nullable();
            $table->uuid('confirmed_by_id')->nullable();
            $table->timestamps();

            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('set null');
            $table->foreign('confirmed_by_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_orders');
    }
};
