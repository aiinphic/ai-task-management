import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, Mic, Sparkles, Upload, X, Loader2, Paperclip, ChevronDown, ChevronUp } from "lucide-react";
import { mockUsers } from "@/data/mockDepartments";
import { matchTaskSymbol } from "@/data/taskSymbols";
import { classifyTaskLevel } from "@/utils/dailyTaskClassifier";
import { classifyTaskLevelAdvanced, checkGoalAlignment } from "@/utils/advancedTaskClassifier";
import { User, TaskPriority } from "@/types/task";
import { toast } from "sonner";
import { Subtask } from "@/types/task";
import { saveAILearningRecord, getAccuracyStats, optimizeAIPrediction } from "@/utils/aiLearning";
import { validateQuantitativeInput, validateAtLeastOne, buildQuantitativeMetrics } from "@/utils/quantitativeValidation";

/**
 * 根據任務標題和預估時間自動生成子任務
 */
function generateSubtasks(title: string, estimatedDuration: string): Subtask[] {
  const titleLower = title.toLowerCase();
  
  // 根據任務類型生成不同的子任務
  const subtaskTemplates: Record<string, string[]> = {
    '包裝機': ['跟客戶確認規格', '需求分析', '報價單製作', '合約簽署'],
    '產品': ['市場研究', '競品分析', '功能規劃', '原型設計'],
    '設計': ['需求收集', '視覺設計', '互動設計', '設計審查'],
    '開發': ['技術評估', '架構設計', '程式開發', '測試驗證'],
    '報告': ['資料收集', '內容編寫', '圖表製作', '審閱修正'],
    '會議': ['議程準備', '資料整理', '會議進行', '會議紀錄'],
  };
  
  // 預設子任務(如果沒有匹配到特定類型)
  const defaultSubtasks = ['確認任務需求', '規劃執行步驟', '執行並追蹤進度', '完成後檢視'];
  
  // 嘗試匹配任務類型
  let selectedTemplate = defaultSubtasks;
  for (const [keyword, template] of Object.entries(subtaskTemplates)) {
    if (titleLower.includes(keyword)) {
      selectedTemplate = template;
      break;
    }
  }
  
  // 計算每個子任務的預估時間
  const totalMinutes = estimatedDuration === '10min' ? 10 : estimatedDuration === '1hour' ? 60 : 480;
  const subtaskMinutes = Math.floor(totalMinutes / selectedTemplate.length);
  
  // 生成子任務
  return selectedTemplate.map((subtaskTitle, index) => ({
    id: `subtask-${Date.now()}-${index}`,
    title: subtaskTitle,
    estimatedHours: subtaskMinutes / 60, // 轉換為小時
    estimatedTime: subtaskMinutes,
    actualTime: 0,
    status: 'pending' as const,
    completed: false,
  }));
}

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask: (taskData: any) => void;
}

