'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { DashboardSnapshot } from '@/lib/types';

const COLORS = ['#004AAD', '#028E8A', '#22C0C7', '#FFD23F', '#16A34A'];

export function DashboardCharts({ data }: { data: DashboardSnapshot }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="card p-4 lg:col-span-2">
        <div className="mb-3">
          <h4 className="text-xs font-black">Hourly visitor flow vs capacity</h4>
          <p className="text-[10px] font-bold text-slate-500">ML forecast: car park full by 08:30 on weekends • 92% confidence</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.visitorTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="visitorFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#004AAD" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="#004AAD" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fontWeight: 800 }} />
              <YAxis tick={{ fontSize: 10, fontWeight: 800 }} />
              <Tooltip formatter={(value) => [`${String(value)} visitors`, 'Visitors']} />
              <Area type="monotone" dataKey="capacity" stroke="#94A3B8" strokeDasharray="5 5" fill="transparent" strokeWidth={2} />
              <Area type="monotone" dataKey="visitors" stroke="#004AAD" strokeWidth={3} fill="url(#visitorFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-4">
        <h4 className="text-xs font-black">Today&apos;s revenue mix</h4>
        <p className="mb-2 text-[10px] font-bold text-slate-500">RM {data.revenueTodayMyr.toLocaleString()} today • RM {data.forecastMonthMyr.toLocaleString()}/month forecast</p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.revenueMix} dataKey="value" nameKey="name" innerRadius={46} outerRadius={78} paddingAngle={3}>
                {data.revenueMix.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value) => `RM ${String(value)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1">
          {data.revenueMix.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between text-[10px] font-bold">
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ background: COLORS[index] }} />{item.name}</span>
              <span>RM {item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4 lg:col-span-3">
        <div className="mb-3">
          <h4 className="text-xs font-black">Weighted destination health index</h4>
          <p className="text-[10px] font-bold text-slate-500">Current score {data.healthIndex} / 5 • GOOD</p>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.healthScores} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 800 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 10, fontWeight: 800 }} />
              <Tooltip formatter={(value) => [`${String(value)}/5`, 'Score']} />
              <Bar dataKey="score" radius={[10, 10, 0, 0]}>
                {data.healthScores.map((entry, index) => <Cell key={entry.key} fill={index % 2 ? '#028E8A' : '#004AAD'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
