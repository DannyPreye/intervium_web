import type { GeneratedResume } from '../types'
import React from 'react'
import { StyleConfig } from '../ResumeBuilder'
import { A, toRgb } from './_shared'

export const ModernTemplate: React.FC<{ resume: GeneratedResume; style: StyleConfig }> = ({
  resume,
  style,
}) => {
  const rgb = toRgb(style.primaryColor)

  return (
    <div style={{ fontFamily: style.bodyFont }} className="bg-white text-slate-800">
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="relative px-10 pt-10 pb-8">
        <div
          className="absolute left-0 top-0 bottom-0 w-[5px]"
          style={{ backgroundColor: style.primaryColor }}
        />
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1
              className="text-[calc(32px*var(--rs))] font-extrabold tracking-tight leading-none text-slate-900"
              style={{ fontFamily: style.headingFont }}
            >
              {resume.personalInfo?.name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-5 h-[2px]" style={{ backgroundColor: style.primaryColor }} />
              <p
                className="text-[calc(10px*var(--rs))] font-black uppercase tracking-[0.28em]"
                style={{ color: style.primaryColor }}
              >
                {resume.jobTitle}
              </p>
            </div>
          </div>

          <div className="text-right space-y-1 flex-shrink-0 text-[calc(10px*var(--rs))] font-semibold text-[var(--rs-secondary)] uppercase tracking-[0.1em]">
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
            {resume.personalInfo?.location && <p>{resume.personalInfo.location}</p>}
            {resume.personalInfo?.linkedIn && (
              <p style={{ color: style.primaryColor }}>
                <A href={resume.personalInfo.linkedIn} color={style.primaryColor}>
                  LinkedIn
                </A>
              </p>
            )}
            {resume.personalInfo?.github && (
              <p style={{ color: style.primaryColor }}>
                <A href={resume.personalInfo.github} color={style.primaryColor}>
                  GitHub
                </A>
              </p>
            )}
            {resume.personalInfo?.portfolio && (
              <p style={{ color: style.primaryColor }}>
                <A href={resume.personalInfo.portfolio} color={style.primaryColor}>
                  Portfolio
                </A>
              </p>
            )}
          </div>
        </div>
        <div
          className="absolute bottom-0 left-5 right-10 h-px"
          style={{ backgroundColor: `rgba(${rgb}, 0.12)` }}
        />
      </header>

      {/* ── BODY ────────────────────────────────────────────────── */}
      <div className="px-10 py-8 space-y-7">
        {resume.summary && (
          <section>
            <SectionHeading label="Professional Summary" color={style.primaryColor} rgb={rgb} />
            <p className="text-[calc(12px*var(--rs))] leading-[1.85] text-slate-600 mt-3">{resume.summary}</p>
          </section>
        )}

        {resume.experience && resume.experience.length > 0 && (
          <section>
            <SectionHeading label="Work Experience" color={style.primaryColor} rgb={rgb} />
            <div className="mt-4 space-y-6">
              {resume.experience.map((exp, i) => (
                <div key={i} className="relative pl-4" style={{ pageBreakInside: 'avoid' }}>
                  <div
                    className="absolute left-0 top-[6px] bottom-0 w-px"
                    style={{
                      backgroundColor: `rgba(${rgb}, ${i === 0 ? '0.35' : '0.12'})`,
                    }}
                  />
                  <div
                    className="absolute left-[-3px] top-[5px] w-[7px] h-[7px] rounded-full border-2 border-white"
                    style={{ backgroundColor: style.primaryColor, opacity: i === 0 ? 1 : 0.4 }}
                  />
                  <div className="flex justify-between items-start gap-4 mb-1">
                    <h3
                      className="text-[calc(13px*var(--rs))] font-bold text-slate-900 leading-tight"
                      style={{ fontFamily: style.headingFont }}
                    >
                      {exp.role}
                    </h3>
                    <span className="text-[calc(9px*var(--rs))] font-bold text-[var(--rs-secondary)] uppercase tracking-[0.15em] whitespace-nowrap pt-0.5">
                      {exp.startDate} — {exp.endDate}
                    </span>
                  </div>
                  <p
                    className="text-[calc(10px*var(--rs))] font-black uppercase tracking-[0.2em] mb-2"
                    style={{ color: style.primaryColor }}
                  >
                    {exp.company}
                    {exp.location ? ` · ${exp.location}` : ''}
                  </p>
                  <ul className="space-y-1.5">
                    {exp.achievements?.map((a, j) => (
                      <li key={j} className="flex gap-2.5 text-[calc(11px*var(--rs))] text-slate-600 leading-relaxed">
                        <span
                          className="flex-shrink-0 mt-[6px] w-1 h-1 rounded-full"
                          style={{ backgroundColor: `rgba(${rgb}, 0.35)` }}
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
            <SectionHeading label="Core Skills" color={style.primaryColor} rgb={rgb} />
            <div className="mt-3 flex flex-wrap gap-2">
              {[...(resume.skills?.technical ?? []), ...(resume.skills?.soft ?? [])].map((s, i) => (
                <span
                  key={i}
                  className="text-[calc(10px*var(--rs))] font-semibold text-slate-700 px-3 py-1 rounded-sm"
                  style={{
                    backgroundColor: `rgba(${rgb}, 0.06)`,
                    border: `1px solid rgba(${rgb}, 0.13)`,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {resume.education && resume.education.length > 0 && (
          <section>
            <SectionHeading label="Education" color={style.primaryColor} rgb={rgb} />
            <div className="mt-4 space-y-3">
              {resume.education.map((edu, i) => (
                <div key={i} className="flex justify-between items-start gap-6">
                  <div>
                    <h3 className="text-[calc(12px*var(--rs))] font-bold text-slate-900 leading-tight">
                      {edu.institution}
                    </h3>
                    <p className="text-[calc(10.5px*var(--rs))] text-[var(--rs-secondary)] font-medium mt-0.5">
                      {edu.degree}
                      {edu.field ? ` in ${edu.field}` : ''}
                    </p>
                    {edu.location && (
                      <p className="text-[calc(9.5px*var(--rs))] text-[var(--rs-secondary)] italic mt-0.5">{edu.location}</p>
                    )}
                  </div>
                  <span className="text-[calc(9px*var(--rs))] font-bold text-[var(--rs-secondary)] uppercase tracking-wider whitespace-nowrap pt-0.5">
                    {edu.startDate} — {edu.endDate}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {resume.projects && resume.projects.length > 0 && (
          <section>
            <SectionHeading label="Projects" color={style.primaryColor} rgb={rgb} />
            <div className="mt-4 space-y-4">
              {resume.projects.map((proj, i) => (
                <div
                  key={i}
                  className="p-4 rounded-sm"
                  style={{
                    backgroundColor: `rgba(${rgb}, 0.025)`,
                    border: `1px solid rgba(${rgb}, 0.08)`,
                    pageBreakInside: 'avoid',
                  }}
                >
                  <div className="flex justify-between items-start gap-4 mb-1.5">
                    <h3
                      className="text-[calc(12px*var(--rs))] font-bold text-slate-900 leading-tight"
                      style={{ fontFamily: style.headingFont }}
                    >
                      {proj.name}
                    </h3>
                    {proj.link && (
                      <A href={proj.link} color={style.primaryColor}>
                        <span
                          className="text-[calc(8px*var(--rs))] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm flex-shrink-0"
                          style={{
                            backgroundColor: `rgba(${rgb}, 0.08)`,
                            color: style.primaryColor,
                            border: `1px solid rgba(${rgb}, 0.15)`,
                          }}
                        >
                          View →
                        </span>
                      </A>
                    )}
                  </div>
                  <p className="text-[calc(11px*var(--rs))] text-slate-600 leading-relaxed mb-2">{proj.description}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {proj.technologies?.map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-[calc(8px*var(--rs))] font-black uppercase tracking-[0.18em] text-[var(--rs-secondary)]"
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

        {((resume.awards && resume.awards.length > 0) ||
          (resume.certifications && resume.certifications.length > 0)) && (
          <section className="grid grid-cols-2 gap-8">
            {resume.awards && resume.awards.length > 0 && (
              <div>
                <SectionHeading label="Awards" color={style.primaryColor} rgb={rgb} />
                <div className="mt-3 space-y-3">
                  {resume.awards.map((award, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline gap-2">
                        <h3 className="text-[calc(11.5px*var(--rs))] font-bold text-slate-800 leading-tight">
                          {award.title}
                        </h3>
                        <span className="text-[calc(9px*var(--rs))] font-bold text-[var(--rs-secondary)] uppercase tracking-wider flex-shrink-0">
                          {award.date}
                        </span>
                      </div>
                      <p
                        className="text-[calc(9px*var(--rs))] font-bold uppercase tracking-[0.15em] mt-0.5"
                        style={{ color: style.primaryColor }}
                      >
                        {award.issuer}
                      </p>
                      {award.description && (
                        <p className="text-[calc(10.5px*var(--rs))] text-[var(--rs-secondary)] mt-1 leading-relaxed">
                          {award.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {resume.certifications && resume.certifications.length > 0 && (
              <div>
                <SectionHeading label="Certifications" color={style.primaryColor} rgb={rgb} />
                <ul className="mt-3 space-y-2">
                  {resume.certifications.map((cert, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-[calc(11px*var(--rs))] text-slate-600 font-medium items-start"
                    >
                      <span
                        className="flex-shrink-0 mt-[5px] w-1.5 h-1.5 rounded-full"
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
            <SectionHeading label="Volunteer Work" color={style.primaryColor} rgb={rgb} />
            <div className="mt-4 space-y-4">
              {resume.volunteerWork.map((vol, i) => (
                <div key={i} className="relative pl-4" style={{ pageBreakInside: 'avoid' }}>
                  <div
                    className="absolute left-0 top-[6px] bottom-0 w-px"
                    style={{ backgroundColor: `rgba(${rgb}, 0.12)` }}
                  />
                  <div className="flex justify-between items-start gap-4 mb-1">
                    <h3
                      className="text-[calc(12px*var(--rs))] font-bold text-slate-900 leading-tight"
                      style={{ fontFamily: style.headingFont }}
                    >
                      {vol.role}
                    </h3>
                    <span className="text-[calc(9px*var(--rs))] font-bold text-[var(--rs-secondary)] uppercase tracking-[0.15em] whitespace-nowrap pt-0.5">
                      {vol.startDate} — {vol.endDate}
                    </span>
                  </div>
                  <p
                    className="text-[calc(9px*var(--rs))] font-black uppercase tracking-[0.2em] mb-2"
                    style={{ color: style.primaryColor }}
                  >
                    {vol.organization}
                  </p>
                  <ul className="space-y-1.5">
                    {vol.achievements?.map((a, j) => (
                      <li key={j} className="flex gap-2.5 text-[calc(11px*var(--rs))] text-slate-600 leading-relaxed">
                        <span
                          className="flex-shrink-0 mt-[6px] w-1 h-1 rounded-full"
                          style={{ backgroundColor: `rgba(${rgb}, 0.35)` }}
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
                <SectionHeading label="Languages" color={style.primaryColor} rgb={rgb} />
                <div className="mt-3 space-y-2">
                  {resume.languages.map((lang, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-[calc(11.5px*var(--rs))] font-semibold text-slate-700">
                        {lang.language}
                      </span>
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
              </div>
            )}
            {resume.interests && resume.interests.length > 0 && (
              <div>
                <SectionHeading label="Interests" color={style.primaryColor} rgb={rgb} />
                <p className="mt-3 text-[calc(11px*var(--rs))] text-slate-600 font-medium leading-relaxed">
                  {resume.interests.join(' · ')}
                </p>
              </div>
            )}
          </section>
        )}

        {resume.references && resume.references.length > 0 && (
          <section>
            <SectionHeading label="References" color={style.primaryColor} rgb={rgb} />
            <div className="mt-4 grid grid-cols-2 gap-4">
              {resume.references.map((ref, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-sm"
                  style={{
                    backgroundColor: `rgba(${rgb}, 0.03)`,
                    border: `1px solid rgba(${rgb}, 0.08)`,
                  }}
                >
                  <h3 className="text-[calc(11.5px*var(--rs))] font-bold text-slate-800">{ref.name}</h3>
                  <p className="text-[calc(9.5px*var(--rs))] text-[var(--rs-secondary)] mt-0.5">
                    {ref.title} · {ref.company}
                  </p>
                  <p className="text-[calc(9.5px*var(--rs))] font-semibold mt-1.5" style={{ color: style.primaryColor }}>
                    {ref.contact}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className="relative px-10 pb-5 pt-1">
        <div
          className="absolute top-0 left-5 right-10 h-px"
          style={{ backgroundColor: `rgba(${rgb}, 0.1)` }}
        />
        <div
          className="absolute left-0 top-0 bottom-0 w-[5px]"
          style={{ backgroundColor: style.primaryColor, opacity: 0.15 }}
        />
      </footer>
    </div>
  )
}

const SectionHeading: React.FC<{ label: string; color: string; rgb: string }> = ({
  label,
  color,
  rgb,
}) => (
  <div className="flex items-center gap-3 mb-1">
    <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
    <h2
      className="text-[calc(9px*var(--rs))] font-black uppercase tracking-[0.3em] whitespace-nowrap"
      style={{ color }}
    >
      {label}
    </h2>
    <div className="flex-1 h-px" style={{ backgroundColor: `rgba(${rgb}, 0.12)` }} />
  </div>
)
