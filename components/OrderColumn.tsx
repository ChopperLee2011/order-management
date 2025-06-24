import { Order } from "@/lib/orderService";
import { Bot } from "lucide-react";

interface OrderColumnProps {
    title: string;
    orders: Order[];
    bgColor: string;
    textColor: string;
  }
  
  const OrderCard = ({ order }: { order: Order }) => (
    <div className={`p-3 mb-3 rounded-lg shadow-md border-l-4 ${order.type === 'VIP' ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300 bg-white'}`}>
      <div className="flex justify-between items-center">
        <span className="font-bold text-lg">Order #{order.id}</span>
        {order.type === 'VIP' && <span className="text-xs font-bold text-yellow-600 bg-yellow-200 px-2 py-1 rounded-full">VIP</span>}
      </div>
      <div className="text-sm text-gray-600 mt-1">
        Status: <span className="font-medium">{order.status}</span>
        {order.status === 'PROCESSING' && order.botId && (
          <div className="flex items-center text-blue-600">
            <Bot className="w-4 h-4 mr-1"/>
            <span>Processing by Bot {order.botId}</span>
          </div>
        )}
      </div>
    </div>
  );
  
  export const OrderColumn: React.FC<OrderColumnProps> = ({ title, orders, bgColor, textColor }) => {
    return (
      <div className="flex-1 p-4 bg-gray-100 rounded-xl">
        <h2 className={`text-2xl font-bold mb-4 text-center ${textColor} ${bgColor} rounded-t-lg py-2`}>{title} ({orders.length})</h2>
        <div className="p-2 h-[60vh] overflow-y-auto">
          {orders.length > 0 ? (
            orders.map(order => <OrderCard key={order.id} order={order} />)
          ) : (
            <div className="text-center text-gray-500 mt-10">No orders</div>
          )}
        </div>
      </div>
    );
  }; 