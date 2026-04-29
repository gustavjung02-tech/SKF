type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <div className="max-w-3xl space-y-3.5">
      {eyebrow ? (
        <p className="jp-eyebrow">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-heading text-2xl font-bold leading-[1.14] text-slate-950 sm:text-[2rem]">{title}</h2>
      {description ? <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">{description}</p> : null}
    </div>
  );
}
