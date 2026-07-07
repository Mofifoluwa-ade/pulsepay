'use client';

import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import HistoryList from '../../components/HistoryList';

export default function TransactionHistory() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#F5F5F5] tracking-tight">System Registry Audit</h1>
          <p className="text-xs text-[#b7b5b4] font-mono">Real-time log of settlements settled via EIP-7702 Universal Accounts.</p>
        </div>

        <HistoryList />
      </div>
    </DashboardLayout>
  );
}
