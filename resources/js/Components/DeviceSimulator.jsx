import React, { useState } from "react";
import {
  Power,
  Fan,
  Lightbulb,
  Save,
  Sun,
  Moon,
} from "lucide-react";
import { usePage, useForm } from "@inertiajs/react";

// ---------------------------------
// FIXED: Fan Blade Component for Visualization (4 Blades, Center Fixed)
// ---------------------------------
const FanBlade = ({ fanSpeed, isOn }) => {
  // Determine rotation speed: faster for higher speed, slower for lower speed
  const animationDuration = isOn && fanSpeed > 0
    ? `${1000 - (fanSpeed * 9)}ms`
    : "1s";

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Outer container */}
      <div className="relative w-32 h-32 flex items-center justify-center">

        {/* Blades Container - This element rotates everything *except* the fixed center hub */}
        <div
          className="absolute inset-0 transition-transform duration-300 ease-linear"
          style={{
            transformOrigin: 'center center',
            animation: isOn && fanSpeed > 0
              ? `spin ${animationDuration} linear infinite`
              : 'none',
            opacity: isOn ? 1 : 0.4,
          }}
        >
          {/* Individual Blades - positioned relative to the center (0,0 of the spinning container) */}
          {[0, 90, 180, 270].map(angle => (
            <div
              key={angle}
              className="absolute w-6 h-16 bg-gray-600 rounded-full shadow-lg"
              style={{
                // Initial placement
                top: '50%',
                left: '50%',
                // Transform sequence: Center, Rotate, Move Out
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-30px)`,
                transformOrigin: 'center center',
                opacity: 0.9,
              }}
            ></div>
          ))}
        </div>

        {/* Central Hub - This element is absolute and does NOT spin */}
        <div className="absolute w-10 h-10 bg-gray-700 rounded-full z-20 border border-gray-600 shadow-lg flex items-center justify-center">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
        </div>
      </div>
    </>
  );
};


// ---------------------------------
// Lightbulb Visual Component (Matches image style)
// ---------------------------------
const LightbulbVisual = ({ isOn, intensity, color }) => {
  if (!isOn || intensity === 0) {
    return (
      <div className="w-40 h-40 flex items-center justify-center">
        <Lightbulb className="w-12 h-12 text-gray-700" />
      </div>
    );
  }

  // Calculate opacity and glow intensity
  const opacity = 0.3 + (intensity / 100) * 0.7; // Base opacity 0.3, max 1.0
  const glow = 10 + intensity * 0.8; // Base glow 10px

  return (
    <div className="flex flex-col items-center">
      {/* Socket */}
      <div className="w-12 h-4 bg-gray-600 rounded-t-lg"></div>

      {/* Bulb */}
      <div
        className="w-20 h-32 rounded-full border-2 border-transparent transition-all duration-300 relative"
        style={{
          backgroundColor: color,
          opacity: opacity,
          boxShadow: `0 0 ${glow}px ${glow * 0.5}px ${color}`,
          marginTop: '-4px', // Overlap with socket
        }}
      >
        {/* Center line for design (like in the image) */}
        <div
          className="absolute w-1 h-16 rounded-full"
          style={{
            backgroundColor: intensity > 50 ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)",
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        ></div>
      </div>
    </div>
  );
};


// ---------------------------------
// Color Presets for Light Controller
// ---------------------------------
const COLOR_PRESETS = [
    { hex: "#FFECD9", name: "Warm White" },
    { hex: "#FFFFFF", name: "Daylight" },
    { hex: "#B0E0FF", name: "Cool Blue" },
    { hex: "#FFB0C0", name: "Rose" },
];

export default function DeviceSimulator() {
  // Always pull presets directly from DB (Inertia props)
  const { presets = [] } = usePage().props;

  const [deviceState, setDeviceState] = useState({
    activeDevice: "Fan",
    isOn: false,
    fanSpeed: 0,
    lightIntensity: 0,
    lightColor: COLOR_PRESETS[0].hex, // Default to first preset color
  });

  const { activeDevice, isOn, fanSpeed, lightIntensity, lightColor } =
    deviceState;
  const isFan = activeDevice === "Fan";

  // -------------------------------
  // Inertia Form
  // -------------------------------
  const form = useForm({
    name: "",
    device: "",
    settings: {},
  });

  // Update Device State
  const updateState = (key, value) => {
    setDeviceState((prev) => {
      let newState = { ...prev, [key]: value };

      // Logic to automatically turn on device
      if ((key === "fanSpeed" || key === "lightIntensity") && value > 0) {
        newState.isOn = true;
      }
      // Logic to automatically turn off device
      else if (
        (key === "fanSpeed" && value === 0 && prev.isOn && isFan) ||
        (key === "lightIntensity" && value === 0 && prev.isOn && !isFan)
      ) {
        newState.isOn = false;
      }

      return newState;
    });
  };

  // Toggle Power
  const togglePower = () => {
    setDeviceState((prev) => {
      const newIsOn = !prev.isOn;
      return {
        ...prev,
        isOn: newIsOn,
        // Reset settings to 0 if turning off
        fanSpeed: newIsOn ? prev.fanSpeed : 0,
        lightIntensity: newIsOn ? prev.lightIntensity : 0,
      };
    });
  };

  // Apply Preset
  const applyPreset = (preset) => {
    const settings = preset.settings || {};

    const newFanSpeed = settings.fanSpeed ?? 0;
    const newLightIntensity = settings.lightIntensity ?? 0;

    setDeviceState({
      activeDevice: preset.device,
      isOn: (preset.device === "Fan" && newFanSpeed > 0) || (preset.device === "Light" && newLightIntensity > 0),
      fanSpeed: newFanSpeed,
      lightIntensity: newLightIntensity,
      lightColor: settings.lightColor ?? COLOR_PRESETS[0].hex,
    });

    form.reset("name");
  };

  // SAVE PRESET
  const handleSave = (e) => {
    e.preventDefault();

    const name = form.data.name.trim();
    if (!name) {
      form.setError("name", "The preset name field is required.");
      return;
    }

    form.data.name = name;
    form.data.device = activeDevice;
    form.data.settings = isFan
      ? { fanSpeed }
      : { lightIntensity, lightColor };

    form.post("/presets", {
      preserveScroll: true,
      onSuccess: () => form.reset("name"),
    });
  };

  // Slider Component
  const ControlSlider = ({
    label,
    value,
    min = 0,
    max = 100,
    unit = "%",
    stateKey,
  }) => (
    <div className="space-y-2 p-4 bg-white/5 rounded-xl transition duration-300 hover:bg-white/10">
      <label className="text-sm font-medium text-gray-300 flex justify-between items-center">
        <span>{label}</span>
        <span className="text-lg font-mono text-indigo-400">
          {value}
          {unit}
        </span>
      </label>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => updateState(stateKey, parseInt(e.target.value))}
        disabled={!isOn}
        className={`w-full h-2 rounded-lg cursor-pointer ${
          isOn ? "bg-indigo-600" : "bg-gray-700 opacity-50"
        }`}
        style={{
          WebkitAppearance: "none",
          height: "8px",
          borderRadius: "4px",
        }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex justify-center items-start p-4 sm:p-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        {/* LEFT PANEL */}
        <div className="lg:col-span-2 bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700/50">
          <h1 className="text-3xl font-extrabold mb-6 text-indigo-400">
            Smart Home Sandbox
          </h1>

          {/* Device Switch */}
          <div className="flex space-x-4 mb-8 p-1 bg-gray-700 rounded-xl shadow-inner">
            <button
              onClick={() =>
                setDeviceState((p) => ({ ...p, activeDevice: "Fan" }))
              }
              className={`flex-1 flex items-center justify-center p-3 text-lg font-semibold rounded-lg transition-all duration-300 ${
                isFan
                  ? "bg-indigo-600 shadow-lg text-white"
                  : "text-gray-400 hover:bg-gray-600"
              }`}
            >
              <Fan className="w-5 h-5 mr-2" /> Fan Controller
            </button>

            <button
              onClick={() =>
                setDeviceState((p) => ({ ...p, activeDevice: "Light" }))
              }
              className={`flex-1 flex items-center justify-center p-3 text-lg font-semibold rounded-lg transition-all duration-300 ${
                !isFan
                  ? "bg-indigo-600 shadow-lg text-white"
                  : "text-gray-400 hover:bg-gray-600"
              }`}
            >
              <Lightbulb className="w-5 h-5 mr-2" /> Light Controller
            </button>
          </div>

          {/* Power Status */}
          <div
            className="flex items-center justify-between p-4 mb-8 rounded-xl border-2 border-dashed"
            style={{
              borderColor: isOn ? "rgba(99,102,241,0.5)" : "#4b5563",
            }}
          >
            <div className="flex items-center space-x-3">
              <span
                className={`w-3 h-3 rounded-full block ${
                  isOn ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              ></span>
              <span className="text-xl font-bold">
                Status: {isOn ? "Online" : "Offline"}
              </span>
            </div>

            <button
              onClick={togglePower}
              className={`p-3 rounded-full shadow-lg transition-all duration-300 transform active:scale-95 ${
                isOn
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <Power className="w-6 h-6" />
            </button>
          </div>

          {/* Device Settings */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-200 border-b border-gray-700 pb-2">
              {isFan ? "Fan Settings" : "Light Settings"}
            </h2>

            {isFan ? (
              <ControlSlider
                label="Rotation Speed"
                value={fanSpeed}
                stateKey="fanSpeed"
                unit=" RPM"
                max={100}
              />
            ) : (
              <div className="space-y-6">

                {/* Brightness Slider */}
                <ControlSlider
                  label="Brightness"
                  value={lightIntensity}
                  stateKey="lightIntensity"
                />

                {/* Color Presets (Matching Image Style) */}
                <div className="space-y-2 p-4 bg-white/5 rounded-xl">
                  <label className="text-sm font-medium text-gray-300 block mb-2">
                    Color Temperature
                  </label>
                  <div className="flex space-x-2">
                    {COLOR_PRESETS.map((p) => (
                      <button
                        key={p.hex}
                        onClick={() => updateState("lightColor", p.hex)}
                        disabled={!isOn}
                        className={`w-full h-10 rounded-lg transition-shadow duration-150 ${
                          lightColor === p.hex ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-gray-800" : ""
                        } ${!isOn ? "opacity-50" : "hover:shadow-md"}`}
                        style={{ backgroundColor: p.hex }}
                        title={p.name}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-2 flex justify-between">
                    Current Hex: <span className="font-mono text-gray-400">{lightColor}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Visualization */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-gray-200">
              Live Visualization
            </h2>

            <div
              className="w-full h-56 rounded-lg flex items-center justify-center font-bold text-lg transition-all duration-500 relative overflow-hidden bg-gray-900"
            >
              {isFan ? (
                // Fan Visualization (using the improved FanBlade)
                <FanBlade fanSpeed={fanSpeed} isOn={isOn} />
              ) : (
                // Light Visualization (using LightbulbVisual)
                <LightbulbVisual
                  isOn={isOn}
                  intensity={lightIntensity}
                  color={lightColor}
                />
              )}

              {/* Status Overlay */}
              <div className="absolute bottom-2 text-sm text-gray-400 z-20">
                {isFan
                  ? `Fan: ${fanSpeed} RPM (${isOn && fanSpeed > 0 ? "Active" : "Idle"})`
                  : `Light: ${lightIntensity}% (${isOn && lightIntensity > 0 ? "Active" : "Idle"})`}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-1 space-y-8">
          {/* SAVE PRESET */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700/50">
            <h2 className="text-xl font-bold mb-4 flex items-center text-indigo-300">
              <Save className="w-5 h-5 mr-2" />
              Save Current State
            </h2>

            <form onSubmit={handleSave} className="space-y-3">
              <input
                type="text"
                placeholder={`Name for ${activeDevice} Preset...`}
                value={form.data.name}
                onChange={(e) => form.setData("name", e.target.value)}
                className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />

              {form.errors.name && (
                <p className="text-red-400 text-xs mb-1">
                  {form.errors.name}
                </p>
              )}

              <button
                type="submit"
                disabled={!form.data.name.trim() || form.processing}
                className="w-full p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {form.processing ? "Saving..." : `Save ${activeDevice} Preset`}
              </button>
            </form>
          </div>

          {/* PRESETS LIST */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700/50">
            <h2 className="text-xl font-bold mb-4 text-indigo-300">
              Applied Presets ({presets.length})
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {presets.length > 0 ? (
                presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="w-full text-left p-3 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors duration-150 flex items-center justify-between"
                  >
                    <span className="font-medium truncate">
                      {preset.name}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                        preset.device === "Fan"
                          ? "bg-blue-900/50 text-blue-300"
                          : "bg-yellow-900/50 text-yellow-300"
                      }`}
                    >
                      {preset.device}
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-gray-500 text-sm italic">
                  No presets saved yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
