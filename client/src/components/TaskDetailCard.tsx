import { useState } from 'react';
import { Task, Subtask } from '@/types/task';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, FileUp, Mic, Square } from 'lucide-react';
import { toast } from 'sonner';

interface TaskDetailCardProps {
  task: Task;
  onEnd: () => void;
  onUploadFile: (file: File) => void;
  onUploadAudio: (file: File) => void;
}

export function TaskDetailCard({ task, onEnd, onUploadFile, onUploadAudio }: TaskDetailCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);
  const [audioInputRef, setAudioInputRef] = useState<HTMLInputElement | null>(null);

  // 獲取層級標籤
  const getLevelBadge = () => {
    switch (task.level) {
      case 'LEVEL_1_REVENUE':
        return <Badge className="bg-amber-500 text-white">1級|營收</Badge>;
      case 'LEVEL_2_TRAFFIC':
        return <Badge className="bg-blue-500 text-white">2級|流量</Badge>;
      case 'LEVEL_3_ADMIN':
        return <Badge className="bg-gray-500 text-white">3級|行政</Badge>;
      case 'LEVEL_4_DAILY':
        return <Badge className="bg-gray-300 text-gray-700">日常</Badge>;
      default:
        return null;
    }
  };

  // 處理文件上傳
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadFile(file);
      toast.success('文件已上傳');
    }
  };

  // 處理錄音檔上傳
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadAudio(file);
      toast.success('錄音檔已上傳');
    }
  };

  return (
    <Card className="p-6 animate-in slide-in-from-right duration-300">
      {/* 任務基本資訊 */}
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-2">📋 {task.title}</h3>
        <div className="flex items-center gap-2 mb-2">
          {getLevelBadge()}
        </div>
        <div className="text-sm text-muted-foreground">
          ⏱️ 預計花費: {task.estimatedMinutes ? `${(task.estimatedMinutes / 60).toFixed(1)}h` : '未評估'}
        </div>
      </div>

      {/* 可展開的任務列表清單 */}
      <div className="mb-4 border-t pt-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
        >
          <span>📋 AI 分析任務事項列表</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {isExpanded && (
          <div className="mt-3 space-y-3">
            {task.subtasks && task.subtasks.length > 0 ? (
              <>
                {task.subtasks.map((subtask, index) => (
                  <div key={subtask.id} className="flex items-start justify-between text-sm bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {index + 1}. {subtask.title}
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-xs text-gray-500">預估時數</div>
                      <div className="font-semibold text-blue-600">
                        {subtask.estimatedHours.toFixed(1)}h
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between text-sm font-semibold bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <span className="text-blue-900">📊 總計時間</span>
                  <span className="text-blue-600">
                    {task.subtasks.reduce((sum, st) => sum + st.estimatedHours, 0).toFixed(1)}h
                  </span>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-400 pl-4">無任務項目</div>
            )}
          </div>
        )}
      </div>

      {/* 上傳作業答案 */}
      <div className="mb-4 border-t pt-4">
        <div className="text-sm font-semibold text-gray-700 mb-3">📎 上傳作業答案</div>
        <div className="flex gap-2">
          <input
            ref={setFileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef?.click()}
            className="flex-1"
          >
            <FileUp className="w-4 h-4 mr-2" />
            上傳文件
          </Button>

          <input
            ref={setAudioInputRef}
            type="file"
            className="hidden"
            onChange={handleAudioUpload}
            accept=".mp3,.wav,.m4a,.ogg"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => audioInputRef?.click()}
            className="flex-1"
          >
            <Mic className="w-4 h-4 mr-2" />
            上傳錄音檔
          </Button>
        </div>
      </div>

      {/* 結束任務按鈕 */}
      <Button
        variant="destructive"
        onClick={onEnd}
        className="w-full"
      >
        <Square className="w-4 h-4 mr-2" />
        結束任務
      </Button>
    </Card>
  );
}
