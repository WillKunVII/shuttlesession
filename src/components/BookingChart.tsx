
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data 
const data = [
  { name: 'Mon', bookings: 4 },
  { name: 'Tue', bookings: 3 },
  { name: 'Wed', bookings: 2 },
  { name: 'Thu', bookings: 6 },
  { name: 'Fri', bookings: 8 },
  { name: 'Sat', bookings: 10 },
  { name: 'Sun', bookings: 9 },
];

export function BookingChart() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Weekly Booking Activity</h3>
      <div className="h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4361EE" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4361EE" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              style={{ fontSize: 12 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              style={{ fontSize: 12 }} 
              tickCount={5} 
            />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="bookings" 
              stroke="#4361EE" 
              fillOpacity={1} 
              fill="url(#colorBookings)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
