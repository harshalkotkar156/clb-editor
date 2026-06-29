// import { FaHeart } from "react-icons/fa";
// import React, { useEffect, useState } from 'react'
// import { Navigate, useNavigate } from 'react-router-dom'
// import { useSelector } from 'react-redux'
// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// const KF = `
//   @keyframes fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
//   @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0} }
//   @keyframes pulseGlow{ 0%,100%{opacity:.7} 50%{opacity:1} }
//   @keyframes barGrow  { from{height:0} to{height:var(--h)} }
//   .fu{animation:fadeUp .55s ease both}
//   .d1{animation-delay:.08s} .d2{animation-delay:.18s}
//   .d3{animation-delay:.28s} .d4{animation-delay:.38s}
//   .d5{animation-delay:.50s} .d6{animation-delay:.62s}
// `

// // ─── Google icon ──────────────────────────────────────────────────────────
// function GIcon({ size = 16 }) {
//   return (
//     <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0">
//       <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
//       <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
//       <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
//       <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
//     </svg>
//   )
// }

// // ─── Animated code preview ────────────────────────────────────────────────
// const CODE = [
//   [{t:'pl',v:'const '},{t:'fn',v:'solve'},{t:'pl',v:' = ('},{t:'v',v:'nums'},{t:'pl',v:') => {'}],
//   [{t:'pl',v:'  let '},{t:'v',v:'map'},{t:'pl',v:' = new Map();'}],
//   [{t:'pl',v:'  for (let '},{t:'v',v:'i'},{t:'pl',v:' = 0; i < nums.length; i++) {'}],
//   [{t:'pl',v:'    let '},{t:'v',v:'comp'},{t:'pl',v:' = target − nums[i];'}],
//   [{t:'kw',v:'    if'},{t:'pl',v:' (map.has(comp)) '},{t:'kw',v:'return'},{t:'pl',v:' [map.get(comp), i];'}],
//   [{t:'pl',v:'    map.set(nums[i], i);'}],
//   [{t:'pl',v:'  }'}],
//   [{t:'pl',v:'};'}],
// ]
// const TC = { kw:'#22d3ee', fn:'#a78bfa', v:'#f59e0b', pl:'#cbd5e1' }

// const ROOM_ID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
// const generateRoomId = () => (
//   Array.from({ length: 8 }, () => ROOM_ID_CHARS[Math.floor(Math.random() * ROOM_ID_CHARS.length)]).join('')
// )

// function EditorPreview() {
//   const total = CODE.reduce((a, l) => a + l.reduce((b, t) => b + t.v.length, 0), 0)
//   const [typed, setTyped] = useState(0)
//   useEffect(() => {
//     let raf, t0 = null
//     const tick = ts => {
//       if (!t0) t0 = ts
//       setTyped(Math.floor(Math.min((ts - t0) / 2600, 1) * total))
//       if (ts - t0 < 2600) raf = requestAnimationFrame(tick)
//     }
//     const id = setTimeout(() => { raf = requestAnimationFrame(tick) }, 600)
//     return () => { clearTimeout(id); cancelAnimationFrame(raf) }
//   }, [total])

//   let idx = 0
//   return (
//     <div className="font-mono text-[12.5px] leading-[21px] select-none">
//       {CODE.map((line, li) => (
//         <div key={li} className="flex">
//           <span className="text-[10px] text-slate-600 w-8 text-right mr-4 shrink-0 pt-px">{li + 1}</span>
//           <span>
//             {line.map((tok, ti) => (
//               <span key={ti} style={{ color: TC[tok.t] }}>
//                 {tok.v.split('').map(ch => {
//                   idx++
//                   const ci = idx
//                   return <span key={ci} style={{ opacity: ci <= typed ? 1 : 0, transition: 'opacity .05s' }}>{ch}</span>
//                 })}
//               </span>
//             ))}
//             {/* Jamie cursor on line 3 */}
//             {li === 3 && (
//               <span className="inline-flex items-center gap-1 ml-1.5 px-1.5 py-px rounded text-[10px]"
//                 style={{ background:'#10b98122', border:'1px solid #10b98155', color:'#10b981', fontFamily:'sans-serif' }}>
//                 <span className="w-0.5 h-3 rounded-sm bg-emerald-400 inline-block" style={{ animation:'blink 1.2s step-end infinite' }}/>
//                 Jamie
//               </span>
//             )}
//           </span>
//         </div>
//       ))}
//     </div>
//   )
// }

// // ─── Feature cards data ───────────────────────────────────────────────────
// const FEAT_MAIN = [
//   {
//     label: 'COMPILER',
//     icon: (
//       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
//         <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
//       </svg>
//     ),
//     iconBg: 'bg-slate-700/60',
//     iconColor: 'text-slate-300',
//     stat: '68ms',
//     statLabel: 'AVG EXEC',
//     title: '40+ Languages, Zero Setup',
//     desc: 'Python, TypeScript, Go, Rust, Java, C++ — run any language in under 80ms with isolated sandboxed execution. No local environment required.',
//     tags: ['Python', 'TypeScript', 'Go', 'Rust', 'Java', 'C++', '+34 more'],
//     wide: true,
//   },
//   {
//     label: 'SHARE',
//     icon: (
//       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
//         <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
//       </svg>
//     ),
//     iconBg: 'bg-violet-900/50',
//     iconColor: 'text-violet-400',
//     title: 'One Link.\nInstant Access.',
//     desc: 'Generate a shareable URL in one click. Anyone with the link joins your live session — read-only or full edit permissions.',
//     wide: false,
//   },
// ]

// const FEAT_BOTTOM = [
//   {
//     label: 'REAL-TIME',
//     icon: (
//       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
//         <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
//       </svg>
//     ),
//     iconBg: 'bg-emerald-900/50',
//     iconColor: 'text-emerald-400',
//     title: 'Sub-50ms Sync',
//     desc: "Operational transforms keep every keystroke in sync. See teammates' cursors and selections live — like Google Docs for code.",
//     extra: 'latency_bars',
//   },
//   {
//     label: 'HISTORY',
//     icon: (
//       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
//         <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
//       </svg>
//     ),
//     iconBg: 'bg-orange-900/40',
//     iconColor: 'text-orange-400',
//     title: 'Automatic Snapshots',
//     desc: 'Every run is checkpointed. Rewind to any point in your session — no more lost work.',
//     extra: 'timeline',
//   },
//   {
//     label: 'COLLAB',
//     icon: (
//       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
//         <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
//       </svg>
//     ),
//     iconBg: 'bg-violet-900/50',
//     iconColor: 'text-violet-400',
//     title: 'One Link. Instant Access.',
//     desc: '',
//     extra: 'share_widget',
//   },
// ]

// // ─── Testimonials ─────────────────────────────────────────────────────────
// const REVIEWS = [
//   {
//     quote: 'We replaced our entire technical interview stack with CodeSync. Candidates run real code, we see their thought process live — hire quality went up 40%.',
//     badge: '+40%',
//     badgeLabel: 'Hire quality',
//     name: 'Marcus Webb',
//     role: 'Head of Engineering · Nexus AI',
//     avatar: 'MW',
//     avatarColor: '#6366f1',
//   },
//   {
//     quote: 'CodeSync cut our pair programming setup from 15 minutes to 8 seconds. The shared link concept is brilliantly simple. We use it daily.',
//     badge: '8s',
//     badgeLabel: 'Session start',
//     name: 'Priya Sharma',
//     role: 'Staff Engineer · Stripe',
//     avatar: 'PS',
//     avatarColor: '#10b981',
//   },
//   {
//     quote: 'Teaching algorithms to 300 students simultaneously — each one running code, me seeing their output live. This tool changed how I teach.',
//     badge: null,
//     name: 'Dr. Kwame Asante',
//     role: 'CS Professor · Georgia Tech',
//     avatar: 'KA',
//     avatarColor: '#a855f7',
//   },
// ]

