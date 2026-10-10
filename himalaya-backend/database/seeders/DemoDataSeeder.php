<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Workstation;
use App\Models\Item;
use App\Models\SalesOrder;
use App\Models\WorkOrder;
use App\Models\JobCard;
use App\Models\Customer;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create a Customer
        $customer = Customer::create([
            'name' => 'Acme Corp',
            'gstin' => '24AAACC1206D1Z2',
        ]);

        // 2. Create Items
        $rm1 = Item::create([
            'code' => 'RM-PVC-K67',
            'name' => 'PVC Resin K-67',
            'category' => 'RAW_MATERIAL',
            'uom' => 'Kg',
            'standard_cost' => 120.00,
        ]);

        $rmBatch = \App\Models\Batch::create([
            'batch_number' => 'BAT-RM-2026-001',
            'item_id' => $rm1->id,
            'quantity' => 5000,
            'uom' => 'Kg',
            'source' => 'PURCHASE',
        ]);

        \App\Models\StockLedgerEntry::create([
            'item_id' => $rm1->id,
            'batch_id' => $rmBatch->id,
            'warehouse' => 'MAIN',
            'quantity' => 5000,
            'movement_type' => 'RECEIPT',
            'reference_id' => 'PO-2026-001',
            'notes' => 'Initial RM Stock',
        ]);

        $item1 = Item::create([
            'code' => 'FG-PIPE-20MM',
            'name' => '20mm PVC Pipe',
            'category' => 'FINISHED_GOODS',
            'uom' => 'Meter',
            'standard_cost' => 15.50,
            'qc_template' => [
                'fields' => [
                    ['name' => 'Outer Diameter', 'type' => 'number', 'min' => 19.8, 'max' => 20.2],
                    ['name' => 'Wall Thickness', 'type' => 'number', 'min' => 1.5, 'max' => 1.7],
                    ['name' => 'Visual Inspection', 'type' => 'boolean', 'expected' => true]
                ]
            ]
        ]);

        $batch1 = \App\Models\Batch::create([
            'batch_number' => 'BAT-2026-0001',
            'item_id' => $item1->id,
            'quantity' => 100,
            'uom' => 'Meter',
            'source' => 'EXTRUSION',
        ]);

        \App\Models\StockLedgerEntry::create([
            'item_id' => $item1->id,
            'batch_id' => $batch1->id,
            'warehouse' => 'MAIN',
            'quantity' => 100,
            'movement_type' => 'PRODUCTION_OUTPUT',
            'reference_id' => 'INIT-001',
            'notes' => 'Initial Demo Data Seeding',
        ]);
        
        $item2 = Item::create([
            'code' => 'FG-PIPE-40MM',
            'name' => '40mm PVC Pipe',
            'category' => 'FINISHED_GOODS',
            'uom' => 'Meter',
            'standard_cost' => 30.00,
        ]);

        // 3. Create a Sales Order
        $so = SalesOrder::create([
            'order_number' => 'SO-2026-001',
            'customer_name' => 'Acme Corp',
            'customer_id' => $customer->id,
            'transaction_date' => now(),
            'delivery_date' => now()->addDays(7),
            'status' => 'IN_PRODUCTION',
            'approval_method' => 'EMAIL',
        ]);

        \App\Models\SalesOrderItem::create([
            'sales_order_id' => $so->id,
            'item_id' => $item1->id,
            'qty' => 5000,
            'rate' => 15.50,
            'amount' => 5000 * 15.50,
        ]);

        \App\Models\SalesOrderItem::create([
            'sales_order_id' => $so->id,
            'item_id' => $item2->id,
            'qty' => 3000,
            'rate' => 30.00,
            'amount' => 3000 * 30.00,
        ]);

        // 4. Create Work Orders
        $wo1 = WorkOrder::create([
            'work_order_number' => 'WO-2026-001',
            'sales_order_id' => $so->id,
            'fg_item_id' => $item1->id,
            'planned_qty' => 5000,
            'status' => 'IN_PROGRESS',
        ]);

        $wo2 = WorkOrder::create([
            'work_order_number' => 'WO-2026-002',
            'sales_order_id' => $so->id,
            'fg_item_id' => $item2->id,
            'planned_qty' => 3000,
            'status' => 'PENDING',
        ]);

        // 5. Create Job Cards and assign to Workstations
        // Get LINE-01 and LINE-02 created from WorkstationSeeder
        $line1 = Workstation::where('code', 'LINE-01')->first();
        $line2 = Workstation::where('code', 'LINE-02')->first();

        if ($line1) {
            JobCard::create([
                'work_order_id' => $wo1->id,
                'workstation_id' => $line1->id,
                'status' => 'ACTIVE', // This makes it show up on the Shop Floor!
                'started_at' => now(),
            ]);
            $line1->update(['status' => 'RUNNING']);
        }

        if ($line2) {
            JobCard::create([
                'work_order_id' => $wo2->id,
                'workstation_id' => $line2->id,
                'status' => 'QUEUED',
            ]);
        }

        // 6. Create Delivery Note and Cartons for testing Dispatch
        $dn = \App\Models\DeliveryNote::create([
            'dn_number' => 'DN-2026-001',
            'sales_order_id' => $so->id,
            'customer_name' => $so->customer_name,
            'status' => 'DRAFT',
            'vehicle_number' => 'MH-12-AB-1234',
            'transporter_name' => 'Fast Express Logistics',
        ]);

        \App\Models\CartonLabel::create([
            'carton_code' => 'CRTN-2026-001',
            'batch_id' => $batch1->id, // PVC pipe batch from earlier
            'quantity' => 50, // 50 meters
            'delivery_note_id' => $dn->id,
        ]);

        \App\Models\CartonLabel::create([
            'carton_code' => 'CRTN-2026-002',
            'batch_id' => $batch1->id,
            'quantity' => 50, // 50 meters
            'delivery_note_id' => $dn->id,
        ]);
    }
}
