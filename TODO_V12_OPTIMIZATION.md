# AI 任務管理系統 v12.0 優化需求

## 📋 需求總覽

### 1. 優化任務卡片視覺
- [ ] 負責人標籤置中顯示
- [ ] 根據層級設定背景漸層色
  - 1級|營收 → 金色漸層 (from-amber-50 to-yellow-100)
  - 2級|流量 → 藍色漸層 (from-blue-50 to-cyan-100)
  - 3級|行政 → 灰色漸層 (from-gray-50 to-slate-100)
  - 4級 → 改名為「無法歸類」,淺灰色漸層 (from-gray-50 to-gray-100)

### 2. 建立待補充事項對話框
- [ ] 建立 SupplementDialog 元件
- [ ] 支援輸入文字
- [ ] 支援上傳圖檔
- [ ] 支援上傳音檔
- [ ] 整合到 TaskDetailDialog 的「補充資料」按鈕

---

## 🎨 任務卡片視覺優化

### 背景漸層色設計

```tsx
const levelGradients = {
  'LEVEL_1_REVENUE': 'bg-gradient-to-br from-amber-50 to-yellow-100',    // 金色
  'LEVEL_2_TRAFFIC': 'bg-gradient-to-br from-blue-50 to-cyan-100',       // 藍色
  'LEVEL_3_ADMIN': 'bg-gradient-to-br from-gray-50 to-slate-100',        // 灰色
  'LEVEL_4_DAILY': 'bg-gradient-to-br from-gray-50 to-gray-100',         // 淺灰色
};

const levelLabels = {
  'LEVEL_1_REVENUE': '1級|營收',
  'LEVEL_2_TRAFFIC': '2級|流量',
  'LEVEL_3_ADMIN': '3級|行政',
  'LEVEL_4_DAILY': '無法歸類',  // ← 改名
};
```

### 負責人標籤置中

```tsx
{/* 下半部:任務標題與負責人 */}
<div className="h-1/2 p-4 flex flex-col justify-center items-center bg-card">
  {/* 任務標題 */}
  <h3 className="font-bold text-base mb-3 line-clamp-2 text-center">
    {task.title}
  </h3>
  
  {/* 負責人標籤(置中) */}
  <Badge variant="secondary">
    {task.assignee.name}
  </Badge>
</div>
```

---

## 💬 待補充事項對話框設計

### 功能需求

1. **文字輸入**
   - 多行文字輸入框(Textarea)
   - 支援長文本輸入

2. **圖檔上傳**
   - 支援格式:jpg, png, gif, webp
   - 顯示上傳預覽
   - 可刪除已上傳圖片

3. **音檔上傳**
   - 支援格式:mp3, wav, m4a
   - 顯示音檔名稱和大小
   - 可刪除已上傳音檔

4. **AI 重新判別**
   - 提交後,AI 分析補充內容
   - 判斷是否需要新增/調整/刪除任務
   - 顯示 AI 分析結果

### UI 設計

```
┌─────────────────────────────────────┐
│ 補充任務資訊                         │
├─────────────────────────────────────┤
│                                     │
│ 文字說明:                           │
│ ┌─────────────────────────────────┐│
│ │                                 ││
│ │ (多行文字輸入框)                ││
│ │                                 ││
│ └─────────────────────────────────┘│
│                                     │
│ 上傳圖片:                           │
│ [選擇圖片] [已上傳: image.jpg ×]   │
│                                     │
│ 上傳音檔:                           │
│ [選擇音檔] [已上傳: audio.mp3 ×]   │
│                                     │
│         [取消]  [提交並分析]        │
└─────────────────────────────────────┘
```

---

## 🔧 技術實作

### 1. 修改 TaskCard 元件

```tsx
export function TaskCard({ task, onStart, onEnd, onCardClick, showActions = false }: TaskCardProps) {
  const symbol = task.symbolId ? getSymbolById(task.symbolId) : null;
  
  const levelGradients = {
    'LEVEL_1_REVENUE': 'bg-gradient-to-br from-amber-50 to-yellow-100',
    'LEVEL_2_TRAFFIC': 'bg-gradient-to-br from-blue-50 to-cyan-100',
    'LEVEL_3_ADMIN': 'bg-gradient-to-br from-gray-50 to-slate-100',
    'LEVEL_4_DAILY': 'bg-gradient-to-br from-gray-50 to-gray-100',
  };
  
  const levelLabels = {
    'LEVEL_1_REVENUE': '1級|營收',
    'LEVEL_2_TRAFFIC': '2級|流量',
    'LEVEL_3_ADMIN': '3級|行政',
    'LEVEL_4_DAILY': '無法歸類',
  };
  
  const levelGradient = task.level ? levelGradients[task.level] : 'bg-gradient-to-br from-gray-50 to-gray-100';
  const levelLabel = task.level ? levelLabels[task.level] : '未分類';

  return (
    <Card className="aspect-square overflow-hidden cursor-pointer hover:shadow-lg">
      {/* 上半部:符號圖示 */}
      <div className={`relative h-1/2 ${levelGradient} flex items-center justify-center`}>
        {/* 分級標籤(右上角) */}
        <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md z-10">
          {levelLabel}
        </div>
        
        {/* 符號圖示 */}
        {symbol && (
          <img 
            src={symbol.iconPath} 
            alt={symbol.name}
            className="w-24 h-24 object-contain"
          />
        )}
      </div>
      
      {/* 下半部:任務標題與負責人 */}
      <div className="h-1/2 p-4 flex flex-col justify-center items-center bg-card">
        {/* 任務標題 */}
        <h3 className="font-bold text-base mb-3 line-clamp-2 text-center">
          {task.title}
        </h3>
        
        {/* 負責人標籤(置中) */}
        <Badge variant="secondary">
          {task.assignee.name}
        </Badge>
      </div>
    </Card>
  );
}
```

