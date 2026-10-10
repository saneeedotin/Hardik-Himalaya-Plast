<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WorkstationController;

Route::get('/', function () {
    return view('welcome');
});

// We are putting this API route in web.php to skip the Sanctum setup for this demo,
// but in production it should go in api.php
Route::get('/api/workstations', [WorkstationController::class, 'index']);
