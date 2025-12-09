/**
 * 任務符號字典檔
 * 基於交通標誌設計原則的符號系統
 */

export interface TaskSymbol {
  id: string;
  name: string;
  category: 'revenue' | 'traffic' | 'admin';
  description: string;
  keywords: string[];
  iconPath: string; // 符號圖形檔案路徑
  color: string; // 主色調
  shape: 'circle' | 'diamond' | 'square';
}

/**
 * 一級 | 營收符號(金色圓形系列)
 */
const revenueSymbols: TaskSymbol[] = [
  {
    id: 'direct-sales',
    name: '直接銷售',
    category: 'revenue',
    description: '金色圓形 + 白色錢幣符號',
    keywords: ['銷售', '賣', '業績', '成交', '訂單'],
    iconPath: '/symbols/revenue/direct-sales.png',
    color: '#FF8C00',
    shape: 'circle',
  },
  {
    id: 'client-visit',
    name: '客戶拜訪',
    category: 'revenue',
    description: '金色圓形 + 白色握手圖案',
    keywords: ['客戶', '拜訪', '會面', '洽談', '商談'],
    iconPath: '/symbols/revenue/client-visit.png',
    color: '#FF8C00',
    shape: 'circle',
  },
  {
    id: 'contract-signing',
    name: '簽約成交',
    category: 'revenue',
    description: '金色圓形 + 白色簽名筆',
    keywords: ['簽約', '合約', '協議', '成交', '簽署'],
    iconPath: '/symbols/revenue/contract-signing.png',
    color: '#FF8C00',
    shape: 'circle',
  },
  {
    id: 'product-demo',
    name: '產品展示',
    category: 'revenue',
    description: '金色圓形 + 白色禮物盒',
    keywords: ['展示', '產品', '示範', '介紹', '呈現'],
    iconPath: '/symbols/revenue/product-demo.png',
    color: '#FF8C00',
    shape: 'circle',
  },
  {
    id: 'quotation',
    name: '報價提案',
    category: 'revenue',
    description: '金色圓形 + 白色文件+錢幣',
    keywords: ['報價', '提案', '估價', '價格', '方案'],
    iconPath: '/symbols/revenue/quotation.png',
    color: '#FF8C00',
    shape: 'circle',
  },
  {
    id: 'order-processing',
    name: '訂單處理',
    category: 'revenue',
    description: '金色圓形 + 白色購物車',
    keywords: ['訂單', '處理', '下單', '購買', '採購'],
    iconPath: '/symbols/revenue/order-processing.png',
    color: '#FF8C00',
    shape: 'circle',
  },
  {
    id: 'payment-collection',
    name: '收款催款',
    category: 'revenue',
    description: '金色圓形 + 白色時鐘+錢幣',
    keywords: ['收款', '催款', '付款', '帳款', '應收'],
    iconPath: '/symbols/revenue/payment-collection.png',
    color: '#FF8C00',
    shape: 'circle',
  },
  {
    id: 'contract-review',
    name: '合約審核',
    category: 'revenue',
    description: '金色圓形 + 白色放大鏡+文件',
    keywords: ['審核', '合約', '檢查', '確認', '核對'],
    iconPath: '/symbols/revenue/contract-review.png',
    color: '#FF8C00',
    shape: 'circle',
  },
  {
    id: 'pricing-strategy',
    name: '定價策略',
    category: 'revenue',
    description: '金色圓形 + 白色標籤+錢幣',
    keywords: ['定價', '價格', '策略', '訂價', '成本'],
    iconPath: '/symbols/revenue/pricing-strategy.png',
    color: '#FF8C00',
    shape: 'circle',
  },
  {
    id: 'revenue-analysis',
    name: '營收分析',
    category: 'revenue',
    description: '金色圓形 + 白色上升圖表',
    keywords: ['營收', '分析', '財務', '收入', '獲利'],
    iconPath: '/symbols/revenue/revenue-analysis.png',
    color: '#FF8C00',
    shape: 'circle',
  },
];

/**
 * 二級 | 流量符號(藍色菱形系列)
 */
