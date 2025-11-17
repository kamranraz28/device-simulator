<?php

namespace App\Http\Controllers;

use App\Models\Preset;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PresetController extends Controller
{
    public function index()
    {
        return Inertia::render('DeviceSimulator', [
            'presets' => Preset::orderByDesc('id')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'device' => 'required|string|in:Fan,Light',
            'settings' => 'required|array',
        ]);

        $preset = Preset::create($validated);

        return redirect()->back()->with('success', 'Preset saved!');
    }
}