// // ─── Latency bars widget ──────────────────────────────────────────────────
// const BAR_HEIGHTS = [28, 38, 32, 48, 42, 56, 44, 60, 52, 68, 58, 72, 64, 72]
// function LatencyBars() {
//   return (
//     <div className="mt-6">
//       <div className="flex items-end gap-1.5 h-20">
//         {BAR_HEIGHTS.map((h, i) => (
//           <div key={i} className="flex-1 rounded-sm bg-emerald-500"
//             style={{ height: h + 'px', opacity: 0.5 + (h / 72) * 0.5 }} />
//         ))}
//       </div>
//       <div className="flex justify-between mt-2 text-[10px] text-slate-600">
//         <span>latency</span>
//         <span className="text-emerald-400 font-mono font-semibold">42ms avg</span>
//       </div>
//     </div>
//   )
// }

// // ─── Timeline widget ──────────────────────────────────────────────────────
// function Timeline() {
//   return (
//     <div className="mt-6">
//       <div className="flex items-center gap-1">
//         {[0,1,2,3,4].map(i => (
//           <React.Fragment key={i}>
//             <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${i === 2 ? 'bg-orange-400 border-orange-400' : 'bg-transparent border-slate-600'}`} />
//             {i < 4 && <div className="flex-1 h-px bg-slate-700" />}
//           </React.Fragment>
//         ))}
//       </div>
//       <div className="flex justify-between mt-2 text-[10px] text-slate-600">
//         <span>12 min ago</span>
//         <span>now</span>
//       </div>
//     </div>
//   )
// }

// // ─── Share widget ─────────────────────────────────────────────────────────
// function ShareWidget() {
//   return (
//     <div className="mt-5 rounded-xl bg-[#1a1d28] border border-white/[0.07] p-4 space-y-3">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-2 text-[12px] text-slate-400 font-mono">
//           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
//             <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
//           </svg>
//           codesync.io/s/x7k2m
//         </div>
//         <span className="text-[11px] text-violet-400 font-medium cursor-pointer hover:text-violet-300">Copy</span>
//       </div>
//       <div className="flex items-center gap-2">
//         {[['A','#22d3ee'],['J','#6366f1'],['S','#10b981'],['R','#f59e0b']].map(([l,c])=>(
//           <div key={l} className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-[#0f1117]"
//             style={{ background: c+'33', color: c }}>
//             {l}
//           </div>
//         ))}
//         <span className="text-[11px] text-slate-500 ml-0.5">4 collaborators active</span>
//       </div>
//       <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
//         <span className="text-[12px] text-slate-400">Allow editing</span>
//         <div className="w-9 h-5 rounded-full bg-violet-500 relative cursor-pointer">
//           <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow" />
//         </div>
//       </div>
//     </div>
//   )
// }

// // ─── Main ─────────────────────────────────────────────────────────────────
// export default function Home() {
//   const { isAuthenticated } = useSelector(s => s.auth)
//   const navigate = useNavigate()
//   const [scrolled, setScrolled] = useState(false)
//   const [roomIdInput, setRoomIdInput] = useState('')

//   useEffect(() => {
//     const fn = () => setScrolled(window.scrollY > 10)
//     window.addEventListener('scroll', fn)
//     return () => window.removeEventListener('scroll', fn)
//   }, [])

//   if (isAuthenticated) return <Navigate to="/dashboard" replace />

//   const login = () => { window.location.href = `${BACKEND_URL}/auth/google` }
  

//   const handleCreateRoom = () => {
//     const roomId = generateRoomId()
//     navigate(`/room/${roomId}`, { state: { isHost: true } })
//   }

//   const handleJoinRoom = () => {
//     const trimmed = roomIdInput.trim().toUpperCase()
//     if (!trimmed) return
//     navigate(`/room/${trimmed}`)
//   }

//   return (
//     <>
//       <style>{KF}</style>
//       <div className="min-h-screen bg-[#0f1117] text-slate-200 overflow-x-hidden"
//            style={{ fontFamily:"'DM Sans', sans-serif" }}>

//         {/* Grid texture overlay */}
//         <div className="pointer-events-none fixed inset-0 z-0"
//           style={{
//             backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
//             backgroundSize: '40px 40px',
//           }} />

//         {/* Ambient glow */}
//         <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
//           <div className="absolute top-1/3 right-0 w-[700px] h-[700px] rounded-full bg-violet-700/[0.07] blur-[140px]" />
//           <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-cyan-500/[0.06] blur-[100px]" />
//         </div>

//         {/* ══════════ NAV ══════════ */}
//         <nav className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 lg:px-12 h-[58px] transition-all duration-300
//           ${scrolled ? 'bg-[#0f1117]/85 backdrop-blur-2xl border-b border-white/[0.06]' : ''}`}>

//           {/* Logo */}
//           <div className="flex items-center gap-2.5">
//             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-[13px] font-bold text-white shrink-0"
//                  style={{ fontFamily:"'Cal Sans',sans-serif" }}>C</div>
//             <span className="text-[16px] font-semibold tracking-tight text-white"
//                   style={{ fontFamily:"'Cal Sans', 'DM Sans', sans-serif" }}>CodeSync</span>
//           </div>

//           {/* Center links */}
//           <div className="hidden md:flex items-center gap-1 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm">
//             {['Features','Collab'].map(l => (
//               <a key={l} href="#" className="text-[13px] text-slate-400 hover:text-white px-4 py-1 rounded-full hover:bg-white/[0.06] transition-all no-underline">{l}</a>
//             ))}
//           </div>

//           {/* Right */}
//           <div className="flex items-center gap-3">
//             <button onClick={login} className="text-[13px] text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-0 hidden sm:block">
//               Sign in
//             </button>
//             <button onClick={login}
//               className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold text-black bg-cyan-400 hover:bg-cyan-300 transition-all duration-200 cursor-pointer border-0 shadow-lg shadow-cyan-500/25">
//               <GIcon size={14} />
//               Start Free →
//             </button>
//           </div>
//         </nav>

//         {/* ══════════ HERO ══════════ */}
//         <section className="relative z-10 flex flex-col items-center text-center pt-32 pb-10 px-5">

//           {/* Top badge */}
//           <div className="fu d1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] text-[11.5px] font-medium text-slate-300 mb-10 tracking-wider uppercase">
//             <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" style={{ animation:'pulseGlow 2s ease infinite' }} />
//             Now with AI Code Assist
//           </div>

//           {/* Headline */}
//           <h1 className="fu d2 font-bold text-white leading-[1.0] tracking-[-2.5px] mb-5"
//               style={{ fontFamily:"'Cal Sans','DM Sans',sans-serif", fontSize:'clamp(48px,8vw,90px)' }}>
//             Code together,{' '}
//             <span className="text-cyan-400">ship faster.</span>
//           </h1>

//           {/* Sub */}
//           <p className="fu d3 text-slate-400 font-light max-w-[560px] leading-[1.75] mb-10"
//              style={{ fontSize:'clamp(15px,2vw,18px)' }}>
//             Write, compile, and debug in 40+ languages — then share a single link
//             and code alongside your team in real time. No installs, no config.
//           </p>

//           {/* CTAs */}
//           <div className="fu d4 flex flex-wrap gap-3 justify-center mb-14">
//             <button onClick={login}
//               className="flex items-center gap-2.5 px-7 py-3.5 rounded-full text-[15px] font-semibold text-black bg-cyan-400 hover:bg-cyan-300 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-400/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border-0">
//               <GIcon size={17} />
//               Start Coding Free →
//             </button>
//             <button className="flex items-center gap-2.5 px-7 py-3.5 rounded-full text-[15px] font-medium text-slate-300 bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] hover:text-white transition-all duration-200 cursor-pointer">
//               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                 <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
//               </svg>
//               Watch Demo
//             </button>
//           </div>

