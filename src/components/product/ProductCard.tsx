import type { Product, ProductSelection } from '../../types';
import { DEFAULT_VARIANT_KEY } from '../../types';
import { Badge } from '../shared/Badge';
import { Price } from '../shared/Price';
import { ProductImage } from '../shared/ProductImage';
import { QuantityStepper } from './QuantityStepper';
import { VariantSelector } from './VariantSelector';

interface ProductCardProps {
  product: Product;
  selection: ProductSelection | undefined;
  onSelectVariant: (variantId: string) => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function ProductCard({
  product,
  selection,
  onSelectVariant,
  onIncrement,
  onDecrement,
}: ProductCardProps) {
  const hasVariants = Boolean(product.variants?.length);

  const activeVariantId = hasVariants
    ? selection?.selectedVariantId ?? product.variants![0].id
    : DEFAULT_VARIANT_KEY;

  const quantity = selection?.quantities[activeVariantId] ?? 0;

  const isProductInBundle = Object.values(
    selection?.quantities ?? {},
  ).some((qty) => qty > 0);

  const activeVariant = product.variants?.find(
    (variant) => variant.id === activeVariantId,
  );

  const displayImage = activeVariant?.image ?? product.image;

  return (
    <div
      className={[
        // Equal height is provided by the parent grid.
        'flex h-full min-h-[159px]',
        'items-center',
        'overflow-hidden rounded-[10px] bg-white p-[11px]',
        'transition-all duration-300 ease-out',
        
        'lg:h-full lg:w-full lg:flex-col lg:items-stretch',
        'xl:h-full xl:w-full xl:flex-row xl:items-center',
        // The gap changes when selected.
        isProductInBundle
          ? 'gap-[19px] border-2 border-[rgba(78,47,210,0.7)]'
          : 'gap-[13px] border-2 border-transparent',
      ].join(' ')}
    >
      {/* Image: fixed 101×137 portrait box in the horizontal layout; at lg it becomes a
          full-width banner instead, same height, so text never has to share the row with it. */}
      <div className="relative w-[101px] shrink-0 lg:mx-auto xl:mx-0">
        <div className="relative h-[137px] w-[101px] overflow-hidden rounded-[5px] bg-white">
          <ProductImage
            key={displayImage}
            src={displayImage}
            alt={product.name}
            className="size-full animate-fade-in object-contain"
          />
        </div>

        {product.discountLabel && (
          <Badge
            tone="discount"
            className="absolute left-0 top-0 lg:left-[calc((101px-180px)/2)] xl:left-0"
          >
            {product.discountLabel}
          </Badge>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-[10px] lg:w-full lg:flex-none xl:w-auto xl:flex-1">
        <div className="flex w-full flex-col items-start gap-[8px] tracking-[0.6px]">
          <h4 className="w-full text-[16px] font-semibold leading-none text-ink-soft">
            {product.name}
          </h4>

          <p className="text-[12px] font-medium leading-[1.3] text-[rgba(31,31,31,0.75)]">
            {product.description}{' '}
            {product.learnMoreHref && (
              <a
                href={product.learnMoreHref}
                className="text-[#00e] underline decoration-from-font whitespace-nowrap"
              >
                Learn More
              </a>
            )}
          </p>

          {hasVariants && (
            <VariantSelector
              productName={product.name}
              variants={product.variants!}
              selectedId={activeVariantId}
              onSelect={onSelectVariant}
            />
          )}
        </div>

        {/* Quantity + Price */}
         <div className={`flex w-full items-end transition-[gap] duration-300 ease-out ${isProductInBundle ? 'gap-[10px]' : 'gap-[10px] md:gap-[46px]'}`}>
          <QuantityStepper
            quantity={quantity}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            disabled={product.required}
            label={`${product.name}${hasVariants ? ` ${activeVariantId}` : ''}`}
          />
          <div className="flex flex-1 items-end justify-end">
            <Price current={product.price} compareAt={product.compareAtPrice} freeWhenZero size="md" emphasis="gray" />
          </div>
        </div>
      </div>
    </div>
  );
}