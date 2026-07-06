import type { GeneratedResume } from '../types'
import React from 'react'
import { StyleConfig } from '../ResumeBuilder'
import { A, toRgb } from './_shared'

export const ExecutiveTemplate: React.FC<{ resume: GeneratedResume; style: StyleConfig }> = ({
  resume,
  style,
}) => {
  const rgb = toRgb(style.primaryColor)

  const contactItems = [
    resume.personalInfo?.location,
    resume.personalInfo?.email
      ? { label: resume.personalInfo.email, href: `mailto:${resume.personalInfo.email}` }
      : null,
    resume.personalInfo?.phone
      ? { label: resume.personalInfo.phone, href: `tel:${resume.personalInfo.phone}` }
      : null,
    resume.personalInfo?.linkedIn
      ? { label: 'LinkedIn', href: resume.personalInfo.linkedIn, accent: true }
      : null,
    resume.personalInfo?.github
      ? { label: 'GitHub', href: resume.personalInfo.github, accent: true }
      : null,
    resume.personalInfo?.portfolio
      ? { label: 'Portfolio', href: resume.personalInfo.portfolio, accent: true }
      : null,
  ].filter(Boolean) as Array<string | { label: string; href: string; accent?: boolean }>

  return (
    <div style={{ fontFamily: style.bodyFont }} className="bg-white text-slate-800">
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="relative px-12 pt-10 pb-8">
        <div className="absolute top-0 left-0 right-0">
          <div className="h-[4px]" style={{ backgroundColor: style.primaryColor }} />
          <div
            className="h-px mt-[3px] mx-12"
            style={{ backgroundColor: `rgba(${rgb}, 0.15)` }}
          />
        </div>

        <h1
          className="text-center text-[calc(34px*var(--rs))] font-bold uppercase tracking-[0.07em] text-slate-900 leading-none mb-2.5"
          style={{ fontFamily: style.headingFont }}
        >
          {resume.personalInfo?.name}
        </h1>

        <p
          className="text-center text-[calc(10px*var(--rs))] font-black uppercase tracking-[0.35em] mb-6"
          style={{ color: style.primaryColor }}
        >
          {resume.jobTitle}
        </p>

        {/* Contact — horizontal pipe-separated */}
        <div className="flex flex-wrap items-center justify-center text-[calc(10px*var(--rs))] font-semibold text-[var(--rs-secondary)] uppercase tracking-[0.1em]">
          {contactItems.map((item, i) => (
            <React.Fragment key={i}>
              {typeof item === 'string' ? (
                <span className="px-3">{item}</span>
              ) : item.accent ? (
                <span className="px-3" style={{ color: style.primaryColor }}>
                  <A href={item.href} color={style.primaryColor}>
                    {item.label}
                  </A>
                </span>
              ) : (
                <span className="px-3">
                  <A href={item.href}>{item.label}</A>
                </span>
              )}
              {i < contactItems.length - 1 && (
                <span className="text-slate-200 font-thin select-none">|</span>
              )}
            </React.Fragment>
          ))}
        </div>

        <div
          className="absolute bottom-0 left-12 right-12 h-px"
          style={{ backgroundColor: `rgba(${rgb}, 0.15)` }}
        />
      </header>

      {/* ── BODY ────────────────────────────────────────────────── */}
      <div className="px-12 py-8 space-y-7">
        {resume.summary && (
          <section>
            <SectionRule label="Professional Summary" color={style.primaryColor} rgb={rgb} />
            <p className="text-[calc(12px*var(--rs))] leading-[1.9] text-slate-600 mt-3 text-justify">
              {resume.summary}
            </p>
          </section>
        )}

        {resume.experience && resume.experience.length > 0 && (
          <section>
            <SectionRule label="Professional Experience" color={style.primaryColor} rgb={rgb} />
            <div className="mt-4 space-y-6">
              {resume.experience.map((exp, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-start gap-6">
                    <div>
                      <h3
                        className="text-[calc(13.5px*var(--rs))] font-bold text-slate-900 leading-tight"
                        style={{ fontFamily: style.headingFont }}
                      >
                        {exp.role}
                      </h3>
                      <p
                        className="text-[calc(10px*var(--rs))] font-black uppercase tracking-[0.2em] mt-0.5"
                        style={{ color: style.primaryColor }}
                      >
                        {exp.company}
                        {exp.location ? ` — ${exp.location}` : ''}
                      </p>
                    </div>
                    <span className="text-[calc(9px*var(--rs))] font-bold text-[var(--rs-secondary)] uppercase tracking-wider whitespace-nowrap pt-0.5">
                      {exp.startDate} – {exp.endDate}
                    </span>
                  </div>
                  <ul className="mt-2.5 space-y-1.5 pl-1">
                    {exp.achievements?.map((a, j) => (
                      <li key={j} className="flex gap-3 text-[calc(11.5px*var(--rs))] text-slate-600 leading-relaxed">
                        <span
                          className="shrink-0 mt-[6px] w-1 h-1 rounded-full"
                          style={{ backgroundColor: style.primaryColor, opacity: 0.5 }}
                        />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {((resume.skills?.technical?.length ?? 0) > 0 ||
          (resume.skills?.soft?.length ?? 0) > 0) && (
          <section>
            <SectionRule label="Core Competencies" color={style.primaryColor} rgb={rgb} />
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              {[...(resume.skills?.technical ?? []), ...(resume.skills?.soft ?? [])].map((s, i) => (
                <span
                  key={i}
                  className="text-[calc(11px*var(--rs))] font-semibold text-slate-600 flex items-center gap-2"
                >
                  <span
                    className="w-1 h-1 rounded-full shrink-0"
                    style={{ backgroundColor: style.primaryColor, opacity: 0.6 }}
                  />
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {resume.education && resume.education.length > 0 && (
          <section>
            <SectionRule label="Education" color={style.primaryColor} rgb={rgb} />
            <div className="mt-4 space-y-3">
              {resume.education.map((edu, i) => (
                <div key={i} className="flex justify-between items-start gap-6">
                  <div>
                    <h3 className="text-[calc(13px*var(--rs))] font-bold text-slate-900 leading-tight">
                      {edu.institution}
                    </h3>
                    <p className="text-[calc(11px*var(--rs))] font-semibold text-[var(--rs-secondary)] mt-0.5">
                      {edu.degree}
                      {edu.field ? ` in ${edu.field}` : ''}
                    </p>
                    {edu.location && (
                      <p className="text-[calc(10px*var(--rs))] text-[var(--rs-secondary)] italic mt-0.5">{edu.location}</p>
                    )}
                  </div>
                  <span className="text-[calc(9px*var(--rs))] font-bold text-[var(--rs-secondary)] uppercase tracking-wider whitespace-nowrap pt-0.5">
                    {edu.startDate} – {edu.endDate}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {resume.projects && resume.projects.length > 0 && (
          <section>
            <SectionRule label="Key Projects" color={style.primaryColor} rgb={rgb} />
            <div className="mt-4 space-y-4">
              {resume.projects.map((proj, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-baseline gap-4">
                    <h3
                      className="text-[calc(12.5px*var(--rs))] font-bold text-slate-900"
                      style={{ fontFamily: style.headingFont }}
                    >
                      {proj.name}
                    </h3>
                    {proj.link && (
                      <A href={proj.link} color={style.primaryColor}>
                        <span
                          className="text-[calc(9px*var(--rs))] font-bold uppercase tracking-[0.12em] shrink-0"
                          style={{ color: style.primaryColor }}
                        >
                          View Project →
                        </span>
                      </A>
                    )}
                  </div>
                  <p className="text-[calc(11.5px*var(--rs))] text-slate-600 leading-relaxed mt-1">
                    {proj.description}
                  </p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <p className="text-[calc(9px*var(--rs))] font-bold uppercase tracking-[0.15em] text-[var(--rs-secondary)] mt-1.5">
                      {proj.technologies.join(' · ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {((resume.awards && resume.awards.length > 0) ||
          (resume.certifications && resume.certifications.length > 0)) && (
          <section className="grid grid-cols-2 gap-8">
            {resume.awards && resume.awards.length > 0 && (
              <div>
                <SectionRule label="Awards" color={style.primaryColor} rgb={rgb} />
                <div className="mt-3 space-y-3">
                  {resume.awards.map((award, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline gap-2">
                        <h3 className="text-[calc(12px*var(--rs))] font-bold text-slate-800">{award.title}</h3>
                        <span className="text-[calc(9px*var(--rs))] font-bold text-[var(--rs-secondary)] tracking-wider shrink-0">
                          {award.date}
                        </span>
                      </div>
                      <p
                        className="text-[calc(9px*var(--rs))] font-bold uppercase tracking-[0.15em] mt-0.5"
                        style={{ color: style.primaryColor }}
                      >
                        {award.issuer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {resume.certifications && resume.certifications.length > 0 && (
              <div>
                <SectionRule label="Certifications" color={style.primaryColor} rgb={rgb} />
                <ul className="mt-3 space-y-2">
                  {resume.certifications.map((cert, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-[calc(11.5px*var(--rs))] text-slate-600 font-medium items-start"
                    >
                      <span
                        className="shrink-0 mt-[6px] w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: style.primaryColor, opacity: 0.5 }}
                      />
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {resume.volunteerWork && resume.volunteerWork.length > 0 && (
          <section>
            <SectionRule label="Volunteer Work" color={style.primaryColor} rgb={rgb} />
            <div className="mt-4 space-y-4">
              {resume.volunteerWork.map((vol, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-start gap-6">
                    <div>
                      <h3 className="text-[calc(13px*var(--rs))] font-bold text-slate-900 leading-tight">
                        {vol.role}
                      </h3>
                      <p
                        className="text-[calc(10px*var(--rs))] font-black uppercase tracking-[0.2em] mt-0.5"
                        style={{ color: style.primaryColor }}
                      >
                        {vol.organization}
                      </p>
                    </div>
                    <span className="text-[calc(9px*var(--rs))] font-bold text-[var(--rs-secondary)] uppercase tracking-wider whitespace-nowrap pt-0.5">
                      {vol.startDate} – {vol.endDate}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1.5 pl-1">
                    {vol.achievements?.map((a, j) => (
                      <li key={j} className="flex gap-3 text-[calc(11.5px*var(--rs))] text-slate-600 leading-relaxed">
                        <span
                          className="shrink-0 mt-[6px] w-1 h-1 rounded-full"
                          style={{ backgroundColor: style.primaryColor, opacity: 0.5 }}
                        />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {((resume.languages && resume.languages.length > 0) ||
          (resume.interests && resume.interests.length > 0)) && (
          <section className="grid grid-cols-2 gap-8">
            {resume.languages && resume.languages.length > 0 && (
              <div>
                <SectionRule label="Languages" color={style.primaryColor} rgb={rgb} />
                <div className="mt-3 space-y-1.5">
                  {resume.languages.map((lang, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-[calc(11.5px*var(--rs))] font-semibold text-slate-700">
                        {lang.language}
                      </span>
                      <span className="text-[calc(10px*var(--rs))] text-[var(--rs-secondary)] font-medium italic">
                        {lang.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {resume.interests && resume.interests.length > 0 && (
              <div>
                <SectionRule label="Interests" color={style.primaryColor} rgb={rgb} />
                <p className="mt-3 text-[calc(11.5px*var(--rs))] text-slate-600 font-medium leading-relaxed">
                  {resume.interests.join(' · ')}
                </p>
              </div>
            )}
          </section>
        )}

        {resume.references && resume.references.length > 0 && (
          <section>
            <SectionRule label="References" color={style.primaryColor} rgb={rgb} />
            <div className="mt-4 grid grid-cols-3 gap-5">
              {resume.references.map((ref, i) => (
                <div
                  key={i}
                  className="p-3 rounded-sm"
                  style={{
                    backgroundColor: `rgba(${rgb}, 0.03)`,
                    border: `1px solid rgba(${rgb}, 0.08)`,
                  }}
                >
                  <h3 className="text-[calc(12px*var(--rs))] font-bold text-slate-800">{ref.name}</h3>
                  <p className="text-[calc(10px*var(--rs))] text-[var(--rs-secondary)] mt-0.5">
                    {ref.title} · {ref.company}
                  </p>
                  <p className="text-[calc(10px*var(--rs))] font-semibold mt-1.5" style={{ color: style.primaryColor }}>
                    {ref.contact}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="px-12 pb-6 pt-2">
        <div className="h-[2px]" style={{ backgroundColor: `rgba(${rgb}, 0.1)` }} />
        <div className="h-px mt-[3px]" style={{ backgroundColor: style.primaryColor }} />
      </footer>
    </div>
  )
}

const SectionRule: React.FC<{ label: string; color: string; rgb: string }> = ({
  label,
  color,
  rgb,
}) => (
  <div className="mb-1">
    <h2
      className="text-[calc(10px*var(--rs))] font-black uppercase tracking-[0.3em] pb-1.5"
      style={{ color }}
    >
      {label}
    </h2>
    <div className="flex gap-1">
      <div className="h-[2px] w-8" style={{ backgroundColor: color }} />
      <div className="h-[2px] flex-1" style={{ backgroundColor: `rgba(${rgb}, 0.12)` }} />
    </div>
  </div>
)
