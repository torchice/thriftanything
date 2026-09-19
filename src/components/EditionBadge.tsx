import { Tag } from './Tag';

export function EditionBadge({ edition }: { edition: 'original' | 'non_original' }) {
  return edition === 'original' ? (
    <Tag tone="green">Ori</Tag>
  ) : (
    <Tag tone="outline">Bukan ori</Tag>
  );
}
