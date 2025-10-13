import React, { useEffect, useState, useRef } from "react";
import type { EnhancementState } from "../types";
import { Undo2, Redo2 } from "lucide-react";

export default function EnhancementTools({
  value,
  onChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: {
  value?: EnhancementState;
  onChange: (v: EnhancementState) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}) {
  if (!value) {
    return (
      <div className="text-xs text-slate-400 italic px-2 py-1">
        Enhancement settings not loaded.
      </div>
    );
  }

  const [local, setLocal] = useState<EnhancementState>(value);
  const isDragging = useRef(false);

  useEffect(() => {
    if (!isDragging.current) setLocal(value);
  }, [value]);

  const update = (key: keyof EnhancementState, val: number) => {
    const newState = { ...local, [key]: val };
    setLocal(newState);
    onChange(newState);
  };

  const startDrag = () => (isDragging.current = true);
  const stopDrag = () => (isDragging.current = false);

  const Control = ({
    label,
    min,
    max,
    step = 1,
    val,
    keyName,
  }: {
    label: string;
    min: number;
    max: number;
    step?: number;
    val: number;
    keyName: keyof EnhancementState;
  }) => (
    <div className="flex items-center justify-between gap-3 py-[2px]">
      {/* Label */}
      <label
        title={label}
        className="w-[70px] text-xs text-slate-400 text-left truncate select-none"
      >
        {label.length > 8 ? label.slice(0, 7) + "." : label}
      </label>

      {/* Slider */}
      <div className="flex-1 relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={val}
          onPointerDown={startDrag}
          onPointerUp={stopDrag}
          onPointerMove={(e) => {
            if (isDragging.current)
              update(keyName, Number((e.target as HTMLInputElement).value));
          }}
          onChange={(e) => update(keyName, Number(e.target.value))}
          className="
            flex-1 appearance-none h-[4px] bg-slate-700 rounded-full
            accent-teal-400 cursor-pointer
          "
        />
      </div>

      {/* Numeric Input */}
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={val}
        onChange={(e) => update(keyName, Number(e.target.value))}
        className="
          w-[36px] h-[20px]
          bg-slate-800 text-slate-200 text-[10px] text-center
          border border-slate-700 rounded
          focus:outline-none focus:ring-1 focus:ring-teal-500
        "
      />
    </div>
  );

  return (
    <div className="p-3 bg-slate-900/60 rounded-md border border-slate-800">
      {/* Undo / Redo */}
      <div className="flex justify-end items-center gap-2 mb-3">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-[3px] rounded-md hover:bg-slate-700 disabled:opacity-30"
        >
          <Undo2 size={13} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-[3px] rounded-md hover:bg-slate-700 disabled:opacity-30"
        >
          <Redo2 size={13} />
        </button>
      </div>

      {/* All controls */}
      <Control label="Brightn." min={-100} max={100} val={local.brightness} keyName="brightness" />
      <Control label="Contrast" min={-100} max={100} val={local.contrast} keyName="contrast" />
      <Control label="Gamma" min={0.1} max={3} step={0.05} val={local.gamma} keyName="gamma" />
      <Control label="Sharpen" min={0} max={100} val={local.sharpen} keyName="sharpen" />
      <Control label="Clarity" min={0} max={100} val={local.clarity} keyName="clarity" />
      <Control label="Denoise" min={0} max={100} val={local.denoise} keyName="denoise" />
      <Control label="Scale" min={1} max={4} step={0.1} val={local.scale} keyName="scale" />
      <Control label="Saturate" min={-100} max={100} val={local.saturation} keyName="saturation" />
      <Control label="Temp." min={-100} max={100} val={local.temperature} keyName="temperature" />
      <Control label="Tint" min={-100} max={100} val={local.tint} keyName="tint" />
    </div>
  );
}