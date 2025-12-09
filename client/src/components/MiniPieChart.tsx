/**
 * 簡單的圓餅圖元件
 * 用於顯示任務分級時間佔比
 */

interface MiniPieChartProps {
  data: Array<{ level: 'level1' | 'level2' | 'level3' | 'daily'; label: string; value: number; color: string }> | {
    level1: number;
    level2: number;
    level3: number;
    daily: number;
    uncategorized: number;
  };
  size?: number;
  onLevelClick?: (level: 'level1' | 'level2' | 'level3' | 'daily' | null) => void;
  selectedLevel?: 'level1' | 'level2' | 'level3' | 'daily' | null | undefined;
}

export function MiniPieChart({ data, size = 150, onLevelClick, selectedLevel }: MiniPieChartProps) {
  // 支援兩種資料格式
  const isArrayFormat = Array.isArray(data);
  
  let total: number;
  if (isArrayFormat) {
    total = data.reduce((sum, item) => sum + item.value, 0);
  } else {
    total = data.level1 + data.level2 + data.level3 + data.daily + data.uncategorized;
  }
  
  // 如果沒有資料,顯示空圓圈
  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
        />
        <text
          x="50"
          y="55"
          textAnchor="middle"
          fontSize="8"
          fill="#9ca3af"
        >
          無資料
        </text>
      </svg>
    );
  }
  
  // 計算每個層級的角度
  const level1Angle = (data.level1 / total) * 360;
  const level2Angle = (data.level2 / total) * 360;
  const level3Angle = (data.level3 / total) * 360;
  const dailyAngle = (data.daily / total) * 360;
  const uncategorizedAngle = (data.uncategorized / total) * 360;
  
  // 顏色定義
  const colors = {
    level1: '#f59e0b', // 金色 (1級營收)
    level2: '#3b82f6', // 藍色 (2級流量)
    level3: '#6b7280', // 灰色 (3級行政)
    daily: '#d1d5db', // 淺灰色 (日常)
    uncategorized: '#ef4444', // 紅色 (無/未分類)
  };
  
  // 計算路徑
  const createArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(50, 50, 40, endAngle);
    const end = polarToCartesian(50, 50, 40, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    
    return [
      `M 50 50`,
      `L ${start.x} ${start.y}`,
      `A 40 40 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
      'Z'
    ].join(' ');
  };
  
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };
  
  // 計算文字位置 (在區塊中心)
  const getLabelPosition = (startAngle: number, endAngle: number) => {
    const midAngle = (startAngle + endAngle) / 2;
    const labelRadius = 30; // 文字距離圓心的半徑
    return polarToCartesian(50, 50, labelRadius, midAngle);
  };
  
  let currentAngle = 0;
  const segments: Array<{ path: string; color: string; level: string }> = [];
  
  if (data.level1 > 0) {
    segments.push({
      path: createArc(currentAngle, currentAngle + level1Angle),
      color: colors.level1,
      level: 'level1',
    });
    currentAngle += level1Angle;
  }
  
  if (data.level2 > 0) {
    segments.push({
      path: createArc(currentAngle, currentAngle + level2Angle),
      color: colors.level2,
      level: 'level2',
    });
    currentAngle += level2Angle;
  }
  
  if (data.level3 > 0) {
    segments.push({
      path: createArc(currentAngle, currentAngle + level3Angle),
      color: colors.level3,
      level: 'level3',
    });
    currentAngle += level3Angle;
  }
  
  if (data.daily > 0) {
    segments.push({
      path: createArc(currentAngle, currentAngle + dailyAngle),
      color: colors.daily,
      level: 'daily',
    });
    currentAngle += dailyAngle;
  }
  
  if (data.uncategorized > 0) {
    segments.push({
      path: createArc(currentAngle, currentAngle + uncategorizedAngle),
      color: colors.uncategorized,
      level: 'uncategorized',
    });
  }
  
  // 準備文字標籤
  const labels = [
    { text: '1級', show: data.level1 > 0, angle: level1Angle },
    { text: '2級', show: data.level2 > 0, angle: level2Angle },
    { text: '3級', show: data.level3 > 0, angle: level3Angle },
    { text: '日常', show: data.daily > 0, angle: dailyAngle },
    { text: '無', show: data.uncategorized > 0, angle: uncategorizedAngle },
  ];
  
  let labelAngle = 0;
  const labelPositions: Array<{ text: string; x: number; y: number }> = [];
  
  for (let i = 0; i < labels.length; i++) {
    if (labels[i].show && labels[i].angle > 20) { // 只顯示角度大於20度的標籤
      const pos = getLabelPosition(labelAngle, labelAngle + labels[i].angle);
      labelPositions.push({
        text: labels[i].text,
        x: pos.x,
        y: pos.y,
      });
    }
    if (labels[i].show) {
      labelAngle += labels[i].angle;
    }
  }
  
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {segments.map((segment, index) => (
        <path
          key={index}
          d={segment.path}
          fill={segment.color}
          opacity={selectedLevel && selectedLevel !== segment.level ? 0.3 : 1}
          onClick={() => onLevelClick?.(selectedLevel === segment.level ? null : segment.level as any)}
          style={{ cursor: onLevelClick ? 'pointer' : 'default' }}
          className="transition-opacity hover:opacity-80"
        />
      ))}
      {labelPositions.map((label, index) => (
        <text
          key={index}
          x={label.x}
          y={label.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="6"
          fontWeight="600"
          fill="white"
        >
          {label.text}
        </text>
      ))}
    </svg>
  );
}
