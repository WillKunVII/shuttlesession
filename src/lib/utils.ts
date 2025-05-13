
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Gets a value from localStorage with type checking and default value
 */
export function getStorageValue<T>(key: string, defaultValue: T): T {
  const storedValue = localStorage.getItem(key);
  if (!storedValue) return defaultValue;
  
  try {
    return JSON.parse(storedValue) as T;
  } catch (e) {
    // For string values that don't need parsing
    if (typeof defaultValue === 'string') {
      return storedValue as unknown as T;
    }
    // For boolean values stored as strings
    if (typeof defaultValue === 'boolean') {
      return (storedValue === 'true') as unknown as T;
    }
    // For number values stored as strings
    if (typeof defaultValue === 'number') {
      return Number(storedValue) as unknown as T;
    }
    return defaultValue;
  }
}

/**
 * Sets a value in localStorage with JSON stringification
 */
export function setStorageValue<T>(key: string, value: T): void {
  if (typeof value === 'object') {
    localStorage.setItem(key, JSON.stringify(value));
  } else {
    localStorage.setItem(key, String(value));
  }
}
