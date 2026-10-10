<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WorkstationController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\QualityInspectionController;
use App\Http\Controllers\BatchController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\DispatchController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/api/workstations', [WorkstationController::class, 'index']);
Route::get('/api/items', [ItemController::class, 'index']);
Route::get('/api/customers', [CustomerController::class, 'index']);
Route::get('/api/suppliers', [SupplierController::class, 'index']);
Route::get('/api/stock/inventory', [StockController::class, 'inventoryStatus']);
Route::get('/api/stock/ledger', [StockController::class, 'ledgerEntries']);
Route::get('/api/stock/batches', [StockController::class, 'batches']);
Route::post('/api/stock/receive-rm', [StockController::class, 'receiveRm']);
Route::post('/api/stock/verify-mixing-bom', [StockController::class, 'verifyMixingBom']);
Route::get('/api/dispatch/notes', [DispatchController::class, 'notes']);
Route::post('/api/dispatch/scan', [DispatchController::class, 'scan']);
Route::get('/api/batches/{batchNumber}/qc-template', [BatchController::class, 'getQcTemplate']);
Route::post('/api/qc/submit', [QualityInspectionController::class, 'submit']);
