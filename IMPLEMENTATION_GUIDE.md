# AI 學習型任務管理系統 - 實作指南

建立日期: 2025-11-27  
版本: v1.0

---

## 📋 文件概覽

本實作指南提供完整的技術實作細節,包括:
1. 技術架構選型
2. 資料庫遷移腳本
3. API 設計規範
4. 前端整合方案
5. AI 服務整合
6. 部署與維運

---

## 🏗️ 技術架構

### 系統架構圖

```
┌─────────────────────────────────────────────────────────┐
│                      前端應用層                          │
│  React 19 + TypeScript + Tailwind CSS + shadcn/ui      │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API / GraphQL
┌──────────────────────┴──────────────────────────────────┐
│                     後端服務層                           │
│  Node.js + Express / Fastify + TypeScript               │
├─────────────────────────────────────────────────────────┤
│  ├─ 任務管理服務 (Task Service)                         │
│  ├─ 模板服務 (Template Service)                         │
│  ├─ AI 分析服務 (AI Analysis Service)                   │
│  ├─ 事件追蹤服務 (Event Tracking Service)               │
│  └─ 通知服務 (Notification Service)                     │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│                     資料層                               │
├─────────────────────────────────────────────────────────┤
│  PostgreSQL (主資料庫)                                   │
│  ├─ tasks, task_events, task_issues                     │
│  ├─ task_templates, template_usage_logs                 │
│  └─ company_culture_features, ai_learning_logs          │
├─────────────────────────────────────────────────────────┤
│  Redis (快取 & 佇列)                                     │
│  ├─ 任務快取                                             │
│  ├─ 使用者 Session                                       │
│  └─ 背景任務佇列                                         │
└─────────────────────────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│                   外部服務                               │
├─────────────────────────────────────────────────────────┤
│  OpenAI GPT-4 API (AI 分析)                             │
│  S3 / MinIO (檔案儲存)                                   │
│  SendGrid / AWS SES (郵件通知)                          │
│  Slack API (即時通知)                                    │
└─────────────────────────────────────────────────────────┘
```

### 技術選型

| 層級 | 技術 | 理由 |
|------|------|------|
| 前端框架 | React 19 | 現代化、生態完善、效能優異 |
| 前端語言 | TypeScript | 型別安全、開發效率高 |
| UI 框架 | Tailwind CSS + shadcn/ui | 快速開發、一致性高 |
| 後端框架 | Node.js + Fastify | 高效能、TypeScript 友好 |
| 資料庫 | PostgreSQL 14+ | 成熟穩定、支援 JSONB、效能優異 |
| 快取 | Redis 7+ | 高效能、支援多種資料結構 |
| AI 服務 | OpenAI GPT-4 | 強大的 NLP 能力、API 友好 |
| 檔案儲存 | S3 / MinIO | 可擴展、成本效益高 |
| 佇列 | BullMQ | 可靠、支援優先級、易於監控 |

---

## 🗄️ 資料庫實作

### 1. 資料庫初始化

```sql
-- 建立資料庫
CREATE DATABASE task_management_ai;

-- 啟用擴充功能
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- 用於文字相似度搜尋
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- 用於 JSONB 索引優化
```

### 2. 建立資料表

