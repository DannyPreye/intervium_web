import type { GeneratedResume } from '../types'
import React from 'react'
import { StyleConfig } from '../ResumeBuilder'
import { A, toRgb } from './_shared'

export const ElegantTemplate: React.FC<{ resume: GeneratedResume; style: StyleConfig }> = ({
  resume,
  style,
}) => {
  const rgb = toRgb(style.primaryColor)

  return (
    <div style={{ fontFamily: style.bodyFont }} className="text-slate-800 bg-white">
      {/* ─── HEADER ─────────────────────────────────────────────── */}
      <header className="relative px-14 pt-12 pb-10 overflow-hidden">
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: style.primaryColor }} />
        {/* Decorative large watermark letter */}
        <div
          className="absolute right-10 top-4 text-[calc(120px*var(--rs))] font-black leading-none select-none pointer-events-none text-slate-900"
          style={{ fontFamily: style.headingFont, opacity: 0.03 }}
          aria-hidden
        >
          {resume.personalInfo?.name?.charAt(0)}
        </div>

        <div className="relative">
          <h1
            className="text-[calc(38px*var(--rs))] text-center font-light tracking-[0.18em] text-slate-900 leading-none mb-3"
            style={{ fontFamily: style.headingFont }}
          >
            {resume.personalInfo?.name?.toUpperCase()}
          </h1>

          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-6 h-px" style={{ backgroundColor: style.primaryColor }} />
            <p className="text-[calc(11px*var(--rs))] font-bold uppercase tracking-[0.35em]" style={{ color: style.primaryColor }}>
              {resume.jobTitle}
            </p>
            <div className="w-6 h-px" style={{ backgroundColor: style.primaryColor }} />
          </div>

          {/* Contact row */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 items-center justify-center">
            {resume.personalInfo?.location && (
              <span className="text-[calc(10px*var(--rs))] font-semibold tracking-[0.12em] text-[var(--rs-secondary)] uppercase">
                {resume.personalInfo.location}
              </span>
            )}
            {resume.personalInfo?.location && resume.personalInfo?.email && (
              <span className="w-1 h-1 rounded-full bg-slate-200 shrink-0" />
            )}
            {resume.personalInfo?.email && (
              <A href={`mailto:${resume.personalInfo.email}`}>
                <span className="text-[calc(10px*var(--rs))] font-semibold tracking-[0.12em] text-[var(--rs-secondary)]">
                  {resume.personalInfo.email}
                </span>
              </A>
            )}
            {resume.personalInfo?.phone && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-200 shrink-0" />
                <A href={`tel:${resume.personalInfo.phone}`}>
                  <span className="text-[calc(10px*var(--rs))] font-semibold tracking-[0.12em] text-[var(--rs-secondary)] uppercase">
                    {resume.personalInfo.phone}
                  </span>
                </A>
              </>
            )}
            {resume.personalInfo?.linkedIn && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-200 shrink-0" />
                <A href={resume.personalInfo.linkedIn} color={style.primaryColor}>
                  <span className="text-[calc(10px*var(--rs))] font-bold tracking-[0.12em]" style={{ color: style.primaryColor }}>
                    LinkedIn
                  </span>
                </A>
              </>
            )}
            {resume.personalInfo?.github && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-200 shrink-0" />
                <A href={resume.personalInfo.github} color={style.primaryColor}>
                  <span className="text-[calc(10px*var(--rs))] font-bold tracking-[0.12em]" style={{ color: style.primaryColor }}>
                    GitHub
                  </span>
                </A>
              </>
            )}
            {resume.personalInfo?.portfolio && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-200 shrink-0" />
                <A href={resume.personalInfo.portfolio} color={style.primaryColor}>
                  <span className="text-[calc(10px*var(--rs))] font-bold tracking-[0.12em]" style={{ color: style.primaryColor }}>
                    Portfolio
                  </span>
                </A>
              </>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-14 right-14 h-px bg-slate-100" />
      </header>

      {/* ─── BODY ────────────────────────────────────────────────── */}
      <div className="px-14 py-10 space-y-10">
        {/* Summary */}
        {resume.summary && (
          <>
            <section className="grid grid-cols-12 gap-8">
              <div className="col-span-3">
                <SectionLabel label="Profile" />
              </div>
              <div className="col-span-9">
                <p
                  className="text-[calc(12.5px*var(--rs))] leading-[1.9] text-justify text-[var(--rs-secondary)] font-normal border-l-2 pl-5"
                  style={{ borderColor: `rgba(${rgb}, 0.2)` }}
                >
                  {resume.summary}
                </p>
              </div>
            </section>
            <Divider />
          </>
        )}

        {/* Experience */}
        {resume.experience && resume.experience.length > 0 && (
          <>
            <section>
              <div className="grid grid-cols-12 gap-8 mb-6">
                <div className="col-span-3">
                  <SectionLabel label="Experience" />
                </div>
              </div>
              <div className="space-y-8">
                {resume.experience.map((exp, i) => (
                  <div key={i} className="grid grid-cols-12 gap-8" style={{ pageBreakInside: 'avoid' }}>
                    <div className="col-span-3 text-right pt-0.5">
                      <p className="text-[calc(9px*var(--rs))] font-bold uppercase tracking-[0.2em] text-[var(--rs-secondary)] leading-loose">
                        {exp.startDate}
                      </p>
                      <p className="text-[calc(9px*var(--rs))] font-bold uppercase tracking-[0.2em] text-[var(--rs-secondary)] leading-loose">
                        {exp.endDate}
                      </p>
                    </div>
                    <div className="col-span-9 relative pl-6 border-l border-slate-100">
                      <div
                        className="absolute -left-[4.5px] top-[5px] w-2 h-2 rounded-full border-2 border-white"
                        style={{ backgroundColor: style.primaryColor }}
                      />
                      <h3
                        className="text-[calc(14px*var(--rs))] font-bold text-slate-900 leading-tight mb-1"
                        style={{ fontFamily: style.headingFont }}
                      >
                        {exp.role}
                      </h3>
                      <p className="text-[calc(9px*var(--rs))] font-black uppercase tracking-[0.25em] mb-3" style={{ color: style.primaryColor }}>
                        {exp.company}{exp.location ? ` — ${exp.location}` : ''}
                      </p>
                      <ul className="space-y-2">
                        {exp.achievements?.map((a, j) => (
                          <li key={j} className="flex gap-2.5 text-[calc(11.5px*var(--rs))] text-[var(--rs-secondary)] leading-relaxed">
                            <span
                              className="shrink-0 mt-[5px] w-1 h-1 rounded-full"
                              style={{ backgroundColor: `rgba(${rgb}, 0.35)` }}
                            />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <Divider />
          </>
        )}

        {/* Skills */}
        {((resume.skills?.technical?.length ?? 0) > 0 || (resume.skills?.soft?.length ?? 0) > 0) && (
          <>
            <section>
              <div className="grid grid-cols-12 gap-8 mb-4">
                <div className="col-span-3">
                  <SectionLabel label="Capabilities" />
                </div>
              </div>
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-3" />
                <div className="col-span-9">
                  <div className="flex flex-wrap gap-2">
                    {[...(resume.skills?.technical ?? []), ...(resume.skills?.soft ?? [])].map((s, i) => (
                      <span
                        key={i}
                        className="text-[calc(10px*var(--rs))] font-semibold tracking-[0.08em] text-slate-600 px-3 py-1.5 rounded-sm"
                        style={{
                          backgroundColor: `rgba(${rgb}, 0.06)`,
                          border: `1px solid rgba(${rgb}, 0.12)`,
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            <Divider />
          </>
        )}

        {/* Education */}
        {resume.education && resume.education.length > 0 && (
          <>
            <section>
              <div className="grid grid-cols-12 gap-8 mb-4">
                <div className="col-span-3">
                  <SectionLabel label="Education" />
                </div>
              </div>
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-3" />
                <div className="col-span-9 space-y-4">
                  {resume.education.map((edu, i) => (
                    <div key={i} className="flex justify-between items-start">
                      <div>
                        <h3 className="text-[calc(13px*var(--rs))] font-bold text-slate-800 leading-tight">{edu.institution}</h3>
                        <p className="text-[calc(10px*var(--rs))] font-bold uppercase tracking-[0.15em] text-[var(--rs-secondary)] mt-1">
                          {edu.degree}{edu.field ? ` · ${edu.field}` : ''}
                        </p>
                        {edu.location && (
                          <p className="text-[calc(10px*var(--rs))] text-[var(--rs-secondary)] italic mt-0.5">{edu.location}</p>
                        )}
                      </div>
                      <span className="text-[calc(9px*var(--rs))] font-bold text-[var(--rs-secondary)] uppercase tracking-widest whitespace-nowrap pt-0.5">
                        {edu.startDate} — {edu.endDate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <Divider />
          </>
        )}

        {/* Projects */}
        {resume.projects && resume.projects.length > 0 && (
          <>
            <section>
              <div className="grid grid-cols-12 gap-8 mb-4">
                <div className="col-span-3">
                  <SectionLabel label="Projects" />
                </div>
              </div>
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-3" />
                <div className="col-span-9 space-y-5">
                  {resume.projects.map((proj, i) => (
                    <div key={i} style={{ pageBreakInside: 'avoid' }}>
                      <div className="flex justify-between items-start mb-1">
                        <h3
                          className="text-[calc(13px*var(--rs))] font-bold text-slate-800"
                          style={{ fontFamily: style.headingFont }}
                        >
                          {proj.name}
                        </h3>
                        {proj.link && (
                          <A href={proj.link} color={style.primaryColor}>
                            <span
                              className="text-[calc(8px*var(--rs))] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm ml-3 shrink-0"
                              style={{
                                backgroundColor: `rgba(${rgb}, 0.07)`,
                                color: style.primaryColor,
                                border: `1px solid rgba(${rgb}, 0.15)`,
                              }}
                            >
                              View →
                            </span>
                          </A>
                        )}
                      </div>
                      <p className="text-[calc(11.5px*var(--rs))] text-[var(--rs-secondary)] leading-relaxed mb-2">{proj.description}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {proj.technologies?.map((tech, idx) => (
                          <span key={idx} className="text-[calc(8px*var(--rs))] font-black uppercase tracking-[0.18em] text-[var(--rs-secondary)]">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <Divider />
          </>
        )}

        {/* Awards */}
        {resume.awards && resume.awards.length > 0 && (
          <>
            <section>
              <div className="grid grid-cols-12 gap-8 mb-4">
                <div className="col-span-3">
                  <SectionLabel label="Recognition" />
                </div>
              </div>
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-3" />
                <div className="col-span-9 space-y-4">
                  {resume.awards.map((award, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-[calc(13px*var(--rs))] font-bold text-slate-800">{award.title}</h3>
                        <span className="text-[calc(9px*var(--rs))] font-bold text-[var(--rs-secondary)] uppercase tracking-widest">{award.date}</span>
                      </div>
                      <p className="text-[calc(9px*var(--rs))] font-bold uppercase tracking-[0.2em] mt-0.5" style={{ color: style.primaryColor }}>
                        {award.issuer}
                      </p>
                      {award.description && (
                        <p className="text-[calc(11.5px*var(--rs))] text-[var(--rs-secondary)] mt-1 leading-relaxed">{award.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <Divider />
          </>
        )}

        {/* Certifications */}
        {resume.certifications && resume.certifications.length > 0 && (
          <>
            <section>
              <div className="grid grid-cols-12 gap-8 mb-4">
                <div className="col-span-3">
                  <SectionLabel label="Certifications" />
                </div>
              </div>
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-3" />
                <div className="col-span-9">
                  <ul className="grid grid-cols-2 gap-x-8 gap-y-2">
                    {resume.certifications.map((cert, i) => (
                      <li key={i} className="flex gap-2 text-[calc(11.5px*var(--rs))] text-slate-600 font-medium items-start">
                        <span
                          className="shrink-0 mt-[6px] w-1 h-1 rounded-full"
                          style={{ backgroundColor: `rgba(${rgb}, 0.4)` }}
                        />
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
            <Divider />
          </>
        )}

        {/* Publications */}
        {resume.publications && resume.publications.length > 0 && (
          <>
            <section>
              <div className="grid grid-cols-12 gap-8 mb-4">
                <div className="col-span-3">
                  <SectionLabel label="Publications" />
                </div>
              </div>
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-3" />
                <div className="col-span-9 space-y-4">
                  {resume.publications.map((pub, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-[calc(13px*var(--rs))] font-bold text-slate-800">{pub.title}</h3>
                        <span className="text-[calc(9px*var(--rs))] font-bold text-[var(--rs-secondary)] uppercase tracking-widest">{pub.date}</span>
                      </div>
                      <p className="text-[calc(10px*var(--rs))] italic text-[var(--rs-secondary)] mt-0.5">{pub.publisher}</p>
                      {pub.description && (
                        <p className="text-[calc(11.5px*var(--rs))] text-[var(--rs-secondary)] mt-1 leading-relaxed">{pub.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <Divider />
          </>
        )}

        {/* Volunteer */}
        {resume.volunteerWork && resume.volunteerWork.length > 0 && (
          <>
            <section>
              <div className="grid grid-cols-12 gap-8 mb-4">
                <div className="col-span-3">
                  <SectionLabel label="Volunteering" />
                </div>
              </div>
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-3" />
                <div className="col-span-9 space-y-5">
                  {resume.volunteerWork.map((vol, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-[calc(13px*var(--rs))] font-bold text-slate-800">{vol.role}</h3>
                          <p className="text-[calc(9px*var(--rs))] font-black uppercase tracking-[0.22em] mt-0.5" style={{ color: style.primaryColor }}>
                            {vol.organization}
                          </p>
                        </div>
                        <span className="text-[calc(9px*var(--rs))] font-bold text-[var(--rs-secondary)] uppercase tracking-widest whitespace-nowrap pt-0.5">
                          {vol.startDate} — {vol.endDate}
                        </span>
                      </div>
                      <ul className="mt-2.5 space-y-1.5">
                        {vol.achievements?.map((a, j) => (
                          <li key={j} className="flex gap-2.5 text-[calc(11.5px*var(--rs))] text-[var(--rs-secondary)] leading-relaxed">
                            <span
                              className="shrink-0 mt-[6px] w-1 h-1 rounded-full"
                              style={{ backgroundColor: `rgba(${rgb}, 0.35)` }}
                            />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <Divider />
          </>
        )}

        {/* Languages + Interests */}
        {((resume.languages && resume.languages.length > 0) ||
          (resume.interests && resume.interests.length > 0)) && (
          <section>
            <div className="grid grid-cols-2 gap-10">
              {resume.languages && resume.languages.length > 0 && (
                <div>
                  <SectionLabel label="Languages" />
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-4">
                    {resume.languages.map((lang, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-2">
                        <span className="text-[calc(13px*var(--rs))] font-bold text-slate-800">{lang.language}</span>
                        <span
                          className="text-[calc(9px*var(--rs))] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-sm"
                          style={{
                            backgroundColor: `rgba(${rgb}, 0.08)`,
                            color: style.primaryColor,
                            border: `1px solid rgba(${rgb}, 0.1)`,
                          }}
                        >
                          {lang.proficiency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {resume.interests && resume.interests.length > 0 && (
                <div>
                  <SectionLabel label="Interests" />
                  <p className="text-[calc(12.5px*var(--rs))] text-[var(--rs-secondary)] leading-relaxed font-medium mt-4">
                    {resume.interests.join('  ·  ')}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* References */}
        {resume.references && resume.references.length > 0 && (
          <>
            <Divider />
            <section>
              <div className="grid grid-cols-12 gap-8 mb-4">
                <div className="col-span-3">
                  <SectionLabel label="References" />
                </div>
              </div>
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-3" />
                <div className="col-span-9 grid grid-cols-2 gap-6">
                  {resume.references.map((ref, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-sm"
                      style={{
                        backgroundColor: `rgba(${rgb}, 0.03)`,
                        border: `1px solid rgba(${rgb}, 0.08)`,
                      }}
                    >
                      <h3 className="text-[calc(12px*var(--rs))] font-bold text-slate-800">{ref.name}</h3>
                      <p className="text-[calc(10px*var(--rs))] italic text-[var(--rs-secondary)] mt-0.5">{ref.title} · {ref.company}</p>
                      <p className="text-[calc(10px*var(--rs))] font-semibold mt-2" style={{ color: style.primaryColor }}>
                        {ref.contact}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <p className="text-[calc(11px*var(--rs))] font-black uppercase tracking-[0.35em] text-[var(--rs-secondary)] pt-0.5">{label}</p>
)

const Divider: React.FC = () => <div className="h-px bg-slate-100 w-full" />
