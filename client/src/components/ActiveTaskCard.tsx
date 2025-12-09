import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Upload, Mic, FileText, X, Check, Pause } from 'lucide-react';
import type { Task, Subtask } from '@/types/task';

interface ActiveTaskCardProps {
  task: Task;
  elapsedSeconds: number;
  onComplete: () => void;
  onPause?: () => void;
  onCancel?: () => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: 'document' | 'audio' | 'file';
  data: string; // base64
}

export function ActiveTaskCard({ task, elapsedSeconds, onComplete, onPause, onCancel }: ActiveTaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // 計算預計時間（分鐘轉小時）
  const estimatedHours = (task.estimatedMinutes || 0) / 60;
  const elapsedHours = elapsedSeconds / 3600;
  
  // 計算進度百分比
  const progress = estimatedHours > 0 ? (elapsedHours / estimatedHours) * 100 : 0;
  const remainingHours = Math.max(0, estimatedHours - elapsedHours);

  // 根據進度決定顏色
  const getProgressColor = () => {
    if (progress < 60) return 'bg-green-500';
    if (progress < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // 格式化時間顯示 (HH:MM:SS)
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 處理檔案上傳
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'document' | 'audio' | 'file') => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const newFile: UploadedFile = {
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type,
        data: e.target?.result as string,
      };

      setUploadedFiles(prev => [...prev, newFile]);
      
      // 儲存到 localStorage
      const storageKey = `task_files_${task.id}`;
      const existing = localStorage.getItem(storageKey);
      const existingFiles = existing ? JSON.parse(existing) : [];
      localStorage.setItem(storageKey, JSON.stringify([...existingFiles, newFile]));
    };

    reader.readAsDataURL(file);
  };

  // 刪除檔案
  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    
    const storageKey = `task_files_${task.id}`;
    const existing = localStorage.getItem(storageKey);
    if (existing) {
      const files = JSON.parse(existing).filter((f: UploadedFile) => f.id !== fileId);
      localStorage.setItem(storageKey, JSON.stringify(files));
    }
  };

  // 格式化檔案大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 載入已上傳的檔案
  useEffect(() => {
    const storageKey = `task_files_${task.id}`;
    const existing = localStorage.getItem(storageKey);
    if (existing) {
      setUploadedFiles(JSON.parse(existing));
    }
  }, [task.id]);

  // 取得層級配置
  const getLevelConfig = () => {
    switch (task.level) {
      case 'LEVEL_1_REVENUE':
        return { label: '1級|營收', bgColor: 'bg-[#f59e0b]', textColor: 'text-white', borderColor: 'border-[#f59e0b]' };
      case 'LEVEL_2_TRAFFIC':
        return { label: '2級|流量', bgColor: 'bg-[#3b82f6]', textColor: 'text-white', borderColor: 'border-[#3b82f6]' };
      case 'LEVEL_3_ADMIN':
        return { label: '3級|行政', bgColor: 'bg-[#6b7280]', textColor: 'text-white', borderColor: 'border-[#6b7280]' };
      default:
        return { label: '日常', bgColor: 'bg-[#d1d5db]', textColor: 'text-gray-700', borderColor: 'border-[#d1d5db]' };
    }
  };

  const levelConfig = getLevelConfig();

  return (
    <Card className={`overflow-hidden border-2 ${levelConfig.borderColor} shadow-lg sticky top-6`}>
      {/* 層級標題欄 */}
      <div className={`${levelConfig.bgColor} ${levelConfig.textColor} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">{levelConfig.label}</span>
          <Badge variant="secondary" className="bg-white/20 text-xs">執行中</Badge>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 任務標題與計時器 */}
        <div>
          <h3 className="font-bold text-lg mb-2">{task.title}</h3>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-blue-50 rounded-lg px-4 py-3 border-2 border-blue-200">
              <div className="text-xs text-blue-600 mb-1">已執行時間</div>
              <div className="font-mono text-2xl font-bold text-blue-600">
                {formatTime(elapsedSeconds)}
              </div>
            </div>
          </div>
        </div>

        {/* AI 分析與子任務 */}
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm font-semibold flex items-center gap-2">
              🤖 AI 分析與任務事項
            </span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isExpanded && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-3">
              {/* AI 分析方向 */}
              {task.aiGeneratedContent?.direction && (
                <div>
                  <p className="font-semibold text-gray-700 mb-1 text-xs">💡 分析方向</p>
                  <p className="text-gray-600 text-xs leading-relaxed">{task.aiGeneratedContent.direction}</p>
                </div>
              )}

              {/* 子任務列表 */}
              {task.subtasks && task.subtasks.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-700 mb-2 text-xs">📋 子任務列表</p>
                  <ul className="space-y-1.5">
                    {task.subtasks.map((subtask: Subtask) => (
                      <li key={subtask.id} className="flex items-start gap-2">
                        <span className="text-xs text-gray-700">• {subtask.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 附件與記錄 */}
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">📎 附件與記錄</p>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'document')}
              />
              <Button variant="outline" size="sm" className="w-full text-xs h-9" asChild>
                <span className="flex flex-col items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span className="text-[10px]">文件</span>
                </span>
              </Button>
            </label>

            <label>
              <input
                type="file"
                accept=".mp3,.wav,.m4a"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'audio')}
              />
              <Button variant="outline" size="sm" className="w-full text-xs h-9" asChild>
                <span className="flex flex-col items-center gap-1">
                  <Mic className="w-4 h-4" />
                  <span className="text-[10px]">錄音</span>
                </span>
              </Button>
            </label>

            <label>
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'file')}
              />
              <Button variant="outline" size="sm" className="w-full text-xs h-9" asChild>
                <span className="flex flex-col items-center gap-1">
                  <Upload className="w-4 h-4" />
                  <span className="text-[10px]">檔案</span>
                </span>
              </Button>
            </label>
          </div>

          {/* 已上傳檔案列表 */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-1 mt-2">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {file.type === 'document' && <FileText className="w-3 h-3 flex-shrink-0" />}
                    {file.type === 'audio' && <Mic className="w-3 h-3 flex-shrink-0" />}
                    {file.type === 'file' && <Upload className="w-3 h-3 flex-shrink-0" />}
                    <span className="truncate">{file.name}</span>
                    <span className="text-gray-500 flex-shrink-0 text-[10px]">({formatFileSize(file.size)})</span>
                  </div>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 操作按鈕 */}
        <div className="space-y-2 pt-2">
          <Button
            onClick={onComplete}
            className={`w-full ${levelConfig.bgColor} hover:opacity-90 ${levelConfig.textColor} h-12 text-base font-semibold`}
            size="lg"
          >
            <Check className="w-5 h-5 mr-2" />
            完成任務
          </Button>
          
          <div className="flex gap-2">
            {onPause && (
              <Button
                onClick={onPause}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Pause className="w-4 h-4 mr-1" />
                暫停
              </Button>
            )}

            {onCancel && (
              <Button
                onClick={onCancel}
                variant="outline"
                size="sm"
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1" />
                取消
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
