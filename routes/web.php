<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\PresetController;

Route::get('/', [PresetController::class, 'index'])->name('simulator');
Route::post('/presets', [PresetController::class, 'store'])->name('presets.store');
