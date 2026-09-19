import clsx from 'clsx';

/*
  One tag primitive. Square corners like the rest of the UI, tinted ground from the
  warm palette, text always dark enough to clear 4.5:1 on its own tint (DESIGN.md).
  No pill shape, no border glow, no dot.
*/
export function Tag({
  children,
  tone = 'tan',
  className
}: {
  children: React.ReactNode;
  tone?: 'tan' | 'green' | 'clay' | 'outline';
  className?: string;
}) {
  return (
    <span
      className={clsx(
        'inline-block px-2 py-[3px] text-xs font-medium leading-none tracking-wide',
        tone === 'tan' && 'bg-tint-tan text-body',
        tone === 'green' && 'bg-tint-green text-forest-deep',
        tone === 'clay' && 'bg-tint-clay text-clay',
        tone === 'outline' && 'border border-edge text-body',
        className
      )}
    >
      {children}
    </span>
  );
}
