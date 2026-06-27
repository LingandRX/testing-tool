import { getFeatureByKey, type FeatureConfig } from '@/config/features';
import type { PageType } from '@/types/storage';

export type DashboardFeature = FeatureConfig & {
  icon: NonNullable<FeatureConfig['icon']>;
};

export interface DashboardFeatureItem {
  key: PageType;
  feature: DashboardFeature;
}

function isDashboardFeature(feature: FeatureConfig): feature is DashboardFeature {
  return feature.icon != null;
}

export function resolveDashboardFeatures(
  keys: PageType[],
  visiblePages: PageType[],
): DashboardFeatureItem[] {
  const visibleSet = new Set(visiblePages);
  const items: DashboardFeatureItem[] = [];

  for (const key of keys) {
    if (!visibleSet.has(key)) continue;

    const feature = getFeatureByKey(key);
    if (!feature || !isDashboardFeature(feature)) continue;

    items.push({ key, feature });
  }

  return items;
}
