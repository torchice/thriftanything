export function EditionBadge({ edition }: { edition: 'original' | 'non_original' }) {
  const label = edition === 'original' ? 'ORIGINAL' : 'NON-ORIGINAL';
  const textClass = edition === 'original' ? 'text-ink' : 'text-muted';

  return (
    <span className={`text-xs font-body font-semibold tracking-wider ${textClass}`}>
      {label}
    </span>
  );
}
