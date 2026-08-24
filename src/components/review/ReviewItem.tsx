import type { ReviewLineItem } from '../../types';
import { Price } from '../shared/Price';
import { QuantityStepper } from '../product/QuantityStepper';
import { useBundle } from '../../state/useBundle';

interface ReviewItemProps {
  item: ReviewLineItem;
}

export function ReviewItem({ item }: ReviewItemProps) {
  const { adjustQuantity } = useBundle();
  const label = item.variantLabel ? `${item.name} (${item.variantLabel})` : item.name;

  return (
    <div className="flex w-full items-center gap-[16px]">
      <div className="flex min-w-0 flex-1 items-center gap-[12px]">
        <div className="size-[41px] shrink-0 overflow-hidden rounded-[5px] bg-white">
          <img src={item.image} alt="" className="size-full object-cover" />
        </div>
        <p className="min-w-0 flex-1 truncate text-[14px] font-medium leading-[16px] tracking-[0.07px] text-ink">
          {label}
        </p>
        <QuantityStepper
          quantity={item.quantity}
          onIncrement={() => adjustQuantity(item.productId, item.variantId, 1)}
          onDecrement={() => adjustQuantity(item.productId, item.variantId, -1)}
          disabled={item.required}
          compact
          label={label}
        />
      </div>
      <Price
        current={item.unitPrice * item.quantity}
        compareAt={item.compareAtUnitPrice ? item.compareAtUnitPrice * item.quantity : undefined}
        freeWhenZero
        size="sm"
        emphasis="brand"
        className="shrink-0"
      />
    </div>
  );
}
