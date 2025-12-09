import { Card } from "@/components/ui/card";
import { Trophy, Star, CheckCircle2 } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: "trophy" | "star" | "check";
  unlocked: boolean;
}

interface ProgressTrackerProps {
  todayProgress: number;
  weekProgress: number;
  monthProgress: number;
  achievements: Achievement[];
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  check: CheckCircle2,
};

export function ProgressTracker({
  todayProgress,
  weekProgress,
  monthProgress,
  achievements,
}: ProgressTrackerProps) {
  return (
    <Card className="p-6 card-shadow">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-card-foreground">進度追蹤</h2>
      </div>

      {/* Progress Rings */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <ProgressRing label="今日" progress={todayProgress} />
        <ProgressRing label="本週" progress={weekProgress} />
        <ProgressRing label="本月" progress={monthProgress} />
      </div>

      {/* Achievements */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">成就徽章</h3>
        <div className="grid grid-cols-3 gap-3">
          {achievements.map((achievement) => {
            const Icon = iconMap[achievement.icon];
            return (
              <div
                key={achievement.id}
                className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                  achievement.unlocked
                    ? "bg-primary/10 border-primary/20"
                    : "bg-muted/50 border-border opacity-50"
                }`}
              >
                <Icon
                  className={`w-8 h-8 mb-2 ${
                    achievement.unlocked ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span className="text-xs text-center font-medium text-card-foreground">
                  {achievement.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function ProgressRing({ label, progress }: { label: string; progress: number }) {
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24 mb-2">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-muted"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-primary transition-all duration-500"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-card-foreground">{progress}%</span>
        </div>
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
