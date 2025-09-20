import FeatureTile from "./FeatureTile";
import { LucideIcon } from "lucide-react";

type Feature = {
  id: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  status?: 'active' | 'coming-soon' | 'beta';
  color?: string;
  category?: string;
};

type FeaturesGridProps = {
  features: Feature[];
  className?: string;
};

export default function FeaturesGrid({ features, className }: FeaturesGridProps) {
  return (
    <div
      className={`
        grid
        grid-cols-2
        sm:grid-cols-3
        md:grid-cols-4
        lg:grid-cols-5
        xl:grid-cols-6
        gap-4 sm:gap-6 md:gap-8
        p-4
        ${className || ''}
      `}
    >
      {features.map((feature) => (
        <FeatureTile
          key={feature.id}
          label={feature.title}
          description={feature.description}
          href={feature.href}
          onClick={feature.onClick}
          icon={feature.icon}
          status={feature.status}
          color={feature.color}
        />
      ))}
    </div>
  );
}