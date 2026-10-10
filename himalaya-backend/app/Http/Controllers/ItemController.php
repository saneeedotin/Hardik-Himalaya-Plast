<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    public function index()
    {
        $items = Item::all();
        
        $mapped = $items->map(function ($item) {
            return [
                'id' => $item->id,
                'code' => $item->code,
                'name' => $item->name,
                'category' => $item->category,
                'uom' => $item->uom,
                'hsnCode' => $item->hsn_code,
                'standardCost' => (float) $item->standard_cost,
                'minStockLevel' => (float) $item->min_stock_level,
                'qcTemplate' => $item->qc_template,
                'createdAt' => $item->created_at,
                'updatedAt' => $item->updated_at,
            ];
        });

        return response()->json($mapped);
    }
}
