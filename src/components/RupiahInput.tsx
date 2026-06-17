import { useState, useEffect } from 'react'

interface RupiahInputProps {
  value: number
  onChange: (value: number) => void
  placeholder?: string
  className?: string
  min?: number
}

function formatRupiah(num: number): string {
  return num.toLocaleString('id-ID')
}

function parseRupiah(str: string): number {
  return Number(str.replace(/\./g, '').replace(/[^0-9]/g, '')) || 0
}

export default function RupiahInput({ value, onChange, placeholder, className, min = 0 }: RupiahInputProps) {
  const [display, setDisplay] = useState('')

  useEffect(() => {
    if (document.activeElement?.id !== `rupiah-${placeholder}`) {
      setDisplay(value ? formatRupiah(value) : '')
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '')
    const num = Number(raw) || 0
    setDisplay(raw ? formatRupiah(num) : '')
    onChange(Math.max(min, num))
  }

  const handleBlur = () => {
    setDisplay(value ? formatRupiah(value) : '')
  }

  const handleFocus = () => {
    setDisplay(value ? formatRupiah(value) : '')
  }

  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">Rp</span>
      <input
        id={`rupiah-${placeholder}`}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder || '0'}
        className={`w-full bg-gray-800 border border-gray-700 rounded-lg pl-12 pr-4 py-2.5 text-white focus:border-amber-400 focus:outline-none ${className || ''}`}
      />
    </div>
  )
}
