// 清除 localStorage 的腳本
// 在瀏覽器 Console 中執行此腳本

// 清除所有時間記錄
const timeLogKeys = Object.keys(localStorage).filter(k => k.startsWith('timeLog_'));
timeLogKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log(`✅ 已清除: ${key}`);
});

// 清除模擬資料標記
localStorage.removeItem('mockDataInitialized');
console.log('✅ 已清除: mockDataInitialized');

// 清除任務資料
localStorage.removeItem('tasks');
console.log('✅ 已清除: tasks');

// 清除部門資料
localStorage.removeItem('departments');
console.log('✅ 已清除: departments');

// 清除人員資料
localStorage.removeItem('members');
console.log('✅ 已清除: members');

// 清除上傳檔案
const uploadKeys = Object.keys(localStorage).filter(k => k.startsWith('upload_'));
uploadKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log(`✅ 已清除: ${key}`);
});

console.log('🎉 所有模擬資料已清除完畢!');
console.log('📊 剩餘 localStorage 項目:', Object.keys(localStorage).length);
