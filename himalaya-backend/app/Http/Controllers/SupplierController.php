<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index()
    {
        $suppliers = Supplier::all();
        
        $mapped = $suppliers->map(function ($sup) {
            return [
                'id' => $sup->id,
                'name' => $sup->name,
                'gstin' => $sup->gstin,
                'email' => $sup->email,
                'phone' => $sup->phone,
                'status' => $sup->status,
                'createdAt' => $sup->created_at,
                'updatedAt' => $sup->updated_at,
            ];
        });

        return response()->json($mapped);
    }
}
