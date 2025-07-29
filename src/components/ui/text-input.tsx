import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  defaultValue?: string
  id?: string
  className?: string
  placeholder?: string
  type?: "text" | "email" | "password" | "url"
  maxLength?: number
  minLength?: number
}

export const TextInput = ({
  value,
  onChange,
  defaultValue = "",
  id,
  className,
  placeholder,
  type = "text",
  maxLength,
  minLength,
}: TextInputProps) => {
  const [inputValue, setInputValue] = useState(value)

  // Sync with external value changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleBlur = () => {
    let finalValue = inputValue.trim()
    
    // Apply length constraints
    if (maxLength && finalValue.length > maxLength) {
      finalValue = finalValue.substring(0, maxLength)
    }
    
    // Use default value if empty and minLength > 0
    if (minLength && finalValue.length < minLength && finalValue.length === 0) {
      finalValue = defaultValue
    }
    
    setInputValue(finalValue)

    if (finalValue !== value) {
      onChange(finalValue)
    }
  }

  return (
    <Input
      id={id}
      type={type}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={handleBlur}
      className={className}
      placeholder={placeholder}
      maxLength={maxLength}
    />
  )
}