```sql
-- 使用者表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar VARCHAR(500),
  department_id UUID REFERENCES departments(id),
  role VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 部門表
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 任務表
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
  
  -- 分類
  category VARCHAR(50),
  symbol_id VARCHAR(50),
  
  -- 人員
  assignee_id UUID REFERENCES users(id) NOT NULL,
  department_id UUID REFERENCES departments(id),
  
  -- 時間
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  deadline TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  -- 優先級評分
  priority_score INTEGER,
  
  -- AI 分析
  ai_analysis JSONB,
  
  -- 模板
  template_id UUID REFERENCES task_templates(id),
  is_from_template BOOLEAN DEFAULT FALSE,
  
  -- 品質
  quality VARCHAR(20) CHECK (quality IN ('excellent', 'good', 'acceptable', 'poor')),
  
  -- 版本
  version INTEGER DEFAULT 1,
  parent_task_id UUID REFERENCES tasks(id)
);

-- 任務事件表
CREATE TABLE task_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) NOT NULL ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES users(id),
  user_role VARCHAR(50),
  event_data JSONB NOT NULL,
  before_state JSONB,
  after_state JSONB,
  context JSONB
);

-- 任務問題表
CREATE TABLE task_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) NOT NULL ON DELETE CASCADE,
  issue_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  root_cause TEXT,
  category VARCHAR(50),
  impact_description TEXT,
  time_wasted_minutes INTEGER DEFAULT 0,
  solution TEXT,
  prevention_measures TEXT,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  reported_by UUID REFERENCES users(id),
  resolved_by UUID REFERENCES users(id),
  reported_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  is_recurring BOOLEAN DEFAULT FALSE,
  similar_issues UUID[],
  ai_prevention_score FLOAT
);

-- 任務模板表
CREATE TABLE task_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(50),
  template_data JSONB NOT NULL,
  generation_method VARCHAR(20) NOT NULL CHECK (generation_method IN ('manual', 'ai_generated', 'ai_learned')),
  source_task_ids UUID[],
  learning_iteration INTEGER DEFAULT 1,
  confidence_score FLOAT,
  usage_count INTEGER DEFAULT 0,
  success_rate FLOAT,
  avg_completion_time INTEGER,
  culture_fit_score FLOAT,
  culture_features JSONB,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  is_public BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  parent_template_id UUID REFERENCES task_templates(id)
);

-- 模板使用記錄表
CREATE TABLE template_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES task_templates(id) NOT NULL,
  task_id UUID REFERENCES tasks(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  department_id UUID REFERENCES departments(id),
  used_at TIMESTAMP DEFAULT NOW(),
  modifications JSONB,
  modification_count INTEGER DEFAULT 0,
  task_completed BOOLEAN,
  completion_time_minutes INTEGER,
  actual_vs_estimated_ratio FLOAT,
  issues_encountered INTEGER DEFAULT 0,
  issue_ids UUID[],
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  user_feedback TEXT,
  would_use_again BOOLEAN,
  is_successful BOOLEAN,
  learning_value_score FLOAT
);

-- 公司文化特徵表
CREATE TABLE company_culture_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_name VARCHAR(100) NOT NULL,
  feature_type VARCHAR(50) NOT NULL,
  description TEXT,
  examples TEXT[],
  feature_value JSONB NOT NULL,
  learned_from VARCHAR(50),
  confidence_score FLOAT,
  applicable_departments VARCHAR(50)[],
  applicable_task_types VARCHAR(50)[],
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- AI 學習記錄表
CREATE TABLE ai_learning_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learning_type VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  input_data JSONB NOT NULL,
  output_data JSONB NOT NULL,
  model_version VARCHAR(50),
  algorithm VARCHAR(50),
  accuracy FLOAT,
  precision FLOAT,
  recall FLOAT,
  f1_score FLOAT,
  insights JSONB,
  recommendations JSONB,
  applied_to_template_ids UUID[],
  applied_to_feature_ids UUID[]
);

-- 協作者關聯表
CREATE TABLE task_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) NOT NULL ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) NOT NULL,
  role VARCHAR(50),
  added_at TIMESTAMP DEFAULT NOW(),
  added_by UUID REFERENCES users(id)
);

-- 子任務表
CREATE TABLE subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) NOT NULL ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  estimated_time INTEGER,
  actual_time INTEGER,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  order_index INTEGER,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  action_logs JSONB
);
```

### 3. 建立索引

