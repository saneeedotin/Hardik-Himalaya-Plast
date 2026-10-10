<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = Customer::all();
        
        $mapped = $customers->map(function ($cust) {
            return [
                'id' => $cust->id,
                'name' => $cust->name,
                'gstin' => $cust->gstin,
                'email' => $cust->email,
                'phone' => $cust->phone,
                'status' => $cust->status,
                'createdAt' => $cust->created_at,
                'updatedAt' => $cust->updated_at,
            ];
        });

        return response()->json($mapped);
    }
}
