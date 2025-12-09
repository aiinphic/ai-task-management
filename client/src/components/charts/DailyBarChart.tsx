/**
 * 長條圖 - 每日時間分布
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DailyTimeDistribution } from '@/types/timeTracking';

interface DailyBarChartProps {
  data: DailyTimeDistribution[];
}

export default function DailyBarChart({ data }: DailyBarChartProps) {
  // 轉換數據為小時單位
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }),
    一級營收: Math.round((item.revenue / 60) * 10) / 10,
    二級流量: Math.round((item.traffic / 60) * 10) / 10,
    三級行政: Math.round((item.admin / 60) * 10) / 10,
  }));

  if (chartData.every((item) => item.一級營收 === 0 && item.二級流量 === 0 && item.三級行政 === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>每日時間分布</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          尚無時間數據
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>每日時間分布</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              label={{ value: '時間 (小時)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip
              formatter={(value: number) => `${value}h`}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
              }}
            />
            <Legend />
            <Bar dataKey="一級營收" stackId="a" fill="#F59E0B" />
            <Bar dataKey="二級流量" stackId="a" fill="#3B82F6" />
            <Bar dataKey="三級行政" stackId="a" fill="#6B7280" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
