<?php

namespace App\Http\Controllers;

use App\Models\Workstation;
use Illuminate\Http\Request;

class WorkstationController extends Controller
{
    public function index()
    {
        $workstations = Workstation::with([
            'jobCards' => function ($query) {
                $query->where('status', 'ACTIVE')
                      ->with([
                          'workOrder' => function ($q) {
                              $q->with(['fgItem', 'salesOrder']);
                          }
                      ]);
            }
        ])->orderBy('code', 'asc')->get();
        
        $mapped = $workstations->map(function ($ws) {
            return [
                'id' => $ws->id,
                'code' => $ws->code,
                'name' => $ws->name,
                'hourlyRate' => (float) $ws->hourly_rate,
                'status' => $ws->status,
                'createdAt' => $ws->created_at,
                'updatedAt' => $ws->updated_at,
                // Nested mapping to match Prisma output exactly
                'jobCards' => $ws->jobCards->map(function ($jc) {
                    return [
                        'id' => $jc->id,
                        'workOrderId' => $jc->work_order_id,
                        'workstationId' => $jc->workstation_id,
                        'assignedUserId' => $jc->assigned_user_id,
                        'dieId' => $jc->die_id,
                        'status' => $jc->status,
                        'goodQty' => (float) $jc->good_qty,
                        'scrapQty' => (float) $jc->scrap_qty,
                        'startedAt' => $jc->started_at,
                        'completedAt' => $jc->completed_at,
                        'workOrder' => $jc->workOrder ? [
                            'id' => $jc->workOrder->id,
                            'workOrderNumber' => $jc->workOrder->work_order_number,
                            'salesOrderId' => $jc->workOrder->sales_order_id,
                            'fgItemId' => $jc->workOrder->fg_item_id,
                            'plannedQty' => (float) $jc->workOrder->planned_qty,
                            'producedQty' => (float) $jc->workOrder->produced_qty,
                            'status' => $jc->workOrder->status,
                            'fgBatchNumber' => $jc->workOrder->fg_batch_number,
                            'startDate' => $jc->workOrder->start_date,
                            'endDate' => $jc->workOrder->end_date,
                            'fgItem' => $jc->workOrder->fgItem ? [
                                'id' => $jc->workOrder->fgItem->id,
                                'code' => $jc->workOrder->fgItem->code,
                                'name' => $jc->workOrder->fgItem->name,
                                'category' => $jc->workOrder->fgItem->category,
                                'uom' => $jc->workOrder->fgItem->uom,
                            ] : null,
                            'salesOrder' => $jc->workOrder->salesOrder ? [
                                'id' => $jc->workOrder->salesOrder->id,
                                'orderNumber' => $jc->workOrder->salesOrder->order_number,
                                'customerName' => $jc->workOrder->salesOrder->customer_name,
                            ] : null,
                        ] : null,
                    ];
                }),
            ];
        });

        return response()->json($mapped);
    }
}
