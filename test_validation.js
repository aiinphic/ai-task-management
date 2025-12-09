// 模擬驗證函數
const ABSTRACT_KEYWORDS = [
  '盡力', '努力', '大幅', '顯著', '明顯', '積極', '持續',
  '提升', '改善', '優化', '加強', '促進', '推動', '深化',
];

function validateQuantitativeInput(input) {
  if (!input || input.trim() === '') {
    return { isValid: true };
  }

  const trimmedInput = input.trim();

  // 先檢查是否包含數字
  if (!/\d/.test(trimmedInput)) {
    return {
      isValid: false,
      error: '❌ 請輸入具體數值（如「50 萬元」、「1000 個用戶」、「10 小時」）',
    };
  }

  // 再檢查是否包含抽象關鍵字
  const hasAbstractKeyword = ABSTRACT_KEYWORDS.some(keyword => trimmedInput.includes(keyword));
  
  if (hasAbstractKeyword) {
    return {
      isValid: false,
      error: '❌ 請避免使用「盡力」、「大幅」、「顯著」等抽象詞彙，請直接輸入具體數值',
    };
  }

  return { isValid: true };
}

// 測試
const testInput = '盡力提升業績';
const result = validateQuantitativeInput(testInput);
console.log('輸入:', testInput);
console.log('驗證結果:', JSON.stringify(result, null, 2));
