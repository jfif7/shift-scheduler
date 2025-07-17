import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  defaultValue?: number
  id?: string
  className?: string
  placeholder?: string
}

export const NumberInput = ({
  value,
  onChange,
  min = 0,
  max = 100,
  defaultValue = min,
  id,
  className,
  placeholder,
}: NumberInputProps) => {
  const [inputValue, setInputValue] = useState(value.toString())

  // Sync with external value changes
  useEffect(() => {
    setInputValue(value.toString())
  }, [value])

  const handleBlur = () => {
    const parsed = Number.parseInt(inputValue) || defaultValue
    const clamped = Math.max(min, Math.min(max, parsed))
    setInputValue(clamped.toString())

    if (clamped !== value) {
      onChange(clamped)
    }
  }

  return (
    <Input
      id={id}
      type="number"
      min={min}
      max={max}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={handleBlur}
      className={className}
      placeholder={placeholder}
    />
  )
}
