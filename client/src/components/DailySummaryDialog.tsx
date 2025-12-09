import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import type { DailyTimeLog } from '@/utils/timeTracking';

interface DailySummaryDialogProps {
  open: boolean;
  onClose: () => void;
  todayLog: DailyTimeLog;
  completedTasksCount: number;
  efficiencyRating: string;
}

export function DailySummaryDialog({
  open,
  onClose,
  todayLog,
  completedTasksCount,
  efficiencyRating,
}: DailySummaryDialogProps) {
  // 計算各層級時間分布
  const levelDistribution = {
    level1: 0,
    level2: 0,
    level3: 0,
    daily: 0,
  };

  todayLog.sessions.forEach((session) => {
    const minutes = session.durationMinutes;
    switch (session.taskLevel) {
      case 1:
        levelDistribution.level1 += minutes;
        break;
      case 2:
        levelDistribution.level2 += minutes;
        break;
      case 3:
        levelDistribution.level3 += minutes;
        break;
      case 4:
        levelDistribution.daily += minutes;
        break;
    }
  });

  const totalMinutes = todayLog.usedMinutes;
  const totalHours = (totalMinutes / 60).toFixed(1);

  // 計算各層級佔比
  const getPercentage = (minutes: number) => {
    if (totalMinutes === 0) return 0;
    return ((minutes / totalMinutes) * 100).toFixed(0);
  };

  // 效率評分顏色
  const getRatingColor = () => {
    switch (efficiencyRating) {
      case 'S':
      case 'A':
        return 'text-green-600 bg-green-100';
      case 'B':
        return 'text-blue-600 bg-blue-100';
      case 'C':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">🎉 今日工作總結</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 總時長與完成任務數 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-600 font-semibold">總時長</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">{totalHours}h</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">完成任務</span>
              </div>
              <p className="text-2xl font-bold text-green-700">{completedTasksCount}</p>
            </div>
          </div>

          {/* 效率評分 */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-purple-700">效率評分</span>
              </div>
              <Badge className={`text-lg font-bold px-3 py-1 ${getRatingColor()}`}>
                {efficiencyRating}
              </Badge>
            </div>
          </div>

          {/* 各層級時間分布 */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">📊 層級時間分布</h3>
            <div className="space-y-2">
              {/* 1級|營收 */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold w-16 text-orange-700">1級|營收</span>
                <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-end pr-2"
                    style={{ width: `${getPercentage(levelDistribution.level1)}%` }}
                  >
                    <span className="text-xs font-bold text-white">
                      {getPercentage(levelDistribution.level1)}%
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-600 w-12 text-right">
                  {(levelDistribution.level1 / 60).toFixed(1)}h
                </span>
              </div>

              {/* 2級|流量 */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold w-16 text-blue-700">2級|流量</span>
                <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-end pr-2"
                    style={{ width: `${getPercentage(levelDistribution.level2)}%` }}
                  >
                    <span className="text-xs font-bold text-white">
                      {getPercentage(levelDistribution.level2)}%
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-600 w-12 text-right">
                  {(levelDistribution.level2 / 60).toFixed(1)}h
                </span>
              </div>

              {/* 3級|行政 */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold w-16 text-green-700">3級|行政</span>
                <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-end pr-2"
                    style={{ width: `${getPercentage(levelDistribution.level3)}%` }}
                  >
                    <span className="text-xs font-bold text-white">
                      {getPercentage(levelDistribution.level3)}%
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-600 w-12 text-right">
                  {(levelDistribution.level3 / 60).toFixed(1)}h
                </span>
              </div>

              {/* 日常 */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold w-16 text-gray-700">日常</span>
                <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-end pr-2"
                    style={{ width: `${getPercentage(levelDistribution.daily)}%` }}
                  >
                    <span className="text-xs font-bold text-white">
                      {getPercentage(levelDistribution.daily)}%
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-600 w-12 text-right">
                  {(levelDistribution.daily / 60).toFixed(1)}h
                </span>
              </div>
            </div>
          </div>

          {/* 關閉按鈕 */}
          <Button onClick={onClose} className="w-full">
            確認
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