export function CreateTaskDialog({ open, onOpenChange, onCreateTask }: CreateTaskDialogProps) {
  const [textInput, setTextInput] = useState("");
  const [taskContentInput, setTaskContentInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority>("high");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [collaboratorIds, setCollaboratorIds] = useState<string[]>([]);
  const [isCollaboratorsExpanded, setIsCollaboratorsExpanded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{
    title: string;
    description: string;
    priority: TaskPriority;
    estimatedDuration: string;
    symbolId: string;
    taskDirection: string;
    taskOutline: string;
    aiSuggestions: string;
    scheduleGoal: string;
    suggestedAssigneeId?: string;
    suggestedCollaboratorIds?: string[];
    suggestedLevel?: 1 | 2 | 3 | 4;
  } | null>(null);
  const [accuracyStats, setAccuracyStats] = useState(getAccuracyStats());
  
  // 量化輸入欄位狀態
  const [financialInput, setFinancialInput] = useState("");
  const [quantityInput, setQuantityInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [quantitativeError, setQuantitativeError] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files!);
      setFiles(prev => [...prev, ...newFiles]);
      toast.success(`已上傳 ${newFiles.length} 個檔案`);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleCollaborator = (userId: string) => {
    setCollaboratorIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAIAnalysis = async () => {
    if (!textInput.trim() && files.length === 0) {
      toast.error("請輸入任務名稱或上傳檔案");
      return;
    }

    setIsAnalyzing(true);
    
    // 模擬 AI 分析過程
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 模擬 AI 分析結果
    const priorities: TaskPriority[] = ["high", "medium", "low"];
    const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
    
    // 使用 AI 符號匹配
    const taskDescription = textInput || "根據上傳的檔案內容生成的任務描述";
    const matchedSymbol = matchTaskSymbol(taskDescription);
    const taskTitle = textInput.split(/[。,，\n]/)[0].substring(0, 20) || "新任務";
    
    // AI 生成任務方向
    const taskDirection = `這是一個${randomPriority === 'high' ? '高優先級' : randomPriority === 'medium' ? '中優先級' : '低優先級'}的任務,建議專注於核心目標的達成,確保每個步驟都能為最終成果加分。`;
    
    // AI 生成任務大綱
    const taskOutline = `1. 明確任務目標與成果標準\n2. 評估所需資源與時間\n3. 分階段執行並追蹤進度\n4. 定期檢視與調整策略\n5. 完成後進行總結與優化`;
    
    // AI 生成執行建議
    const aiSuggestions = `建議採用漸進式方法,先完成核心功能,再逐步優化細節。建議每天投入 ${randomPriority === 'high' ? '3-4' : randomPriority === 'medium' ? '2-3' : '1-2'} 小時,保持穩定的執行節奏。`;
    
    // AI 生成時程目標
    const estimatedDays = randomPriority === "high" ? 7 : randomPriority === "medium" ? 3 : 1;
    const scheduleGoal = `預計 ${estimatedDays} 天內完成,建議每天檢視進度並調整執行計畫。`;
    
    // AI 推薦負責人和協作成員
    const suggestedAssigneeId = mockUsers[Math.floor(Math.random() * mockUsers.length)].id;
    const suggestedCollaboratorIds = mockUsers
      .filter(u => u.id !== suggestedAssigneeId)
      .slice(0, 2)
      .map(u => u.id);
    
    const mockResult = {
      title: taskTitle,
      description: taskDescription,
      priority: randomPriority,
      estimatedDuration: randomPriority === "high" ? "1day" : randomPriority === "medium" ? "1hour" : "10min",
      symbolId: matchedSymbol.id,
      taskDirection,
      taskOutline,
      aiSuggestions,
      scheduleGoal,
      suggestedAssigneeId,
      suggestedCollaboratorIds,
    };

    // 根據優先級設定層級
    let suggestedLevel: 1 | 2 | 3 | 4 = 2;
    if (randomPriority === "high") {
      suggestedLevel = 1;
    } else if (randomPriority === "medium") {
      suggestedLevel = 2;
    } else {
      suggestedLevel = 3;
    }
    
    // 使用 AI 學習優化預測
    const optimizedPrediction = optimizeAIPrediction(
      taskDescription,
      {
        level: suggestedLevel,
        priority: randomPriority,
        assigneeId: suggestedAssigneeId,
      }
    );
    
    setAiResult({
      ...mockResult,
      suggestedLevel: optimizedPrediction.level,
    });
    
    // 自動預填層級和優先級，但不預填負責人和協作成員
    setSelectedPriority(optimizedPrediction.priority);
    setSelectedLevel(optimizedPrediction.level);
    // 不自動預填負責人和協作成員，由使用者自己選擇
    // setAssigneeId(optimizedPrediction.assigneeId);
    // setCollaboratorIds(suggestedCollaboratorIds);
    
    setIsAnalyzing(false);
    
    // 使用進階分級器判斷任務層級（基於陳宗賢老師理論）
    // 注意：這裡還沒有量化貢獻度，所以先使用舊的分級器
    const taskLevel = classifyTaskLevel(
      mockResult.title,
      mockResult.description,
      mockResult.priority
    );
    
    const levelLabels = {
      'LEVEL_1_REVENUE': '一級 | 營收',
      'LEVEL_2_TRAFFIC': '二級 | 流量',
      'LEVEL_3_ADMIN': '三級 | 行政',
      'LEVEL_4_DAILY': '日常',
    };
    
    toast.success("✨ AI 智能分析完成!", {
      description: `任務已分級為: ${levelLabels[taskLevel]}`
    });
  };

  const handleSubmit = () => {
    console.log('handleSubmit 被調用');
    toast.error('測試 Toast 通知是否顯示');
    
    if (!aiResult) {
      toast.error("請先執行 AI 智能分析");
      return;
    }

    if (!assigneeId) {
      toast.error("請選擇負責人");
      return;
    }
    
    // 驗證量化輸入
    const atLeastOneResult = validateAtLeastOne(financialInput, quantityInput, timeInput);
    if (!atLeastOneResult.isValid) {
      setQuantitativeError(atLeastOneResult.error || "");
      toast.error(atLeastOneResult.error);
      return;
    }
    
    // 驗證每個欄位的格式
    const financialValidation = validateQuantitativeInput(financialInput);
    console.log('金額貢獻度驗證:', financialInput, financialValidation);
    if (!financialValidation.isValid) {
      console.error('金額貢獻度驗證失敗:', financialValidation.error);
      setQuantitativeError(financialValidation.error || "");
      toast.error(`金額貢獻度：${financialValidation.error}`);
      return;
    }
    
    const quantityValidation = validateQuantitativeInput(quantityInput);
    if (!quantityValidation.isValid) {
      setQuantitativeError(quantityValidation.error || "");
      toast.error(`數量貢獻度：${quantityValidation.error}`);
      return;
    }
    
    const timeValidation = validateQuantitativeInput(timeInput);
    if (!timeValidation.isValid) {
      setQuantitativeError(timeValidation.error || "");
      toast.error(`時間貢獻度：${timeValidation.error}`);
      return;
    }

    const assignee = mockUsers.find(u => u.id === assigneeId);
    const collaborators = mockUsers.filter(u => collaboratorIds.includes(u.id));
    
    // 建立量化貢獻度物件
    const quantitativeMetrics = buildQuantitativeMetrics(financialInput, quantityInput, timeInput);
    
    // 使用進階分級器重新計算任務層級（基於陳宗賢老師理論）
    const advancedLevel = classifyTaskLevelAdvanced(
      aiResult.title,
      taskContentInput || aiResult.description,
      quantitativeMetrics
    );
    
    // 檢查目標對齊性
    const alignmentWarning = checkGoalAlignment(advancedLevel, quantitativeMetrics);
    if (alignmentWarning) {
      toast.warning(alignmentWarning);
    }
    
    // 使用進階分級器的結果更新 selectedLevel
    setSelectedLevel(advancedLevel);

    // 根據進階分級器的結果設定 taskLevel
    const levelMap = {
      1: 'LEVEL_1_REVENUE' as const,
      2: 'LEVEL_2_TRAFFIC' as const,
      3: 'LEVEL_3_ADMIN' as const,
      4: 'LEVEL_4_DAILY' as const,
    };
    
    const newTask = {
      id: `task-${Date.now()}`,
      title: aiResult.title,
      description: aiResult.description,
      priority: selectedPriority,
      duration: aiResult.estimatedDuration as any,
      status: "pending" as const,
      assignee: assignee!,
      collaborators,
      department: assignee!.department,
      symbolId: aiResult.symbolId,
      level: levelMap[advancedLevel],
      weight: 'MEDIUM' as const,
      progress: 0,
      createdAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedHours: aiResult.estimatedDuration === '10min' ? 0.17 : aiResult.estimatedDuration === '1hour' ? 1 : 8,
      subtasks: generateSubtasks(aiResult.title, aiResult.estimatedDuration),
      taskDirection: aiResult.taskDirection,
      taskOutline: aiResult.taskOutline,
      aiSuggestions: aiResult.aiSuggestions,
      scheduleGoal: aiResult.scheduleGoal,
      aiAnalysis: {
        progress: "新建任務,尚未開始",
        missingItems: ["待確認執行細節"],
      },
      aiGeneratedContent: {
        direction: aiResult.taskDirection,
        outline: aiResult.taskOutline.split('\n'),
        description: aiResult.description,
      },
      quantitativeMetrics, // 量化貢獻度
    };

    onCreateTask(newTask);
    
    // 記錄 AI 學習資料
    if (aiResult) {
      const aiPredictedLevel = aiResult.suggestedLevel || 2;
      const aiPredictedPriority = aiResult.priority;
      const aiPredictedAssigneeId = aiResult.suggestedAssigneeId || "";
      const aiPredictedCollaboratorIds = aiResult.suggestedCollaboratorIds || [];
      
      saveAILearningRecord({
        id: `learning-${Date.now()}`,
        timestamp: new Date().toISOString(),
        taskDescription: textInput,
        aiPrediction: {
          level: aiPredictedLevel,
          priority: aiPredictedPriority,
          assigneeId: aiPredictedAssigneeId,
          collaboratorIds: aiPredictedCollaboratorIds,
        },
        userChoice: {
          level: selectedLevel,
          priority: selectedPriority,
          assigneeId: assigneeId,
          collaboratorIds: collaboratorIds,
        },
        modifications: {
          levelChanged: selectedLevel !== aiPredictedLevel,
          priorityChanged: selectedPriority !== aiPredictedPriority,
          assigneeChanged: assigneeId !== aiPredictedAssigneeId,
          collaboratorsChanged: JSON.stringify(collaboratorIds.sort()) !== JSON.stringify(aiPredictedCollaboratorIds.sort()),
        },
      });
      
      // 更新統計資料
      setAccuracyStats(getAccuracyStats());
      
      // 顯示回饋提示
      const hasModifications = 
        selectedLevel !== aiPredictedLevel ||
        selectedPriority !== aiPredictedPriority ||
        assigneeId !== aiPredictedAssigneeId ||
        JSON.stringify(collaboratorIds.sort()) !== JSON.stringify(aiPredictedCollaboratorIds.sort());
      
      if (hasModifications) {
        toast.success("任務建立成功! 🎓 AI 已學習您的調整");
      } else {
        toast.success("任務建立成功!");
      }
    } else {
      toast.success("任務建立成功!");
    }
    
    // Reset form
    setTextInput("");
    setTaskContentInput("");
    setFiles([]);
    setSelectedLevel(1);
    setSelectedPriority("high");
    setAssigneeId("");
    setCollaboratorIds([]);
    setIsCollaboratorsExpanded(false);
    setAiResult(null);
    setFinancialInput("");
    setQuantityInput("");
    setTimeInput("");
    setQuantitativeError("");
    
    onOpenChange(false);
  };

  // 獲取部門列表
  const departments = Array.from(new Set(mockUsers.map(u => u.department)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            新增任務
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Name Input */}
          <div className="space-y-2">
            <Label htmlFor="task-input" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              任務名稱
            </Label>
            <Textarea
              id="task-input"
              placeholder="請輸入任務名稱,例如:準備產品發表會簡報"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Task Content Input */}
          <div className="space-y-2">
            <Label htmlFor="task-content" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              任務內容
            </Label>
            <Textarea
              id="task-content"
              placeholder="請輸入任務的詳細內容、目標、要求等..."
              value={taskContentInput}
              onChange={(e) => setTaskContentInput(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              附件 ({files.length})
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("file-upload")?.click()}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              點擊上傳文件、錄音或其他檔案
            </Button>
            <input
              id="file-upload"
              type="file"
              multiple
              accept="*/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {files.map((file, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {file.name}
                    <button onClick={() => removeFile(index)} className="ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Quantitative Metrics Input */}
          <div className="space-y-3 p-4 border-2 border-dashed border-primary/30 rounded-lg bg-gradient-to-r from-amber-50/50 to-orange-50/50">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold flex items-center gap-2">
                📊 量化貢獻度（至少填寫一項）
              </Label>
              {quantitativeError && (
                <span className="text-xs text-destructive">{quantitativeError}</span>
              )}
            </div>
            
            {/* Financial Input */}
            <div className="space-y-1.5">
              <Label htmlFor="financial-input" className="text-sm flex items-center gap-1.5">
                💰 金額貢獻度
              </Label>
              <Textarea
                id="financial-input"
                placeholder="例如：預計帶來 50 萬營收、節省 10 萬成本"
                value={financialInput}
                onChange={(e) => {
                  setFinancialInput(e.target.value);
                  setQuantitativeError("");
                }}
                rows={1}
                className="resize-none text-sm"
              />
            </div>
            
            {/* Quantity Input */}
            <div className="space-y-1.5">
              <Label htmlFor="quantity-input" className="text-sm flex items-center gap-1.5">
                👥 數量貢獻度
              </Label>
              <Textarea
                id="quantity-input"
                placeholder="例如：增加 1000 個新用戶、完成 20 個客戶案件"
                value={quantityInput}
                onChange={(e) => {
                  setQuantityInput(e.target.value);
                  setQuantitativeError("");
                }}
                rows={1}
                className="resize-none text-sm"
              />
            </div>
            
            {/* Time Input */}
            <div className="space-y-1.5">
              <Label htmlFor="time-input" className="text-sm flex items-center gap-1.5">
                ⏱️ 時間貢獻度
              </Label>
              <Textarea
                id="time-input"
                placeholder="例如：節省 10 小時工時、縮短 2 天流程時間"
                value={timeInput}
                onChange={(e) => {
                  setTimeInput(e.target.value);
                  setQuantitativeError("");
                }}
                rows={1}
                className="resize-none text-sm"
              />
            </div>
            
            {/* 錯誤提示 */}
            {quantitativeError && (
              <div className="bg-red-50 border border-red-300 rounded-md p-3 flex items-start gap-2">
                <span className="text-red-600 text-sm">⚠️</span>
                <span className="text-red-700 text-sm font-medium">{quantitativeError}</span>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground flex items-start gap-1.5 pt-1">
              <span>ℹ️</span>
              <span>提示：請輸入具體數值，避免「盡力而為」等抽象描述。根據陳宗賢老師理論，每個任務都必須有明確的 KPI 貢獻度。</span>
            </div>
          </div>

          {/* AI Analysis Button - Moved here */}
          <Button
            onClick={handleAIAnalysis}
            disabled={!textInput.trim() || isAnalyzing}
            className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                分析中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                ✨ 智能分析並建立
              </>
            )}
          </Button>

          {/* Assignee Selection - Avatar Buttons */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              👤 負責人 *
            </Label>
            <div className="flex flex-wrap gap-2">
              {mockUsers.map(user => (
                <Button
                  key={user.id}
                  type="button"
                  variant={assigneeId === user.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAssigneeId(user.id)}
                  className="flex items-center gap-2"
                >
                  <span>{user.avatar}</span>
                  <span>{user.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Collaborators Selection - Collapsible */}
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCollaboratorsExpanded(!isCollaboratorsExpanded)}
              className="w-full flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                👥 協作成員 ({collaboratorIds.length})
              </span>
              {isCollaboratorsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            
            {isCollaboratorsExpanded && (
              <div className="space-y-3 p-4 border rounded-lg">
                {departments.map(dept => {
                  const deptUsers = mockUsers.filter(u => u.department === dept);
                  return (
                    <div key={dept}>
                      <div className="text-sm font-semibold mb-2 flex items-center justify-between">
                        <span>{dept}</span>
                        <span className="text-muted-foreground">{deptUsers.length} 人</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {deptUsers.map(user => (
                          <Button
                            key={user.id}
                            type="button"
                            variant={collaboratorIds.includes(user.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleCollaborator(user.id)}
                            className="flex items-center gap-2"
                          >
                            <span>{user.avatar}</span>
                            <span>{user.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>



          {/* AI Result */}
          {aiResult && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-primary/20 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Sparkles className="w-4 h-4" />
                  AI 分析結果
                </div>
                {accuracyStats.totalPredictions > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-full">
                      <span className="font-semibold text-primary">{accuracyStats.accuracyRate}%</span>
                      <span className="text-muted-foreground">準確率</span>
                    </div>
                    <div className="text-muted-foreground">
                      🎓 已學習 {accuracyStats.totalPredictions} 次
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">任務標題:</span> {aiResult.title}
                </div>
                <div>
                  <span className="font-semibold">預估時間:</span>{" "}
                  {aiResult.estimatedDuration === "10min" ? "10 分鐘" :
                   aiResult.estimatedDuration === "1hour" ? "1 小時" :
                   "1 天"}
                </div>
                <div>
                  <span className="font-semibold">AI 建議:</span> {aiResult.aiSuggestions}
                </div>
              </div>
              {accuracyStats.totalPredictions > 0 && (
                <div className="pt-2 border-t border-primary/10">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-semibold text-primary">{accuracyStats.levelAccuracy}%</div>
                      <div className="text-muted-foreground">層級準確</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-primary">{accuracyStats.priorityAccuracy}%</div>
                      <div className="text-muted-foreground">優先級準確</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-primary">{accuracyStats.assigneeAccuracy}%</div>
                      <div className="text-muted-foreground">負責人準確</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button
              className="flex-1 bg-primary"
              onClick={handleSubmit}
              disabled={!aiResult || !assigneeId}
            >
              建立任務
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
