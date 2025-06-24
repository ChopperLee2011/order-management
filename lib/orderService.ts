import {
  setInterval,
  setTimeout,
} from 'node:timers';

/**
 * NOTE: This is an in-memory store.
 * The state will be reset when the server restarts.
 * This is suitable for a demo, but not for production.
 * In a serverless environment (like Vercel), each API call could potentially
 * be a separate instance, so this singleton pattern won't reliably hold state
 * across different API calls without further configuration.
 */

// --- Data Structures ---
export interface Order {
  id: number;
  type: 'NORMAL' | 'VIP';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETE';
  createdAt: number;
  botId?: number;
}

export interface Bot {
  id: number;
  status: 'IDLE' | 'PROCESSING';
  orderId: number | null;
}

// --- In-Memory State ---
const orders: Order[] = [];
let bots: Bot[] = [{ id: 1, status: 'IDLE', orderId: null }];
let nextOrderId = 1;
const PROCESSING_TIME_MS = 10000; // 10 seconds

// --- Core Processing Loop ---

/**
 * Finds the next order to be processed based on priority.
 * VIP orders are always prioritized over normal orders.
 * Within the same type, the earliest order is chosen.
 */
function findOrderToProcess(): Order | undefined {
  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const vipOrder = pendingOrders
    .filter((o) => o.type === 'VIP')
    .sort((a, b) => a.createdAt - b.createdAt)[0];

  if (vipOrder) {
    return vipOrder;
  }

  const normalOrder = pendingOrders
    .filter((o) => o.type === 'NORMAL')
    .sort((a, b) => a.createdAt - b.createdAt)[0];

  return normalOrder;
}

/**
 * This function is the main "game loop". It runs periodically to assign
 * pending orders to idle bots.
 */
function assignOrdersToBots() {
  const idleBots = bots.filter((b) => b.status === 'IDLE');

  for (const bot of idleBots) {
    const orderToProcess = findOrderToProcess();

    if (orderToProcess) {
      // Assign order to the bot
      bot.status = 'PROCESSING';
      bot.orderId = orderToProcess.id;
      orderToProcess.status = 'PROCESSING';
      orderToProcess.botId = bot.id;

      // Simulate the 10-second processing time
      setTimeout(() => {
        // Find the original bot and order to ensure they still exist
        const currentBot = bots.find(b => b.id === bot.id);
        const completedOrder = orders.find(o => o.id === orderToProcess.id);

        // If the bot hasn't been removed and the order still exists
        if (currentBot && currentBot.status === 'PROCESSING' && completedOrder) {
            completedOrder.status = 'COMPLETE';
            completedOrder.botId = undefined;
            
            // Free up the bot
            currentBot.status = 'IDLE';
            currentBot.orderId = null;
            
            // Check if there are more orders to process
            assignOrdersToBots();
        }
      }, PROCESSING_TIME_MS);
    }
  }
}

// Start the processing loop
setInterval(assignOrdersToBots, 1000); // Check for new assignments every second

// --- Public Service Functions ---

export const getSystemState = () => {
  return {
    orders: JSON.parse(JSON.stringify(orders)),
    bots: JSON.parse(JSON.stringify(bots)),
  };
};

export const addOrder = (type: 'NORMAL' | 'VIP'): Order => {
  const newOrder: Order = {
    id: nextOrderId++,
    type,
    status: 'PENDING',
    createdAt: Date.now(),
  };
  orders.push(newOrder);
  assignOrdersToBots(); // Immediately try to assign the new order
  return newOrder;
};

export const setBotCount = (count: number) => {
  const currentCount = bots.length;
  const targetCount = Math.max(0, count); // Ensure count is not negative

  if (targetCount > currentCount) {
    // Increase bots
    for (let i = 0; i < targetCount - currentCount; i++) {
      const newBotId = bots.length > 0 ? Math.max(...bots.map(b => b.id)) + 1 : 1;
      bots.push({ id: newBotId, status: 'IDLE', orderId: null });
    }
    assignOrdersToBots(); // New bots can start working immediately
  } else if (targetCount < currentCount) {
    // Decrease bots
    const diff = currentCount - targetCount;
    const idleBotsToRemove = bots.filter((b) => b.status === 'IDLE').slice(0, diff);
    let removedIds = idleBotsToRemove.map((b) => b.id);

    if (removedIds.length < diff) {
      // If we still need to remove more, target busy bots
      const busyBotsToRemove = bots
        .filter((b) => b.status === 'PROCESSING' && !removedIds.includes(b.id))
        .slice(0, diff - removedIds.length);
      
      for(const botToRemove of busyBotsToRemove) {
        const orderToRequeue = orders.find(o => o.id === botToRemove.orderId);
        if(orderToRequeue) {
          orderToRequeue.status = 'PENDING';
          orderToRequeue.botId = undefined;
        }
      }
      removedIds = [...removedIds, ...busyBotsToRemove.map(b => b.id)];
    }
    
    bots = bots.filter((b) => !removedIds.includes(b.id));
  }
  return getSystemState().bots;
}; 