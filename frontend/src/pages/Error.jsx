import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const Error = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen bg-[#0e0e10] flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Subtle grid background — matches CodeCollab */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Content */}
      <div
        className={`relative z-10 text-center max-w-md w-full transition-all duration-700 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Ghost 404 */}
        <p
          className="text-[160px] font-extrabold leading-none select-none mb-[-20px]"
          style={{
            color: 'transparent',
            WebkitTextStroke: '1.5px rgba(255,255,255,0.06)',
            fontFamily: 'monospace',
            letterSpacing: '-6px',
          }}
        >
          404
        </p>

        {/* Badge — cyan dash like CodeCollab section labels */}
        <div className="inline-flex items-center gap-2 mb-5">
          <span className="w-4 h-px bg-[#22d3ee]" />
          <span className="text-[11px] tracking-[3px] text-[#22d3ee] font-medium uppercase">
            Page Not Found
          </span>
        </div>

        {/* Title */}
        <h1 className="text-white text-3xl font-bold mb-3 leading-tight tracking-tight">
          This page doesn't exist.
        </h1>

        {/* Description */}
        <p className="text-[#6b7280] text-[15px] leading-relaxed mb-10 max-w-sm mx-auto">
          The link may be broken, or the page may have been removed.
          Head back home and keep building.
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#22d3ee] hover:bg-[#06b6d4] text-[#0e0e10] text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-200 hover:-translate-y-px"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            Back to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 bg-transparent border border-white/10 hover:border-white/25 text-[#9ca3af] hover:text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all duration-200 hover:-translate-y-px"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12,19 5,12 12,5"/>
            </svg>
            Go Back
          </button>
        </div>

        {/* Footer hint */}
        <p className="mt-10 text-[12px] text-[#374151]">
          Error 404 · CodeCollab
        </p>
      </div>
    </div>
  )
}

export default Error