import './PageHeader.css';

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <section className="page-header">
      <div className="container">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </section>
  );
}
