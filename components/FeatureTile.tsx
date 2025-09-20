import Link from "next/link";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type FeatureTileProps = {
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon | React.ReactNode;
  label: string;
  description?: string;
  status?: 'active' | 'coming-soon' | 'beta';
  color?: string;
  className?: string;
};

export default function FeatureTile({
  href,
  onClick,
  icon: IconComponent,
  label,
  description,
  status = 'active',
  color = 'bg-gray-500',
  className,
}: FeatureTileProps) {
  const getStatusIndicator = () => {
    switch (status) {
      case 'active':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      case 'coming-soon':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
      case 'beta':
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
      default:
        return null
    }
  }

  const isDisabled = status !== 'active';

  const Tile = (
    <div
      className={cn(
        "group relative flex flex-col items-center justify-center",
        "aspect-square rounded-2xl border border-gray-200 bg-white",
        "p-4 sm:p-6",
        "shadow-sm transition-all duration-200",
        isDisabled 
          ? "opacity-75 cursor-default" 
          : "hover:shadow-lg hover:border-lavender/50 cursor-pointer hover:scale-105",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-lavender/50",
        className
      )}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
    >
      {/* Icon container - Apple style */}
      <div className={cn("w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-3", color)}>
        {typeof IconComponent === 'function' ? (
          <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
        ) : (
          IconComponent || <span className="text-2xl">🔧</span>
        )}
      </div>

      {/* Label underneath - Apple style */}
      <div className="text-center">
        <h3 className="font-medium text-sm sm:text-base text-gray-900 leading-tight whitespace-normal break-words">
          {label}
        </h3>
      </div>

      {/* Status indicator */}
      <div className="mt-1">
        {getStatusIndicator()}
      </div>
    </div>
  );

  if (href && !isDisabled) {
    return (
      <Link href={href} className="block focus:outline-none">
        {Tile}
      </Link>
    );
  }

  return (
    <div 
      onClick={!isDisabled ? onClick : undefined} 
      className="block w-full focus:outline-none"
    >
      {Tile}
    </div>
  );
}