//           {/* Collab quick actions */}
//           {/* <div className="fu d4 w-full max-w-[720px] mb-10">
//             <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 md:p-5">
//               <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
//                 <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0f1117] border border-white/[0.08]">
//                   <span className="text-[11px] text-slate-500 font-mono uppercase tracking-widest">Room</span>
//                   <input
//                     value={roomIdInput}
//                     onChange={e => setRoomIdInput(e.target.value.toUpperCase())}
//                     onKeyDown={e => e.key === 'Enter' && handleJoinRoom()}
//                     maxLength={8}
//                     placeholder="Enter room ID"
//                     className="flex-1 bg-transparent text-[13px] text-slate-200 outline-none placeholder:text-slate-600 font-mono"
//                   />
//                   <button
//                     onClick={handleJoinRoom}
//                     className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white bg-white/[0.08] hover:bg-white/[0.12] transition-colors"
//                   >
//                     Join Room
//                   </button>
//                 </div>
//                 <button
//                   onClick={handleCreateRoom}
//                   className="px-4 py-2 rounded-xl text-[13px] font-semibold text-black bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-md shadow-cyan-500/30"
//                 >
//                   Create Room
//                 </button>
//               </div>
//               <div className="mt-2 text-[11px] text-slate-500">
//                 Room IDs are 8-character codes. Create a new room or join an active one.
//               </div>
//             </div>
//           </div> */}

//           {/* Stats row */}
//           <div className="fu d5 flex flex-wrap justify-center gap-10 mb-16">
//             {[['40+','LANGUAGES'],['12k+','DEVELOPERS'],['< 80ms','EXEC TIME']].map(([v,l],i) => (
//               <div key={l} className={`text-center ${i > 0 ? 'pl-10 border-l border-white/[0.08]' : ''}`}>
//                 <div className="text-[32px] font-bold text-white tracking-tight" style={{ fontFamily:"'Cal Sans','DM Sans',sans-serif" }}>{v}</div>
//                 <div className="text-[10px] tracking-widest text-slate-500 mt-0.5">{l}</div>
//               </div>
//             ))}
//           </div>

//           {/* ── Editor window ── */}
//           <div className="fu d6 w-full max-w-[860px] rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_40px_100px_rgba(0,0,0,0.7)]">
//             {/* Title bar */}
//             <div className="bg-[#181b27] px-5 py-3 flex items-center gap-3 border-b border-white/[0.06]">
//               <div className="flex gap-1.5">
//                 {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ background:c }} />)}
//               </div>
//               <div className="flex gap-2 ml-2">
//                 {[['solution.ts',true],['utils.ts',false]].map(([n,a])=>(
//                   <span key={n} className={`flex items-center gap-1.5 px-3 py-[3px] rounded text-[11.5px] font-mono border ${a ? 'bg-[#2a2f45] text-cyan-300 border-cyan-500/30' : 'bg-transparent text-slate-500 border-transparent'}`}>
//                     <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                       <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
//                     </svg>
//                     {n}
//                   </span>
//                 ))}
//               </div>
//               <div className="ml-auto flex items-center gap-2">
//                 {[['A','#22d3ee'],['J','#6366f1'],['S','#f59e0b']].map(([l,c])=>(
//                   <div key={l} className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-[1.5px]"
//                     style={{ background: c+'33', color: c, borderColor: c+'66' }}>{l}</div>
//                 ))}
//                 <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono ml-1">
//                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation:'pulseGlow 2s ease infinite' }} />
//                   Live
//                 </span>
//               </div>
//             </div>

//             {/* Code + output */}
//             <div className="bg-[#13151f] flex">
//               <div className="flex-1 px-3 py-5 min-h-[220px] border-r border-white/[0.05]">
//                 <EditorPreview />
//               </div>
//               <div className="w-48 px-4 py-4 shrink-0">
//                 <div className="text-[10px] tracking-widest text-slate-600 mb-3">OUTPUT</div>
//                 <div className="flex items-center gap-1.5 text-[12px] text-emerald-400 mb-2">
//                   <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
//                   Running...
//                 </div>
//                 <div className="font-mono text-[12px] text-slate-300 mb-4">[0, 1]</div>
//                 <div className="text-[12px] text-emerald-400 font-semibold mb-1">✓ Passed 3/3</div>
//                 <div className="text-[11px] text-slate-500">Time: 68ms</div>
//                 <div className="text-[11px] text-slate-500">Mem: 42.1 MB</div>
//               </div>
//             </div>

//             {/* Bottom bar */}
//             <div className="bg-[#181b27] px-5 py-2 flex items-center gap-1 border-t border-white/[0.05]">
//               <span className="text-[11px] text-slate-500">TypeScript</span>
//               <span className="text-slate-700 mx-2">|</span>
//               <span className="text-[11px] text-slate-500">Node 20</span>
//               <div className="ml-auto flex gap-2">
//                 <button className="flex items-center gap-1.5 px-3 py-1 rounded text-[11px] text-slate-400 border border-white/[0.08] hover:bg-white/[0.05] transition-all cursor-pointer bg-transparent">
//                   Share
//                 </button>
//                 <button onClick={login} className="flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-medium text-black bg-cyan-400 hover:bg-cyan-300 transition-all cursor-pointer border-0">
//                   ▶ Run
//                 </button>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* ══════════ FEATURES ══════════ */}
//         <section id="features" className="relative z-10 max-w-6xl mx-auto px-5 py-24">
//           <p className="text-[11px] font-semibold tracking-[3px] uppercase text-cyan-400 mb-4">— PLATFORM FEATURES</p>
//           <h2 className="font-bold text-white leading-tight mb-14"
//               style={{ fontFamily:"'Cal Sans','DM Sans',sans-serif", fontSize:'clamp(28px,4vw,46px)', letterSpacing:'-1.5px' }}>
//             Everything you need to{' '}
//             <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">build together.</span>
//           </h2>

//           {/* Row 1: big + small */}
//           <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 mb-4">
//             {/* Big compiler card */}
//             <div className="group bg-[#13151f] border border-white/[0.07] rounded-2xl p-7 hover:border-white/[0.14] transition-all duration-200">
//               <div className="flex items-start justify-between mb-8">
//                 <div className={`w-12 h-12 rounded-xl ${FEAT_MAIN[0].iconBg} flex items-center justify-center ${FEAT_MAIN[0].iconColor}`}>
//                   {FEAT_MAIN[0].icon}
//                 </div>
//                 <div className="text-right">
//                   <div className="text-3xl font-bold text-cyan-400" style={{ fontFamily:"'Cal Sans','DM Sans',sans-serif" }}>{FEAT_MAIN[0].stat}</div>
//                   <div className="text-[9px] tracking-widest text-slate-600">{FEAT_MAIN[0].statLabel}</div>
//                 </div>
//               </div>
//               <p className="text-[10px] tracking-[2.5px] text-slate-500 mb-2 flex items-center gap-2">
//                 <span className="w-4 h-px bg-slate-600 inline-block" /> {FEAT_MAIN[0].label}
//               </p>
//               <h3 className="text-2xl font-bold text-white mb-3" style={{ letterSpacing:'-0.5px' }}>{FEAT_MAIN[0].title}</h3>
//               <p className="text-[14px] text-slate-400 leading-relaxed mb-6 font-light">{FEAT_MAIN[0].desc}</p>
//               <div className="flex flex-wrap gap-2">
//                 {FEAT_MAIN[0].tags.map(t => (
//                   <span key={t} className="px-3 py-1 rounded-full text-[12px] text-slate-400 border border-white/[0.1] hover:border-white/[0.2] transition-colors cursor-default">{t}</span>
//                 ))}
//               </div>
//             </div>