const trafficSymbols: TaskSymbol[] = [
  {
    id: 'seo-optimization',
    name: 'SEO 優化',
    category: 'traffic',
    description: '藍色菱形 + 白色放大鏡',
    keywords: ['SEO', '搜尋', '優化', '排名', '關鍵字'],
    iconPath: '/symbols/traffic/seo-optimization.png',
    color: '#1E90FF',
    shape: 'diamond',
  },
  {
    id: 'social-media',
    name: '社群經營',
    category: 'traffic',
    description: '藍色菱形 + 白色人群圖案',
    keywords: ['社群', '粉絲', '社交', '互動', '社團'],
    iconPath: '/symbols/traffic/social-media.png',
    color: '#1E90FF',
    shape: 'diamond',
  },
  {
    id: 'content-writing',
    name: '內容撰寫',
    category: 'traffic',
    description: '藍色菱形 + 白色筆+紙',
    keywords: ['內容', '撰寫', '文章', '寫作', '編輯'],
    iconPath: '/symbols/traffic/content-writing.png',
    color: '#1E90FF',
    shape: 'diamond',
  },
  {
    id: 'advertising',
    name: '廣告投放',
    category: 'traffic',
    description: '藍色菱形 + 白色擴音器',
    keywords: ['廣告', '投放', '行銷', '推廣', '宣傳'],
    iconPath: '/symbols/traffic/advertising.png',
    color: '#1E90FF',
    shape: 'diamond',
  },
  {
    id: 'data-analysis',
    name: '數據分析',
    category: 'traffic',
    description: '藍色菱形 + 白色圖表',
    keywords: ['數據', '分析', '統計', '報表', '指標'],
    iconPath: '/symbols/traffic/data-analysis.png',
    color: '#1E90FF',
    shape: 'diamond',
  },
  {
    id: 'website-optimization',
    name: '網站優化',
    category: 'traffic',
    description: '藍色菱形 + 白色電腦螢幕',
    keywords: ['網站', '優化', '改善', '速度', '體驗'],
    iconPath: '/symbols/traffic/website-optimization.png',
    color: '#1E90FF',
    shape: 'diamond',
  },
  {
    id: 'email-marketing',
    name: '電郵行銷',
    category: 'traffic',
    description: '藍色菱形 + 白色信封',
    keywords: ['電郵', '郵件', 'EDM', '信件', '通知'],
    iconPath: '/symbols/traffic/email-marketing.png',
    color: '#1E90FF',
    shape: 'diamond',
  },
  {
    id: 'video-production',
    name: '影片製作',
    category: 'traffic',
    description: '藍色菱形 + 白色播放按鈕',
    keywords: ['影片', '視頻', '拍攝', '剪輯', '製作'],
    iconPath: '/symbols/traffic/video-production.png',
    color: '#1E90FF',
    shape: 'diamond',
  },
  {
    id: 'event-planning',
    name: '活動企劃',
    category: 'traffic',
    description: '藍色菱形 + 白色日曆+星星',
    keywords: ['活動', '企劃', '策劃', '規劃', '舉辦'],
    iconPath: '/symbols/traffic/event-planning.png',
    color: '#1E90FF',
    shape: 'diamond',
  },
  {
    id: 'traffic-monitoring',
    name: '流量監控',
    category: 'traffic',
    description: '藍色菱形 + 白色儀表板',
    keywords: ['流量', '監控', '追蹤', '觀察', '檢視'],
    iconPath: '/symbols/traffic/traffic-monitoring.png',
    color: '#1E90FF',
    shape: 'diamond',
  },
];

/**
 * 三級 | 行政符號(灰色方形系列)
 */
