import { RatingLevel, getRatingColorClass } from '@/utils/performanceRating';

interface RatingBadgeProps {
  level: RatingLevel;
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export function RatingBadge({ level, score, size = 'md', showScore = true }: RatingBadgeProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  const scoreSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${sizeClasses[size]} ${getRatingColorClass(level)} 
          rounded-lg flex items-center justify-center font-bold shadow-lg
          transform transition-transform hover:scale-110`}
      >
        {level}
      </div>
      {showScore && (
        <span className={`${scoreSizeClasses[size]} font-semibold text-muted-foreground`}>
          {score}分
        </span>
      )}
    </div>
  );
}
