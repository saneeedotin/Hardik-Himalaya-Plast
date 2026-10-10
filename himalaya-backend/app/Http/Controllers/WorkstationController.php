<?php

namespace App\Http\Controllers;

use App\Models\Workstation;
use Illuminate\Http\Request;

class WorkstationController extends Controller
{
    public function index()
    {
        // Return all workstations as JSON
        $workstations = Workstation::all();
        
        // Map the snake_case columns back to camelCase to match our Next.js frontend exactly
        $mapped = $workstations->map(function ($ws) {
            return [
                'id' => $ws->id,
                'code' => $ws->code,
                'name' => $ws->name,
                'hourlyRate' => (float) $ws->hourly_rate,
                'status' => $ws->status,
                'createdAt' => $ws->created_at,
                'updatedAt' => $ws->updated_at,
            ];
        });

        return response()->json($mapped);
    }
}