```sql
-- 任務表索引
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_department ON tasks(department_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_template ON tasks(template_id);
CREATE INDEX idx_tasks_priority_score ON tasks(priority_score DESC);

-- 任務事件表索引
CREATE INDEX idx_task_events_task_id ON task_events(task_id);
CREATE INDEX idx_task_events_type ON task_events(event_type);
CREATE INDEX idx_task_events_timestamp ON task_events(timestamp DESC);
CREATE INDEX idx_task_events_user ON task_events(user_id);

-- 任務問題表索引
CREATE INDEX idx_task_issues_task_id ON task_issues(task_id);
CREATE INDEX idx_task_issues_type ON task_issues(issue_type);
CREATE INDEX idx_task_issues_severity ON task_issues(severity);
CREATE INDEX idx_task_issues_status ON task_issues(status);
CREATE INDEX idx_task_issues_category ON task_issues(category);
CREATE INDEX idx_task_issues_recurring ON task_issues(is_recurring) WHERE is_recurring = true;

-- 模板表索引
CREATE INDEX idx_task_templates_category ON task_templates(category);
CREATE INDEX idx_task_templates_status ON task_templates(status);
CREATE INDEX idx_task_templates_confidence ON task_templates(confidence_score DESC);
CREATE INDEX idx_task_templates_usage ON task_templates(usage_count DESC);

-- 模板使用記錄索引
CREATE INDEX idx_template_usage_template_id ON template_usage_logs(template_id);
CREATE INDEX idx_template_usage_task_id ON template_usage_logs(task_id);
CREATE INDEX idx_template_usage_user_id ON template_usage_logs(user_id);
CREATE INDEX idx_template_usage_used_at ON template_usage_logs(used_at DESC);

-- JSONB 欄位索引 (GIN)
CREATE INDEX idx_tasks_ai_analysis ON tasks USING GIN (ai_analysis);
CREATE INDEX idx_task_events_event_data ON task_events USING GIN (event_data);
CREATE INDEX idx_task_templates_template_data ON task_templates USING GIN (template_data);

-- 全文搜尋索引
CREATE INDEX idx_tasks_title_trgm ON tasks USING GIN (title gin_trgm_ops);
CREATE INDEX idx_tasks_description_trgm ON tasks USING GIN (description gin_trgm_ops);
```

### 4. 建立觸發器

```sql
-- 自動更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_templates_updated_at
  BEFORE UPDATE ON task_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 自動更新模板使用次數
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE task_templates
  SET usage_count = usage_count + 1
  WHERE id = NEW.template_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_template_usage_trigger
  AFTER INSERT ON template_usage_logs
  FOR EACH ROW
  EXECUTE FUNCTION increment_template_usage();
```

---

## 🔌 API 設計

### RESTful API 端點

#### 任務管理 API

```typescript
// 建立任務
POST /api/tasks
Request Body:
{
  "input": {
    "method": "text" | "file" | "audio",
    "content": string,
    "files"?: File[]
  },
  "assigneeId": string,
  "collaboratorIds": string[],
  "templateId"?: string
}
Response:
{
  "task": Task,
  "aiAnalysis": AIAnalysisResult,
  "suggestedTemplate"?: TemplateRecommendation[]
}

// 取得任務列表
GET /api/tasks?status=pending&assignee=user-123&department=sales
Response:
{
  "tasks": Task[],
  "total": number,
  "page": number,
  "pageSize": number
}

// 取得任務詳情
GET /api/tasks/:taskId
Response:
{
  "task": Task,
  "events": TaskEvent[],
  "issues": TaskIssue[],
  "subtasks": Subtask[],
  "collaborators": User[]
}

// 更新任務
PATCH /api/tasks/:taskId
Request Body:
{
  "title"?: string,
  "description"?: string,
  "status"?: TaskStatus,
  "priority"?: TaskPriority,
  // ... 其他欄位
}

// 開始任務
POST /api/tasks/:taskId/start
Response:
{
  "task": Task,
  "event": TaskEvent
}

// 完成任務
POST /api/tasks/:taskId/complete
Request Body:
{
  "quality": "excellent" | "good" | "acceptable" | "poor",
  "deliverables": Deliverable[],
  "notes"?: string
}

// 回報問題
POST /api/tasks/:taskId/issues
Request Body:
{
  "issueType": string,
  "severity": "low" | "medium" | "high" | "critical",
  "title": string,
  "description": string,
  "timeWasted": number
}
```

