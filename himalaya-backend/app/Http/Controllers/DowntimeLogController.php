<?php

namespace App\Http\Controllers;

use App\Models\DowntimeLog;
use Illuminate\Http\Request;

class DowntimeLogController extends Controller
{
    public function index()
    {
        return response()->json(DowntimeLog::all());
    }
}
