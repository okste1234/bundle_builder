import { Price } from '../shared/Price';

interface ReviewInfoRowProps {
  icon: string;
  label: string;
  current: number;
  compareAt?: number;
  suffix?: string;
  nameAccent?: string;
}

/** A review-panel row with an icon instead of a product thumbnail and no quantity
 *  stepper — used for the Plan and Shipping sections. */
export function ReviewInfoRow({ icon, label, current, compareAt, suffix, nameAccent }: ReviewInfoRowProps) {
  const namePrefix = nameAccent ? label.replace(nameAccent, '').trim() : null;

  return (
    <div className="flex w-full items-center justify-between gap-[16px]">
      <div className="flex min-w-0 flex-1 items-center gap-[12px]">
        <div className="flex size-[41px] shrink-0 items-center justify-center overflow-hidden rounded-[5px] bg-white">
          <img src={icon} alt="" className="size-[29px]" />
        </div>
        <p className="min-w-0 flex-1 truncate font-gilroy text-[16px] font-extrabold leading-none tracking-[-0.032px] text-ink">
          {namePrefix ? (<> {namePrefix}{' '}<span className="text-brand">{nameAccent}</span></>) : (label)}
        </p>
      </div>
      <Price current={current} compareAt={compareAt} freeWhenZero size="sm" emphasis="brand" suffix={suffix} />
    </div>
  );
}