//             {/* Share card */}
//             <div className="group bg-[#16131f] border border-violet-500/[0.15] rounded-2xl p-7 hover:border-violet-500/30 transition-all duration-200 relative overflow-hidden">
//               <div className="absolute inset-0 bg-gradient-to-br from-violet-600/[0.06] to-transparent" />
//               <div className="relative z-10">
//                 <div className={`w-12 h-12 rounded-xl ${FEAT_MAIN[1].iconBg} flex items-center justify-center ${FEAT_MAIN[1].iconColor} mb-8`}>
//                   {FEAT_MAIN[1].icon}
//                 </div>
//                 <p className="text-[10px] tracking-[2.5px] text-slate-500 mb-2 flex items-center gap-2">
//                   <span className="w-4 h-px bg-slate-600 inline-block" /> {FEAT_MAIN[1].label}
//                 </p>
//                 <h3 className="text-2xl font-bold text-white mb-3 whitespace-pre-line" style={{ letterSpacing:'-0.5px' }}>{FEAT_MAIN[1].title}</h3>
//                 <p className="text-[14px] text-slate-400 leading-relaxed font-light">{FEAT_MAIN[1].desc}</p>
//                 <ShareWidget />
//               </div>
//             </div>
//           </div>

//           {/* Row 2: three equal cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {FEAT_BOTTOM.map(f => (
//               <div key={f.label}
//                 className="group bg-[#13151f] border border-white/[0.07] rounded-2xl p-6 hover:border-white/[0.14] transition-all duration-200">
//                 <div className={`w-11 h-11 rounded-xl ${f.iconBg} flex items-center justify-center ${f.iconColor} mb-6`}>
//                   {f.icon}
//                 </div>
//                 <p className="text-[10px] tracking-[2.5px] text-slate-500 mb-2 flex items-center gap-2">
//                   <span className="w-4 h-px bg-slate-600 inline-block" /> {f.label}
//                 </p>
//                 <h3 className="text-[20px] font-bold text-white mb-2" style={{ letterSpacing:'-0.4px' }}>{f.title}</h3>
//                 {f.desc && <p className="text-[13px] text-slate-400 leading-relaxed font-light">{f.desc}</p>}
//                 {f.extra === 'latency_bars' && <LatencyBars />}
//                 {f.extra === 'timeline'     && <Timeline />}
//                 {f.extra === 'share_widget' && <ShareWidget />}
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* ══════════ COLLAB SECTION ══════════ */}
//         <section className="relative z-10 max-w-6xl mx-auto px-5 py-16">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

//             {/* Editor mockup */}
//             <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl">
//               <div className="bg-[#181b27] px-4 py-3 flex items-center justify-between border-b border-white/[0.06]">
//                 <div className="flex gap-1.5">
//                   {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background:c }} />)}
//                 </div>
//                 <span className="text-[12px] text-slate-400 font-mono">api.ts — CodeSync</span>
//                 <span className="flex items-center gap-1.5 text-[11px] text-emerald-400">
//                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation:'pulseGlow 2s ease infinite' }} />
//                   3 live
//                 </span>
//               </div>
//               <div className="bg-[#13151f] px-3 py-4 font-mono text-[12.5px] leading-[21px] min-h-[300px]">
//                 {[
//                   [{t:'kw',v:'export async function '},{t:'fn',v:'withRetry'},{t:'pl',v:'<T>('}],
//                   [{t:'pl',v:'  fn: () => Promise<T>,'}],
//                   [{t:'pl',v:'  retries = '},{t:'num',v:'3'}],
//                   [{t:'pl',v:'): Promise<T> {'}],
//                   [{t:'pl',v:'  '},{t:'kw',v:'for'},{t:'pl',v:' (let attempt = 0; attempt < retries; attempt++) {'}],
//                   [{t:'kw',v:'    try'},{t:'pl',v:' {'}],
//                   [{t:'kw',v:'      return await'},{t:'pl',v:' fn();'}],
//                   [{t:'pl',v:'    } '},{t:'kw',v:'catch'},{t:'pl',v:' (err) {'}],
//                   [{t:'kw',v:'      if'},{t:'pl',v:' (attempt === retries − 1) '},{t:'kw',v:'throw'},{t:'pl',v:' err;'}],
//                   [{t:'kw',v:'      await'},{t:'pl',v:' sleep(2 ** attempt * 100);'}],
//                   [{t:'pl',v:'    }'}],
//                   [{t:'pl',v:'  }'}],
//                   [{t:'kw',v:'  throw new'},{t:'pl',v:' Error('},{t:'str',v:"'Max retries exceeded'"},{t:'pl',v:');'}],
//                   [{t:'pl',v:'}'}],
//                 ].map((line, li) => (
//                   <div key={li} className="flex">
//                     <span className="text-[10px] text-slate-700 w-7 text-right mr-4 shrink-0 pt-px">{li+1}</span>
//                     {line.map((t, ti) => (
//                       <span key={ti} style={{ color: t.t==='kw'?'#22d3ee':t.t==='fn'?'#a78bfa':t.t==='num'?'#fb923c':t.t==='str'?'#86efac':'#cbd5e1' }}>
//                         {t.v}
//                       </span>
//                     ))}
//                     {li === 12 && (
//                       <span className="inline-block w-0.5 h-4 ml-0.5 bg-orange-400 align-middle" style={{ animation:'blink 1.2s step-end infinite' }} />
//                     )}
//                   </div>
//                 ))}
//               </div>
//               {/* Collaborators bar */}
//               <div className="bg-[#181b27] px-4 py-2.5 flex items-center gap-4 border-t border-white/[0.05]">
//                 {[['A','#22d3ee','Aisha'],['J','#6366f1','James'],['S','#10b981','Sara']].map(([l,c,n])=>(
//                   <div key={l} className="flex items-center gap-1.5">
//                     <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background:c+'33',color:c }}>{l}</div>
//                     <span className="text-[11px] text-slate-400">{n}</span>
//                     <span className="w-1 h-1 rounded-full" style={{ background:c }} />
//                     <span className="text-[11px]" style={{ color:c }}>editing</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Text side */}
//             <div>
//               <p className="text-[10px] tracking-[3px] uppercase text-cyan-400 mb-4 flex items-center gap-2">
//                 <span className="w-5 h-px bg-cyan-400 inline-block" /> REAL-TIME COLLABORATION
//               </p>
//               <h2 className="font-bold text-white leading-tight mb-5"
//                   style={{ fontFamily:"'Cal Sans','DM Sans',sans-serif", fontSize:'clamp(28px,4vw,46px)', letterSpacing:'-1.5px' }}>
//                 Your whole team,{' '}
//                 <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
//                   in the same file.
//                 </span>
//               </h2>
//               <p className="text-[15px] text-slate-400 leading-relaxed mb-8 font-light max-w-md">
//                 See every keystroke as it happens. Colored cursors identify each collaborator — no more "who changed this?" moments. Presence awareness built in.
//               </p>
//               <div className="space-y-4 mb-10">
//                 {[
//                   ['Named cursor presence — see who is where', '#a855f7'],
//                   ['Inline comments and code annotations', '#6366f1'],
//                   ['Granular permission controls per session', '#8b5cf6'],
//                 ].map(([text, c]) => (
//                   <div key={text} className="flex items-center gap-3">
//                     <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: c+'22', border:`1px solid ${c}44` }}>
//                       <div className="w-1.5 h-1.5 rounded-full" style={{ background:c }} />
//                     </div>
//                     <span className="text-[14px] text-slate-300">{text}</span>
//                   </div>
//                 ))}
//               </div>
//               <button onClick={login} className="flex items-center gap-2 text-[14px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer bg-transparent border-0">
//                 Try collaborative editing free →
//               </button>
//             </div>
//           </div>
//         </section>

