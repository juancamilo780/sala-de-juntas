import React from 'react'
import { useToastStore } from '../ui/toastStore.js'

export function Toast() {
  const { message, type } = useToastStore()

  if (!message) return null

  return (
    <div className={`toast toast-${type}`}>
      {message}
    </div>
  )
}