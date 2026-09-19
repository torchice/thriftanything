import { Tag } from './Tag';

export function EditionBadge({ edition }: { edition: 'original' | 'non_original' }) {
  return edition === 'original' ? (
    <Tag tone="green">Original</Tag>
  ) : (
    <Tag tone="outline">Non-original</Tag>
  );
}
