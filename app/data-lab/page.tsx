// FILE: app/data-lab/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { getAllDataLab } from '@/lib/content';
import Tag from '@/components/ui/Tag';
import CTAButton from '@/components/ui/CTAButton';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata: Metadata = {
  title: 'Data Lab | FinNexus Lab',
  description: 'Power BI dashboards, Python analyses, and Excel financial models that power FinNexus Lab research.',
};

export default function DataLabPage() {
  const projects = getAllDataLab();
  
  // Calculate stats
  const totalProjects = projects.length;
  const allTools = Array.from(new Set(projects.flatMap(p => p.tools)));
  const totalTools = allTools.length;
  const allSectors = Array.from(new Set(projects.map(p => p.sector)));
  const totalSectors = allSectors.length;

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <section className="bg-gradient-to-br from-brand-navy to-slate-900 py-20">
        <div className="wrap max-w-6xl">
          <div className="max-w-3xl">
            <span className="section-label text-brand-teal">Data Lab</span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mt-4 mb-6">
              Analytics Projects & Dashboards
            </h1>
            <p className="text-xl text-gray-300 mb-10">
              The quantitative engine behind FinNexus Lab research —
              Power BI dashboards, Python analyses, and Excel financial models.
            </p>
            
            {/* Stats strip */}
            <div className="flex flex-wrap gap-8 py-6 border-t border-gray-700">
              <div>
                <div className="text-3xl font-bold text-white">{totalProjects}</div>
                <div className="text-sm text-gray-400">Projects</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{totalTools}</div>
                <div className="text-sm text-gray-400">Tools</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{totalSectors}</div>
                <div className="text-sm text-gray-400">Sectors</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects grid */}
      <section className="wrap max-w-6xl py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.slug}
              className="card p-6 flex flex-col border border-gray-200 rounded-xl hover:shadow-lg transition-shadow"
            >
              {/* Tools badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tools.map((tool) => (
                  <Tag key={tool} variant="silver" text={tool} className="text-sm" />
                ))}
              </div>
              
              {/* Sector tag */}
              <Tag variant="teal" text={project.sector} className="self-start mb-4 text-sm" />
              
              {/* Title */}
              <h3 className="font-bold text-brand-navy text-xl mb-2">
                {project.title}
              </h3>
              
              {/* Business question */}
              <p className="text-sm text-brand-teal italic mb-3">
                {project.businessQuestion}
              </p>
              
              {/* Duration badge */}
              <div className="text-xs text-gray-400 mb-6">
                Duration: {project.duration}
              </div>
              
              {/* Spacer */}
              <div className="flex-grow" />
              
              {/* Footer */}
              <Link
                href={`/data-lab/${project.slug}`}
                className="btn-ghost text-brand-navy hover:text-brand-teal inline-flex items-center gap-2 self-start"
              >
                View Project →
              </Link>
            </div>
          ))}
        </div>
        
        {/* Empty state */}
        {projects.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-gray-700 mb-4">No Data Lab projects yet</h3>
            <p className="text-gray-500 mb-8">Check back soon for analytical projects and dashboards.</p>
            <CTAButton href="/contact" variant="primary">
              Suggest a Project
            </CTAButton>
          </div>
        )}
      </section>
    </div>
  );
}