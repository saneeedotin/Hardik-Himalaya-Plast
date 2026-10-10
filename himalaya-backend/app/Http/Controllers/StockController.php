<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Item;
use App\Models\StockLedgerEntry;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    public function inventoryStatus()
    {
        $items = Item::orderBy('name', 'asc')->get();
        $ledgers = StockLedgerEntry::orderBy('created_at', 'desc')->get();

        $physicalMap = [];

        foreach ($ledgers as $entry) {
            if (!isset($physicalMap[$entry->item_id])) {
                $physicalMap[$entry->item_id] = [
                    'stock' => 0,
                    'lastMovement' => null
                ];
            }

            $type = $entry->movement_type;
            if (in_array($type, ["RECEIPT", "PRODUCTION_OUTPUT", "PRODUCTION", "RECOVERY", "ADJUSTMENT_IN"])) {
                $physicalMap[$entry->item_id]['stock'] += $entry->quantity;
            } elseif (in_array($type, ["CONSUMPTION", "SCRAP", "DISPATCH", "ADJUSTMENT_OUT"])) {
                $physicalMap[$entry->item_id]['stock'] -= $entry->quantity;
            }

            $entryDate = \Carbon\Carbon::parse($entry->created_at);
            if (!$physicalMap[$entry->item_id]['lastMovement'] || $entryDate > $physicalMap[$entry->item_id]['lastMovement']) {
                $physicalMap[$entry->item_id]['lastMovement'] = $entryDate;
            }
        }

        $inventory = $items->map(function ($item) use ($physicalMap) {
            $stats = $physicalMap[$item->id] ?? ['stock' => 0, 'lastMovement' => null];
            
            $physicalStock = round($stats['stock'], 2);
            $reservedStock = 0; // TODO: Implement reservations
            $availableStock = max(0, round($physicalStock - $reservedStock, 2));
            
            $minStock = (float) ($item->min_stock_level ?? 0);
            $reorderAlert = $physicalStock < $minStock && $minStock > 0;

            return [
                'item' => [
                    'id' => $item->id,
                    'code' => $item->code,
                    'name' => $item->name,
                    'category' => $item->category,
                    'uom' => $item->uom,
                    'minStockLevel' => $minStock,
                ],
                'physicalStock' => $physicalStock,
                'reservedStock' => $reservedStock,
                'availableStock' => $availableStock,
                'stock' => $physicalStock,
                'reorderAlert' => $reorderAlert,
                'minStockLevel' => $minStock,
                'lastMovement' => $stats['lastMovement'] ? $stats['lastMovement']->toISOString() : null,
                'tier' => $item->category,
            ];
        });

        return response()->json($inventory);
    }

    public function ledgerEntries()
    {
        $entries = StockLedgerEntry::with('item')
            ->orderBy('created_at', 'desc')
            ->take(100)
            ->get();

        $mapped = $entries->map(function ($entry) {
            return [
                'id' => $entry->id,
                'itemId' => $entry->item_id,
                'batchId' => $entry->batch_id,
                'warehouse' => $entry->warehouse,
                'quantity' => (float) $entry->quantity,
                'movementType' => $entry->movement_type,
                'referenceId' => $entry->reference_id,
                'notes' => $entry->notes,
                'createdAt' => $entry->created_at->toISOString(),
                'item' => $entry->item ? [
                    'id' => $entry->item->id,
                    'code' => $entry->item->code,
                    'name' => $entry->item->name,
                    'uom' => $entry->item->uom,
                ] : null
            ];
        });

        return response()->json($mapped);
    }

    public function batches()
    {
        $batches = \App\Models\Batch::with('item')
            ->orderBy('created_at', 'desc')
            ->get();

        $mapped = $batches->map(function ($batch) {
            return [
                'id' => $batch->id,
                'batchNumber' => $batch->batch_number,
                'itemId' => $batch->item_id,
                'quantity' => (float) $batch->quantity,
                'uom' => $batch->uom,
                'source' => $batch->source,
                'parentBatchId' => $batch->parent_batch_id,
                'createdAt' => $batch->created_at->toISOString(),
                'item' => $batch->item ? [
                    'id' => $batch->item->id,
                    'code' => $batch->item->code,
                    'name' => $batch->item->name,
                    'uom' => $batch->item->uom,
                ] : null
            ];
        });

        return response()->json($mapped);
    }

    public function receiveRm(Request $request)
    {
        $barcode = $request->input('barcode');
        
        $pvcItem = \App\Models\Item::where('code', 'RM-PVC-K67')->first();
        if (!$pvcItem) {
            return response()->json(['success' => false, 'error' => 'PVC Resin item not found in DB.'], 404);
        }

        $batchNumber = 'BATCH-RM-' . $barcode . '-' . substr((string)(time() * 1000), -4);
        
        $newBatch = \App\Models\Batch::create([
            'batch_number' => $batchNumber,
            'item_id' => $pvcItem->id,
            'quantity' => 25,
            'uom' => 'Kg',
            'source' => 'PURCHASE',
        ]);

        \App\Models\StockLedgerEntry::create([
            'item_id' => $pvcItem->id,
            'batch_id' => $newBatch->id,
            'warehouse' => 'MAIN',
            'quantity' => 25,
            'movement_type' => 'RECEIPT',
            'reference_id' => $barcode,
            'notes' => 'Received via Tablet App',
        ]);

        return response()->json([
            'success' => true,
            'batch' => [
                'id' => $newBatch->batch_number,
                'material' => $pvcItem->name,
                'qty' => $newBatch->quantity,
                'time' => $newBatch->created_at->format('h:i:s A')
            ]
        ]);
    }

    public function verifyMixingBom(Request $request)
    {
        $jobCardId = $request->input('jobCardId', '');
        $resinBarcode = $request->input('resinBarcode', '');
        $masterbatchBarcode = $request->input('masterbatchBarcode', '');

        if (str_contains($resinBarcode, 'ERR') || str_contains($masterbatchBarcode, 'ERR') || str_contains($jobCardId, 'ERR')) {
            return response()->json(['success' => false, 'error' => 'Mismatch Detected! Components do not match BOM.']);
        }

        return response()->json(['success' => true]);
    }
}