//         {/* ══════════ TESTIMONIALS ══════════ */}
//         <section className="relative z-10 max-w-6xl mx-auto px-5 py-24 text-center">
//           <p className="text-[10px] tracking-[3px] uppercase text-cyan-400 mb-4 flex items-center justify-center gap-2">
//             <span className="w-4 h-px bg-cyan-400 inline-block" /> TRUSTED BY DEVELOPERS
//           </p>
//           <h2 className="font-bold text-white mb-16"
//               style={{ fontFamily:"'Cal Sans','DM Sans',sans-serif", fontSize:'clamp(28px,4vw,46px)', letterSpacing:'-1.5px' }}>
//             Used by teams who <span className="text-cyan-400">ship.</span>
//           </h2>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
//             {REVIEWS.map(r => (
//               <div key={r.name}
//                 className="group bg-[#13151f] border border-white/[0.07] rounded-2xl p-7 text-left hover:border-white/[0.14] transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40">
//                 <div className="text-3xl text-slate-700 mb-5 font-serif">"</div>
//                 <p className="text-[14px] text-slate-300 leading-relaxed mb-6 font-light">{r.quote}</p>
//                 {r.badge && (
//                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] text-[11px] font-mono mb-5">
//                     <span className="text-cyan-400 font-semibold">{r.badge}</span>
//                     <span className="text-slate-500">{r.badgeLabel}</span>
//                   </div>
//                 )}
//                 <div className="flex items-center gap-3 mt-auto pt-2 border-t border-white/[0.06]">
//                   <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
//                     style={{ background: r.avatarColor+'33', color: r.avatarColor }}>
//                     {r.avatar}
//                   </div>
//                   <div>
//                     <div className="text-[13px] font-semibold text-white">{r.name}</div>
//                     <div className="text-[11.5px] text-slate-500">{r.role}</div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Stats strip */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-t border-white/[0.06]">
//             {[['12,000+','ACTIVE DEVELOPERS'],['3.2M','CODE RUNS / MONTH'],['99.9%','UPTIME SLA'],['4.9★','AVERAGE RATING']].map(([v,l])=>(
//               <div key={l} className="text-center">
//                 <div className="text-[32px] font-bold text-white tracking-tight" style={{ fontFamily:"'Cal Sans','DM Sans',sans-serif" }}>{v}</div>
//                 <div className="text-[9.5px] tracking-widest text-slate-600 mt-1">{l}</div>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* ══════════ FINAL CTA ══════════ */}
//         <section className="relative z-10 px-5 py-24 text-center">
//           <div className="max-w-xl mx-auto">
//             <h2 className="font-bold text-white mb-4 leading-tight"
//                 style={{ fontFamily:"'Cal Sans','DM Sans',sans-serif", fontSize:'clamp(30px,5vw,52px)', letterSpacing:'-1.5px' }}>
//               Start coding together,<br/>right now.
//             </h2>
//             <p className="text-slate-400 text-[16px] font-light mb-10">No setup. No installs. One click to collaborate.</p>
//             <button onClick={login}
//               className="flex items-center gap-3 mx-auto px-8 py-4 rounded-full text-[15px] font-semibold text-black bg-cyan-400 hover:bg-cyan-300 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-400/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border-0">
//               <GIcon size={18} />
//               Get started with Google →
//             </button>
//           </div>
//         </section>

//         {/* ══════════ FOOTER ══════════ */}
//         <footer className="relative z-10 border-t border-white/[0.06] px-6 lg:px-12 py-6
//                            flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-slate-600">
//           <div className="flex items-center gap-2">
//             <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white">C</div>
//             <span className="font-semibold text-slate-500">CodeSync</span>
//           </div>
//           <span className="flex items-center gap-0.5">© {new Date().getFullYear()} CodeSync. Designed & Developed by Harshal <FaHeart /> </span>
//           <div className="flex gap-6">
//             {['Privacy','Terms','GitHub'].map(l => (
//               <a key={l} href="#" className="hover:text-slate-400 transition-colors no-underline">{l}</a>
//             ))}
//           </div>
//         </footer>

//       </div>
//     </>
//   )
// }


