import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface DocumentLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function DocumentLayout({ title, children }: DocumentLayoutProps) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-(--text-secondary) transition-colors hover:text-(--text-primary)"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>
      <article className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-(--text-primary) sm:text-3xl">
            {title}
          </h1>
        </header>
        <div className="space-y-4 leading-relaxed text-(--text-secondary) [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-(--text-primary) [&_h3]:mt-6 [&_h3]:font-medium [&_h3]:text-(--text-primary) [&_p]:text-pretty [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_strong]:text-(--text-primary)">
          {children}
        </div>
      </article>
    </main>
  );
}
