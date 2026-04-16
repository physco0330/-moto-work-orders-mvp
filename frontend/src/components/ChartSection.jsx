import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

function ChartSection({ data, total }) {
  return (
    <div className="chart-section-new">
      <div className="chart-header">
        <div>
          <h3>Tendencia de servicios</h3>
          <p>Servicios realizados en los últimos 7 días</p>
        </div>
        <span className="chart-total">{total} total</span>
      </div>
      <div className="chart-container-new">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickCount={5}
            />
            <Tooltip 
              contentStyle={{ 
                background: '#fff', 
                border: '1px solid #e2e8f0', 
                borderRadius: 8,
                fontSize: 13
              }}
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#2563eb" 
              strokeWidth={3}
              dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#2563eb' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ChartSection;