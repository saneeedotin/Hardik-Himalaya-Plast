<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class BatchController extends Controller
{
    public function getQcTemplate($batchNumber)
    {
        $batch = \App\Models\Batch::with('item')->where('batch_number', $batchNumber)->first();
        if (!$batch || !$batch->item || !$batch->item->qc_template) {
            return response()->json(['template' => null], 404);
        }

        return response()->json([
            'template' => $batch->item->qc_template
        ]);
    }
}
