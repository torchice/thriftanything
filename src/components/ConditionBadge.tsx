import { Tag } from './Tag';

export type BookCondition = 'like_new' | 'very_good' | 'good';

const LABELS: Record<BookCondition, { label: string; tone: 'green' | 'tan' | 'outline' }> = {
  like_new: { label: 'Kayak baru', tone: 'green' },
  very_good: { label: 'Masih mulus', tone: 'tan' },
  good: { label: 'Layak baca', tone: 'outline' }
};

/*
  Renders only when the book actually carries a graded condition in the database.
  Ungraded stock shows nothing rather than a guessed grade (R-17 / R-38).
*/
export function ConditionBadge({ condition }: { condition?: BookCondition | null }) {
  if (!condition || !LABELS[condition]) return null;
  const { label, tone } = LABELS[condition];
  return <Tag tone={tone}>{label}</Tag>;
}
