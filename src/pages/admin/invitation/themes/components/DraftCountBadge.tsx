interface DraftCountBadgeProps {
  count: number;
}

const DraftCountBadge = ({ count }: DraftCountBadgeProps) => {
  if (count <= 0) return null;
  return (
    <span className="text-xs text-muted-foreground font-normal">({count})</span>
  );
};

export default DraftCountBadge;
