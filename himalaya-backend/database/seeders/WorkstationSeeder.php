<?php

namespace Database\Seeders;

use App\Models\Workstation;
use Illuminate\Database\Seeder;

class WorkstationSeeder extends Seeder
{
    public function run(): void
    {
        Workstation::create([
            'code' => 'LINE-01',
            'name' => 'Extrusion Line 01',
            'hourly_rate' => 650.0,
            'status' => 'RUNNING',
        ]);

        Workstation::create([
            'code' => 'LINE-02',
            'name' => 'Extrusion Line 02',
            'hourly_rate' => 850.0,
            'status' => 'IDLE',
        ]);

        Workstation::create([
            'code' => 'LINE-03',
            'name' => 'Extrusion Line 03',
            'hourly_rate' => 700.0,
            'status' => 'IDLE',
        ]);
        
        Workstation::create([
            'code' => 'LINE-04',
            'name' => 'Extrusion Line 04',
            'hourly_rate' => 900.0,
            'status' => 'IDLE',
        ]);
        
        Workstation::create([
            'code' => 'LINE-05',
            'name' => 'Extrusion Line 05',
            'hourly_rate' => 800.0,
            'status' => 'IDLE',
        ]);
        
        Workstation::create([
            'code' => 'LINE-06',
            'name' => 'Extrusion Line 06',
            'hourly_rate' => 600.0,
            'status' => 'IDLE',
        ]);
    }
}
