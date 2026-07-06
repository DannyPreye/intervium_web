import type { GeneratedResume } from '../types'
import React from 'react'
import { StyleConfig } from '../ResumeBuilder'
import { A, toRgb } from './_shared'

export const TechnicalTemplate: React.FC<{ resume: GeneratedResume; style: StyleConfig }> = ({
  resume,
  style,
}) => {
  const rgb = toRgb(style.primaryColor)

  return (
    <div style={{ fontFamily: style.bodyFont }} className="bg-white text-slate-800">
      {/* ─── HEADER ──────────────────────────────────────────────── */}
      <header
        className="px-9 pt-9 pb-7 relative"
        style={{
          backgroundColor: `rgba(${rgb}, 0.03)`,
          borderBottom: `1px solid rgba(${rgb}, 0.1)`,
        }}
      >
        {/* Top-left corner bracket */}
        <div className="absolute top-0 left-0 w-5 h-5">
          <div className="absolute top-0 left-0 w-5 h-[2px]" style={{ backgroundColor: style.primaryColor }} />
          <div className="absolute top-0 left-0 h-5 w-[2px]" style={{ backgroundColor: style.primaryColor }} />
        </div>
        {/* Bottom-right corner bracket */}
        <div className="absolute bottom-0 right-0 w-5 h-5">
          <div className="absolute bottom-0 right-0 w-5 h-[2px]" style={{ backgroundColor: style.primaryColor }} />
          <div className="absolute bottom-0 right-0 h-5 w-[2px]" style={{ backgroundColor: style.primaryColor }} />
        </div>

        <div className="flex justify-between items-start gap-6">
          {/* Name + role */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[calc(9px*var(--rs))] font-black font-mono" style={{ color: `rgba(${rgb}, 0.4)` }}>
                &gt;_
              </span>
              <span className="text-[calc(8px*var(--rs))] font-bold uppercase tracking-[0.25em]" style={{ color: `rgba(${rgb}, 0.35)` }}>
                resume.json
              </span>
            </div>
            <h1
              className="text-[calc(30px*var(--rs))] font-bold tracking-tight leading-none text-slate-900"
              style={{ fontFamily: style.headingFont }}
            >
              {resume.personalInfo?.name}
            </h1>
            <p className="text-[calc(10px*var(--rs))] font-black uppercase tracking-[0.25em] mt-2" style={{ color: style.primaryColor }}>
              {resume.jobTitle}
            </p>
          </div>

          {/* Contact — right column */}
          <div className="text-right space-y-1 shrink-0 pt-6">
            {resume.personalInfo?.email && (
              <p className="text-[calc(10px*var(--rs))] font-mono text-[var(--rs-secondary)]">
                <A href={`mailto:${resume.personalInfo.email}`}>{resume.personalInfo.email}</A>
              </p>
            )}
            {resume.personalInfo?.phone && (
              <p className="text-[calc(10px*var(--rs))] font-mono text-[var(--rs-secondary)]">
                <A href={`tel:${resume.personalInfo.phone}`}>{resume.personalInfo.phone}</A>
              </p>
            )}
            {resume.personalInfo?.location && (
              <p className="text-[calc(10px*var(--rs))] font-mono text-[var(--rs-secondary)]">{resume.personalInfo.location}</p>
            )}
            {(resume.personalInfo?.linkedIn || resume.personalInfo?.github || resume.personalInfo?.portfolio) && (
              <div className="flex gap-3 justify-end pt-1">
                {resume.personalInfo.linkedIn && (
                  <A href={resume.personalInfo.linkedIn} color={style.primaryColor}>
                    <span className="text-[calc(9px*var(--rs))] font-bold uppercase tracking-[0.15em]" style={{ color: style.primaryColor }}>
                      LinkedIn
                    </span>
                  </A>
                )}
                {resume.personalInfo.github && (
                  <A href={resume.personalInfo.github} color={style.primaryColor}>
                    <span className="text-[calc(9px*var(--rs))] font-bold uppercase tracking-[0.15em]" style={{ color: style.primaryColor }}>
                      GitHub
                    </span>
                  </A>
                )}
                {resume.personalInfo.portfolio && (
                  <A href={resume.personalInfo.portfolio} color={style.primaryColor}>
                    <span className="text-[calc(9px*var(--rs))] font-bold uppercase tracking-[0.15em]" style={{ color: style.primaryColor }}>
                      Portfolio
                    </span>
                  </A>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── BODY ────────────────────────────────────────────────── */}
      <div className="px-9 py-7 space-y-6">
        {/* Skills — compact inline toolbar at top */}
        {((resume.skills?.technical?.length ?? 0) > 0 || (resume.skills?.soft?.length ?? 0) > 0) && (
          <section
            className="p-4 rounded-sm"
            style={{
              backgroundColor: `rgba(${rgb}, 0.04)`,
              border: `1px solid rgba(${rgb}, 0.1)`,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[calc(8px*var(--rs))] font-black uppercase tracking-[0.28em]" style={{ color: `rgba(${rgb}, 0.5)` }}>
                // Technical Toolkit
              </span>
              <div className="flex-1 h-px" style={{ backgroundColor: `rgba(${rgb}, 0.1)` }} />
            </div>
            <div className="flex flex-wrap gap-2">
              {[...(resume.skills?.technical ?? []), ...(resume.skills?.soft ?? [])].map((s, i) => (
                <span
                  key={i}
                  className="text-[calc(10px*var(--rs))] font-bold text-slate-700 px-2.5 py-1 rounded-sm font-mono"
                  style={{
                    backgroundColor: `rgba(${rgb}, 0.07)`,
                    border: `1px solid rgba(${rgb}, 0.15)`,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Summary */}
        {resume.summary && (
          <section>
            <SectionHeading label="Summary" rgb={rgb} />
            <p className="text-[calc(12px*var(--rs))] leading-[1.85] text-slate-600 mt-3">{resume.summary}</p>
          </section>
        )}

        {/* Experience */}
        {resume.experience && resume.experience.length > 0 && (
          <section>
            <SectionHeading label="Experience" rgb={rgb} />
            <div className="mt-4 space-y-5">
              {resume.experience.map((exp, i) => (
                <div key={i} className="relative pl-4" style={{ pageBreakInside: 'avoid' }}>
                  {/* Timeline */}
                  <div
                    className="absolute left-0 top-[6px] bottom-0 w-px"
                    style={{ backgroundColor: `rgba(${rgb}, ${i === 0 ? '0.4' : '0.12'})` }}
                  />
                  <div
                    className="absolute left-[-3.5px] top-[4.5px] w-[8px] h-[8px] rounded-sm border-2 border-white"
                    style={{ backgroundColor: style.primaryColor, opacity: i === 0 ? 1 : 0.35 }}
                  />
                  <div className="flex justify-between items-start gap-4 mb-1">
                    <h3 className="text-[calc(13px*var(--rs))] font-bold leading-tight" style={{ fontFamily: style.headingFont }}>
                      <span style={{ color: style.primaryColor }}>{exp.role}</span>
                      <span className="text-[var(--rs-secondary)] font-normal mx-1.5">@</span>
                      <span className="text-slate-900">{exp.company}</span>
                    </h3>
                    <span
                      className="text-[calc(9px*var(--rs))] font-bold uppercase tracking-[0.15em] whitespace-nowrap pt-0.5 font-mono"
                      style={{ color: `rgba(${rgb}, 0.45)` }}
                    >
                      {exp.startDate} — {exp.endDate}
                    </span>
                  </div>
                  {exp.location && (
                    <p className="text-[calc(9px*var(--rs))] font-semibold text-[var(--rs-secondary)] italic mb-2">{exp.location}</p>
                  )}
                  <ul className="space-y-1.5 mt-2">
                    {exp.achievements?.map((a, j) => (
                      <li key={j} className="flex gap-2.5 text-[calc(11.5px*var(--rs))] text-slate-600 leading-relaxed">
                        <span className="shrink-0 font-mono text-[calc(10px*var(--rs))] mt-px" style={{ color: `rgba(${rgb}, 0.4)` }}>
                          ›
                        </span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {resume.projects && resume.projects.length > 0 && (
          <section>
            <SectionHeading label="Key Projects" rgb={rgb} />
            <div className="mt-4 space-y-3">
              {resume.projects.map((proj, i) => (
                <div
                  key={i}
                  className="p-4 rounded-sm"
                  style={{
                    backgroundColor: `rgba(${rgb}, 0.025)`,
                    border: `1px solid rgba(${rgb}, 0.09)`,
                    borderLeft: `3px solid rgba(${rgb}, ${i === 0 ? '0.7' : '0.2'})`,
                    pageBreakInside: 'avoid',
                  }}
                >
                  <div className="flex justify-between items-start gap-4 mb-1.5">
                    <h3
                      className="text-[calc(12.5px*var(--rs))] font-bold text-slate-900 leading-tight"
                      style={{ fontFamily: style.headingFont }}
                    >
                      {proj.name}
                    </h3>
                    {proj.link && (
                      <A href={proj.link} color={style.primaryColor}>
                        <span
                          className="text-[calc(8.5px*var(--rs))] font-bold font-mono px-2 py-0.5 rounded-sm shrink-0"
                          style={{
                            backgroundColor: `rgba(${rgb}, 0.08)`,
                            color: style.primaryColor,
                            border: `1px solid rgba(${rgb}, 0.15)`,
                          }}
                        >
                          view →
                        </span>
                      </A>
                    )}
                  </div>
                  <p className="text-[calc(11px*var(--rs))] text-slate-600 leading-relaxed mb-2.5">{proj.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies?.map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-[calc(8.5px*var(--rs))] font-bold font-mono px-2 py-0.5 rounded-sm"
                        style={{
                          backgroundColor: 'rgba(15,23,42,0.04)',
                          color: 'rgb(100 116 139)',
                          border: '1px solid rgba(15,23,42,0.08)',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education + Certifications */}
        {((resume.education && resume.education.length > 0) ||
          (resume.certifications && resume.certifications.length > 0)) && (
          <div className="grid grid-cols-2 gap-8">
            {resume.education && resume.education.length > 0 && (
              <section>
                <SectionHeading label="Education" rgb={rgb} />
                <div className="mt-3 space-y-3">
                  {resume.education.map((edu, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline gap-2">
                        <h3 className="text-[calc(12px*var(--rs))] font-bold text-slate-900 leading-tight">{edu.institution}</h3>
                        <span className="text-[calc(9px*var(--rs))] font-bold font-mono shrink-0" style={{ color: `rgba(${rgb}, 0.45)` }}>
                          {edu.startDate}–{edu.endDate}
                        </span>
                      </div>
                      <p className="text-[calc(10.5px*var(--rs))] text-[var(--rs-secondary)] font-medium mt-0.5">
                        {edu.degree}{edu.field ? ` · ${edu.field}` : ''}
                      </p>
                      {edu.location && (
                        <p className="text-[calc(9.5px*var(--rs))] text-[var(--rs-secondary)] italic mt-0.5">{edu.location}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
            {resume.certifications && resume.certifications.length > 0 && (
              <section>
                <SectionHeading label="Certifications" rgb={rgb} />
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {resume.certifications.map((cert, i) => (
                    <span
                      key={i}
                      className="text-[calc(9.5px*var(--rs))] font-bold text-slate-600 px-2.5 py-1 rounded-sm"
                      style={{
                        backgroundColor: `rgba(${rgb}, 0.05)`,
                        border: `1px solid rgba(${rgb}, 0.12)`,
                      }}
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Awards + Volunteer */}
        {((resume.awards && resume.awards.length > 0) ||
          (resume.volunteerWork && resume.volunteerWork.length > 0)) && (
          <div className="grid grid-cols-2 gap-8">
            {resume.awards && resume.awards.length > 0 && (
              <section>
                <SectionHeading label="Awards & Recognition" rgb={rgb} />
                <div className="mt-3 space-y-3">
                  {resume.awards.map((award, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline gap-2">
                        <h3 className="text-[calc(11.5px*var(--rs))] font-bold text-slate-800 leading-tight">{award.title}</h3>
                        <span className="text-[calc(9px*var(--rs))] font-bold font-mono shrink-0" style={{ color: `rgba(${rgb}, 0.4)` }}>
                          {award.date}
                        </span>
                      </div>
                      <p className="text-[calc(9px*var(--rs))] font-bold uppercase tracking-[0.15em] mt-0.5" style={{ color: style.primaryColor }}>
                        {award.issuer}
                      </p>
                      {award.description && (
                        <p className="text-[calc(10.5px*var(--rs))] text-[var(--rs-secondary)] mt-1 leading-relaxed">{award.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
            {resume.volunteerWork && resume.volunteerWork.length > 0 && (
              <section>
                <SectionHeading label="Volunteer Work" rgb={rgb} />
                <div className="mt-3 space-y-4">
                  {resume.volunteerWork.map((vol, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-[calc(12px*var(--rs))] font-bold leading-tight">
                          <span style={{ color: style.primaryColor }}>{vol.role}</span>
                          <span className="text-[var(--rs-secondary)] font-normal mx-1">@</span>
                          <span className="text-slate-800">{vol.organization}</span>
                        </h3>
                        <span
                          className="text-[calc(9px*var(--rs))] font-bold font-mono shrink-0 whitespace-nowrap pt-0.5"
                          style={{ color: `rgba(${rgb}, 0.45)` }}
                        >
                          {vol.startDate}–{vol.endDate}
                        </span>
                      </div>
                      <ul className="mt-1.5 space-y-1">
                        {vol.achievements?.map((a, j) => (
                          <li key={j} className="flex gap-2 text-[calc(10.5px*var(--rs))] text-slate-600 leading-relaxed">
                            <span className="shrink-0 font-mono text-[calc(10px*var(--rs))] mt-px" style={{ color: `rgba(${rgb}, 0.4)` }}>›</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Publications · Languages · Interests */}
        {((resume.publications && resume.publications.length > 0) ||
          (resume.languages && resume.languages.length > 0) ||
          (resume.interests && resume.interests.length > 0)) && (
          <div className="grid grid-cols-3 gap-6">
            {resume.publications && resume.publications.length > 0 && (
              <section>
                <SectionHeading label="Publications" rgb={rgb} />
                <div className="mt-3 space-y-3">
                  {resume.publications.map((pub, i) => (
                    <div key={i}>
                      <h3 className="text-[calc(11px*var(--rs))] font-bold text-slate-800 leading-snug">{pub.title}</h3>
                      <p className="text-[calc(9.5px*var(--rs))] text-[var(--rs-secondary)] italic mt-0.5">
                        {pub.publisher} · {pub.date}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {resume.languages && resume.languages.length > 0 && (
              <section>
                <SectionHeading label="Languages" rgb={rgb} />
                <div className="mt-3 space-y-2">
                  {resume.languages.map((lang, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-[calc(11.5px*var(--rs))] font-semibold text-slate-700">{lang.language}</span>
                      <span
                        className="text-[calc(8px*var(--rs))] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm"
                        style={{
                          backgroundColor: `rgba(${rgb}, 0.07)`,
                          color: style.primaryColor,
                        }}
                      >
                        {lang.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {resume.interests && resume.interests.length > 0 && (
              <section>
                <SectionHeading label="Interests" rgb={rgb} />
                <p className="mt-3 text-[calc(11px*var(--rs))] text-slate-600 leading-relaxed">
                  {resume.interests.join(' · ')}
                </p>
              </section>
            )}
          </div>
        )}

        {/* References */}
        {resume.references && resume.references.length > 0 && (
          <section>
            <SectionHeading label="References" rgb={rgb} />
            <div className="mt-3 grid grid-cols-3 gap-4">
              {resume.references.map((ref, i) => (
                <div
                  key={i}
                  className="p-3 rounded-sm"
                  style={{
                    backgroundColor: `rgba(${rgb}, 0.03)`,
                    border: `1px solid rgba(${rgb}, 0.08)`,
                  }}
                >
                  <h3 className="text-[calc(11.5px*var(--rs))] font-bold text-slate-900">{ref.name}</h3>
                  <p className="text-[calc(9.5px*var(--rs))] font-semibold text-[var(--rs-secondary)] mt-0.5 leading-tight">{ref.title}</p>
                  <p className="text-[calc(9px*var(--rs))] font-bold uppercase tracking-[0.12em] mt-0.5" style={{ color: style.primaryColor }}>
                    {ref.company}
                  </p>
                  <p className="text-[calc(9.5px*var(--rs))] font-mono text-[var(--rs-secondary)] mt-1.5">{ref.contact}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ─── FOOTER ──────────────────────────────────────────────── */}
      <footer
        className="px-9 py-3 flex justify-between items-center"
        style={{ borderTop: `1px solid rgba(${rgb}, 0.08)` }}
      >
        <span className="text-[calc(8px*var(--rs))] font-mono" style={{ color: `rgba(${rgb}, 0.25)` }}>
          &gt;_ {resume.personalInfo?.name?.toLowerCase().replace(/\s+/g, '.')}.resume
        </span>
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <span
              key={i}
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: style.primaryColor, opacity: 0.15 + i * 0.15 }}
            />
          ))}
        </div>
      </footer>
    </div>
  )
}

const SectionHeading: React.FC<{ label: string; rgb: string }> = ({ label, rgb }) => (
  <div className="flex items-center gap-2.5">
    <span className="text-[calc(8px*var(--rs))] font-black font-mono" style={{ color: `rgba(${rgb}, 0.35)` }}>
      //
    </span>
    <h2 className="text-[calc(9px*var(--rs))] font-black uppercase tracking-[0.28em] text-[var(--rs-secondary)] whitespace-nowrap">
      {label}
    </h2>
    <div className="flex-1 h-px" style={{ backgroundColor: `rgba(${rgb}, 0.1)` }} />
  </div>
)
