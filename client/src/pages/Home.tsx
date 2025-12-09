import { useState, useMemo } from "react";
import { TaskCard } from "@/components/TaskCard";
import { Task } from "@/types/task";
import { mockUsers } from "@/data/mockDepartments";
import { mockDepartments } from "@/data/mockDepartments";
import { StatsCard } from "@/components/StatsCard";
import { ProgressTracker } from "@/components/ProgressTracker";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { DepartmentCard } from "@/components/DepartmentCard";
import { TaskFilter, FilterState } from "@/components/TaskFilter";
import PriorityPieChart from "@/components/charts/PriorityPieChart";
import DailyBarChart from "@/components/charts/DailyBarChart";
import TodayDonutChart from "@/components/charts/TodayDonutChart";
import { calculateTimeByPriority, calculateDailyTimeDistribution } from "@/utils/timeStats";
import { PersonTimeCard } from "@/components/PersonTimeCard";
import { sortTasksByPriority } from "@/utils/priorityScore";
import { ExecutionMode } from "@/pages/ExecutionMode";
import { Button } from "@/components/ui/button";
import { QuadrantRadarView } from "@/components/QuadrantRadarView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
  LayoutDashboard,
  Plus,
  ListTodo,
  Building2,
  Play,
} from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    assignee: "all",
  });
  const [selectedCategory, setSelectedCategory] = useState<Task["level"] | "ALL">("ALL");
  const [taskViewMode, setTaskViewMode] = useState<"ongoing" | "completed">("ongoing"); // 任務檢視模式
  const [searchKeyword, setSearchKeyword] = useState<string>(""); // 搜尋關鍵字

  const [tasks, setTasks] = useState<Task[]>([]); // 已清空初始任務資料

  // 從 localStorage 讀取任務資料
  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    const hasInitialData = localStorage.getItem('initial_data_loaded');
    
    // 如果沒有載入過初始資料，強制載入 initial-tasks.json
    if (!hasInitialData) {
      console.log('🔄 首次載入，從 initial-tasks.json 載入預設任務...');
      fetch('/initial-tasks.json')
        .then(res => res.json())
        .then(initialTasks => {
          setTasks(initialTasks);
          localStorage.setItem('tasks', JSON.stringify(initialTasks));
          localStorage.setItem('initial_data_loaded', 'true');
          console.log(`✅ 已載入 ${initialTasks.length} 個初始任務`);
        })
        .catch(error => {
          console.error('載入初始任務失敗:', error);
        });
    } else if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks);
        setTasks(parsedTasks);
        console.log(`✅ 已載入 ${parsedTasks.length} 個任務`);
      } catch (error) {
        console.error('讀取任務資料失敗:', error);
      }
    }
  }, []);
  /*
  // 以下為原本的模擬任務資料,已註解
  const [tasks_OLD, setTasks_OLD] = useState<Task[]>([
    {
      id: "1",
      title: "產品銷售簡報",
      description: "準備下週客戶會議的產品展示簡報",
      priority: "high",
      duration: "1hour",
      status: "pending",
      department: "業務部",
      assignee: mockUsers.find(u => u.department === "業務部")!,
      collaborators: [mockUsers.find(u => u.name === "李美華")!],      symbolId: "product-sales", // 產品銷售
      level: "LEVEL_1_REVENUE", // 1級|營收
      weight: "HIGH", // 高權重
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2天後
      estimatedMinutes: 360, // 6小時
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3天前建立
      aiGeneratedContent: {
        direction: "本任務旨在完成產品銷售簡報，向潛在客戶展示產品核心價值與競爭優勢，促成簽約成交。",
        outline: [
          "分析目標客戶需求與痛點",
          "準備產品功能展示素材",
          "設計價格方案與優惠策略",
          "製作簡報投影片",
          "預演簡報流程"
        ],
        description: "此次簡報對象為 ABC 公司採購部門，該公司目前使用競品 X，但對其價格與客服不滿。我們需要強調產品的性價比優勢與完善的售後服務，並提供首年 8 折優惠方案，預計簽約金額為 50 萬元。"
      },
      aiAnalysis: {
        progress: "已完成簡報大綱，正在製作投影片",
        missingItems: ["價格方案最終確認", "客戶案例素材"],
      },
    },
    {
      id: "2",
      title: "網站 SEO 優化",
      description: "更新網站 meta 標籤、改善關鍵字密度",
      priority: "medium",
      duration: "1hour",
      status: "in-progress",
      department: "行銷部",
      startTime: new Date(),
      progress: 45,
      assignee: mockUsers.find(u => u.name === "陳冠宇")!,
      collaborators: [mockUsers.find(u => u.name === "張雅筑")!],
      symbolId: "seo-optimization", // SEO 優化
      level: "LEVEL_2_TRAFFIC", // 2級|流量
      weight: "MEDIUM", // 中權重
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5天後
      estimatedMinutes: 180, // 3小時
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1天前建立
      aiAnalysis: {
        progress: "已完成首頁和產品頁優化",
        missingItems: ["部落格文章關鍵字", "圖片 alt 標籤"],
      },
    },
    {
      id: "3",
      title: "團隊週報審核",
      description: "檢視各部門本週工作進度",
      priority: "low",
      duration: "10min",
      status: "pending",
      department: "行政部",
      assignee: mockUsers.find(u => u.department === "行政部")!,
      collaborators: [],
      symbolId: "weekly-report", // 週報審核
      level: "LEVEL_3_ADMIN", // 3級|行政
      weight: "LOW", // 低權重
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天後
      estimatedMinutes: 30, // 30分鐘
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5天前建立
      aiAnalysis: {
        progress: "等待各部門提交週報",
        missingItems: ["行銷部週報", "技術部週報"],
      },
    },
    {
      id: "4",
      title: "客戶需求訪談",
      description: "與重點客戶進行深度訪談",
      priority: "high",
      duration: "1day",
      status: "pending",
      department: "產品部",
      assignee: mockUsers.find(u => u.name === "李美華")!,
      collaborators: [mockUsers.find(u => u.name === "王小明")!],
      symbolId: "client-visit", // 客戶拜訪
      level: "LEVEL_1_REVENUE", // 1級|營收
      weight: "CRITICAL", // 極高權重 (明天到期)
      deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 明天
      estimatedMinutes: 480, // 8小時
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2天前建立
      aiAnalysis: {
        progress: "已預約三位客戶訪談時間",
        missingItems: ["訪談問卷設計", "會議室預訂"],
      },
    },
    {
      id: "5",
      title: "社群內容發布",
      description: "發布本週行銷內容到各大社群平台",
      priority: "medium",
      duration: "10min",
      status: "pending",
      department: "行銷部",
      assignee: mockUsers.find(u => u.name === "張雅筑")!,
      collaborators: [mockUsers.find(u => u.name === "劉宇恩")!],
      symbolId: "social-media", // 社群經營
      level: "LEVEL_2_TRAFFIC", // 2級|流量
      weight: "HIGH", // 高權重 (今天內到期)
      deadline: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000), // 今天內
      estimatedMinutes: 60, // 1小時
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1天前建立
      aiAnalysis: {
        progress: "內容已撰寫完成,等待發布",
        missingItems: ["配圖設計", "發布時間確認"],
      },
    },
    {
      id: "6",
      title: "財務報表整理",
      description: "整理Q4財務數據並製作報表",
      priority: "high",
      duration: "1hour",
      status: "pending",
      department: "會計部",
      assignee: mockUsers.find(u => u.department === "會計部")!,
      collaborators: [mockUsers.find(u => u.name === "吳俊傑")!],
      symbolId: "revenue-analysis", // 營收分析
      level: "LEVEL_1_REVENUE", // 1級|營收
      weight: "MEDIUM", // 中權重
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3天後
      estimatedMinutes: 240, // 4小時
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前建立
      aiAnalysis: {
        progress: "已收集各部門數據",
        missingItems: ["營收數據核對", "成本分析"],
      },
    },
    {
      id: "7",
      title: "辦公室清潔工作",
      description: "整理辦公室環境與文件歸檔",
      priority: "low",
      duration: "10min",
      status: "pending",
      department: "行政部",
      assignee: mockUsers.find(u => u.department === "行政部")!,
      collaborators: [],
      symbolId: "system-maintenance", // 系統維護 (作為日常任務範例)
      level: "LEVEL_4_DAILY", // 4級|日常
      weight: "LOW", // 低權重
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10天後
      estimatedMinutes: 45, // 45分鐘
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1天前建立
      aiAnalysis: {
        progress: "AI 無法明確分類，歸類為日常任務",
        missingItems: [],
      },
    },
  ]);
  */

  // 計算部門任務統計
  const departmentsWithStats = useMemo(() => {
    return mockDepartments.map((dept) => {
      const deptTasks = tasks.filter((t) => t.department === dept.name);
      return {
        ...dept,
        taskStats: {
          pending: deptTasks.filter((t) => t.status === "pending").length,
          inProgress: deptTasks.filter((t) => t.status === "in-progress").length,
          completed: deptTasks.filter((t) => t.status === "completed").length,
        },
      };
    });
  }, [tasks]);

  // 篩選後的任務，並按照優先級排序（一級營收 → 二級流量 → 三級行政）
  const filteredTasks = useMemo(() => {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    
    return tasks
      .filter((task) => {
        if (filters.status !== "all" && task.status !== filters.status) {
          return false;
        }
        if (filters.assignee !== "all" && task.assignee.name !== filters.assignee) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        // 按照優先級排序：一級營收 > 二級流量 > 三級行政
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }, [tasks, filters]);

  // 按分類篩選任務
  const categoryFilteredTasks = useMemo(() => {
    // 先根據 taskViewMode 篩選狀態
    let tasksToShow = filteredTasks;
    if (taskViewMode === "ongoing") {
      tasksToShow = filteredTasks.filter(task => task.status === "pending" || task.status === "in-progress");
    } else if (taskViewMode === "completed") {
      tasksToShow = filteredTasks.filter(task => task.status === "completed");
    }
    
    // 再根據 selectedCategory 篩選分類
    if (selectedCategory !== "ALL") {
      tasksToShow = tasksToShow.filter(task => task.level === selectedCategory);
    }

    // 最後根據搜尋關鍵字篩選
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      tasksToShow = tasksToShow.filter(task => {
        // 搜尋任務標題
        if (task.title.toLowerCase().includes(keyword)) return true;
        // 搜尋任務描述
        if (task.description?.toLowerCase().includes(keyword)) return true;
        // 搜尋層級標籤
        const levelLabels: Record<string, string> = {
          LEVEL_1_REVENUE: "1級|營收",
          LEVEL_2_TRAFFIC: "2級|流量",
          LEVEL_3_ADMIN: "3級|行政",
          LEVEL_4_DAILY: "日常",
        };
        if (task.level && levelLabels[task.level]?.toLowerCase().includes(keyword)) return true;
        return false;
      });
    }

    return tasksToShow;
  }, [selectedCategory, filteredTasks, taskViewMode, searchKeyword]);

  // 統計數據
  // 按照優先級排序任務
  const sortedTasks = useMemo(() => sortTasksByPriority(tasks), [tasks]);
  
  const pendingTasks = sortedTasks.filter((t) => t.status === "pending");
  const inProgressTasks = sortedTasks.filter((t) => t.status === "in-progress");
  const completedTasks = sortedTasks.filter((t) => t.status === "completed");

  const handleStartTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: "in-progress" as const,
              startTime: new Date(),
              progress: 0,
            }
          : task
      )
    );
    toast.success("任務已開始!");
  };

  const handleEndTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: "completed" as const,
              endTime: new Date(),
              completedAt: new Date(),
              progress: 100,
            }
          : task
      )
    );
    toast.success("任務已完成!太棒了!繼續保持這個節奏!");
  };

  const handleCardClick = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setShowTaskDetail(true);
    }
  };

  const handleCreateTask = (newTask: Task) => {
    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    
    // 同步儲存到 localStorage
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    setShowCreateTask(false);
    toast.success("任務建立成功!");
    
    console.log(`✅ 新任務已儲存: ${newTask.title}`);
  };

  const uniqueDepartments = Array.from(new Set(tasks.map((t) => t.department)));
  const uniqueAssignees = Array.from(new Set(tasks.map((t) => t.assignee.name)));

  // 計算時間統計數據
  const timeStatsByPriority = calculateTimeByPriority(tasks);
  const dailyTimeDistribution = calculateDailyTimeDistribution(tasks, 7);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI 任務管理系統</h1>
              <p className="text-xs text-muted-foreground">優化時間分配,提升工作效能</p>
            </div>
          </div>
          <Button onClick={() => setShowCreateTask(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            新增任務
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-card">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              儀表板
            </TabsTrigger>
            <TabsTrigger value="all-tasks" className="gap-2">
              <ListTodo className="w-4 h-4" />
              所有任務列表
            </TabsTrigger>
            <TabsTrigger value="departments" className="gap-2">
              <Building2 className="w-4 h-4" />
              部門概況
            </TabsTrigger>
            <TabsTrigger value="execution" className="gap-2">
              <Play className="w-4 h-4" />
              執行模式
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/90 via-primary to-primary/80 p-8 text-white">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2">歡迎回來!</h2>
                <p className="text-sm opacity-90">
                  今天是 {new Date().toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
                </p>
                <div className="flex gap-6 mt-4">
                  <div>
                    <div className="text-3xl font-bold">{pendingTasks.length}</div>
                    <div className="text-sm opacity-80">待完成任務</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{completedTasks.length}</div>
                    <div className="text-sm opacity-80">已完成</div>
                  </div>
                </div>
              </div>
              <div className="absolute right-0 top-0 w-1/2 h-full opacity-10">
                <img
                  src="/hero-dashboard.png"
                  alt="Dashboard"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard
                title="已完成任務"
                value={completedTasks.length}
                icon={CheckCircle2}
                trend={{ value: 12, isPositive: true }}
              />
              <StatsCard
                title="進行中任務"
                value={inProgressTasks.length}
                icon={Clock}
                trend={{ value: 5, isPositive: false }}
              />
              <StatsCard
                title="今日投入時間"
                value="0h"
                icon={TrendingUp}
                trend={{ value: 0, isPositive: true }}
              />
            </div>

            {/* 今日時間分配 - 已註解,改為從真實資料計算 */}
            {tasks.length > 0 && (
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                今日時間分配
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 左側:圓餅圖 */}
                <div className="flex flex-col items-center">
                  <div className="w-full max-w-[280px]">
                    <TodayDonutChart data={timeStatsByPriority} />
                  </div>
                  <div className="mt-4 text-center">
                    <div className="text-2xl font-bold text-primary">0h</div>
                    <div className="text-sm text-muted-foreground">今日總投入</div>
                  </div>
                </div>
                
                {/* 右側:層級明細 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span className="font-medium">1級|營收</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">4.5h</div>
                      <div className="text-xs text-muted-foreground">53%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="font-medium">2級|流量</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">2.5h</div>
                      <div className="text-xs text-muted-foreground">29%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      <span className="font-medium">3級|行政</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">1.0h</div>
                      <div className="text-xs text-muted-foreground">12%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                      <span className="font-medium">日常</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">0.5h</div>
                      <div className="text-xs text-muted-foreground">6%</div>
                    </div>
                  </div>
                  
                  {/* 目標 vs 實際 */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="text-sm font-medium mb-2">目標 vs 實際</div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">1級目標: 60%</span>
                        <span className="font-medium text-amber-600">實際: 53% ↓</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">2級目標: 25%</span>
                        <span className="font-medium text-blue-600">實際: 29% ↑</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* All Tasks */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-bold">所有任務</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {tasks.slice(0, 10).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onCardClick={handleCardClick}
                    />
                  ))}
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="space-y-4">
                <ProgressTracker
                  todayProgress={75}
                  weekProgress={60}
                  monthProgress={45}
                  achievements={[
                    { id: "streak", title: "連續 7 天", description: "連續工作 7 天", icon: "trophy", unlocked: true },
                    { id: "tasks", title: "完成 50 任務", description: "縯計完成 50 個任務", icon: "star", unlocked: true },
                    { id: "ontime", title: "準時達標", description: "所有任務準時完成", icon: "check", unlocked: false },
                  ]}
                />
              </div>
            </div>


          </TabsContent>

          {/* All Tasks Tab */}
          <TabsContent value="all-tasks" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">所有任務列表</h2>
              <p className="text-muted-foreground">
                完成 {completedTasks.length} / {tasks.length} 項任務
              </p>
            </div>

            {/* 任務狀態分頁切換 */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={taskViewMode === "ongoing" ? "default" : "outline"}
                onClick={() => setTaskViewMode("ongoing")}
                className="flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                進行中 ({pendingTasks.length + inProgressTasks.length})
              </Button>
              <Button
                variant={taskViewMode === "completed" ? "default" : "outline"}
                onClick={() => setTaskViewMode("completed")}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                已完成 ({completedTasks.length})
              </Button>
            </div>

            {/* 搜尋框 */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="搜尋任務標題、描述或層級..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full h-10 pl-10 pr-10 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* 任務分類書籤 */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={selectedCategory === "ALL" ? "default" : "outline"}
                onClick={() => setSelectedCategory("ALL")}
                className="flex-1"
              >
                全部
              </Button>
              <Button
                variant={selectedCategory === "LEVEL_1_REVENUE" ? "default" : "outline"}
                onClick={() => setSelectedCategory("LEVEL_1_REVENUE")}
                className="flex-1"
              >
                1級|營收
              </Button>
              <Button
                variant={selectedCategory === "LEVEL_2_TRAFFIC" ? "default" : "outline"}
                onClick={() => setSelectedCategory("LEVEL_2_TRAFFIC")}
                className="flex-1"
              >
                2級|流量
              </Button>
              <Button
                variant={selectedCategory === "LEVEL_3_ADMIN" ? "default" : "outline"}
                onClick={() => setSelectedCategory("LEVEL_3_ADMIN")}
                className="flex-1"
              >
                3級|行政
              </Button>
              <Button
                variant={selectedCategory === "LEVEL_4_DAILY" ? "default" : "outline"}
                onClick={() => setSelectedCategory("LEVEL_4_DAILY")}
                className="flex-1"
              >
                日常
              </Button>
            </div>

            {/* Task Filter */}
            <TaskFilter
              filters={filters}
              onFilterChange={setFilters}
              assignees={uniqueAssignees}
              tasks={categoryFilteredTasks}
            />

            {/* Filtered Tasks */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                任務列表 ({categoryFilteredTasks.length} 項)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {categoryFilteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onCardClick={handleCardClick}
                    showActions={false}
                  />
                ))}
              </div>
              {categoryFilteredTasks.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  沒有符合條件的任務
                </div>
              )}
            </div>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">部門概況</h2>
              <p className="text-muted-foreground">
                共 {departmentsWithStats.length} 個部門
              </p>
            </div>

            {/* Department Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {departmentsWithStats.map((dept) => (
                <DepartmentCard
                  key={dept.id}
                  department={dept}
                  onClick={() => {
                    // TODO: 將來可以實作點擊部門卡片後的行為
                    console.log('點擊部門:', dept.name);
                  }}
                />
              ))}
            </div>
          </TabsContent>

          {/* Execution Mode Tab */}
          <TabsContent value="execution" className="space-y-6">
            <ExecutionMode tasks={tasks} />
          </TabsContent>

        </Tabs>
      </main>

      {/* Dialogs */}
      <TaskDetailDialog
        task={selectedTask}
        open={showTaskDetail}
        onOpenChange={setShowTaskDetail}
      />
      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
}
