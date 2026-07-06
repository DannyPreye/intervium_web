import type { GeneratedResume } from '../types'
import React from 'react'
import { StyleConfig } from '../ResumeBuilder'
import { A, toRgb } from './_shared'

export const SharpTemplate: React.FC<{ resume: GeneratedResume; style: StyleConfig }> = ({
  resume,
  style,
}) => {
  const rgb = toRgb(style.primaryColor)

  return (
    <div style={{ fontFamily: style.bodyFont }} className="bg-white text-slate-900">
      {/* ─── HEADER ──────────────────────────────────────────────── */}
      <header className="px-10 pt-10 pb-8 border-b-4 border-slate-900">
        <div className="flex justify-between items-end gap-6">
          <div>
            <h1
              className="text-[calc(40px*var(--rs))] font-black text-slate-900 leading-none tracking-tight"
              style={{ fontFamily: style.headingFont }}
            >
              {resume.personalInfo?.name}
            </h1>
            <p
              className="text-[calc(13px*var(--rs))] font-bold uppercase tracking-[0.25em] mt-2"
              style={{ color: style.primaryColor }}
            >
              {resume.jobTitle}
            </p>
          </div>

          {/* Contact block — right-aligned */}
          <div className="text-right text-[calc(10px*var(--rs))] text-[var(--rs-secondary)] space-y-1 shrink-0 pb-0.5">
            {resume.personalInfo?.location && <p>{resume.personalInfo.location}</p>}
            {resume.personalInfo?.email && (
              <p>
                <A href={`mailto:${resume.personalInfo.email}`}>{resume.personalInfo.email}</A>
              </p>
            )}
            {resume.personalInfo?.phone && (
              <p>
                <A href={`tel:${resume.personalInfo.phone}`}>{resume.personalInfo.phone}</A>
              </p>
            )}
            <div className="flex gap-3 justify-end pt-0.5">
              {resume.personalInfo?.linkedIn && (
                <A href={resume.personalInfo.linkedIn} color={style.primaryColor}>
                  <span className="font-bold" style={{ color: style.primaryColor }}>LinkedIn</span>
                </A>
              )}
              {resume.personalInfo?.github && (
                <A href={resume.personalInfo.github} color={style.primaryColor}>
                  <span className="font-bold" style={{ color: style.primaryColor }}>GitHub</span>
                </A>
              )}
              {resume.personalInfo?.portfolio && (
                <A href={resume.personalInfo.portfolio} color={style.primaryColor}>
                  <span className="font-bold" style={{ color: style.primaryColor }}>Portfolio</span>
                </A>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─── BODY ────────────────────────────────────────────────── */}
      <div className="px-10 py-8 space-y-7">
        {/* Summary */}
        {resume.summary && (
          <section>
            <Rule label="Summary" color={style.primaryColor} />
            <p className="text-[calc(12px*var(--rs))] leading-[1.9] text-slate-600 mt-3">{resume.summary}</p>
          </section>
        )}

        {/* Skills */}
        {((resume.skills?.technical?.length ?? 0) > 0 || (resume.skills?.soft?.length ?? 0) > 0) && (
          <section>
            <Rule label="Core Skills" color={style.primaryColor} />
            <div className="mt-3 flex flex-wrap gap-2">
              {[...(resume.skills?.technical ?? []), ...(resume.skills?.soft ?? [])].map((s, i) => (
                <span
                  key={i}
                  className="text-[calc(10.5px*var(--rs))] font-bold text-slate-700 px-3 py-1"
                  style={{
                    border: `1.5px solid rgba(${rgb}, 0.25)`,
                    backgroundColor: `rgba(${rgb}, 0.04)`,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {resume.experience && resume.experience.length > 0 && (
          <section>
            <Rule label="Experience" color={style.primaryColor} />
            <div className="mt-4 space-y-6">
              {resume.experience.map((exp, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3
                        className="text-[calc(14px*var(--rs))] font-black text-slate-900 leading-tight"
                        style={{ fontFamily: style.headingFont }}
                      >
                        {exp.role}
                      </h3>
                      <p className="text-[calc(11px*var(--rs))] font-bold text-[var(--rs-secondary)] mt-0.5 uppercase tracking-wide">
                        {exp.company}{exp.location ? ` — ${exp.location}` : ''}
                      </p>
                    </div>
                    <span
                      className="text-[calc(10px*var(--rs))] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 pt-0.5"
                      style={{ color: style.primaryColor }}
                    >
                      {exp.startDate} – {exp.endDate}
                    </span>
                  </div>
                  <ul className="mt-2.5 space-y-1.5 pl-1">
                    {exp.achievements?.map((a, j) => (
                      <li key={j} className="flex gap-3 text-[calc(11.5px*var(--rs))] text-slate-600 leading-relaxed">
                        <span
                          className="shrink-0 mt-[7px] w-[5px] h-[2px]"
                          style={{ backgroundColor: style.primaryColor }}
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

        {/* Education */}
        {resume.education && resume.education.length > 0 && (
          <section>
            <Rule label="Education" color={style.primaryColor} />
            <div className="mt-4 space-y-4">
              {resume.education.map((edu, i) => (
                <div key={i} className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-[calc(13px*var(--rs))] font-black text-slate-900">{edu.institution}</h3>
                    <p className="text-[calc(11px*var(--rs))] font-semibold text-[var(--rs-secondary)] mt-0.5">
                      {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                    </p>
                    {edu.location && <p className="text-[calc(10px*var(--rs))] text-[var(--rs-secondary)] mt-0.5">{edu.location}</p>}
                  </div>
                  <span
                    className="text-[calc(10px*var(--rs))] font-bold whitespace-nowrap shrink-0 pt-0.5"
                    style={{ color: style.primaryColor }}
                  >
                    {edu.startDate} – {edu.endDate}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {resume.projects && resume.projects.length > 0 && (
          <section>
            <Rule label="Projects" color={style.primaryColor} />
            <div className="mt-4 space-y-5">
              {resume.projects.map((proj, i) => (
                <div
                  key={i}
                  className="pl-4"
                  style={{
                    borderLeft: `3px solid ${style.primaryColor}`,
                    pageBreakInside: 'avoid',
                  }}
                >
                  <div className="flex justify-between items-baseline gap-4">
                    <h3
                      className="text-[calc(13px*var(--rs))] font-black text-slate-900"
                      style={{ fontFamily: style.headingFont }}
                    >
                      {proj.name}
                    </h3>
                    {proj.link && (
                      <A href={proj.link} color={style.primaryColor}>
                        <span
                          className="text-[calc(9px*var(--rs))] font-bold uppercase tracking-wider shrink-0"
                          style={{ color: style.primaryColor }}
                        >
                          View Project →
                        </span>
                      </A>
                    )}
                  </div>
                  <p className="text-[calc(11.5px*var(--rs))] text-slate-600 leading-relaxed mt-1">{proj.description}</p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <p className="text-[calc(10px*var(--rs))] font-bold uppercase tracking-wider text-[var(--rs-secondary)] mt-1.5">
                      {proj.technologies.join(' / ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications + Awards */}
        {((resume.certifications && resume.certifications.length > 0) ||
          (resume.awards && resume.awards.length > 0)) && (
          <div className="grid grid-cols-2 gap-8">
            {resume.certifications && resume.certifications.length > 0 && (
              <section>
                <Rule label="Certifications" color={style.primaryColor} />
                <ul className="mt-3 space-y-2">
                  {resume.certifications.map((cert, i) => (
                    <li key={i} className="flex gap-3 text-[calc(11.5px*var(--rs))] text-slate-600 font-medium">
                      <span
                        className="shrink-0 mt-[7px] w-[5px] h-[2px]"
                        style={{ backgroundColor: style.primaryColor }}
                      />
                      {cert}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {resume.awards && resume.awards.length > 0 && (
              <section>
                <Rule label="Awards" color={style.primaryColor} />
                <div className="mt-3 space-y-3">
                  {resume.awards.map((award, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline gap-2">
                        <h3 className="text-[calc(12px*var(--rs))] font-black text-slate-800">{award.title}</h3>
                        <span className="text-[calc(9px*var(--rs))] font-bold text-[var(--rs-secondary)] shrink-0">{award.date}</span>
                      </div>
                      <p className="text-[calc(10px*var(--rs))] font-bold uppercase tracking-wider mt-0.5" style={{ color: style.primaryColor }}>
                        {award.issuer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Volunteer */}
        {resume.volunteerWork && resume.volunteerWork.length > 0 && (
          <section>
            <Rule label="Volunteer Work" color={style.primaryColor} />
            <div className="mt-4 space-y-5">
              {resume.volunteerWork.map((vol, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-[calc(13px*var(--rs))] font-black text-slate-900">{vol.role}</h3>
                      <p className="text-[calc(11px*var(--rs))] font-bold text-[var(--rs-secondary)] mt-0.5 uppercase tracking-wide">
                        {vol.organization}
                      </p>
                    </div>
                    <span
                      className="text-[calc(10px*var(--rs))] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 pt-0.5"
                      style={{ color: style.primaryColor }}
                    >
                      {vol.startDate} – {vol.endDate}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1.5 pl-1">
                    {vol.achievements?.map((a, j) => (
                      <li key={j} className="flex gap-3 text-[calc(11.5px*var(--rs))] text-slate-600 leading-relaxed">
                        <span
                          className="shrink-0 mt-[7px] w-[5px] h-[2px]"
                          style={{ backgroundColor: style.primaryColor }}
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

        {/* Publications */}
        {resume.publications && resume.publications.length > 0 && (
          <section>
            <Rule label="Publications" color={style.primaryColor} />
            <div className="mt-3 space-y-3">
              {resume.publications.map((pub, i) => (
                <div key={i} className="flex justify-between items-baseline gap-4">
                  <div>
                    <h3 className="text-[calc(12px*var(--rs))] font-black text-slate-800">{pub.title}</h3>
                    <p className="text-[calc(10px*var(--rs))] text-[var(--rs-secondary)] mt-0.5 italic">{pub.publisher}</p>
                  </div>
                  <span className="text-[calc(10px*var(--rs))] font-bold text-[var(--rs-secondary)] shrink-0">{pub.date}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages + Interests */}
        {((resume.languages && resume.languages.length > 0) || (resume.interests && resume.interests.length > 0)) && (
          <div className="grid grid-cols-2 gap-8">
            {resume.languages && resume.languages.length > 0 && (
              <section>
                <Rule label="Languages" color={style.primaryColor} />
                <div className="mt-3 space-y-2">
                  {resume.languages.map((lang, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-[calc(12px*var(--rs))] font-bold text-slate-800">{lang.language}</span>
                      <span className="text-[calc(10px*var(--rs))] text-[var(--rs-secondary)] font-medium">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {resume.interests && resume.interests.length > 0 && (
              <section>
                <Rule label="Interests" color={style.primaryColor} />
                <p className="mt-3 text-[calc(11.5px*var(--rs))] text-slate-600 leading-relaxed">
                  {resume.interests.join(' · ')}
                </p>
              </section>
            )}
          </div>
        )}

        {/* References */}
        {resume.references && resume.references.length > 0 && (
          <section>
            <Rule label="References" color={style.primaryColor} />
            <div className="mt-4 grid grid-cols-3 gap-4">
              {resume.references.map((ref, i) => (
                <div
                  key={i}
                  className="p-3"
                  style={{
                    border: `1.5px solid rgba(${rgb}, 0.15)`,
                    borderTop: `3px solid ${style.primaryColor}`,
                  }}
                >
                  <h3 className="text-[calc(12px*var(--rs))] font-black text-slate-900">{ref.name}</h3>
                  <p className="text-[calc(10px*var(--rs))] text-[var(--rs-secondary)] mt-0.5">{ref.title} · {ref.company}</p>
                  <p className="text-[calc(10px*var(--rs))] font-bold mt-1.5" style={{ color: style.primaryColor }}>
                    {ref.contact}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ─── FOOTER ──────────────────────────────────────────────── */}
      <footer className="px-10 pb-8 pt-2">
        <div className="h-[3px] bg-slate-900" />
        <div className="h-[2px] mt-1" style={{ backgroundColor: style.primaryColor }} />
      </footer>
    </div>
  )
}

const Rule: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <div className="mb-2">
    <div className="flex items-center gap-3">
      <h2 className="text-[calc(11px*var(--rs))] font-black uppercase tracking-[0.2em] text-slate-900 whitespace-nowrap">
        {label}
      </h2>
      <div className="flex-1 h-[2px] bg-slate-900" />
    </div>
    <div className="h-[2px] mt-0.5 w-12" style={{ backgroundColor: color }} />
  </div>
)
