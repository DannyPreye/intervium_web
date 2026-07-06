import type { GeneratedResume } from '../types'
import React from 'react'
import { StyleConfig } from '../ResumeBuilder'
import { A, toRgb } from './_shared'

export const CreativeTemplate: React.FC<{ resume: GeneratedResume; style: StyleConfig }> = ({
  resume,
  style,
}) => {
  const rgb = toRgb(style.primaryColor)

  return (
    <div style={{ fontFamily: style.bodyFont }} className="bg-white text-slate-800">
      {/* ── HEADER BAND ─────────────────────────────────────────── */}
      <header
        className="relative px-10 pt-9 pb-8 overflow-hidden"
        style={{ backgroundColor: style.primaryColor }}
      >
        {/* Decorative geometric shapes — stay within header, no sidebar */}
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
          style={{ backgroundColor: 'white', transform: 'translate(40%, -40%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-32 h-32 opacity-5"
          style={{
            backgroundColor: 'white',
            clipPath: 'polygon(0 100%, 100% 100%, 0 0)',
          }}
        />
        <div
          className="absolute top-1/2 right-16 w-24 h-24 rounded-full opacity-5"
          style={{ backgroundColor: 'white', transform: 'translateY(-50%)' }}
        />

        <div className="relative z-10">
          {/* Name */}
          <h1
            className="text-[calc(36px*var(--rs))] font-black leading-none tracking-tight text-white mb-1"
            style={{ fontFamily: style.headingFont }}
          >
            {resume.personalInfo?.name}
          </h1>

          {/* Title with accent underline */}
          <div className="flex items-center gap-3 mb-6">
            <p className="text-[calc(11px*var(--rs))] font-bold uppercase tracking-[0.3em] text-white/70">
              {resume.jobTitle}
            </p>
            <div className="h-px flex-1 bg-white/20" />
          </div>

          {/* Contact row */}
          <div className="flex flex-wrap gap-x-5 gap-y-1.5">
            {resume.personalInfo?.email && (
              <ContactChip
                value={resume.personalInfo.email}
                href={`mailto:${resume.personalInfo.email}`}
              />
            )}
            {resume.personalInfo?.phone && (
              <ContactChip
                value={resume.personalInfo.phone}
                href={`tel:${resume.personalInfo.phone}`}
              />
            )}
            {resume.personalInfo?.location && (
              <ContactChip value={resume.personalInfo.location} />
            )}
            {resume.personalInfo?.linkedIn && (
              <ContactChip
                value="LinkedIn"
                href={resume.personalInfo.linkedIn}
                label
              />
            )}
            {resume.personalInfo?.github && (
              <ContactChip
                value="GitHub"
                href={resume.personalInfo.github}
                label
              />
            )}
            {resume.personalInfo?.portfolio && (
              <ContactChip
                value="Portfolio"
                href={resume.personalInfo.portfolio}
                label
              />
            )}
          </div>
        </div>
      </header>

      {/* Accent strip below header */}
      <div className="flex h-1">
        <div className="flex-1" style={{ backgroundColor: `rgba(${rgb}, 0.6)` }} />
        <div className="flex-1" style={{ backgroundColor: `rgba(${rgb}, 0.3)` }} />
        <div className="flex-1" style={{ backgroundColor: `rgba(${rgb}, 0.1)` }} />
      </div>

      {/* ── BODY ────────────────────────────────────────────────── */}
      <div className="px-10 py-8 space-y-7">
        {resume.summary && (
          <section>
            <SectionHead label="Profile" color={style.primaryColor} rgb={rgb} />
            <p className="text-[calc(12px*var(--rs))] leading-[1.9] text-slate-600 mt-3">{resume.summary}</p>
          </section>
        )}

        {resume.experience && resume.experience.length > 0 && (
          <section>
            <SectionHead label="Experience" color={style.primaryColor} rgb={rgb} />
            <div className="mt-4 space-y-6">
              {resume.experience.map((exp, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-start gap-4 mb-1">
                    <div>
                      <h3
                        className="text-[calc(13px*var(--rs))] font-bold text-slate-900 leading-tight"
                        style={{ fontFamily: style.headingFont }}
                      >
                        {exp.role}
                      </h3>
                      <p
                        className="text-[calc(10px*var(--rs))] font-black uppercase tracking-[0.18em] mt-0.5"
                        style={{ color: style.primaryColor }}
                      >
                        {exp.company}
                        {exp.location ? ` · ${exp.location}` : ''}
                      </p>
                    </div>
                    <span
                      className="text-[calc(9px*var(--rs))] font-bold whitespace-nowrap pt-0.5 px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: `rgba(${rgb}, 0.08)`,
                        color: style.primaryColor,
                      }}
                    >
                      {exp.startDate} — {exp.endDate}
                    </span>
                  </div>
                  <ul className="mt-2.5 space-y-1.5">
                    {exp.achievements?.map((a, j) => (
                      <li key={j} className="flex gap-2.5 text-[calc(11px*var(--rs))] text-slate-600 leading-relaxed">
                        <span
                          className="shrink-0 mt-[6px] w-1.5 h-1.5 rounded-full"
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
            <SectionHead label="Skills" color={style.primaryColor} rgb={rgb} />
            <div className="mt-3 flex flex-wrap gap-2">
              {[...(resume.skills?.technical ?? []), ...(resume.skills?.soft ?? [])].map((s, i) => (
                <span
                  key={i}
                  className="text-[calc(10px*var(--rs))] font-bold text-white px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: style.primaryColor }}
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {resume.education && resume.education.length > 0 && (
          <section>
            <SectionHead label="Education" color={style.primaryColor} rgb={rgb} />
            <div className="mt-4 space-y-3">
              {resume.education.map((edu, i) => (
                <div
                  key={i}
                  className="flex justify-between items-start gap-6 p-3 rounded-lg"
                  style={{ backgroundColor: `rgba(${rgb}, 0.03)`, border: `1px solid rgba(${rgb}, 0.08)` }}
                >
                  <div>
                    <h3 className="text-[calc(12.5px*var(--rs))] font-bold text-slate-900 leading-tight">
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
                  <span
                    className="text-[calc(9px*var(--rs))] font-bold whitespace-nowrap px-2 py-0.5 rounded-full shrink-0"
                    style={{ backgroundColor: `rgba(${rgb}, 0.08)`, color: style.primaryColor }}
                  >
                    {edu.startDate} — {edu.endDate}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {resume.projects && resume.projects.length > 0 && (
          <section>
            <SectionHead label="Projects" color={style.primaryColor} rgb={rgb} />
            <div className="mt-4 space-y-4">
              {resume.projects.map((proj, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: `rgba(${rgb}, 0.03)`,
                    border: `1px solid rgba(${rgb}, 0.1)`,
                    borderLeft: `4px solid ${style.primaryColor}`,
                    pageBreakInside: 'avoid',
                  }}
                >
                  <div className="flex justify-between items-start gap-4 mb-1.5">
                    <h3
                      className="text-[calc(12.5px*var(--rs))] font-bold text-slate-900"
                      style={{ fontFamily: style.headingFont }}
                    >
                      {proj.name}
                    </h3>
                    {proj.link && (
                      <A href={proj.link} color={style.primaryColor}>
                        <span
                          className="text-[calc(9px*var(--rs))] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full shrink-0"
                          style={{
                            backgroundColor: `rgba(${rgb}, 0.1)`,
                            color: style.primaryColor,
                          }}
                        >
                          View →
                        </span>
                      </A>
                    )}
                  </div>
                  <p className="text-[calc(11px*var(--rs))] text-slate-600 leading-relaxed mb-2">
                    {proj.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies?.map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-[calc(8px*var(--rs))] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `rgba(${rgb}, 0.06)`,
                          color: `rgba(${rgb}, 0.7)`,
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

        {((resume.awards && resume.awards.length > 0) ||
          (resume.certifications && resume.certifications.length > 0)) && (
          <section className="grid grid-cols-2 gap-8">
            {resume.awards && resume.awards.length > 0 && (
              <div>
                <SectionHead label="Awards" color={style.primaryColor} rgb={rgb} />
                <div className="mt-3 space-y-3">
                  {resume.awards.map((award, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline gap-2">
                        <h3 className="text-[calc(12px*var(--rs))] font-bold text-slate-800">{award.title}</h3>
                        <span className="text-[calc(9px*var(--rs))] font-bold text-[var(--rs-secondary)] shrink-0">
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
                <SectionHead label="Certifications" color={style.primaryColor} rgb={rgb} />
                <ul className="mt-3 space-y-2">
                  {resume.certifications.map((cert, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-[calc(11px*var(--rs))] text-slate-600 font-medium items-start"
                    >
                      <span
                        className="shrink-0 mt-[5px] w-1.5 h-1.5 rounded-full"
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
            <SectionHead label="Volunteer" color={style.primaryColor} rgb={rgb} />
            <div className="mt-4 space-y-4">
              {resume.volunteerWork.map((vol, i) => (
                <div key={i} style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-start gap-4 mb-1">
                    <div>
                      <h3 className="text-[calc(12.5px*var(--rs))] font-bold text-slate-900 leading-tight">
                        {vol.role}
                      </h3>
                      <p
                        className="text-[calc(10px*var(--rs))] font-black uppercase tracking-[0.18em] mt-0.5"
                        style={{ color: style.primaryColor }}
                      >
                        {vol.organization}
                      </p>
                    </div>
                    <span
                      className="text-[calc(9px*var(--rs))] font-bold whitespace-nowrap px-2 py-0.5 rounded-full shrink-0"
                      style={{ backgroundColor: `rgba(${rgb}, 0.08)`, color: style.primaryColor }}
                    >
                      {vol.startDate} — {vol.endDate}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {vol.achievements?.map((a, j) => (
                      <li key={j} className="flex gap-2.5 text-[calc(11px*var(--rs))] text-slate-600 leading-relaxed">
                        <span
                          className="shrink-0 mt-[6px] w-1.5 h-1.5 rounded-full"
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

        {((resume.publications && resume.publications.length > 0) ||
          (resume.languages && resume.languages.length > 0) ||
          (resume.interests && resume.interests.length > 0)) && (
          <section className="grid grid-cols-3 gap-6">
            {resume.publications && resume.publications.length > 0 && (
              <div className="col-span-1">
                <SectionHead label="Publications" color={style.primaryColor} rgb={rgb} />
                <div className="mt-3 space-y-3">
                  {resume.publications.map((pub, i) => (
                    <div key={i}>
                      <h3 className="text-[calc(11px*var(--rs))] font-bold text-slate-800">{pub.title}</h3>
                      <p className="text-[calc(9px*var(--rs))] italic text-[var(--rs-secondary)] mt-0.5">
                        {pub.publisher} · {pub.date}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {resume.languages && resume.languages.length > 0 && (
              <div className="col-span-1">
                <SectionHead label="Languages" color={style.primaryColor} rgb={rgb} />
                <div className="mt-3 space-y-2">
                  {resume.languages.map((lang, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-[calc(11px*var(--rs))] font-semibold text-slate-700">
                        {lang.language}
                      </span>
                      <span
                        className="text-[calc(8px*var(--rs))] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `rgba(${rgb}, 0.08)`,
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
              <div className="col-span-1">
                <SectionHead label="Interests" color={style.primaryColor} rgb={rgb} />
                <p className="mt-3 text-[calc(10.5px*var(--rs))] text-slate-600 leading-relaxed">
                  {resume.interests.join(' · ')}
                </p>
              </div>
            )}
          </section>
        )}

        {resume.references && resume.references.length > 0 && (
          <section>
            <SectionHead label="References" color={style.primaryColor} rgb={rgb} />
            <div className="mt-4 grid grid-cols-2 gap-4">
              {resume.references.map((ref, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl"
                  style={{
                    backgroundColor: `rgba(${rgb}, 0.03)`,
                    border: `1px solid rgba(${rgb}, 0.1)`,
                  }}
                >
                  <h3 className="text-[calc(12px*var(--rs))] font-bold text-slate-800">{ref.name}</h3>
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

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="px-10 pb-6 pt-2">
        <div className="flex gap-1">
          <div className="h-1 flex-1" style={{ backgroundColor: style.primaryColor }} />
          <div className="h-1 flex-1" style={{ backgroundColor: `rgba(${rgb}, 0.3)` }} />
          <div className="h-1 flex-1" style={{ backgroundColor: `rgba(${rgb}, 0.1)` }} />
        </div>
      </footer>
    </div>
  )
}

const ContactChip: React.FC<{
  value: string
  href?: string
  label?: boolean
}> = ({ value, href, label }) => {
  const inner = (
    <span
      className="text-[calc(10px*var(--rs))] font-semibold"
      style={{
        color: label ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.75)',
        textDecoration: 'none',
      }}
    >
      {value}
    </span>
  )
  if (href) {
    return (
      <a
        href={
          href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')
            ? href
            : `https://${href}`
        }
        style={{ textDecoration: 'none' }}
      >
        {inner}
      </a>
    )
  }
  return inner
}

const SectionHead: React.FC<{ label: string; color: string; rgb: string }> = ({
  label,
  color,
  rgb,
}) => (
  <div className="flex items-center gap-3 mb-1">
    <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
    <h2
      className="text-[calc(10px*var(--rs))] font-black uppercase tracking-[0.28em] whitespace-nowrap"
      style={{ color }}
    >
      {label}
    </h2>
    <div className="flex-1 h-px" style={{ backgroundColor: `rgba(${rgb}, 0.12)` }} />
  </div>
)
