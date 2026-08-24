import type { BundleState, ProductCategory } from '../../types';
import { getLineItemsForCategory } from '../../state/selectors';
import { useAnimatedItems } from '../../hooks/useAnimatedItems';
import { Collapse } from '../shared/Collapse';
import { AnimatedListItem } from '../shared/AnimatedListItem';
import { ReviewSection } from './ReviewSection';
import { ReviewItem } from './ReviewItem';

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  camera: 'Cameras',
  sensor: 'Sensors',
  accessory: 'Accessories',
};

interface ReviewCategorySectionProps {
  category: ProductCategory;
  state: BundleState;
}

/** One review-panel category (Cameras/Sensors/Accessories): its own component so
 *  `useAnimatedItems` — which needs to track this category's line items across renders
 *  to animate additions/removals — follows the rules of hooks properly instead of being
 *  called from inside a `.map()` callback in the parent. The whole section eases open/
 *  closed as its item count goes from/to zero. */
export function ReviewCategorySection({ category, state }: ReviewCategorySectionProps) {
  const items = getLineItemsForCategory(state, category);
  const animatedItems = useAnimatedItems(items);

  const productLineCounts = animatedItems.reduce<Record<string, number>>((counts, entry) => {
    counts[entry.item.productId] = (counts[entry.item.productId] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <Collapse open={items.length > 0}>
      <ReviewSection label={CATEGORY_LABELS[category]}>
        {animatedItems.map(({ key, item, exiting }) => (
          <AnimatedListItem key={key} exiting={exiting}>
            <ReviewItem item={item} showVariantLabel={productLineCounts[item.productId] > 1} />
          </AnimatedListItem>
        ))}
      </ReviewSection>
    </Collapse>
  );
}
