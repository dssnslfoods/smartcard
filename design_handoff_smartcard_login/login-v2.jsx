// V2 — Midnight: premium dark with floating card stack, KPI, and clean form
const LoginV2 = () => {
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [show, setShow] = React.useState(false);

  const v2 = {
    page: { width:'100%', height:'100%', display:'grid', gridTemplateColumns:'1fr 1fr', background:'#0A0E1F', fontFamily:"'IBM Plex Sans Thai','Plus Jakarta Sans',sans-serif", color:'#fff', overflow:'hidden' },
    left: { position:'relative', overflow:'hidden', padding:'48px 56px', display:'flex', flexDirection:'column', justifyContent:'space-between' },
    bgMesh: { position:'absolute', inset:0, background:'radial-gradient(80% 60% at 30% 10%, rgba(99,102,241,.35), transparent 60%), radial-gradient(60% 50% at 100% 100%, rgba(236,72,153,.25), transparent 65%), radial-gradient(60% 60% at 0% 100%, rgba(34,211,238,.18), transparent 65%), #0A0E1F' },
    grid: { position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px)', backgroundSize:'56px 56px', maskImage:'radial-gradient(ellipse at 50% 60%,#000 30%,transparent 80%)' },
    noise: { position:'absolute', inset:0, opacity:.5, backgroundImage:'radial-gradient(rgba(255,255,255,.04) 1px,transparent 1px)', backgroundSize:'3px 3px' },

    brandRow: { position:'relative', display:'flex', alignItems:'center', gap:12, zIndex:2 },
    brandIcon: { width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#818CF8,#C084FC)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 30px rgba(129,140,248,.5), inset 0 1px 0 rgba(255,255,255,.3)' },
    brandName: { fontWeight:700, fontSize:18, letterSpacing:'-0.01em' },

    hero: { position:'relative', zIndex:2 },
    eyebrow: { display:'inline-flex', alignItems:'center', gap:8, fontSize:11.5, fontWeight:600, color:'#A5B4FC', background:'rgba(99,102,241,.12)', border:'1px solid rgba(165,180,252,.25)', padding:'6px 12px', borderRadius:999 },
    h1: { fontSize:52, lineHeight:1.05, fontWeight:700, letterSpacing:'-0.025em', margin:'18px 0 0', maxWidth:560 },
    h1Accent: { background:'linear-gradient(135deg,#A5B4FC,#F0ABFC,#FDA4AF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
    sub: { fontSize:15.5, lineHeight:1.65, color:'rgba(226,232,240,.7)', marginTop:18, maxWidth:480 },

    // Floating card stack
    stack: { position:'relative', zIndex:2, height:300, perspective:'1600px', transformStyle:'preserve-3d' },
    card: (i, base) => ({
      position:'absolute', width:300, height:182, borderRadius:18, padding:18,
      ...base,
      boxShadow:'0 30px 60px -20px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.08), inset 0 1px 0 rgba(255,255,255,.1)',
      backdropFilter:'blur(14px)',
    }),

    // KPIs
    kpis: { position:'relative', zIndex:2, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24, paddingTop:24, borderTop:'1px solid rgba(255,255,255,.08)' },
    kVal: { fontSize:28, fontWeight:700, letterSpacing:'-0.02em', background:'linear-gradient(180deg,#fff,#A5B4FC)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
    kLabel: { fontSize:12, color:'rgba(226,232,240,.55)', marginTop:4 },

    // RIGHT
    right: { position:'relative', display:'flex', flexDirection:'column', padding:'48px 64px', background:'#0A0E1F' },
    rightInner: { flex:1, display:'flex', flexDirection:'column', justifyContent:'center', maxWidth:420, width:'100%', marginInline:'auto' },
    formCard: { background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.08)', borderRadius:20, padding:36, boxShadow:'0 30px 80px -30px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.06)' },
    formH: { fontSize:26, fontWeight:700, margin:0, letterSpacing:'-0.02em' },
    formS: { fontSize:14, color:'rgba(226,232,240,.6)', marginTop:8 },
    field: { marginTop:18 },
    label: { fontSize:12.5, fontWeight:600, color:'rgba(226,232,240,.85)', marginBottom:7, display:'flex', justifyContent:'space-between' },
    inputWrap: { position:'relative', display:'flex', alignItems:'center' },
    input: { width:'100%', height:46, padding:'0 14px 0 42px', borderRadius:11, border:'1px solid rgba(255,255,255,.08)', background:'rgba(255,255,255,.04)', fontSize:14.5, color:'#fff', outline:'none', fontFamily:'inherit' },
    inputIcon: { position:'absolute', left:13, color:'rgba(226,232,240,.5)', display:'flex' },
    eye: { position:'absolute', right:6, color:'rgba(226,232,240,.6)', background:'transparent', border:0, padding:8, cursor:'pointer' },
    forgot: { color:'#A5B4FC', fontWeight:600, textDecoration:'none', fontSize:12.5 },
    submit: { marginTop:22, width:'100%', height:48, borderRadius:11, border:0, color:'#0B1020', fontWeight:700, fontSize:14.5, cursor:'pointer', background:'linear-gradient(135deg,#A5B4FC,#F0ABFC)', boxShadow:'0 12px 30px -10px rgba(165,180,252,.6), inset 0 1px 0 rgba(255,255,255,.5)', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:'inherit' },
    divider: { display:'flex', alignItems:'center', gap:12, margin:'20px 0', color:'rgba(226,232,240,.4)', fontSize:11.5 },
    dline: { flex:1, height:1, background:'rgba(255,255,255,.08)' },
    sso: { display:'flex', flexDirection:'column', gap:10 },
    ssoBtn: { height:44, borderRadius:11, border:'1px solid rgba(255,255,255,.1)', background:'rgba(255,255,255,.03)', display:'flex', alignItems:'center', justifyContent:'center', gap:10, fontSize:13.5, fontWeight:600, color:'#fff', cursor:'pointer', fontFamily:'inherit' },
    contact: { textAlign:'center', fontSize:12.5, color:'rgba(226,232,240,.55)', marginTop:18 },
    contactLink: { color:'#A5B4FC', fontWeight:600, textDecoration:'none' },
    bottomBar: { display:'flex', justifyContent:'space-between', fontSize:11.5, color:'rgba(226,232,240,.4)', marginTop:24 },
  };

  return (
    <div style={v2.page}>
      <style>{`
        .v2-input:focus { border-color: rgba(165,180,252,.5) !important; box-shadow: 0 0 0 4px rgba(165,180,252,.12) !important; background: rgba(255,255,255,.06) !important; }
        .v2-input::placeholder { color: rgba(226,232,240,.35); }
        @keyframes v2float1 { 0%,100% { transform: translate(-110px, -10px) rotateZ(-10deg) rotateX(8deg) rotateY(10deg); } 50% { transform: translate(-110px, -22px) rotateZ(-10deg) rotateX(8deg) rotateY(10deg); } }
        @keyframes v2float2 { 0%,100% { transform: translate(0, 0) rotateZ(2deg) rotateX(6deg) rotateY(-4deg); } 50% { transform: translate(0, -8px) rotateZ(2deg) rotateX(6deg) rotateY(-4deg); } }
        @keyframes v2float3 { 0%,100% { transform: translate(120px, 30px) rotateZ(12deg) rotateX(4deg) rotateY(-12deg); } 50% { transform: translate(120px, 18px) rotateZ(12deg) rotateX(4deg) rotateY(-12deg); } }
        @keyframes v2pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
      `}</style>

      {/* LEFT */}
      <div style={v2.left}>
        <div style={v2.bgMesh}></div>
        <div style={v2.grid}></div>
        <div style={v2.noise}></div>

        <div style={v2.brandRow}>
          <div style={v2.brandIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="16" rx="3" stroke="#fff" strokeWidth="2"/>
              <circle cx="9" cy="11" r="2" stroke="#fff" strokeWidth="2"/>
              <path d="M14 10h4M14 13h3M6 17h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={v2.brandName}>SmartCard <span style={{ fontSize:10, fontWeight:600, color:'#A5B4FC', background:'rgba(165,180,252,.15)', padding:'2px 6px', borderRadius:5, marginLeft:6, verticalAlign:'middle' }}>ENTERPRISE</span></div>
            <div style={{ fontSize:11.5, color:'rgba(226,232,240,.55)', fontWeight:500 }}>Sales · CRM · Pipeline</div>
          </div>
        </div>

        <div style={v2.hero}>
          <span style={v2.eyebrow}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#34D399', boxShadow:'0 0 10px #34D399', animation:'v2pulse 1.6s infinite' }}></span>
            ระบบทำงานปกติ · 99.99% uptime
          </span>
          <h1 style={v2.h1}>ทุกการพบกัน<br/><span style={v2.h1Accent}>คือดีลที่กำลังเริ่มต้น</span></h1>
          <p style={v2.sub}>แพลตฟอร์มสแกนนามบัตรและจัดการลูกค้าที่ทีมขายอันดับต้นของเอเชียเลือกใช้ — เปลี่ยนนามบัตรเป็นรายได้ภายใน 24 ชั่วโมง</p>
        </div>

        <div style={{ position:'relative', zIndex:2, height:240, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={v2.stack}>
            {/* Card 3 - back left */}
            <div style={{ ...v2.card(0, { left:'50%', top:'50%', marginLeft:-150, marginTop:-91, animation:'v2float1 6s ease-in-out infinite', background:'linear-gradient(135deg,rgba(99,102,241,.5),rgba(99,102,241,.2))' })}}>
              <div style={{ fontSize:10, color:'rgba(255,255,255,.6)', letterSpacing:'.18em', fontWeight:600 }}>FINANCE · #2412</div>
              <div style={{ marginTop:30, fontWeight:700, fontSize:15 }}>Khun Nattaya P.</div>
              <div style={{ fontSize:11.5, color:'rgba(255,255,255,.7)', marginTop:3 }}>CFO · Indus Group</div>
              <div style={{ position:'absolute', right:18, bottom:18, width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,.15)' }}></div>
            </div>
            {/* Card 1 - center */}
            <div style={{ ...v2.card(1, { left:'50%', top:'50%', marginLeft:-150, marginTop:-91, zIndex:3, animation:'v2float2 5s ease-in-out infinite', background:'linear-gradient(135deg,rgba(255,255,255,.18),rgba(255,255,255,.06))' })}}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.7)', letterSpacing:'.18em', fontWeight:600 }}>SCANNED · 2 มิ.ย.</div>
                <div style={{ padding:'2px 7px', borderRadius:5, background:'rgba(52,211,153,.2)', color:'#6EE7B7', fontSize:9.5, fontWeight:700, letterSpacing:'.04em' }}>HOT LEAD</div>
              </div>
              <div style={{ marginTop:18, display:'flex', alignItems:'center', gap:11 }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#FCA5A5,#F0ABFC)' }}></div>
                <div>
                  <div style={{ fontWeight:700, fontSize:14.5 }}>คุณ ปริญญา วงศ์ภักดี</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,.7)', marginTop:1 }}>Head of Marketing · Aurora</div>
                </div>
              </div>
              <div style={{ position:'absolute', left:18, bottom:14, fontSize:10, color:'rgba(255,255,255,.55)' }}>parinya@aurora.co.th</div>
              <div style={{ position:'absolute', right:18, bottom:14, fontSize:10, color:'#A5B4FC', fontWeight:700 }}>OCR 99.4%</div>
            </div>
            {/* Card 2 - back right */}
            <div style={{ ...v2.card(2, { left:'50%', top:'50%', marginLeft:-150, marginTop:-91, animation:'v2float3 7s ease-in-out infinite', background:'linear-gradient(135deg,rgba(236,72,153,.5),rgba(236,72,153,.15))' })}}>
              <div style={{ fontSize:10, color:'rgba(255,255,255,.6)', letterSpacing:'.18em', fontWeight:600 }}>EVENT · BMA EXPO</div>
              <div style={{ marginTop:30, fontWeight:700, fontSize:15 }}>Sarawut V.</div>
              <div style={{ fontSize:11.5, color:'rgba(255,255,255,.7)', marginTop:3 }}>CTO · Lumen Co.</div>
            </div>
          </div>
        </div>

        <div style={v2.kpis}>
          <div>
            <div style={v2.kVal}>2.4M+</div>
            <div style={v2.kLabel}>นามบัตรที่สแกนแล้วในระบบ</div>
          </div>
          <div>
            <div style={v2.kVal}>99.4%</div>
            <div style={v2.kLabel}>ความแม่นยำ OCR ภาษาไทย-อังกฤษ</div>
          </div>
          <div>
            <div style={v2.kVal}>1,200+</div>
            <div style={v2.kLabel}>ทีมขายและการตลาดที่ใช้งาน</div>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div style={v2.right}>
        <div style={v2.rightInner}>
          <div style={v2.formCard}>
            <h2 style={v2.formH}>เข้าสู่ระบบ</h2>
            <p style={v2.formS}>กลับมาปิดดีลต่อกันได้เลย — ลงชื่อเข้าใช้บัญชีของคุณ</p>

            <div style={v2.field}>
              <div style={v2.label}>อีเมลที่ทำงาน</div>
              <div style={v2.inputWrap}>
                <span style={v2.inputIcon}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 7l9 6 9-6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                <input className="v2-input" style={v2.input} type="email" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)} />
              </div>
            </div>

            <div style={v2.field}>
              <div style={v2.label}><span>รหัสผ่าน</span><a href="#" style={v2.forgot}>ลืมรหัสผ่าน?</a></div>
              <div style={v2.inputWrap}>
                <span style={v2.inputIcon}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="4" y="11" width="16" height="9" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></span>
                <input className="v2-input" style={v2.input} type={show?'text':'password'} placeholder="••••••••" value={pw} onChange={e=>setPw(e.target.value)} />
                <button style={v2.eye} onClick={()=>setShow(!show)}>{show?'🙈':'👁'}</button>
              </div>
            </div>

            <button style={v2.submit}>
              เข้าสู่ระบบอย่างปลอดภัย
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            <div style={v2.contact}>มีปัญหาเข้าสู่ระบบ? <a href="#" style={v2.contactLink}>ติดต่อทีมซัพพอร์ต</a></div>
          </div>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:18, marginTop:22, fontSize:11.5, color:'rgba(226,232,240,.45)' }}>
            <span style={{ display:'flex', alignItems:'center', gap:6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4z" stroke="currentColor" strokeWidth="1.6"/></svg>
              SOC 2 Type II
            </span>
            <span>·</span>
            <span>ISO 27001</span>
            <span>·</span>
            <span>PDPA Compliant</span>
          </div>
        </div>

        <div style={v2.bottomBar}>
          <span>© 2026 SmartCard · Arnon Arpaket</span>
          <span style={{ display:'flex', gap:14 }}>
            <a href="#" style={{ color:'rgba(226,232,240,.5)', textDecoration:'none' }}>Privacy</a>
            <a href="#" style={{ color:'rgba(226,232,240,.5)', textDecoration:'none' }}>Terms</a>
            <a href="#" style={{ color:'rgba(226,232,240,.5)', textDecoration:'none' }}>EN ▾</a>
          </span>
        </div>
      </div>
    </div>
  );
};
window.LoginV2 = LoginV2;
