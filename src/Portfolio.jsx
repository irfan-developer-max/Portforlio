export default function Portfolio() {
  const flowerStyle = `
    .flower-animation {
      position: relative;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,0.12), transparent 60%);
      animation: rotateFlower 20s linear infinite;
      filter: blur(0.5px);
    }

    .flower-animation::before,
    .flower-animation::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.15);
      animation: pulseFlower 6s ease-in-out infinite;
    }

    .flower-animation::after {
      transform: rotate(45deg);
      animation-delay: 2s;
    }

    @keyframes rotateFlower {
      from {
        transform: rotate(0deg) scale(1);
      }
      to {
        transform: rotate(360deg) scale(1.05);
      }
    }

    @keyframes pulseFlower {
      0%, 100% {
        transform: scale(1);
        opacity: 0.4;
      }
      50% {
        transform: scale(1.15);
        opacity: 1;
      }
    }

    @media (max-width: 640px) {
      .flower-animation {
        width: 280px;
        height: 280px;
      }
    }
  `;

  const skills = {
    Frontend: ['React.js', 'JavaScript', 'HTML5', 'CSS3', 'Responsive Design'],
    Backend: ['Node.js', 'Express.js', 'Python', 'Django', 'REST APIs'],
    Database: ['MySQL', 'PostgreSQL', 'Schema Design', 'Query Optimization'],
    Tools: ['Git & GitHub', 'VS Code', 'Postman', 'API Integration'],
  };

  const projects = [
    {
      title: 'Kidzofi',
      description:
        'Developed and maintained features for an educational platform with responsive UI, scalable backend integration, and user-focused functionality.',
      link: 'https://www.kidzofi.com/',
    },
    {
      title: 'B2B E-commerce Platform',
      description:
        'Worked on a production-level B2B e-commerce platform with authentication, order workflows, payment integration, and shipment tracking.',
      link: 'https://www.befach.com/en',
    },
    {
      title: 'URL Shortener Application',
      description:
        'Developed a URL shortening application with analytics and optimized redirects using Node.js and MySQL.',
    },
    {
      title: 'Food Delivery App',
      description:
        'Built a responsive frontend application with dynamic menus, search functionality, and shopping cart features.',
      link: 'https://food-del-rosy-five.vercel.app/categories.html',
    },
  ];

  return (
    <>
      <style>{flowerStyle}</style>

      <div className="min-h-screen bg-black text-white overflow-x-hidden selection:bg-white selection:text-black">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide">
              Mohd Irfan
            </h1>

            <div className="hidden md:flex gap-8 text-sm text-gray-300 font-medium">
              <a href="#about" className="hover:text-white transition">
                About
              </a>
              <a href="#skills" className="hover:text-white transition">
                Skills
              </a>
              <a href="#experience" className="hover:text-white transition">
                Experience
              </a>
              <a href="#projects" className="hover:text-white transition">
                Projects
              </a>
              <a href="#contact" className="hover:text-white transition">
                Contact
              </a>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative py-16 sm:py-20 md:py-24 px-4 sm:px-6 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
            <div className="flower-animation"></div>
          </div>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_40%)]"></div>

          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center relative z-10">
            <div>
              <p className="text-sm tracking-[0.3em] uppercase text-gray-500 mb-4">
                Full Stack Developer
              </p>

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-tight mb-6">
                Building Modern
                <span className="block text-gray-400">
                  Web Experiences
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-400 leading-7 sm:leading-8 max-w-2xl">
                Full Stack Developer with experience building scalable B2B
                e-commerce platforms and real-time systems using Python,
                Django, Node.js, Express.js, React, MySQL, and PostgreSQL.
              </p>
            </div>

            <div className="flex justify-center">
              <div className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-96 md:h-96 rounded-full border border-white/10 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center shadow-[0_0_80px_rgba(255,255,255,0.08)]">
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.15),transparent_60%)]"></div>

                <h2 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-widest text-white/90 relative z-10">
                  MI
                </h2>
              </div>
            </div>
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
        <section id="skills" className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14">
              Technical Skills
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {Object.entries(skills).map(([category, items]) => (
                <div
                  key={category}
                  className="group relative bg-[#050505] backdrop-blur-xl p-5 sm:p-7 rounded-[28px] border border-white/10 overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:border-white/20 hover:shadow-[0_0_40px_rgba(255,255,255,0.12)]"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_45%)] opacity-0 group-hover:opacity-100 transition duration-500"></div>

                  <h3 className="text-xl sm:text-2xl font-bold mb-6 relative z-10">
                    {category}
                  </h3>

                  <ul className="space-y-4 relative z-10">
                    {items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-3 text-gray-400 group-hover:text-gray-200 transition duration-300"
                      >
                        <span className="w-2 h-2 rounded-full bg-white"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Experience */}
        <section id="experience" className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14">
              Experience
            </h2>

            <div className="bg-[#050505] border border-white/10 rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 md:p-10 hover:border-white/20 transition duration-300">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                    Backend Developer
                  </h3>

                  <p className="text-gray-400 text-lg">
                    Befach International
                  </p>
                </div>

                <span className="text-gray-500">Oct 2025 - Present</span>
              </div>

              <div className="grid gap-5 text-gray-400">
                <div className="flex gap-4">
                  <span className="w-2 h-2 rounded-full bg-white mt-3"></span>

                  <p>
                    Developed scalable backend services and REST APIs for a B2B
                    e-commerce platform.
                  </p>
                </div>

                <div className="flex gap-4">
                  <span className="w-2 h-2 rounded-full bg-white mt-3"></span>

                  <p>
                    Built real-time shipment tracking features integrated with
                    third-party logistics APIs.
                  </p>
                </div>

                <div className="flex gap-4">
                  <span className="w-2 h-2 rounded-full bg-white mt-3"></span>

                  <p>
                    Managed MySQL and PostgreSQL databases with optimized
                    queries.
                  </p>
                </div>

                <div className="flex gap-4">
                  <span className="w-2 h-2 rounded-full bg-white mt-3"></span>

                  <p>
                    Worked on authentication, order processing, and product
                    management modules.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Projects */}
        <section id="projects" className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14">
              Projects
            </h2>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              {projects.map((project) => (
                <div
                  key={project.title}
                  className="group relative bg-[#050505] backdrop-blur-xl p-5 sm:p-8 rounded-[24px] sm:rounded-[28px] border border-white/10 overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:border-white/20 hover:shadow-[0_0_40px_rgba(255,255,255,0.12)]"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_45%)] opacity-0 group-hover:opacity-100 transition duration-500"></div>

                  <div className="relative z-10">
                    <h3 className="text-xl sm:text-2xl font-bold mb-4">
                      {project.title}
                    </h3>

                    <p className="text-sm sm:text-base text-gray-400 leading-7 sm:leading-8 mb-6">
                      {project.description}
                    </p>

                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noreferrer"
                        className="border border-white/20 bg-white/5 px-4 py-2 rounded-full text-sm hover:bg-white hover:text-black transition duration-300"
                      >
                        Visit Project
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
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
                href="https://github.com/123irf#-hi-there-im-mohd-irfan--web-developer"
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
      </div>
    </>
  );
}
