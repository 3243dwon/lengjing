interface SectionCardProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
}

export default function SectionCard({ title, icon, children }: SectionCardProps) {
  return (
    <section className="bg-white rounded-2xl shadow-card p-5 sm:p-6">
      <h2 className="text-lg font-bold text-heading mb-4 flex items-center gap-2 border-l-[3px] border-amber-accent pl-3">
        {icon && <span>{icon}</span>}
        {title}
      </h2>
      {children}
    </section>
  );
}