#### 模板管理 API

```typescript
// 搜尋模板
GET /api/templates?category=financial_report&status=active
Response:
{
  "templates": TaskTemplate[],
  "total": number
}

// 取得模板詳情
GET /api/templates/:templateId
Response:
{
  "template": TaskTemplate,
  "usageStats": TemplateUsageStats,
  "analytics": TemplateAnalytics
}

// 建立模板
POST /api/templates
Request Body:
{
  "name": string,
  "category": string,
  "templateData": TemplateData,
  "generationMethod": "manual" | "ai_generated"
}

// 從任務生成模板
POST /api/templates/generate-from-task
Request Body:
{
  "taskId": string,
  "name": string,
  "description": string
}

// 推薦模板
POST /api/templates/recommend
Request Body:
{
  "taskInput": {
    "description": string,
    "category"?: string
  },
  "userId": string
}
Response:
{
  "recommendations": TemplateRecommendation[]
}

// 模板回饋
POST /api/templates/:templateId/feedback
Request Body:
{
  "taskId": string,
  "rating": number,
  "feedback": string,
  "wouldUseAgain": boolean
}
```

#### AI 分析 API

```typescript
// 分析任務輸入
POST /api/ai/analyze-task
Request Body:
{
  "input": string,
  "context"?: {
    "department": string,
    "userId": string
  }
}
Response:
{
  "analysis": AIAnalysisResult,
  "confidence": number
}

// 預測潛在問題
POST /api/ai/predict-issues
Request Body:
{
  "taskId": string
}
Response:
{
  "warnings": Warning[],
  "recommendations": string[]
}

// 學習公司文化
POST /api/ai/learn-culture
Response:
{
  "cultureProfile": CompanyCultureProfile,
  "learningStats": LearningStats
}

// 優化模板
POST /api/ai/optimize-template
Request Body:
{
  "templateId": string
}
Response:
{
  "optimizationResult": TemplateOptimization,
  "newTemplateId"?: string
}
```

---

## 💻 前端整合

### 1. API 客戶端設定

```typescript
// src/lib/api-client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 回應攔截器
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // 處理未授權
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 2. 任務服務

```typescript
// src/services/taskService.ts
import apiClient from '@/lib/api-client';
import type { Task, CreateTaskInput, TaskEvent } from '@/types/task';

