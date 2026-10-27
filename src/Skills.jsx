// import React from 'react';
import { FiCircle } from 'react-icons/fi';
import { LuCodeXml, LuServer, LuDatabase, LuSettings } from 'react-icons/lu';

export default function Skills() {
  const skills = {
    Frontend: ['React.js', 'JavaScript', 'HTML5', 'CSS3', 'Responsive Design'],
    Backend: ['Node.js', 'Express.js', 'Python', 'Django', 'REST APIs'],
    Database: ['MySQL', 'PostgreSQL', 'MongoDB', 'Apache Cassandra'],
    Tools: ['Git & GitHub', 'VS Code', 'Postman', 'API Integration'],
  };

  return (
    <section id="skills" className="py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14">
          Technical Skills
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {Object.entries(skills).map(([category, items]) => (
            <div
              key={category}
              className="skill-card group relative bg-[#050505] backdrop-blur-xl p-5 sm:p-7 rounded-[28px] border border-blue-500/30 shadow-[0_0_18px_rgba(0,112,255,0.08),inset_0_0_18px_rgba(0,112,255,0.025)] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-blue-400/60 hover:shadow-[0_0_28px_rgba(0,112,255,0.2),inset_0_0_22px_rgba(0,112,255,0.06)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,112,255,0.10),transparent_48%)] opacity-60 group-hover:opacity-100 transition duration-500"></div>

              <h3 className="text-xl sm:text-2xl font-bold mb-6 relative z-10 flex items-center gap-2">
                {category === 'Frontend' && (
                  <LuCodeXml className="w-6 h-6" aria-hidden="true" />
                )}
                {category === 'Backend' && (
                  <LuServer className="w-6 h-6" aria-hidden="true" />
                )}
                {category === 'Database' && (
                  <LuDatabase className="w-6 h-6" aria-hidden="true" />
                )}
                {category === 'Tools' && (
                  <LuSettings className="w-6 h-6" aria-hidden="true" />
                )}
                {category}
              </h3>

              <ul className="space-y-4 relative z-10">
                {items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-gray-400 group-hover:text-gray-200 transition duration-300"
                  >
                    <FiCircle className="w-2 h-2 fill-current" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
