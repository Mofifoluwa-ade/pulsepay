'use client';

import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import SendForm from '../../components/SendForm';

export default function SendUSDC() {
  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto py-4">
        <SendForm />
      </div>
    </DashboardLayout>
  );
}