import { FaHeart } from "react-icons/fa";
import React, { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
console.log("This is bacekndurl : ",BACKEND_URL);

// ─── Injected keyframes ───────────────────────────────────────────────────
const KF = `
  @keyframes fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes pulseGlow{ 0%,100%{opacity:.7} 50%{opacity:1} }
  .fu{animation:fadeUp .55s ease both}
  .d1{animation-delay:.08s} .d2{animation-delay:.18s}
  .d3{animation-delay:.28s} .d4{animation-delay:.38s}
  .d5{animation-delay:.50s} .d6{animation-delay:.62s}
`

// ─── Google icon ──────────────────────────────────────────────────────────
function GIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

// ─── Animated code preview (C++) ──────────────────────────────────────────
const CODE = [
  [{t:'kw',v:'#include'},{t:'str',v:' <iostream>'}],
  [{t:'kw',v:'#include'},{t:'str',v:' <vector>'}],
  [{t:'pl',v:''}],
  [{t:'kw',v:'int'},{t:'pl',v:' '},{t:'fn',v:'twoSum'},{t:'pl',v:'('},{t:'kw',v:'vector'},{t:'pl',v:'<int>& nums, '},{t:'kw',v:'int'},{t:'pl',v:' target) {'}],
  [{t:'kw',v:'  for'},{t:'pl',v:' ('},{t:'kw',v:'int'},{t:'pl',v:' i = 0; i < nums.size(); i++) {'}],
  [{t:'kw',v:'    for'},{t:'pl',v:' ('},{t:'kw',v:'int'},{t:'pl',v:' j = i+1; j < nums.size(); j++) {'}],
  [{t:'kw',v:'      if'},{t:'pl',v:' (nums[i] + nums[j] == target)'}],
  [{t:'kw',v:'        return'},{t:'pl',v:' {i, j};'}],
  [{t:'pl',v:'    }'}],
  [{t:'pl',v:'  }'}],
  [{t:'kw',v:'  return'},{t:'pl',v:' {};'}],
  [{t:'pl',v:'}'}],
]
const TC = { kw:'#22d3ee', fn:'#a78bfa', v:'#f59e0b', pl:'#cbd5e1', str:'#86efac', num:'#fb923c' }

function EditorPreview() {
  const total = CODE.reduce((a, l) => a + l.reduce((b, t) => b + t.v.length, 0), 0)
  const [typed, setTyped] = useState(0)
  useEffect(() => {
    let raf, t0 = null
    const tick = ts => {
      if (!t0) t0 = ts
      setTyped(Math.floor(Math.min((ts - t0) / 2800, 1) * total))
      if (ts - t0 < 2800) raf = requestAnimationFrame(tick)
    }
    const id = setTimeout(() => { raf = requestAnimationFrame(tick) }, 600)
    return () => { clearTimeout(id); cancelAnimationFrame(raf) }
  }, [total])

  let idx = 0
  return (
    <div className="font-mono text-[12.5px] leading-[21px] select-none">
      {CODE.map((line, li) => (
        <div key={li} className="flex">
          <span className="text-[10px] text-slate-600 w-8 text-right mr-4 shrink-0 pt-px">{li + 1}</span>
          <span>
            {line.map((tok, ti) => (
              <span key={ti} style={{ color: TC[tok.t] }}>
                {tok.v.split('').map(ch => {
                  idx++
                  const ci = idx
                  return <span key={ci} style={{ opacity: ci <= typed ? 1 : 0, transition: 'opacity .05s' }}>{ch}</span>
                })}
              </span>
            ))}
            {li === 6 && (
              <span className="inline-flex items-center gap-1 ml-1.5 px-1.5 py-px rounded text-[10px]"
                style={{ background:'#10b98122', border:'1px solid #10b98155', color:'#10b981', fontFamily:'sans-serif' }}>
                <span className="w-0.5 h-3 rounded-sm bg-emerald-400 inline-block" style={{ animation:'blink 1.2s step-end infinite' }}/>
                Yash
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Language tags ────────────────────────────────────────────────────────
const LANGS = ['C++', 'Python', 'Java', 'JavaScript']

// ─── Feature cards ────────────────────────────────────────────────────────
const FEATURES = [
  {
    label: 'COMPILER',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    iconBg: 'bg-slate-700/60',
    iconColor: 'text-slate-300',
    stat: '4',
    statSub: 'LANGUAGES',
    title: 'Run Code Instantly',
    desc: 'Execute C++, Python, Java, and JavaScript right in the browser — no local setup, no compiler downloads. Just write and run.',
    extra: 'lang_tags',
    wide: true,
  },
  {
    label: 'REAL-TIME SYNC',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    iconBg: 'bg-emerald-900/50',
    iconColor: 'text-emerald-400',
    title: 'Zero-Conflict Editing',
    desc: 'Every keystroke synced instantly. No merge conflicts, no overwriting — multiple people in the same file, always consistent.',
    extra: 'sync_bars',
    wide: false,
  },
]

const FEATURES_BOTTOM = [
  {
    label: 'LIVE CURSORS',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4l7.07 17 2.51-7.39L21 11.07z"/>
      </svg>
    ),
    iconBg: 'bg-violet-900/50',
    iconColor: 'text-violet-400',
    title: 'See Who\'s Where',
    desc: 'Named, colored cursors show exactly where each teammate is in the file — in real time, always.',
    extra: 'cursors_demo',
  },
  {
    label: 'SHARE',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
    iconBg: 'bg-cyan-900/50',
    iconColor: 'text-cyan-400',
    title: 'One Link to Join',
    desc: 'Generate a room link in one click. Anyone with it joins the live session instantly — no account needed.',
    extra: 'share_widget',
  },
  {
    label: 'OUTPUT',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10l4 4 4-4"/>
      </svg>
    ),
    iconBg: 'bg-orange-900/40',
    iconColor: 'text-orange-400',
    title: 'Shared Output Panel',
    desc: 'When someone runs the code, everyone sees the output. No more screen-sharing just to show a result.',
    extra: 'output_demo',
  },
]

// ─── Testimonials (students only) ─────────────────────────────────────────
const REVIEWS = [
  {
    quote: 'We used this for our DSA assignment and it was a game changer. No more "it works on my machine" — we all coded in the same file and submitted together.',
    name: 'Yash Warunkshe',
    role: 'B.Tech CSE, 3rd Year · SPPU',
    avatar: 'YW',
    avatarColor: '#22d3ee',
    badge: null,
  },
  {
    quote: 'Our professor shared a room link during the lecture and we all jumped in and solved the problem live. Way better than watching someone else type on a projector.',
    name: 'Sumit Chavan',
    role: 'B.E. IT, 2nd Year · VIT Pune',
    avatar: 'SC',
    avatarColor: '#10b981',
    badge: null,
  },
  {
    quote: 'Debugging with a friend used to mean sharing my screen over a call and lag-typing. Now we both just edit. Fixed a tricky pointer bug in 10 minutes flat.',
    name: 'Sameer Bagul',
    role: 'B.Tech CSE, Final Year · PICT',
    avatar: 'SB',
    avatarColor: '#a855f7',
    badge: null,
  },
]

// ─── Sync bars widget ─────────────────────────────────────────────────────
const BAR_HEIGHTS = [28, 38, 32, 48, 42, 56, 44, 60, 52, 68, 58, 72, 64, 72]
function SyncBars() {
  return (
    <div className="mt-6">
      <div className="flex items-end gap-1.5 h-20">
        {BAR_HEIGHTS.map((h, i) => (
          <div key={i} className="flex-1 rounded-sm bg-emerald-500"
            style={{ height: h + 'px', opacity: 0.4 + (h / 72) * 0.6 }} />
        ))}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-slate-600">
        <span>sync latency</span>
        <span className="text-emerald-400 font-mono font-semibold">38ms avg</span>
      </div>
    </div>
  )
}

// ─── Cursors demo ─────────────────────────────────────────────────────────
function CursorsDemo() {
  return (
    <div className="mt-5 space-y-2.5">
      {[['Yash','#22d3ee','line 7, col 22'],['Sumit','#6366f1','line 12, col 8'],['Sameer','#10b981','line 4, col 35']].map(([name,c,pos])=>(
        <div key={name} className="flex items-center gap-2.5 px-3 py-2 rounded-lg" style={{ background: c+'11', border:`1px solid ${c}22` }}>
          <div className="w-0.5 h-4 rounded-sm" style={{ background: c }} />
          <span className="text-[12px] font-semibold" style={{ color: c }}>{name}</span>
          <span className="text-[11px] text-slate-500 ml-auto font-mono">{pos}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Share widget ─────────────────────────────────────────────────────────
function ShareWidget() {
  return (
    <div className="mt-5 rounded-xl bg-[#1a1d28] border border-white/[0.07] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12px] text-slate-400 font-mono">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          codesync.io/room/K9M3
        </div>
        <span className="text-[11px] text-cyan-400 font-medium cursor-pointer hover:text-cyan-300">Copy</span>
      </div>
      <div className="flex items-center gap-2">
        {[['Y','#22d3ee'],['S','#6366f1'],['S','#10b981']].map(([l,c],i)=>(
          <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-[#0f1117]"
            style={{ background: c+'33', color: c }}>
            {l}
          </div>
        ))}
        <span className="text-[11px] text-slate-500 ml-0.5">3 active in room</span>
      </div>
    </div>
  )
}

// ─── Output demo ──────────────────────────────────────────────────────────
function OutputDemo() {
  return (
    <div className="mt-5 rounded-xl bg-[#1a1d28] border border-white/[0.07] p-4 font-mono">
      <div className="text-[10px] text-slate-600 tracking-widest mb-2">STDOUT</div>
      <div className="text-[12px] text-emerald-400 mb-1">✓ Compiled in 320ms</div>
      <div className="text-[12px] text-slate-300">Answer: [0, 1]</div>
      <div className="text-[12px] text-slate-300">Time: 4ms</div>
      <div className="text-[11px] text-slate-600 mt-2">— visible to all 3 members</div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────
export default function Home() {
  const { isAuthenticated } = useSelector(s => s.auth)
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  
  const login = () => { window.location.href = `${BACKEND_URL}/api/v1/auth/google`; }

  return (
    <>
      <style>{KF}</style>
      <div className="min-h-screen bg-[#0f1117] text-slate-200 overflow-x-hidden"
           style={{ fontFamily:"'DM Sans', sans-serif" }}>

        {/* Grid texture */}
        <div className="pointer-events-none fixed inset-0 z-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

        {/* Ambient glow */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute top-1/3 right-0 w-[700px] h-[700px] rounded-full bg-violet-700/[0.07] blur-[140px]" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-cyan-500/[0.06] blur-[100px]" />
        </div>

        {/* ══════════ NAV ══════════ */}
        <nav className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 lg:px-12 h-[58px] transition-all duration-300
          ${scrolled ? 'bg-[#0f1117]/85 backdrop-blur-2xl border-b border-white/[0.06]' : ''}`}>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-[13px] font-bold text-white shrink-0"
                 style={{ fontFamily:"'Cal Sans',sans-serif" }}>C</div>
            <span className="text-[16px] font-semibold tracking-tight text-white"
                  style={{ fontFamily:"'Cal Sans', 'DM Sans', sans-serif" }}>CodeSync</span>
          </div>

          <div className="hidden md:flex items-center gap-1 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm">
            {['Features','Collab'].map(l => (
              <a key={l} href="#" className="text-[13px] text-slate-400 hover:text-white px-4 py-1 rounded-full hover:bg-white/[0.06] transition-all no-underline">{l}</a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={login} className="text-[13px] text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-0 hidden sm:block">
              Sign in
            </button>
            <button onClick={login}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold text-black bg-cyan-400 hover:bg-cyan-300 transition-all duration-200 cursor-pointer border-0 shadow-lg shadow-cyan-500/25">
              <GIcon size={14} />
              Start Free →
            </button>
          </div>
        </nav>

        {/* ══════════ HERO ══════════ */}
        <section className="relative z-10 flex flex-col items-center text-center pt-32 pb-10 px-5">

          <div className="fu d1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] text-[11.5px] font-medium text-slate-300 mb-10 tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" style={{ animation:'pulseGlow 2s ease infinite' }} />
            Real-time collaborative coding
          </div>

          <h1 className="fu d2 font-bold text-white leading-[1.0] tracking-[-2.5px] mb-5"
              style={{ fontFamily:"'Cal Sans','DM Sans',sans-serif", fontSize:'clamp(48px,8vw,90px)' }}>
            Code together,{' '}
            <span className="text-cyan-400">ship faster.</span>
          </h1>

          <p className="fu d3 text-slate-400 font-light max-w-[560px] leading-[1.75] mb-10"
             style={{ fontSize:'clamp(15px,2vw,18px)' }}>
            Write, compile, and debug C++, Python, Java & JavaScript with your team — 
            in the same editor, live. Share a link, and everyone's in.
          </p>

          <div className="fu d4 flex flex-wrap gap-3 justify-center mb-14">
            <button onClick={login}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-full text-[15px] font-semibold text-black bg-cyan-400 hover:bg-cyan-300 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-400/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border-0">
              <GIcon size={17} />
              Start Coding Free →
            </button>
            <button className="flex items-center gap-2.5 px-7 py-3.5 rounded-full text-[15px] font-medium text-slate-300 bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] hover:text-white transition-all duration-200 cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
              </svg>
              Watch Demo
            </button>
          </div>

          {/* Stats row */}
          <div className="fu d5 flex flex-wrap justify-center gap-10 mb-16">
            {[['4','LANGUAGES'],['Live','CURSORS'],['< 50ms','SYNC TIME']].map(([v,l],i) => (
              <div key={l} className={`text-center ${i > 0 ? 'pl-10 border-l border-white/[0.08]' : ''}`}>
                <div className="text-[32px] font-bold text-white tracking-tight" style={{ fontFamily:"'Cal Sans','DM Sans',sans-serif" }}>{v}</div>
                <div className="text-[10px] tracking-widest text-slate-500 mt-0.5">{l}</div>
              </div>
            ))}
          </div>

          {/* ── Editor window ── */}
          <div className="fu d6 w-full max-w-[860px] rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_40px_100px_rgba(0,0,0,0.7)]">
            <div className="bg-[#181b27] px-5 py-3 flex items-center gap-3 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ background:c }} />)}
              </div>
              <div className="flex gap-2 ml-2">
                {[['solution.cpp',true],['utils.cpp',false]].map(([n,a])=>(
                  <span key={n} className={`flex items-center gap-1.5 px-3 py-[3px] rounded text-[11.5px] font-mono border ${a ? 'bg-[#2a2f45] text-cyan-300 border-cyan-500/30' : 'bg-transparent text-slate-500 border-transparent'}`}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                    </svg>
                    {n}
                  </span>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-2">
                {[['Y','#22d3ee'],['S','#6366f1'],['S','#10b981']].map(([l,c],i)=>(
                  <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-[1.5px]"
                    style={{ background: c+'33', color: c, borderColor: c+'66' }}>{l}</div>
                ))}
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono ml-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation:'pulseGlow 2s ease infinite' }} />
                  Live
                </span>
              </div>
            </div>

            <div className="bg-[#13151f] flex">
              <div className="flex-1 px-3 py-5 min-h-[220px] border-r border-white/[0.05]">
                <EditorPreview />
              </div>
              <div className="w-48 px-4 py-4 shrink-0">
                <div className="text-[10px] tracking-widest text-slate-600 mb-3">OUTPUT</div>
                <div className="flex items-center gap-1.5 text-[12px] text-emerald-400 mb-2">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Running...
                </div>
                <div className="font-mono text-[12px] text-slate-300 mb-4">[0, 1]</div>
                <div className="text-[12px] text-emerald-400 font-semibold mb-1">✓ Passed</div>
                <div className="text-[11px] text-slate-500">Time: 4ms</div>
                <div className="text-[11px] text-slate-500">Lang: C++17</div>
              </div>
            </div>

            <div className="bg-[#181b27] px-5 py-2 flex items-center gap-1 border-t border-white/[0.05]">
              <span className="text-[11px] text-slate-500">C++17</span>
              <span className="text-slate-700 mx-2">|</span>
              <span className="text-[11px] text-slate-500">GCC 13</span>
              <div className="ml-auto flex gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1 rounded text-[11px] text-slate-400 border border-white/[0.08] hover:bg-white/[0.05] transition-all cursor-pointer bg-transparent">
                  Share Room
                </button>
                <button onClick={login} className="flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-medium text-black bg-cyan-400 hover:bg-cyan-300 transition-all cursor-pointer border-0">
                  ▶ Run
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ FEATURES ══════════ */}
        <section id="features" className="relative z-10 max-w-6xl mx-auto px-5 py-24">
          <p className="text-[11px] font-semibold tracking-[3px] uppercase text-cyan-400 mb-4">— PLATFORM FEATURES</p>
          <h2 className="font-bold text-white leading-tight mb-14"
              style={{ fontFamily:"'Cal Sans','DM Sans',sans-serif", fontSize:'clamp(28px,4vw,46px)', letterSpacing:'-1.5px' }}>
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">build together.</span>
          </h2>

          {/* Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 mb-4">
            {/* Compiler card */}
            <div className="group bg-[#13151f] border border-white/[0.07] rounded-2xl p-7 hover:border-white/[0.14] transition-all duration-200">
              <div className="flex items-start justify-between mb-8">
                <div className={`w-12 h-12 rounded-xl ${FEATURES[0].iconBg} flex items-center justify-center ${FEATURES[0].iconColor}`}>
                  {FEATURES[0].icon}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-cyan-400" style={{ fontFamily:"'Cal Sans','DM Sans',sans-serif" }}>{FEATURES[0].stat}</div>
                  <div className="text-[9px] tracking-widest text-slate-600">{FEATURES[0].statSub}</div>
                </div>
              </div>
              <p className="text-[10px] tracking-[2.5px] text-slate-500 mb-2 flex items-center gap-2">
                <span className="w-4 h-px bg-slate-600 inline-block" /> {FEATURES[0].label}
              </p>
              <h3 className="text-2xl font-bold text-white mb-3" style={{ letterSpacing:'-0.5px' }}>{FEATURES[0].title}</h3>
              <p className="text-[14px] text-slate-400 leading-relaxed mb-6 font-light">{FEATURES[0].desc}</p>
              <div className="flex flex-wrap gap-2">
                {LANGS.map(t => (
                  <span key={t} className="px-3 py-1 rounded-full text-[12px] text-slate-400 border border-white/[0.1] hover:border-white/[0.2] transition-colors cursor-default">{t}</span>
                ))}
              </div>
            </div>

            {/* Sync card */}
            <div className="group bg-[#13191f] border border-emerald-500/[0.15] rounded-2xl p-7 hover:border-emerald-500/30 transition-all duration-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/[0.06] to-transparent" />
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl ${FEATURES[1].iconBg} flex items-center justify-center ${FEATURES[1].iconColor} mb-8`}>
                  {FEATURES[1].icon}
                </div>
                <p className="text-[10px] tracking-[2.5px] text-slate-500 mb-2 flex items-center gap-2">
                  <span className="w-4 h-px bg-slate-600 inline-block" /> {FEATURES[1].label}
                </p>
                <h3 className="text-2xl font-bold text-white mb-3" style={{ letterSpacing:'-0.5px' }}>{FEATURES[1].title}</h3>
                <p className="text-[14px] text-slate-400 leading-relaxed font-light">{FEATURES[1].desc}</p>
                <SyncBars />
              </div>
            </div>
          </div>

          {/* Row 2: three cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURES_BOTTOM.map(f => (
              <div key={f.label}
                className="group bg-[#13151f] border border-white/[0.07] rounded-2xl p-6 hover:border-white/[0.14] transition-all duration-200">
                <div className={`w-11 h-11 rounded-xl ${f.iconBg} flex items-center justify-center ${f.iconColor} mb-6`}>
                  {f.icon}
                </div>
                <p className="text-[10px] tracking-[2.5px] text-slate-500 mb-2 flex items-center gap-2">
                  <span className="w-4 h-px bg-slate-600 inline-block" /> {f.label}
                </p>
                <h3 className="text-[20px] font-bold text-white mb-2" style={{ letterSpacing:'-0.4px' }}>{f.title}</h3>
                <p className="text-[13px] text-slate-400 leading-relaxed font-light">{f.desc}</p>
                {f.extra === 'cursors_demo' && <CursorsDemo />}
                {f.extra === 'share_widget'  && <ShareWidget />}
                {f.extra === 'output_demo'   && <OutputDemo />}
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ COLLAB SECTION ══════════ */}
        <section className="relative z-10 max-w-6xl mx-auto px-5 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl">
              <div className="bg-[#181b27] px-4 py-3 flex items-center justify-between border-b border-white/[0.06]">
                <div className="flex gap-1.5">
                  {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background:c }} />)}
                </div>
                <span className="text-[12px] text-slate-400 font-mono">main.cpp — CodeSync</span>
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation:'pulseGlow 2s ease infinite' }} />
                  3 live
                </span>
              </div>
              <div className="bg-[#13151f] px-3 py-4 font-mono text-[12.5px] leading-[21px] min-h-[300px]">
                {[
                  [{t:'kw',v:'#include'},{t:'str',v:' <bits/stdc++.h>'}],
                  [{t:'kw',v:'using namespace'},{t:'pl',v:' std;'}],
                  [{t:'pl',v:''}],
                  [{t:'kw',v:'int'},{t:'fn',v:' main'},{t:'pl',v:'() {'}],
                  [{t:'pl',v:'  '},{t:'kw',v:'int'},{t:'pl',v:' n; cin >> n;'}],
                  [{t:'pl',v:'  vector<'},{t:'kw',v:'int'},{t:'pl',v:'> arr(n);'}],
                  [{t:'kw',v:'  for'},{t:'pl',v:' (auto& x : arr) cin >> x;'}],
                  [{t:'pl',v:'  sort(arr.begin(), arr.end());'}],
                  [{t:'kw',v:'  for'},{t:'pl',v:' (auto x : arr) cout << x << " ";'}],
                  [{t:'kw',v:'  return'},{t:'pl',v:' 0;'}],
                  [{t:'pl',v:'}'}],
                ].map((line, li) => (
                  <div key={li} className="flex">
                    <span className="text-[10px] text-slate-700 w-7 text-right mr-4 shrink-0 pt-px">{li+1}</span>
                    {line.map((t, ti) => (
                      <span key={ti} style={{ color: t.t==='kw'?'#22d3ee':t.t==='fn'?'#a78bfa':t.t==='str'?'#86efac':'#cbd5e1' }}>
                        {t.v}
                      </span>
                    ))}
                    {li === 7 && (
                      <span className="inline-block w-0.5 h-4 ml-0.5 bg-violet-400 align-middle" style={{ animation:'blink 1.2s step-end infinite' }} />
                    )}
                  </div>
                ))}
              </div>
              <div className="bg-[#181b27] px-4 py-2.5 flex items-center gap-4 border-t border-white/[0.05]">
                {[['Y','#22d3ee','Yash'],['S','#6366f1','Sumit'],['S','#10b981','Sameer']].map(([l,c,n])=>(
                  <div key={n} className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background:c+'33',color:c }}>{l}</div>
                    <span className="text-[11px] text-slate-400">{n}</span>
                    <span className="w-1 h-1 rounded-full" style={{ background:c }} />
                    <span className="text-[11px]" style={{ color:c }}>editing</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] tracking-[3px] uppercase text-cyan-400 mb-4 flex items-center gap-2">
                <span className="w-5 h-px bg-cyan-400 inline-block" /> REAL-TIME COLLABORATION
              </p>
              <h2 className="font-bold text-white leading-tight mb-5"
                  style={{ fontFamily:"'Cal Sans','DM Sans',sans-serif", fontSize:'clamp(28px,4vw,46px)', letterSpacing:'-1.5px' }}>
                Your whole team,{' '}
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  in the same file.
                </span>
              </h2>
              <p className="text-[15px] text-slate-400 leading-relaxed mb-8 font-light max-w-md">
                See every keystroke as it happens. Colored cursors show exactly where each teammate is — no more "who broke what?" moments.
              </p>
              <div className="space-y-4 mb-10">
                {[
                  ['Named cursor presence — see who is where', '#a855f7'],
                  ['Shared output — everyone sees the run result', '#6366f1'],
                  ['Zero-conflict sync — no merge issues ever', '#8b5cf6'],
                ].map(([text, c]) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: c+'22', border:`1px solid ${c}44` }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background:c }} />
                    </div>
                    <span className="text-[14px] text-slate-300">{text}</span>
                  </div>
                ))}
              </div>
              <button onClick={login} className="flex items-center gap-2 text-[14px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer bg-transparent border-0">
                Try collaborative editing free →
              </button>
            </div>
          </div>
        </section>

        {/* ══════════ TESTIMONIALS ══════════ */}
        <section className="relative z-10 max-w-6xl mx-auto px-5 py-24 text-center">
          <p className="text-[10px] tracking-[3px] uppercase text-cyan-400 mb-4 flex items-center justify-center gap-2">
            <span className="w-4 h-px bg-cyan-400 inline-block" /> WHAT STUDENTS SAY
          </p>
          <h2 className="font-bold text-white mb-16"
              style={{ fontFamily:"'Cal Sans','DM Sans',sans-serif", fontSize:'clamp(28px,4vw,46px)', letterSpacing:'-1.5px' }}>
            Used by students who <span className="text-cyan-400">actually code.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
            {REVIEWS.map(r => (
              <div key={r.name}
                className="group bg-[#13151f] border border-white/[0.07] rounded-2xl p-7 text-left hover:border-white/[0.14] transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40">
                <div className="text-3xl text-slate-700 mb-5 font-serif">"</div>
                <p className="text-[14px] text-slate-300 leading-relaxed mb-6 font-light">{r.quote}</p>
                <div className="flex items-center gap-3 mt-auto pt-2 border-t border-white/[0.06]">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                    style={{ background: r.avatarColor+'33', color: r.avatarColor }}>
                    {r.avatar}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-white">{r.name}</div>
                    <div className="text-[11.5px] text-slate-500">{r.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-10 border-t border-white/[0.06]">
            {[['4','SUPPORTED LANGUAGES'],['< 50ms','SYNC LATENCY'],['100%','BROWSER-BASED']].map(([v,l])=>(
              <div key={l} className="text-center">
                <div className="text-[32px] font-bold text-white tracking-tight" style={{ fontFamily:"'Cal Sans','DM Sans',sans-serif" }}>{v}</div>
                <div className="text-[9.5px] tracking-widest text-slate-600 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ FINAL CTA ══════════ */}
        <section className="relative z-10 px-5 py-24 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="font-bold text-white mb-4 leading-tight"
                style={{ fontFamily:"'Cal Sans','DM Sans',sans-serif", fontSize:'clamp(30px,5vw,52px)', letterSpacing:'-1.5px' }}>
              Start coding together,<br/>right now.
            </h2>
            <p className="text-slate-400 text-[16px] font-light mb-10">No setup. No installs. One link to collaborate.</p>
            <button onClick={login}
              className="flex items-center gap-3 mx-auto px-8 py-4 rounded-full text-[15px] font-semibold text-black bg-cyan-400 hover:bg-cyan-300 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-400/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border-0">
              <GIcon size={18} />
              Get started with Google →
            </button>
          </div>
        </section>

        {/* ══════════ FOOTER ══════════ */}
        <footer className="relative z-10 border-t border-white/[0.06] px-6 lg:px-12 py-6
                           flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white">C</div>
            <span className="font-semibold text-slate-500">CodeSync</span>
          </div>
          <span className="flex items-center gap-0.5">© {new Date().getFullYear()} CodeSync. Designed & Developed by Harshal <FaHeart /></span>
          <div className="flex gap-6">
            {['Privacy','Terms','GitHub'].map(l => (
              <a key={l} href="#" className="hover:text-slate-400 transition-colors no-underline">{l}</a>
            ))}
          </div>
        </footer>

      </div>
    </>
  )
}