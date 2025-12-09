import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Task } from "@/types/task";
import { Badge } from "@/components/ui/badge";

interface StartTaskConfirmDialogProps {
  open: boolean;
  task: Task | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const LEVEL_LABELS: Record<string, { label: string; color: string }> = {
  LEVEL_1_REVENUE: { label: "1級|營收", color: "bg-orange-500" },
  LEVEL_2_TRAFFIC: { label: "2級|流量", color: "bg-blue-500" },
  LEVEL_3_ADMIN: { label: "3級|行政", color: "bg-gray-500" },
  LEVEL_4_DAILY: { label: "日常", color: "bg-purple-500" },
};

export function StartTaskConfirmDialog({ open, task, onConfirm, onCancel }: StartTaskConfirmDialogProps) {
  if (!task) return null;

  const levelInfo = task.level ? LEVEL_LABELS[task.level] : { label: "未分級", color: "bg-gray-400" };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>確認開始任務</span>
            <Badge className={`${levelInfo.color} text-white`}>
              {levelInfo.label}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            確定要開始執行此任務嗎?開始後將記錄執行時間。
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">任務名稱</p>
              <p className="font-medium">{task.title}</p>
            </div>
            {task.description && (
              <div>
                <p className="text-sm text-muted-foreground">任務描述</p>
                <p className="text-sm">{task.description}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button onClick={onConfirm}>
            確認開始
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