### 2. 建立 SupplementDialog 元件

```tsx
// client/src/components/SupplementDialog.tsx

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, X, Image as ImageIcon, Music } from "lucide-react";

interface SupplementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SupplementData) => void;
}

interface SupplementData {
  text: string;
  images: File[];
  audios: File[];
}

export function SupplementDialog({ open, onOpenChange, onSubmit }: SupplementDialogProps) {
  const [text, setText] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [audios, setAudios] = useState<File[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)]);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAudios([...audios, ...Array.from(e.target.files)]);
    }
  };

  const handleSubmit = () => {
    onSubmit({ text, images, audios });
    // 重置表單
    setText("");
    setImages([]);
    setAudios([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>補充任務資訊</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 文字輸入 */}
          <div>
            <Label htmlFor="text">文字說明</Label>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="請輸入補充說明..."
              rows={6}
              className="mt-2"
            />
          </div>

          {/* 圖片上傳 */}
          <div>
            <Label>上傳圖片</Label>
            <div className="mt-2 space-y-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
                className="w-full"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                選擇圖片
              </Button>
              {images.length > 0 && (
                <div className="space-y-1">
                  {images.map((img, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 truncate">{img.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 音檔上傳 */}
          <div>
            <Label>上傳音檔</Label>
            <div className="mt-2 space-y-2">
              <Input
                type="file"
                accept="audio/*"
                multiple
                onChange={handleAudioUpload}
                className="hidden"
                id="audio-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('audio-upload')?.click()}
                className="w-full"
              >
                <Music className="w-4 h-4 mr-2" />
                選擇音檔
              </Button>
              {audios.length > 0 && (
                <div className="space-y-1">
                  {audios.map((audio, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 truncate">{audio.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setAudios(audios.filter((_, i) => i !== idx))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            提交並分析
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 3. 整合到 TaskDetailDialog

```tsx
// 在 TaskDetailDialog 中新增 state
const [showSupplementDialog, setShowSupplementDialog] = useState(false);

// 處理補充資料提交
const handleSupplementSubmit = (data: SupplementData) => {
  console.log('補充資料:', data);
  // TODO: 將資料發送給 AI 進行分析
  // TODO: 根據 AI 分析結果更新任務或新增任務
};

// 修改「補充資料」按鈕
<Button 
  variant="outline" 
  size="sm" 
  className="mt-3"
  onClick={() => setShowSupplementDialog(true)}
>
  補充資料
</Button>

// 在 Dialog 外層新增 SupplementDialog
<SupplementDialog
  open={showSupplementDialog}
  onOpenChange={setShowSupplementDialog}
  onSubmit={handleSupplementSubmit}
/>
```

---

## ✅ 驗收標準

### 1. 任務卡片視覺
- ✅ 負責人標籤置中顯示
- ✅ 1級|營收顯示金色漸層背景
- ✅ 2級|流量顯示藍色漸層背景
- ✅ 3級|行政顯示灰色漸層背景
- ✅ 4級改名為「無法歸類」,顯示淺灰色漸層背景

### 2. 待補充事項對話框
- ✅ 點擊「補充資料」按鈕開啟對話框
- ✅ 可輸入多行文字
- ✅ 可上傳圖片並預覽
- ✅ 可上傳音檔並顯示檔名
- ✅ 可刪除已上傳的檔案
- ✅ 提交後關閉對話框

---

## 🔧 實作步驟

1. **Phase 2: 優化任務卡片視覺**
   - 修改 TaskCard 元件
   - 新增層級背景漸層色
   - 修改 4級標籤名稱為「無法歸類」
   - 負責人標籤置中

2. **Phase 3: 建立待補充事項對話框元件**
   - 建立 SupplementDialog.tsx
   - 實作文字輸入功能
   - 實作圖片上傳功能
   - 實作音檔上傳功能

3. **Phase 4: 整合對話框到 TaskDetailDialog**
   - 在 TaskDetailDialog 新增 state
   - 修改「補充資料」按鈕點擊事件
   - 處理補充資料提交邏輯

4. **Phase 5: 測試所有功能**
   - 測試任務卡片視覺
   - 測試對話框開啟/關閉
   - 測試檔案上傳/刪除
   - 儲存檢查點

5. **Phase 6: 交付成果**
   - 提供檢查點連結
   - 說明優化內容
   - 建議後續開發方向
