/**
 * 量化輸入驗證工具
 * 根據陳宗賢老師理論，拒絕抽象描述，強制量化輸入
 */

import { QuantitativeMetrics } from "@/types/task";

/**
 * 抽象關鍵字列表
 */
const ABSTRACT_KEYWORDS = [
  '盡力', '努力', '大幅', '顯著', '明顯', '積極', '持續',
  '提升', '改善', '優化', '加強', '促進', '推動', '深化',
  '盡快', '盡量', '盡可能', '儘速', '適當', '合理', '妥善',
  '有效', '良好', '優質', '卓越', '完善', '健全', '充分',
];

/**
 * 數字+單位的正則表達式
 */
const QUANTITATIVE_REGEX = /\d+(\.\d+)?\s*(元|萬|億|千|百|個|件|小時|天|週|月|年|人|次|位|名|家|台|套|組|項|筆|單|張|份|本|冊|頁|字|行|篇|章|節|段|條|款|點|項|級|層|階|步|期|輪|回|場|屆|代|批|波|輪|梯|班|組|隊|支|部|處|科|室|股|課|局|署|廳|委|會|中心|站|所|院|館|店|廠|場|園|區|城|市|縣|鄉|鎮|村|里|街|路|巷|弄|號|樓|層)/;

/**
 * 驗證量化輸入是否合法
 */
export function validateQuantitativeInput(input: string): {
  isValid: boolean;
  error?: string;
} {
  // 空輸入視為合法（因為三個欄位是「至少填寫一項」）
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

/**
 * 驗證至少填寫一個量化欄位
 */
export function validateAtLeastOne(
  financial: string,
  quantity: string,
  time: string
): {
  isValid: boolean;
  error?: string;
} {
  const hasFinancial = financial && financial.trim() !== '';
  const hasQuantity = quantity && quantity.trim() !== '';
  const hasTime = time && time.trim() !== '';

  if (!hasFinancial && !hasQuantity && !hasTime) {
    return {
      isValid: false,
      error: '❌ 請至少填寫一項量化貢獻度（金額/數量/時間）',
    };
  }

  return { isValid: true };
}

/**
 * 解析量化輸入，提取數值和單位
 * 使用簡單的正則表達式匹配
 */
export function parseQuantitativeInput(input: string): {
  value: number;
  unit: string;
  description: string;
} | null {
  if (!input || input.trim() === '') {
    return null;
  }

  const trimmedInput = input.trim();

  // 嘗試匹配「數字 + 單位」的格式
  const match = trimmedInput.match(/(\d+(?:\.\d+)?)\s*([^\d\s]+)/);

  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2];
    return {
      value,
      unit,
      description: trimmedInput,
    };
  }

  // 如果無法解析，返回 null
  return null;
}

/**
 * 建立 QuantitativeMetrics 物件
 */
export function buildQuantitativeMetrics(
  financialInput: string,
  quantityInput: string,
  timeInput: string
): QuantitativeMetrics | undefined {
  const financial = parseQuantitativeInput(financialInput);
  const quantity = parseQuantitativeInput(quantityInput);
  const time = parseQuantitativeInput(timeInput);

  // 如果三個欄位都為空，返回 undefined
  if (!financial && !quantity && !time) {
    return undefined;
  }

  const metrics: QuantitativeMetrics = {};

  if (financial) {
    // 根據描述自動判斷類型
    let type: 'revenue' | 'cost_saving' | 'investment' = 'revenue';
    if (financialInput.includes('節省') || financialInput.includes('降低')) {
      type = 'cost_saving';
    } else if (financialInput.includes('投資') || financialInput.includes('投入')) {
      type = 'investment';
    }

    metrics.financial = {
      value: financial.value,
      unit: financial.unit,
      type,
      description: financial.description,
    };
  }

  if (quantity) {
    // 根據描述自動判斷類型
    let type: 'users' | 'customers' | 'products' | 'projects' | 'other' = 'other';
    if (quantityInput.includes('用戶') || quantityInput.includes('使用者')) {
      type = 'users';
    } else if (quantityInput.includes('客戶') || quantityInput.includes('顧客')) {
      type = 'customers';
    } else if (quantityInput.includes('產品') || quantityInput.includes('商品')) {
      type = 'products';
    } else if (quantityInput.includes('專案') || quantityInput.includes('項目')) {
      type = 'projects';
    }

    metrics.quantity = {
      value: quantity.value,
      unit: quantity.unit,
      type,
      description: quantity.description,
    };
  }

  if (time) {
    // 根據描述自動判斷類型
    let type: 'time_saving' | 'process_optimization' | 'efficiency' = 'time_saving';
    if (timeInput.includes('優化') || timeInput.includes('改善')) {
      type = 'process_optimization';
    } else if (timeInput.includes('效率') || timeInput.includes('提升')) {
      type = 'efficiency';
    }

    metrics.time = {
      value: time.value,
      unit: time.unit,
      type,
      description: time.description,
    };
  }

  return metrics;
}
