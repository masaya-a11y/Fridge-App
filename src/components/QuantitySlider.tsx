interface Props {
  value: number
  min?: number
  max?: number
  step?: number
  unit: string
  onChange: (value: number) => void
}

export function QuantitySlider({ value, min = 0, max = 1000, step = 1, unit, onChange }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-9 h-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 font-bold text-lg transition-colors flex items-center justify-center"
        >
          −
        </button>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={e => onChange(Number(e.target.value))}
          className="w-24 text-center border-2 border-gray-200 rounded-xl py-1.5 font-semibold text-gray-700 focus:outline-none focus:border-sky-400"
        />
        <span className="text-sm text-gray-500">{unit}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          className="w-9 h-9 rounded-xl bg-green-50 text-green-500 hover:bg-green-100 font-bold text-lg transition-colors flex items-center justify-center"
        >
          ＋
        </button>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-sky-500"
      />
    </div>
  )
}
