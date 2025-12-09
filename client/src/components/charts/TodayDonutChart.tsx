/**
 * 甜甜圈圖 - 今日時間投入概況
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TimeStatsByPriority } from '@/types/timeTracking';

interface TodayDonutChartProps {
  data: TimeStatsByPriority[];
}

export default function TodayDonutChart({ data }: TodayDonutChartProps) {
  // 計算總時間
  const totalHours = data.reduce((sum, item) => sum + item.totalHours, 0);

  // 過濾掉時間為0的項目
  const chartData = data
    .filter((item) => item.totalMinutes > 0)
    .map((item) => ({
      name: item.label,
      value: item.totalHours,
      percentage: item.percentage,
      color: item.color,
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>今日時間投入</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <div className="text-4xl font-bold text-muted-foreground">0h</div>
          <div className="text-sm text-muted-foreground mt-2">尚未開始任務</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>今日時間投入</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `${value}h`}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* 中心文字 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="text-4xl font-bold text-foreground">{totalHours}h</div>
          <div className="text-sm text-muted-foreground mt-1">總投入時間</div>
        </div>

        {/* 圖例 */}
        <div className="flex justify-center gap-6 mt-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">
                {item.name}: {item.value}h
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
