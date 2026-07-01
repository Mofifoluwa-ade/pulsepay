'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import type { AppContextValue, AppScreen, User, SendPayload, Transaction } from '@/types'
import { MOCK_TRANSACTIONS, MOCK_BALANCE } from '@/lib/mockData'

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('login')
  const [pendingSend, setPendingSend] = useState<SendPayload | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS)
  const [balance] = useState<number>(MOCK_BALANCE)

  const navigateTo = useCallback((screen: AppScreen) => {
    setCurrentScreen(screen)
  }, [])

  const addTransaction = useCallback((tx: Transaction) => {
    setTransactions(prev => [tx, ...prev])
  }, [])

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        balance,
        transactions,
        currentScreen,
        navigateTo,
        pendingSend,
        setPendingSend,
        // @ts-expect-error — extended context
        addTransaction,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