export const taskService = {
  // 建立任務
  async createTask(input: CreateTaskInput): Promise<{
    task: Task;
    aiAnalysis: any;
    suggestedTemplates?: any[];
  }> {
    return await apiClient.post('/tasks', input);
  },

  // 取得任務列表
  async getTasks(params?: {
    status?: string;
    assignee?: string;
    department?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{
    tasks: Task[];
    total: number;
  }> {
    return await apiClient.get('/tasks', { params });
  },

  // 取得任務詳情
  async getTask(taskId: string): Promise<{
    task: Task;
    events: TaskEvent[];
    issues: any[];
    subtasks: any[];
  }> {
    return await apiClient.get(`/tasks/${taskId}`);
  },

  // 更新任務
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    return await apiClient.patch(`/tasks/${taskId}`, updates);
  },

  // 開始任務
  async startTask(taskId: string): Promise<Task> {
    return await apiClient.post(`/tasks/${taskId}/start`);
  },

  // 完成任務
  async completeTask(taskId: string, data: {
    quality: string;
    deliverables: any[];
    notes?: string;
  }): Promise<Task> {
    return await apiClient.post(`/tasks/${taskId}/complete`, data);
  },

  // 回報問題
  async reportIssue(taskId: string, issue: {
    issueType: string;
    severity: string;
    title: string;
    description: string;
    timeWasted: number;
  }): Promise<any> {
    return await apiClient.post(`/tasks/${taskId}/issues`, issue);
  },
};
```

### 3. 模板服務

```typescript
// src/services/templateService.ts
import apiClient from '@/lib/api-client';
import type { TaskTemplate } from '@/types/template';

export const templateService = {
  // 搜尋模板
  async searchTemplates(params?: {
    category?: string;
    status?: string;
  }): Promise<{
    templates: TaskTemplate[];
    total: number;
  }> {
    return await apiClient.get('/templates', { params });
  },

  // 取得模板詳情
  async getTemplate(templateId: string): Promise<{
    template: TaskTemplate;
    usageStats: any;
    analytics: any;
  }> {
    return await apiClient.get(`/templates/${templateId}`);
  },

  // 推薦模板
  async recommendTemplates(input: {
    taskInput: {
      description: string;
      category?: string;
    };
    userId: string;
  }): Promise<{
    recommendations: any[];
  }> {
    return await apiClient.post('/templates/recommend', input);
  },

  // 提交回饋
  async submitFeedback(templateId: string, feedback: {
    taskId: string;
    rating: number;
    feedback: string;
    wouldUseAgain: boolean;
  }): Promise<void> {
    return await apiClient.post(`/templates/${templateId}/feedback`, feedback);
  },
};
```

### 4. React Hooks

```typescript
// src/hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/taskService';
import type { Task, CreateTaskInput } from '@/types/task';

export function useTasks(params?: any) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => taskService.getTasks(params),
  });
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: () => taskService.getTask(taskId),
    enabled: !!taskId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateTaskInput) => taskService.createTask(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) =>
      taskService.updateTask(taskId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useStartTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) => taskService.startTask(taskId),
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
```

---

## 🤖 AI 服務整合

### OpenAI GPT-4 整合

```typescript
// server/services/aiService.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AIService {
  // 分析任務輸入
  async analyzeTaskInput(input: string, context?: any): Promise<AIAnalysisResult> {
    const prompt = `
你是一個專業的任務管理助手。請分析以下任務描述,並提供結構化的分析結果。

任務描述: ${input}

${context ? `上下文資訊:\n- 部門: ${context.department}\n- 使用者: ${context.userName}` : ''}

請以 JSON 格式返回以下資訊:
{
  "taskType": {
    "category": "任務類型(例如:財務報告/客戶會議/產品開發)",
    "subcategory": "子類型",
    "confidence": 0.0-1.0
  },
  "extractedInfo": {
    "title": "簡短直覺的任務標題",
    "description": "詳細描述",
    "priority": "high/medium/low",
    "estimatedMinutes": 預估時間(分鐘),
    "deadline": "截止日期(ISO 8601格式,如果有提到)",
    "suggestedSubtasks": [
      {
        "title": "子任務標題",
        "estimatedTime": 預估時間(分鐘),
        "order": 順序
      }
    ]
  },
  "reasoning": "分析推理過程"
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '你是一個專業的任務管理 AI 助手,擅長分析任務需求並提供結構化建議。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return result;
  }

  // 預測潛在問題
  async predictIssues(task: Task, historicalIssues: TaskIssue[]): Promise<Warning[]> {
    const prompt = `
分析以下任務,根據歷史問題預測可能遇到的問題。

當前任務:
- 標題: ${task.title}
- 類型: ${task.category}
- 預估時間: ${task.estimatedMinutes} 分鐘
- 截止日期: ${task.deadline}

歷史相似任務常見問題:
${historicalIssues.map(issue => `- ${issue.title} (發生率: ${issue.frequency})`).join('\n')}

請以 JSON 格式返回預測的問題和建議:
{
  "warnings": [
    {
      "type": "問題類型",
      "severity": "low/medium/high/critical",
      "message": "警告訊息",
      "probability": 0.0-1.0,
      "preventionMeasures": ["預防措施1", "預防措施2"]
    }
  ]
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '你是一個專業的風險分析師,擅長預測任務執行中可能遇到的問題。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return result.warnings;
  }

  // 生成模板描述
  async generateTemplateDescription(
    category: string,
    patterns: TaskStructurePattern
  ): Promise<string> {
    const prompt = `
根據以下任務模式,生成一個專業的模板描述。

任務類型: ${category}

模式分析:
- 平均完成時間: ${patterns.timePattern.avgTotalTime} 分鐘
- 常見子任務: ${patterns.commonSubtasks.map(st => st.title).join(', ')}
- 典型團隊規模: ${patterns.collaborationPattern.avgTeamSize} 人
- 跨部門協作率: ${(patterns.collaborationPattern.crossDepartmentRate * 100).toFixed(0)}%

請生成一段 2-3 句的專業描述,說明此模板適用的場景和特點。
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    return response.choices[0].message.content!.trim();
  }
}
```

---

## 🚀 部署指南

### Docker 部署

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# 安裝依賴
COPY package*.json ./
RUN npm ci

# 複製原始碼
COPY . .

# 建置
RUN npm run build

# 生產環境
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3001

CMD ["node", "dist/server/index.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: task_management_ai
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  app:
    build: .
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/task_management_ai
      REDIS_URL: redis://redis:6379
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      NODE_ENV: production
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
  redis_data:
```

### 環境變數

```bash
# .env.production
# 資料庫
DATABASE_URL=postgresql://user:password@localhost:5432/task_management_ai
REDIS_URL=redis://localhost:6379

# OpenAI
OPENAI_API_KEY=sk-...

# JWT
JWT_SECRET=your-secret-key

# S3 / MinIO
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=task-management-files
S3_ACCESS_KEY=...
S3_SECRET_KEY=...

# 郵件
SENDGRID_API_KEY=...
EMAIL_FROM=noreply@yourdomain.com

# Slack
SLACK_WEBHOOK_URL=...

# 應用程式
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com
```

---

## 📊 監控與維運

### 效能監控

```typescript
// server/middleware/monitoring.ts
import { performance } from 'perf_hooks';

export function performanceMonitoring(req, res, next) {
  const start = performance.now();
  
  res.on('finish', () => {
    const duration = performance.now() - start;
    
    // 記錄慢請求
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.path} - ${duration.toFixed(2)}ms`);
    }
    
    // 發送到監控系統
    metrics.recordHttpRequest({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
    });
  });
  
  next();
}
```

### 錯誤追蹤

```typescript
// server/middleware/errorHandler.ts
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  // 發送到錯誤追蹤服務 (例如 Sentry)
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }
  
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}
```

---

## ✅ 實作檢查清單

### 階段 1: 基礎建設
- [ ] 建立 PostgreSQL 資料庫
- [ ] 執行資料庫遷移腳本
- [ ] 設定 Redis
- [ ] 建立基礎 API 架構
- [ ] 實作使用者認證

### 階段 2: 核心功能
- [ ] 實作任務 CRUD API
- [ ] 實作事件記錄系統
- [ ] 實作問題回報功能
- [ ] 整合前端任務管理介面

### 階段 3: AI 整合
- [ ] 整合 OpenAI API
- [ ] 實作任務分析功能
- [ ] 實作問題預測功能
- [ ] 建立 AI 學習記錄

### 階段 4: 模板系統
- [ ] 實作模板 CRUD
- [ ] 實作模板生成演算法
- [ ] 實作模板推薦系統
- [ ] 建立模板使用追蹤

### 階段 5: 持續優化
- [ ] 實作自動優化機制
- [ ] 建立監控儀表板
- [ ] 實作 A/B 測試
- [ ] 完善文件與測試

---

**總結**: 本實作指南提供完整的技術細節,從資料庫設計到 API 實作、前端整合到 AI 服務,涵蓋所有關鍵環節。按照此指南循序漸進,即可建立一個功能完整、可擴展的 AI 學習型任務管理系統。
