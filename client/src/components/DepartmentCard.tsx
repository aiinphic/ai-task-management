import { Department } from "@/types/department";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface DepartmentCardProps {
  department: Department;
  onClick?: () => void;
}

export function DepartmentCard({ department, onClick }: DepartmentCardProps) {
  const totalTasks =
    department.taskStats.pending +
    department.taskStats.inProgress +
    department.taskStats.completed;

  return (
    <Card
      className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50"
      onClick={onClick}
    >
      {/* 部門標題 */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-lg ${department.color} flex items-center justify-center text-2xl`}>
          {department.icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold">{department.name}</h3>
          <p className="text-sm text-muted-foreground">
            {department.members.length} 名成員
          </p>
        </div>
      </div>

      {/* 任務統計 */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="flex flex-col items-center p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-orange-500 mb-1" />
          <span className="text-xs text-muted-foreground">待辦</span>
          <span className="text-lg font-bold text-orange-600">
            {department.taskStats.pending}
          </span>
        </div>
        <div className="flex flex-col items-center p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <Clock className="w-4 h-4 text-blue-500 mb-1" />
          <span className="text-xs text-muted-foreground">進行中</span>
          <span className="text-lg font-bold text-blue-600">
            {department.taskStats.inProgress}
          </span>
        </div>
        <div className="flex flex-col items-center p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-green-500 mb-1" />
          <span className="text-xs text-muted-foreground">已完成</span>
          <span className="text-lg font-bold text-green-600">
            {department.taskStats.completed}
          </span>
        </div>
      </div>

      {/* 成員頭像列表 */}
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-muted-foreground" />
        <div className="flex -space-x-2">
          {department.members.slice(0, 5).map((member) => (
            <div
              key={member.id}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center border-2 border-background text-sm"
              title={member.name}
            >
              {member.avatar}
            </div>
          ))}
          {department.members.length > 5 && (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border-2 border-background text-xs font-semibold">
              +{department.members.length - 5}
            </div>
          )}
        </div>
      </div>

      {/* 總任務數 */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">總任務數</span>
          <Badge variant="secondary" className="text-base font-bold">
            {totalTasks}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
