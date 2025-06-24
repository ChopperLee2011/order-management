"use client";

import { useEffect, useState } from 'react';
import { Bot, Order } from '@/lib/orderService';
import { OrderColumn } from './OrderColumn';
import { PlusCircle, MinusCircle, User, Star } from 'lucide-react';

interface SystemState {
  orders: Order[];
  bots: Bot[];
}

// A custom hook for polling data
const usePolling = (url: string, interval: number) => {
  const [data, setData] = useState<SystemState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        setData(json);
      } catch (e: any) {
        setError(e.message);
      }
    };

    fetchData(); // Fetch immediately on mount
    const pollingInterval = setInterval(fetchData, interval);

    return () => clearInterval(pollingInterval);
  }, [url, interval]);

  return { data, error };
};


export const OrderSystem = () => {
  const { data: state, error } = usePolling('/api/state', 2000); // Poll every 2 seconds
  const [isSubmitting, setIsSubmitting] = useState(false);

  const orders: Order[] = state?.orders ?? [];
  const bots: Bot[] = state?.bots ?? [];
  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const processingOrders = orders.filter(o => o.status === 'PROCESSING');
  const completedOrders = orders.filter(o => o.status === 'COMPLETE');

  const handleAddOrder = async (type: 'NORMAL' | 'VIP') => {
    setIsSubmitting(true);
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });
    setIsSubmitting(false);
  };

  const handleSetBotCount = async (count: number) => {
    if (count < 0) return;
    await fetch('/api/bots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count }),
    });
  };
  
  const botCount = bots.length;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 tracking-tight">
          McDonald&apos;s Order System
        </h1>
        <p className="text-center text-gray-500 mt-2">A Real-Time Order Processing Simulation</p>
      </header>
      
      {/* --- Control Panels --- */}
      <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
        {/* Manager Panel */}
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <h2 className="text-xl font-bold text-gray-700 mb-4 text-center">Manager Panel</h2>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => handleSetBotCount(botCount - 1)}
              className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition disabled:opacity-50"
              disabled={botCount <= 0}
            >
              <MinusCircle />
            </button>
            <div className="text-center">
                <p className="text-4xl font-bold text-blue-600">{botCount}</p>
                <p className="text-sm text-gray-500">Cooking Bot(s)</p>
            </div>
            <button
              onClick={() => handleSetBotCount(botCount + 1)}
              className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
            >
              <PlusCircle />
            </button>
          </div>
        </div>

        {/* Customer Panel */}
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <h2 className="text-xl font-bold text-gray-700 mb-4 text-center">Customer Panel</h2>
          <div className="flex justify-around">
            <button
              onClick={() => handleAddOrder('NORMAL')}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition disabled:bg-blue-300"
            >
              <User />
              <span>New Normal Order</span>
            </button>
            <button
              onClick={() => handleAddOrder('VIP')}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition disabled:bg-yellow-300"
            >
              <Star />
              <span>New VIP Order</span>
            </button>
          </div>
        </div>
      </div>
      
      {error && <div className="text-center text-red-500">Error fetching state: {error}</div>}
      
      {/* --- Order Columns --- */}
      <main className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        <OrderColumn title="Pending" orders={pendingOrders} bgColor="bg-gray-200" textColor="text-gray-800"/>
        <OrderColumn title="Processing" orders={processingOrders} bgColor="bg-blue-200" textColor="text-blue-800"/>
        <OrderColumn title="Complete" orders={completedOrders} bgColor="bg-green-200" textColor="text-green-800"/>
      </main>

      <footer className="text-center mt-12 text-gray-400 text-sm">
        <p>This is a simulation. State is not persisted.</p>
      </footer>
    </div>
  );
}; 