const adminSymbols: TaskSymbol[] = [
  {
    id: 'document-review',
    name: '文件審核',
    category: 'admin',
    description: '灰色方形 + 白色勾選+文件',
    keywords: ['審核', '文件', '檢查', '核准', '批准'],
    iconPath: '/symbols/admin/document-review.png',
    color: '#708090',
    shape: 'square',
  },
  {
    id: 'weekly-report',
    name: '週報月報',
    category: 'admin',
    description: '灰色方形 + 白色日曆',
    keywords: ['週報', '月報', '報告', '彙報', '總結'],
    iconPath: '/symbols/admin/weekly-report.png',
    color: '#708090',
    shape: 'square',
  },
  {
    id: 'process-optimization',
    name: '流程優化',
    category: 'admin',
    description: '灰色方形 + 白色齒輪',
    keywords: ['流程', '優化', '改善', '精進', '提升'],
    iconPath: '/symbols/admin/process-optimization.png',
    color: '#708090',
    shape: 'square',
  },
  {
    id: 'meeting-scheduling',
    name: '會議安排',
    category: 'admin',
    description: '灰色方形 + 白色時鐘+人',
    keywords: ['會議', '安排', '排程', '預約', '協調'],
    iconPath: '/symbols/admin/meeting-scheduling.png',
    color: '#708090',
    shape: 'square',
  },
  {
    id: 'data-organization',
    name: '資料整理',
    category: 'admin',
    description: '灰色方形 + 白色資料夾',
    keywords: ['資料', '整理', '歸檔', '分類', '彙整'],
    iconPath: '/symbols/admin/data-organization.png',
    color: '#708090',
    shape: 'square',
  },
  {
    id: 'system-maintenance',
    name: '系統維護',
    category: 'admin',
    description: '灰色方形 + 白色扳手',
    keywords: ['系統', '維護', '保養', '修復', '更新'],
    iconPath: '/symbols/admin/system-maintenance.png',
    color: '#708090',
    shape: 'square',
  },
  {
    id: 'hr-management',
    name: '人事管理',
    category: 'admin',
    description: '灰色方形 + 白色人員卡',
    keywords: ['人事', '管理', '員工', '人力', '招聘'],
    iconPath: '/symbols/admin/hr-management.png',
    color: '#708090',
    shape: 'square',
  },
  {
    id: 'budget-planning',
    name: '預算編列',
    category: 'admin',
    description: '灰色方形 + 白色計算機',
    keywords: ['預算', '編列', '規劃', '財務', '經費'],
    iconPath: '/symbols/admin/budget-planning.png',
    color: '#708090',
    shape: 'square',
  },
  {
    id: 'compliance-check',
    name: '合規檢查',
    category: 'admin',
    description: '灰色方形 + 白色盾牌+勾',
    keywords: ['合規', '檢查', '稽核', '法規', '規範'],
    iconPath: '/symbols/admin/compliance-check.png',
    color: '#708090',
    shape: 'square',
  },
  {
    id: 'document-processing',
    name: '文書處理',
    category: 'admin',
    description: '灰色方形 + 白色鍵盤',
    keywords: ['文書', '處理', '打字', '輸入', '登錄'],
    iconPath: '/symbols/admin/document-processing.png',
    color: '#708090',
    shape: 'square',
  },
];

/**
 * 所有符號集合
 */
export const allTaskSymbols: TaskSymbol[] = [
  ...revenueSymbols,
  ...trafficSymbols,
  ...adminSymbols,
];

/**
 * AI 判別函數:根據任務描述自動匹配符號
 * @param taskDescription 任務描述文字
 * @returns 匹配的符號物件
 */
export function matchTaskSymbol(taskDescription: string): TaskSymbol {
  const lowerDescription = taskDescription.toLowerCase();
  
  // 計算每個符號的匹配分數
  const scores = allTaskSymbols.map(symbol => {
    let score = 0;
    symbol.keywords.forEach(keyword => {
      if (lowerDescription.includes(keyword.toLowerCase())) {
        score += 1;
      }
    });
    return { symbol, score };
  });
  
  // 找出最高分的符號
  const bestMatch = scores.reduce((best, current) => 
    current.score > best.score ? current : best
  );
  
  // 如果沒有任何匹配,根據分級返回預設符號
  if (bestMatch.score === 0) {
    // 檢查是否包含分級關鍵字
    if (lowerDescription.includes('營收') || lowerDescription.includes('銷售') || 
        lowerDescription.includes('賺錢') || lowerDescription.includes('客戶')) {
      return revenueSymbols[0]; // 預設:直接銷售
    } else if (lowerDescription.includes('流量') || lowerDescription.includes('行銷') || 
               lowerDescription.includes('推廣') || lowerDescription.includes('曝光')) {
      return trafficSymbols[0]; // 預設:SEO 優化
    } else {
      return adminSymbols[0]; // 預設:文件審核
    }
  }
  
  return bestMatch.symbol;
}

/**
 * 根據符號類別獲取符號列表
 */
export function getSymbolsByCategory(category: 'revenue' | 'traffic' | 'admin'): TaskSymbol[] {
  return allTaskSymbols.filter(symbol => symbol.category === category);
}

/**
 * 根據符號 ID 獲取符號
 */
export function getSymbolById(id: string): TaskSymbol | undefined {
  return allTaskSymbols.find(symbol => symbol.id === id);
}
