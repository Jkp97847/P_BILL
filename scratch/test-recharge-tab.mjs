import React from 'react';
import { renderToString } from 'react-dom/server';
import RechargeReportTab from '../src/recharge/components/tabs/RechargeReportTab.jsx';
import * as RechargeContextModule from '../src/recharge/context/RechargeContext.jsx';

// Mock useRecharge
const mockContext = {
  transactions: [
    {
      id: 'TXN-TEST-1',
      billDate: '2026-09-25',
      serviceType: 'electricity',
      operatorName: 'Jaipur Discom',
      consumerNo: '123456789',
      customerName: 'Ramesh',
      billAmount: 1000,
      conveFee: 5,
      totalAmount: 1005,
      subDivision: 'Jaipur',
      notes: ''
    }
  ],
  deleteTransaction: () => {},
  clearAllTransactions: () => {},
  printSlip: () => {}
};

RechargeContextModule.useRecharge = () => mockContext;

try {
  const html = renderToString(React.createElement(RechargeReportTab));
  console.log('RechargeReportTab rendered successfully!');
  console.log('HTML length:', html.length);
} catch (err) {
  console.error('Error rendering RechargeReportTab:', err);
  process.exit(1);
}
