import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/types/task";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Clock, TrendingUp, Award } from "lucide-react";

interface PersonTimeCardProps {
  user: User;
  todayHours: number;
  taskTimeData: {
    taskName: string;
    hours: number;
    percentage: number;
  }[];
  priorityTimeData: {
    name: string;
    value: number;
    color: string;
  }[];
  weeklyTrend: {
    day: string;
    hours: number;
  }[];
}

const COLORS = {
  revenue: '#F59E0B',  // 金色
  traffic: '#3B82F6',  // 藍色
  admin: '#6B7280',    // 灰色
};

export function PersonTimeCard({
  user,
  todayHours,
  taskTimeData,
  priorityTimeData,
  weeklyTrend,
}: PersonTimeCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{user.avatar}</div>
          <div>
            <CardTitle className="text-lg">{user.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.department} · {user.role}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* 今日投入時間 */}
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <Clock className="w-8 h-8 text-blue-600" />
          <div>
            <div className="text-2xl font-bold text-blue-600">{todayHours}h</div>
            <div className="text-sm text-muted-foreground">今日投入時間</div>
          </div>
        </div>

        {/* 今日任務時間佔比 TOP 3 */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            今日任務時間佔比 TOP 3
          </h4>
          <div className="space-y-2">
            {taskTimeData.slice(0, 3).map((task, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">
                    {index + 1}. {task.taskName}
                  </span>
                  <span className="text-muted-foreground">
                    {task.hours}h ({task.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                    style={{ width: `${task.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 任務分級時間佔比 - 圓餅圖 */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" />
            任務分級時間佔比
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={priorityTimeData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {priorityTimeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${value}h`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-sm">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 本週時間趨勢 - 迷你長條圖 */}
        <div>
          <h4 className="font-semibold mb-3">本週時間趨勢</h4>
          <div className="space-y-2">
            {weeklyTrend.map((day, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground w-6">
                  {day.day}
                </span>
                <div className="flex-1 bg-slate-200 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all"
                    style={{ width: `${(day.hours / 10) * 100}%` }}
                  >
                    <span className="text-xs font-bold text-white">
                      {day.hours}h
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
