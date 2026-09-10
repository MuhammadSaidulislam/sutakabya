export default function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-[24px] font-semibold text-white sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1 text-[13.5px] text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}
