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

export function ProductCard({ product, selection, onSelectVariant, onIncrement, onDecrement }: ProductCardProps) {
  const hasVariants = Boolean(product.variants?.length);
  const activeVariantId = hasVariants
    ? selection?.selectedVariantId ?? product.variants![0].id
    : DEFAULT_VARIANT_KEY;
  const quantity = selection?.quantities[activeVariantId] ?? 0;

  // The card is "selected" (purple border) if the product is in the bundle at all — i.e.
  // ANY variant has qty > 0 — not just the variant currently showing on the card. This
  // keeps e.g. a White ×1 selection visibly reflected even while the user is previewing
  // Grey (qty 0) on the same card, since White ×1 still lives in the review panel.
  const isProductInBundle = Object.values(selection?.quantities ?? {}).some((qty) => qty > 0);

  // Most products keep one constant hero photo regardless of color; a few (where the
  // swatch itself is the only shot of that color) override it per variant.
  const activeVariant = product.variants?.find((v) => v.id === activeVariantId);
  const displayImage = activeVariant?.image ?? product.image;

  return (
    <div
      className={`flex items-center overflow-hidden rounded-[10px] bg-white p-[11px] transition-all duration-300 ease-out ${
        isProductInBundle ? 'gap-[19px] border-2 border-[rgba(78,47,210,0.7)]' : 'gap-[13px] border-2 border-transparent'
      }`}
    >
      <div className="relative h-[137px] w-[101px] shrink-0 overflow-hidden rounded-[5px] bg-white">
        <ProductImage key={displayImage} src={displayImage} alt={product.name} className="size-full animate-fade-in object-cover" />
        {product.discountLabel && (
          <Badge tone="discount" className="absolute left-0 top-0">
            {product.discountLabel}
          </Badge>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col items-start gap-[10px]">
        <div className="flex w-full flex-col items-start gap-[8px] tracking-[0.6px]">
          <h4 className="w-full text-[16px] font-semibold leading-none text-ink-soft">{product.name}</h4>
          <p className="text-[12px] font-medium leading-[1.3] text-[rgba(31,31,31,0.75)]">
            {product.description}{' '}
            {product.learnMoreHref && (
              <a href={product.learnMoreHref} className="text-[#00e] underline underline-offset-2">
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

        <div className={`flex w-full items-end transition-[gap] duration-300 ease-out ${isProductInBundle ? 'gap-[10px]' : 'gap-[46px]'}`}>
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
