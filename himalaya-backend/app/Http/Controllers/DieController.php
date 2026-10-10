<?php

namespace App\Http\Controllers;

use App\Models\DieModel;
use Illuminate\Http\Request;

class DieController extends Controller
{
    public function index()
    {
        return response()->json(DieModel::all());
    }
}
