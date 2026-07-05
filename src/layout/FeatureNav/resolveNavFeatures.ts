import { getFeatureByKey, type FeatureConfig } from '@/config/features';
import type { PageType } from '@/types/storage';

export interface NavFeatureItem {
  key: PageType;
  feature: FeatureConfig & { icon: NonNullable<FeatureConfig['icon']> };
}

function isNavFeature(feature: FeatureConfig): feature is NavFeatureItem['feature'] {
  return feature.icon != null;
}

export function resolveNavFeatures(keys: PageType[], visiblePages: PageType[]): NavFeatureItem[] {
  const visibleSet = new Set(visiblePages);
  const items: NavFeatureItem[] = [];

  for (const key of keys) {
    if (!visibleSet.has(key)) continue;

    const feature = getFeatureByKey(key);
    if (!feature || !isNavFeature(feature)) continue;

    items.push({ key, feature });
  }

  return items;
}
