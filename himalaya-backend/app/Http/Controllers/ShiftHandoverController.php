<?php

namespace App\Http\Controllers;

use App\Models\ShiftHandover;
use Illuminate\Http\Request;

class ShiftHandoverController extends Controller
{
    public function index()
    {
        return response()->json(ShiftHandover::all());
    }
}
