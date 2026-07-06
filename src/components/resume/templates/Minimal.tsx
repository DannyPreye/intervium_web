import type { GeneratedResume } from '../types'
import React from 'react'
import { StyleConfig } from '../ResumeBuilder'
import { A, toRgb } from './_shared'

export const MinimalTemplate: React.FC<{ resume: GeneratedResume; style: StyleConfig }> = ({
  resume,
  style,
}) => {
  const rgb = toRgb(style.primaryColor)

  return (
    <div style={{ fontFamily: style.bodyFont }} className="bg-white text-slate-800">
      {/* ─── HEADER ──────────────────────────────────────────────── */}
      <header className="px-12 pt-12 pb-8">
        <h1
          className="text-[calc(36px*var(--rs))] font-light text-slate-900 tracking-tight leading-none mb-1.5"
          style={{ fontFamily: style.headingFont }}
        >
          {resume.personalInfo?.name}
        </h1>
        <p className="text-[calc(12px*var(--rs))] font-medium mb-6" style={{ color: style.primaryColor }}>
          {resume.jobTitle}
        </p>

        {/* Contact — single line */}
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[calc(10px*var(--rs))] text-[var(--rs-secondary)]">
          {resume.personalInfo?.location && <span>{resume.personalInfo.location}</span>}
          {resume.personalInfo?.email && (
            <A href={`mailto:${resume.personalInfo.email}`}>
              <span className="text-[var(--rs-secondary)]">{resume.personalInfo.email}</span>
            </A>
          )}
          {resume.personalInfo?.phone && (
            <A href={`tel:${resume.personalInfo.phone}`}>
              <span className="text-[var(--rs-secondary)]">{resume.personalInfo.phone}</span>
            </A>
          )}
          {resume.personalInfo?.linkedIn && (
            <A href={resume.personalInfo.linkedIn} color={style.primaryColor}>
              <span style={{ color: style.primaryColor }}>LinkedIn</span>
            </A>
          )}
          {resume.personalInfo?.github && (
            <A href={resume.personalInfo.github} color={style.primaryColor}>
              <span style={{ color: style.primaryColor }}>GitHub</span>
            </A>
          )}
          {resume.personalInfo?.portfolio && (
            <A href={resume.personalInfo.portfolio} color={style.primaryColor}>
              <span style={{ color: style.primaryColor }}>Portfolio</span>
            </A>
          )}
        </div>

        <div className="mt-8 h-px" style={{ backgroundColor: `rgba(${rgb}, 0.12)` }} />
      </header>

      {/* ─── BODY ────────────────────────────────────────────────── */}
      <div className="px-12 pb-12 space-y-8">
        {/* Summary */}
        {resume.summary && (
          <section>
            <Sec label="Summary" color={style.primaryColor} rgb={rgb} />
            <p className="text-[calc(12px*var(--rs))] leading-[1.9] text-slate-600 mt-3">{resume.summary}</p>
          </section>
        )}

        {/* Experience */}
        {resume.experience && resume.experience.length > 0 && (
          <section>
            <Sec label="Experience" color={style.primaryColor} rgb={rgb} />
            <div className="mt-4 space-y-6">
              {resume.experience.map((exp, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-baseline gap-4">
                    <div>
                      <h3
                        className="text-[calc(13px*var(--rs))] font-semibold text-slate-900"
                        style={{ fontFamily: style.headingFont }}
                      >
                        {exp.role}
                      </h3>
                      <p className="text-[calc(11px*var(--rs))] text-[var(--rs-secondary)] mt-0.5">
                        {exp.company}{exp.location ? `, ${exp.location}` : ''}
                      </p>
                    </div>
                    <span className="text-[calc(10px*var(--rs))] text-[var(--rs-secondary)] whitespace-nowrap shrink-0">
                      {exp.startDate} – {exp.endDate}
                    </span>
                  </div>
                  <ul className="mt-2.5 space-y-1.5">
                    {exp.achievements?.map((a, j) => (
                      <li key={j} className="flex gap-3 text-[calc(11.5px*var(--rs))] text-slate-600 leading-relaxed">
                        <span className="shrink-0 mt-[7px] w-[3px] h-[3px] rounded-full" style={{ backgroundColor: style.primaryColor }} />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {((resume.skills?.technical?.length ?? 0) > 0 || (resume.skills?.soft?.length ?? 0) > 0) && (
          <section>
            <Sec label="Skills" color={style.primaryColor} rgb={rgb} />
            <p className="mt-3 text-[calc(11.5px*var(--rs))] text-slate-600 leading-relaxed">
              {[...(resume.skills?.technical ?? []), ...(resume.skills?.soft ?? [])].join('  ·  ')}
            </p>
          </section>
        )}

        {/* Education */}
        {resume.education && resume.education.length > 0 && (
          <section>
            <Sec label="Education" color={style.primaryColor} rgb={rgb} />
            <div className="mt-4 space-y-4">
              {resume.education.map((edu, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[calc(13px*var(--rs))] font-semibold text-slate-900">{edu.institution}</h3>
                    <p className="text-[calc(11px*var(--rs))] text-[var(--rs-secondary)] mt-0.5">
                      {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                    </p>
                    {edu.location && <p className="text-[calc(10px*var(--rs))] text-[var(--rs-secondary)] mt-0.5">{edu.location}</p>}
                  </div>
                  <span className="text-[calc(10px*var(--rs))] text-[var(--rs-secondary)] whitespace-nowrap shrink-0 pt-0.5">
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
            <Sec label="Projects" color={style.primaryColor} rgb={rgb} />
            <div className="mt-4 space-y-4">
              {resume.projects.map((proj, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-baseline gap-4">
                    <h3 className="text-[calc(13px*var(--rs))] font-semibold text-slate-900">{proj.name}</h3>
                    {proj.link && (
                      <A href={proj.link} color={style.primaryColor}>
                        <span className="text-[calc(10px*var(--rs))] shrink-0" style={{ color: style.primaryColor }}>
                          View →
                        </span>
                      </A>
                    )}
                  </div>
                  <p className="text-[calc(11.5px*var(--rs))] text-slate-600 leading-relaxed mt-1">{proj.description}</p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <p className="text-[calc(10px*var(--rs))] text-[var(--rs-secondary)] mt-1.5">{proj.technologies.join(' · ')}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {resume.certifications && resume.certifications.length > 0 && (
          <section>
            <Sec label="Certifications" color={style.primaryColor} rgb={rgb} />
            <ul className="mt-3 space-y-1.5">
              {resume.certifications.map((cert, i) => (
                <li key={i} className="flex gap-3 text-[calc(11.5px*var(--rs))] text-slate-600">
                  <span className="shrink-0 mt-[7px] w-[3px] h-[3px] rounded-full" style={{ backgroundColor: style.primaryColor }} />
                  {cert}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Awards */}
        {resume.awards && resume.awards.length > 0 && (
          <section>
            <Sec label="Awards" color={style.primaryColor} rgb={rgb} />
            <div className="mt-3 space-y-3">
              {resume.awards.map((award, i) => (
                <div key={i} className="flex justify-between items-baseline gap-4">
                  <div>
                    <h3 className="text-[calc(12px*var(--rs))] font-semibold text-slate-800">{award.title}</h3>
                    <p className="text-[calc(10px*var(--rs))] text-[var(--rs-secondary)] mt-0.5">{award.issuer}</p>
                  </div>
                  <span className="text-[calc(10px*var(--rs))] text-[var(--rs-secondary)] shrink-0">{award.date}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Volunteer */}
        {resume.volunteerWork && resume.volunteerWork.length > 0 && (
          <section>
            <Sec label="Volunteer" color={style.primaryColor} rgb={rgb} />
            <div className="mt-4 space-y-5">
              {resume.volunteerWork.map((vol, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline gap-4">
                    <div>
                      <h3 className="text-[calc(13px*var(--rs))] font-semibold text-slate-900">{vol.role}</h3>
                      <p className="text-[calc(11px*var(--rs))] text-[var(--rs-secondary)] mt-0.5">{vol.organization}</p>
                    </div>
                    <span className="text-[calc(10px*var(--rs))] text-[var(--rs-secondary)] whitespace-nowrap shrink-0">
                      {vol.startDate} – {vol.endDate}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {vol.achievements?.map((a, j) => (
                      <li key={j} className="flex gap-3 text-[calc(11.5px*var(--rs))] text-slate-600 leading-relaxed">
                        <span className="shrink-0 mt-[7px] w-[3px] h-[3px] rounded-full" style={{ backgroundColor: style.primaryColor }} />
                        {a}
                      </li>
                    ))}
                  </ul>
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
                <Sec label="Languages" color={style.primaryColor} rgb={rgb} />
                <div className="mt-3 space-y-2">
                  {resume.languages.map((lang, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-[calc(12px*var(--rs))] text-slate-700">{lang.language}</span>
                      <span className="text-[calc(10px*var(--rs))] text-[var(--rs-secondary)]">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {resume.interests && resume.interests.length > 0 && (
              <section>
                <Sec label="Interests" color={style.primaryColor} rgb={rgb} />
                <p className="mt-3 text-[calc(11.5px*var(--rs))] text-slate-600 leading-relaxed">
                  {resume.interests.join(' · ')}
                </p>
              </section>
            )}
          </div>
        )}

        {/* Publications */}
        {resume.publications && resume.publications.length > 0 && (
          <section>
            <Sec label="Publications" color={style.primaryColor} rgb={rgb} />
            <div className="mt-3 space-y-3">
              {resume.publications.map((pub, i) => (
                <div key={i} className="flex justify-between items-baseline gap-4">
                  <div>
                    <h3 className="text-[calc(12px*var(--rs))] font-semibold text-slate-800">{pub.title}</h3>
                    <p className="text-[calc(10px*var(--rs))] text-[var(--rs-secondary)] mt-0.5">{pub.publisher}</p>
                  </div>
                  <span className="text-[calc(10px*var(--rs))] text-[var(--rs-secondary)] shrink-0">{pub.date}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* References */}
        {resume.references && resume.references.length > 0 && (
          <section>
            <Sec label="References" color={style.primaryColor} rgb={rgb} />
            <div className="mt-4 grid grid-cols-2 gap-6">
              {resume.references.map((ref, i) => (
                <div key={i}>
                  <h3 className="text-[calc(12px*var(--rs))] font-semibold text-slate-800">{ref.name}</h3>
                  <p className="text-[calc(10px*var(--rs))] text-[var(--rs-secondary)] mt-0.5">{ref.title} · {ref.company}</p>
                  <p className="text-[calc(10px*var(--rs))] mt-1" style={{ color: style.primaryColor }}>{ref.contact}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

const Sec: React.FC<{ label: string; color: string; rgb: string }> = ({ label, color, rgb }) => (
  <div className="flex items-center gap-3 mb-1">
    <h2 className="text-[calc(9px*var(--rs))] font-bold uppercase tracking-[0.28em] whitespace-nowrap" style={{ color }}>
      {label}
    </h2>
    <div className="flex-1 h-px" style={{ backgroundColor: `rgba(${rgb}, 0.1)` }} />
  </div>
)
