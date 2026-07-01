'use client'

import { AppProvider, useApp } from '@/context/AppContext'
import { LoginScreen } from '@/components/screens/LoginScreen'
import { DashboardScreen } from '@/components/screens/DashboardScreen'
import { SendScreen } from '@/components/screens/SendScreen'
import { ConfirmScreen } from '@/components/screens/ConfirmScreen'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { useEffect, useRef, useState } from 'react'

export default function Home() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  )
}

function App() {
  const { currentScreen } = useApp()
  const { toast, showToast } = useToast()
  const [displayScreen, setDisplayScreen] = useState(currentScreen)
  const [animating, setAnimating] = useState(false)
  const prevScreen = useRef(currentScreen)

  useEffect(() => {
    if (currentScreen === prevScreen.current) return
    setAnimating(true)
    const t = setTimeout(() => {
      setDisplayScreen(currentScreen)
      prevScreen.current = currentScreen
      setAnimating(false)
    }, 180)
    return () => clearTimeout(t)
  }, [currentScreen])

  const screenMap = {
    login: <LoginScreen />,
    dashboard: <DashboardScreen />,
    send: <SendScreen />,
    confirm: <ConfirmScreen />,
  }

  return (
    <div className="app-shell">
      <div className="phone-shell">
        <div className="notch" aria-hidden="true" />
        <div
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? 'translateY(10px)' : 'translateY(0)',
            transition: 'opacity 0.18s ease, transform 0.18s ease',
            height: '100%',
          }}
        >
          {screenMap[displayScreen]}
        </div>
      </div>
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  )
}
