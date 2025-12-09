# TODO v16: 修復新增任務 aiGeneratedContent 錯誤

## 問題描述
新增任務後點擊任務卡片會出現錯誤:
```
TypeError: task.aiGeneratedContent.outline.map is not a function
```

## 錯誤原因
CreateTaskDialog 建立的新任務缺少 `aiGeneratedContent` 欄位,導致 TaskDetailDialog 嘗試讀取該欄位時出錯。

## 待辦事項

### ✅ 階段 1: 分析錯誤
- [x] 檢查錯誤訊息
- [x] 定位問題根源

### ⏳ 階段 2: 修正 CreateTaskDialog
- [ ] 在 CreateTaskDialog 新增 aiGeneratedContent 欄位
- [ ] 確保 aiGeneratedContent 包含 direction, outline, description 三個子欄位
- [ ] outline 必須是陣列格式

### ⏳ 階段 3: 測試
- [ ] 測試新增任務功能
- [ ] 點擊新增的任務卡片
- [ ] 確認 TaskDetailDialog 正常顯示

### ⏳ 階段 4: 交付
- [ ] 儲存檢查點
- [ ] 交付成果給使用者
