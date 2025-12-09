import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export interface FilterState {
  status: string;
  assignee: string;
}

interface TaskFilterProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  assignees: string[];
  tasks: any[]; // 用於計算每個成員的任務數量
}

export function TaskFilter({ filters, onFilterChange, assignees, tasks }: TaskFilterProps) {
  const handleAssigneeChange = (value: string) => {
    onFilterChange({ ...filters, assignee: value });
  };

  // 計算每個成員的任務數量
  const getTaskCount = (assignee: string) => {
    if (assignee === "all") return tasks.length;
    return tasks.filter(task => task.assignee.name === assignee).length;
  };

  return (
    <div className="space-y-3">
      {/* 負責人篩選按鈕組 */}
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">負責人：</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filters.assignee === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => handleAssigneeChange("all")}
          className="h-9"
        >
          全部 ({getTaskCount("all")})
        </Button>
        {assignees.map((assignee) => (
          <Button
            key={assignee}
            variant={filters.assignee === assignee ? "default" : "outline"}
            size="sm"
            onClick={() => handleAssigneeChange(assignee)}
            className="h-9"
          >
            {assignee} ({getTaskCount(assignee)})
          </Button>
        ))}
      </div>
    </div>
  );
}
