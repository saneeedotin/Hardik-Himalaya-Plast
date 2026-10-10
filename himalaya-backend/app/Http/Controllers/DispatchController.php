<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DispatchController extends Controller
{
    public function notes()
    {
        $notes = \App\Models\DeliveryNote::with([
            'salesOrder.items.item',
            'cartons.batch.item',
            'cartons.scannedBy'
        ])
        ->orderBy('created_at', 'desc')
        ->get();

        $mapped = $notes->map(function ($note) {
            return [
                'id' => $note->id,
                'noteNumber' => $note->dn_number,
                'salesOrderId' => $note->sales_order_id,
                'status' => $note->status,
                'vehicleNumber' => $note->vehicle_number,
                'driverName' => '',
                'transporter' => $note->transporter_name,
                'createdAt' => $note->created_at->toISOString(),
                'salesOrder' => $note->salesOrder ? [
                    'id' => $note->salesOrder->id,
                    'orderNumber' => $note->salesOrder->order_number,
                    'customerName' => $note->salesOrder->customer_name,
                    'items' => $note->salesOrder->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'itemId' => $item->item_id,
                            'quantity' => (float) $item->qty,
                            'item' => $item->item ? [
                                'id' => $item->item->id,
                                'code' => $item->item->code,
                                'name' => $item->item->name,
                                'uom' => $item->item->uom,
                            ] : null
                        ];
                    })
                ] : null,
                'cartons' => $note->cartons->map(function ($carton) {
                    return [
                        'id' => $carton->id,
                        'cartonCode' => $carton->carton_code,
                        'batchId' => $carton->batch_id,
                        'quantity' => (float) $carton->quantity,
                        'status' => $carton->status,
                        'scannedAt' => $carton->scanned_at ? $carton->scanned_at->toISOString() : null,
                        'batch' => $carton->batch ? [
                            'id' => $carton->batch->id,
                            'batchNumber' => $carton->batch->batch_number,
                            'item' => $carton->batch->item ? [
                                'id' => $carton->batch->item->id,
                                'code' => $carton->batch->item->code,
                                'name' => $carton->batch->item->name,
                            ] : null
                        ] : null,
                        'scannedBy' => $carton->scannedBy ? [
                            'id' => $carton->scannedBy->id,
                            'name' => $carton->scannedBy->name,
                        ] : null
                    ];
                })
            ];
        });

        return response()->json($mapped);
    }

    public function scan(Request $request)
    {
        $cartonCode = $request->input('cartonCode');
        $override = $request->input('override', false);
        $overrideNote = $request->input('overrideNote', '');

        if (!$cartonCode) {
            return response()->json(['error' => 'Carton code is required'], 400);
        }

        $carton = \App\Models\CartonLabel::with([
            'deliveryNote.cartons',
            'batch.item'
        ])->where('carton_code', $cartonCode)->first();

        if (!$carton) {
            return response()->json(['error' => 'Carton code "' . $cartonCode . '" not recognized in system.'], 404);
        }

        if ($carton->scanned && !$override) {
            return response()->json([
                'error' => 'Carton "' . $cartonCode . '" was already scanned previously.',
                'alreadyScanned' => true,
                'carton' => $carton
            ], 409);
        }

        $carton->update([
            'scanned' => true,
            'scanned_at' => now(),
            'dispatch_override' => $override,
            'dispatch_override_note' => $override ? $overrideNote : null,
        ]);

        $carton->load('deliveryNote.cartons');

        $allCartons = $carton->deliveryNote->cartons;
        $scannedCount = $allCartons->where('scanned', true)->count();
        $totalCount = $allCartons->count();
        $isComplete = $scannedCount === $totalCount;

        if ($isComplete) {
            $carton->deliveryNote->update([
                'status' => 'DISPATCHED',
                // 'dispatched_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Scanned carton ' . $cartonCode . ' (' . $carton->quantity . 'm ' . $carton->batch->item->name . ')',
            'carton' => $carton,
            'scannedCount' => $scannedCount,
            'totalCount' => $totalCount,
            'isComplete' => $isComplete,
        ]);
    }
}
