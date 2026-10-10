<?php

namespace App\Http\Controllers;

use App\Models\QualityInspection;
use Illuminate\Http\Request;

class QualityInspectionController extends Controller
{
    public function index()
    {
        return response()->json(QualityInspection::all());
    }

    public function submit(Request $request)
    {
        $data = $request->validate([
            'batchNumber' => 'required|string',
            'status' => 'required|string',
            'sampleSize' => 'nullable|integer',
            'qcData' => 'nullable|array',
            'inspectorName' => 'nullable|string',
            'reworkNotes' => 'nullable|string',
        ]);

        $batchNumber = $data['batchNumber'];
        $status = $data['status'];
        $sampleSize = $data['sampleSize'] ?? 5;
        $inspectorName = $data['inspectorName'] ?? 'Param (Founder)';
        $qcData = collect($data['qcData'] ?? [])->toJson();

        $reportCount = QualityInspection::count();
        $reportNumber = 'QC-2026-' . str_pad($reportCount + 1, 5, '0', STR_PAD_LEFT);

        $inspection = QualityInspection::create([
            'report_number' => $reportNumber,
            'batch_number' => $batchNumber,
            'status' => $status,
            'sample_size' => $sampleSize,
            'inspector_name' => $inspectorName,
            'qc_data' => $qcData === '[]' ? null : $qcData,
            'rework_notes' => $data['reworkNotes'] ?? null,
        ]);

        $batch = \App\Models\Batch::where('batch_number', $batchNumber)->first();

        if ($batch && $status === 'SCRAP') {
            \App\Models\StockLedgerEntry::create([
                'item_id' => $batch->item_id,
                'batch_id' => $batch->id,
                'warehouse' => 'QC_HOLD',
                'quantity' => $batch->quantity,
                'movement_type' => 'SCRAP',
                'reference_id' => $inspection->id,
                'notes' => "QC Scrapped via Report $reportNumber",
            ]);
        }

        return response()->json([
            'success' => true,
            'inspection' => [
                'id' => $inspection->id,
                'reportNumber' => $inspection->report_number,
                'batchNumber' => $inspection->batch_number,
                'status' => $inspection->status,
                'sampleSize' => $inspection->sample_size,
                'inspectorName' => $inspection->inspector_name,
                'qcData' => $inspection->qc_data,
                'reworkNotes' => $inspection->rework_notes,
                'inspectedAt' => $inspection->inspected_at,
            ]
        ]);
    }
}
