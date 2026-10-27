import { useState } from 'react';
import { IconContext } from "react-icons";
import {
  LuBriefcaseBusiness,
  LuCalendarDays,
  LuMapPin,
  LuExternalLink,
  LuGithub,
  LuMenu,
  LuX,
} from 'react-icons/lu';
import Skills from './Skills';
import HangingBadge from './components/HangingBadge';
import ProjectVideoPlayer from './components/ProjectVideoPlayer';
import ProjectModal from './components/ProjectModal';
import PortfolioChatbot from './components/PortfolioChatbot';
import {
  loadProjectsFromStorage,
  saveProjectsToStorage,
  resetProjectsStorage,
} from './utils/videoStorage';

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState('about');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectsList, setProjectsList] = useState(() => loadProjectsFromStorage());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const navItems = [
    ['about', 'About'],
    ['skills', 'Skills'],
    ['experience', 'Experience'],
    ['projects', 'Projects'],
    ['contact', 'Contact'],
  ];

  const handleOpenAdd = () => {
    setEditingProject(null);
    setModalOpen(true);
  };

  const handleSaveProject = (projectData) => {
    let updated;
    const exists = projectsList.some((p) => p.id === projectData.id);
    if (exists) {
      updated = projectsList.map((p) => (p.id === projectData.id ? projectData : p));
    } else {
      updated = [projectData, ...projectsList];
    }
    setProjectsList(updated);
    saveProjectsToStorage(updated);
  };

  const handleVideoChange = (projectId, newVideoSrc) => {
    const updated = projectsList.map((p) =>
      p.id === projectId ? { ...p, video: newVideoSrc } : p
    );
    setProjectsList(updated);
    saveProjectsToStorage(updated);
  };

  const handleResetDefaults = async () => {
    if (window.confirm('Reset all projects back to default showcase projects?')) {
      const defaults = await resetProjectsStorage();
      setProjectsList([...defaults]);
    }
  };

  return (
    <>
      <div className="portfolio-shell min-h-screen bg-black text-white overflow-x-hidden selection:bg-blue-500 selection:text-white">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 border-b border-slate-700/80 bg-black">
          <div className="mx-auto flex min-h-[76px] max-w-[1500px] items-center justify-between px-4 sm:min-h-[88px] sm:px-10 lg:px-16">
            <div className="flex items-center gap-3 sm:gap-4">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Mohd Irfan
              </h1>
            </div>

            <div className="hidden items-center gap-5 text-base font-semibold text-gray-300 sm:flex sm:gap-7 lg:gap-9 lg:text-lg">
              {navItems.map(([id, label]) => {
                const isActive = activeSection === id;

                return (
                  <a
                    key={id}
                    href={`#${id}`}
                    aria-current={isActive ? 'location' : undefined}
                    onClick={() => setActiveSection(id)}
                    className={`border-b-[3px] px-2 py-3 transition-colors ${
                      isActive
                        ? 'border-sky-500 text-sky-400'
                        : 'border-transparent hover:border-sky-500 hover:text-white'
                    }`}
                  >
                    {label}
                  </a>
                );
              })}
            </div>
            <button
              type="button"
              className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-gray-200 transition hover:border-sky-500 hover:text-sky-300 sm:hidden"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? (
                <LuX className="h-5 w-5" />
              ) : (
                <LuMenu className="h-5 w-5" />
              )}
              <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
            </button>
          </div>
          {mobileMenuOpen && (
            <div id="mobile-navigation" className="border-t border-white/10 px-4 py-3 sm:hidden">
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-semibold text-gray-300">
                {navItems.map(([id, label]) => {
                  const isActive = activeSection === id;

                  return (
                    <a
                      key={id}
                      href={`#${id}`}
                      aria-current={isActive ? 'location' : undefined}
                      onClick={() => {
                        setActiveSection(id);
                        setMobileMenuOpen(false);
                      }}
                      className={isActive ? 'text-sky-400' : 'hover:text-white'}
                    >
                      {label}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Hero */}
        <section className="relative min-h-[calc(100svh-72px)] flex items-start md:items-center px-4 sm:px-6 pt-16 pb-12 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_12%_8%,rgba(0,112,255,0.16),transparent_38%)]" />

          <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 md:grid-cols-[minmax(0,1fr)_auto] md:gap-16 lg:gap-24">
            <div className="text-center md:text-left">
              <h2 className="text-[clamp(2.5rem,10vw,8rem)] font-black leading-[0.95] tracking-[-0.06em] md:text-[clamp(3.5rem,8vw,8rem)]">
                Mohd <span className="text-blue-500">Irfan</span>
              </h2>
              <p className="mt-3 text-[clamp(1.25rem,6vw,3.5rem)] font-bold leading-tight tracking-[-0.035em] text-gray-200 sm:mt-7 md:text-[clamp(1.7rem,4vw,3.5rem)]">
                Full Stack Developer
              </p>
            </div>
            <HangingBadge className="mx-auto md:mx-0" />
          </div>
        </section>

        {/* About */}
        <section id="about" className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-8">
              About Me
            </h2>

            <p className="text-base sm:text-lg md:text-xl leading-8 sm:leading-9 text-gray-400">
              I am currently working as a Backend Developer at Befach
              International, developing scalable APIs, authentication systems,
              order workflows, and real-time shipment tracking features for B2B
              applications. I am actively looking for Full Stack Developer
              opportunities to contribute my backend expertise while expanding
              my frontend development skills.
            </p>
          </div>
        </section>

        {/* Skills */}
        <IconContext.Provider value={{ color: "blue", className: "global-class-name", size: "2em" }}>
          <Skills />
        </IconContext.Provider>

        {/* Experience */}
        <section id="experience" className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="experience-section relative max-w-6xl mx-auto">
            <div className="experience-dots" aria-hidden="true" />
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">
              Experience
            </h2>
            <p className="text-center text-gray-400 mb-12">
              A timeline of my professional journey
            </p>

            <div className="relative grid grid-cols-[24px_minmax(0,1fr)] gap-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-8">
              <div className="absolute left-[23px] top-5 bottom-5 w-px bg-gradient-to-b from-blue-400 via-blue-500/70 to-transparent sm:left-[159px]" />

              <div className="relative pt-5 text-right text-xs sm:pr-6 sm:text-sm leading-5 text-blue-300">
                <span className="hidden font-semibold sm:inline">Jun 10, 2026</span>
                <br />
                <span className="hidden text-gray-400 sm:inline">- Present</span>
                <span className="experience-timeline-dot absolute right-[-7px] top-7 z-10 h-4 w-4 rounded-full bg-blue-500 ring-4 ring-blue-500/15 shadow-[0_0_16px_rgba(0,112,255,0.8)]" />
              </div>

              <article className="relative min-w-0 overflow-hidden rounded-2xl border border-blue-500/40 bg-[#05090f] p-4 sm:p-7 shadow-[0_0_20px_rgba(0,112,255,0.08)] transition duration-300 hover:border-blue-400/70 hover:shadow-[0_0_30px_rgba(0,112,255,0.16)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,112,255,0.12),transparent_48%)]" />
                <div className="relative">
                  <p className="mb-2 text-xs font-medium text-gray-400 sm:hidden">
                    Jun 10, 2026 - Present
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold mb-1">
                    Full Stack Developer
                  </h3>
                  <p className="text-blue-400 font-semibold text-base sm:text-lg mb-4">
                    Teketreeinc
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-300">
                    <span className="inline-flex items-center gap-2">
                      <LuMapPin className="h-4 w-4 text-blue-300" aria-hidden="true" />
                      Hyderabad, India
                    </span>
                    <span className="hidden sm:block h-4 w-px bg-gray-600" />
                    <span className="inline-flex items-center gap-2">
                      <LuBriefcaseBusiness className="h-4 w-4 text-blue-300" aria-hidden="true" />
                      Full-time
                    </span>
                    <span className="hidden sm:block h-4 w-px bg-gray-600" />
                    <span className="inline-flex items-center gap-2">
                      <LuCalendarDays className="h-4 w-4 text-blue-300" aria-hidden="true" />
                      Jun 10, 2026 - Present
                    </span>
                  </div>
                </div>
              </article>

              <div className="relative pt-5 text-right text-xs sm:pr-6 sm:text-sm leading-5 text-blue-300">
                <span className="hidden font-semibold sm:inline">Jun 23, 2025</span>
                <br />
                <span className="hidden text-gray-400 sm:inline">- May 31, 2026</span>
                <span className="experience-timeline-dot absolute right-[-7px] top-7 z-10 h-4 w-4 rounded-full bg-blue-500 ring-4 ring-blue-500/15 shadow-[0_0_16px_rgba(0,112,255,0.8)]" />
              </div>

              <article className="relative min-w-0 overflow-hidden rounded-2xl border border-blue-500/40 bg-[#05090f] p-4 sm:p-7 shadow-[0_0_20px_rgba(0,112,255,0.08)] transition duration-300 hover:border-blue-400/70 hover:shadow-[0_0_30px_rgba(0,112,255,0.16)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,112,255,0.12),transparent_48%)]" />
                <div className="relative">
                  <p className="mb-2 text-xs font-medium text-gray-400 sm:hidden">
                    Jun 23, 2025 - May 31, 2026
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold mb-1">
                    Backend Developer
                  </h3>
                  <p className="text-blue-400 font-semibold text-base sm:text-lg mb-4">
                    Befach International
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-300">
                    <span className="inline-flex items-center gap-2">
                      <LuMapPin className="h-4 w-4 text-blue-300" aria-hidden="true" />
                      Hyderabad, India
                    </span>
                    <span className="hidden sm:block h-4 w-px bg-gray-600" />
                    <span className="inline-flex items-center gap-2">
                      <LuBriefcaseBusiness className="h-4 w-4 text-blue-300" aria-hidden="true" />
                      Full-time
                    </span>
                    <span className="hidden sm:block h-4 w-px bg-gray-600" />
                    <span className="inline-flex items-center gap-2">
                      <LuCalendarDays className="h-4 w-4 text-blue-300" aria-hidden="true" />
                      Jun 23, 2025 - May 31, 2026
                    </span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Projects */}
        <section id="projects" className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Header and Controls */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-5">
              <div>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                  Projects
                </h2>
                <p className="mt-2 text-sm sm:text-base text-gray-400 max-w-xl">
                  Explore production applications with autoplay video previews, technology stacks, and direct project links.
                </p>
              </div>

            </div>

            {/* Grid of Projects */}
            <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
              {projectsList.map((project) => (
                <article
                  key={project.id || project.title}
                  className="group relative flex flex-col bg-[#070b13] backdrop-blur-xl rounded-[28px] border border-blue-500/20 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-blue-400/50 hover:shadow-[0_0_40px_rgba(0,112,255,0.18)]"
                >
                  {/* Subtle Background Glow */}
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,112,255,0.12),transparent_60%)] opacity-70 group-hover:opacity-100 transition duration-500" />

                  {/* Autoplay Video Player */}
                  <div className="relative p-3 pb-0">
                    <ProjectVideoPlayer
                      project={project}
                      onVideoChange={(newSrc) => handleVideoChange(project.id, newSrc)}
                    />
                  </div>

                  {/* Card Body */}
                  <div className="relative z-10 flex flex-1 flex-col p-6 sm:p-7">
                    {/* Header: Title and Management Buttons */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-sky-300 transition-colors">
                        {project.title}
                      </h3>
                    </div>

                    {/* Tech Stack Pills */}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-blue-950/60 border border-blue-500/25 px-2.5 py-0.5 text-xs font-medium text-sky-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Description */}
                    <p className="flex-1 text-sm sm:text-base text-gray-300/90 leading-relaxed mb-6">
                      {project.description}
                    </p>

                    {/* Action Links */}
                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10 mt-auto">
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-[0_0_15px_rgba(0,112,255,0.3)] hover:from-blue-500 hover:to-sky-400 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          <span>Visit Project</span>
                          <LuExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}

                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3.5 py-2 text-xs sm:text-sm font-medium text-gray-200 hover:bg-white hover:text-black transition duration-300 cursor-pointer"
                        >
                          <LuGithub className="h-4 w-4" />
                          <span>Code</span>
                        </a>
                      )}

                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Project Modal (Add / Edit) */}
          <ProjectModal
            isOpen={modalOpen}
            initialData={editingProject}
            onClose={() => setModalOpen(false)}
            onSave={handleSaveProject}
          />
        </section>

        {/* Contact */}
        <section id="contact" className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">
              Let’s Build Something Great
            </h2>

            <p className="text-base sm:text-lg text-gray-400 mb-10 leading-7 sm:leading-8">
              Open to Full Stack Developer, Backend Developer, and Software
              Engineer opportunities.
            </p>

            <div className="flex flex-col md:flex-row gap-5 justify-center items-center">
              <a
                href="mailto:iamirfan6767@gmail.com"
                className="w-full sm:w-auto text-center px-6 sm:px-7 py-3 rounded-2xl bg-white text-black font-semibold hover:scale-105 transition duration-300"
              >
                Contact Me
              </a>

              <a
                href="https://github.com/irfan-developer-max/developer-portfolio"
                target="_blank"
                rel="noreferrer"
                className="relative z-50 w-full sm:w-auto text-center px-6 sm:px-7 py-3 rounded-2xl border border-white/20 hover:bg-white hover:text-black transition duration-300 cursor-pointer"
              >
                GitHub
              </a>

              <a
                href="https://www.linkedin.com/in/mohd-irfan-irfan?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                target="_blank"
                rel="noreferrer"
                className="relative z-50 w-full sm:w-auto text-center px-6 sm:px-7 py-3 rounded-2xl border border-white/20 hover:bg-white hover:text-black transition duration-300 cursor-pointer"
              >
                LinkedIn
              </a>
            </div>

            <div className="mt-12 text-gray-500 space-y-2">
              <p>Hyderabad, Telangana, India</p>
              <p>iamirfan6767@gmail.com</p>
            </div>
          </div>
        </section>

        {/* AI Assistant Chatbot */}
        <PortfolioChatbot />
      </div>
    </>
  );
}
