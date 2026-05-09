// V1 — Aurora: light, professional, split-screen with animated scan visual
const LoginV1 = () => {
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [remember, setRemember] = React.useState(true);

  const v1 = {
    page: { width:'100%', height:'100%', display:'grid', gridTemplateColumns:'1.05fr 1fr', background:'#fff', fontFamily:"'IBM Plex Sans Thai','Plus Jakarta Sans',sans-serif", color:'#0B1020', overflow:'hidden' },
    left: { position:'relative', overflow:'hidden', background:'linear-gradient(135deg,#eef1ff 0%,#f5f0ff 50%,#eaf2ff 100%)', padding:'56px 64px', display:'flex', flexDirection:'column', justifyContent:'space-between' },
    blob1: { position:'absolute', top:-160, right:-120, width:520, height:520, borderRadius:'50%', background:'radial-gradient(circle,#6366F1 0%,transparent 70%)', opacity:.18, filter:'blur(20px)' },
    blob2: { position:'absolute', bottom:-180, left:-140, width:480, height:480, borderRadius:'50%', background:'radial-gradient(circle,#A78BFA 0%,transparent 70%)', opacity:.20, filter:'blur(20px)' },
    grid: { position:'absolute', inset:0, backgroundImage:'linear-gradient(#0B102008 1px,transparent 1px),linear-gradient(90deg,#0B102008 1px,transparent 1px)', backgroundSize:'42px 42px', maskImage:'radial-gradient(ellipse at center,#000 30%,transparent 75%)' },
    brandRow: { position:'relative', display:'flex', alignItems:'center', gap:12, zIndex:2 },
    brandIcon: { width:40, height:40, borderRadius:11, background:'linear-gradient(135deg,#4F46E5,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 10px 28px -8px rgba(79,70,229,.5)' },
    brandName: { fontWeight:700, fontSize:18, letterSpacing:'-0.01em' },
    hero: { position:'relative', zIndex:2, display:'flex', flexDirection:'column', gap:28, marginTop:24 },
    eyebrow: { display:'inline-flex', alignItems:'center', gap:8, fontSize:12, fontWeight:600, color:'#4F46E5', background:'#fff', border:'1px solid #E0E7FF', padding:'6px 12px', borderRadius:999, alignSelf:'flex-start', boxShadow:'0 1px 2px rgba(15,23,42,.04)' },
    h1: { fontSize:42, lineHeight:1.15, fontWeight:700, letterSpacing:'-0.02em', margin:0, maxWidth:540 },
    h1Accent: { background:'linear-gradient(135deg,#4F46E5,#7C3AED 60%,#EC4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
    sub: { fontSize:16, lineHeight:1.6, color:'#475569', margin:0, maxWidth:480 },
    // Scanner mock
    scanWrap: { position:'relative', zIndex:2, height:300, display:'flex', alignItems:'center', justifyContent:'center', perspective:'1400px' },
    cardBack: { position:'absolute', width:340, height:200, borderRadius:18, background:'linear-gradient(135deg,#1E1B4B,#312E81)', transform:'translateY(28px) translateX(-90px) rotate(-9deg)', boxShadow:'0 30px 60px -20px rgba(15,23,42,.35)', overflow:'hidden' },
    cardFront: { position:'relative', width:380, height:230, borderRadius:20, background:'#fff', boxShadow:'0 30px 80px -20px rgba(15,23,42,.25), 0 0 0 1px rgba(15,23,42,.04)', padding:24, transform:'rotate(2deg)', overflow:'hidden' },
    scanLine: { position:'absolute', left:0, right:0, height:3, background:'linear-gradient(90deg,transparent,#4F46E5,#A78BFA,transparent)', boxShadow:'0 0 22px 4px rgba(79,70,229,.55)', animation:'v1scan 2.6s ease-in-out infinite' },
    corner: { position:'absolute', width:22, height:22, borderColor:'#4F46E5' },
    bullets: { position:'relative', zIndex:2, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 },
    bullet: { background:'rgba(255,255,255,.7)', backdropFilter:'blur(8px)', border:'1px solid rgba(15,23,42,.06)', borderRadius:14, padding:'14px 16px' },
    bIcon: { width:32, height:32, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:8 },
    bTitle: { fontSize:13, fontWeight:600, color:'#0B1020', margin:0 },
    bSub: { fontSize:11.5, color:'#64748B', margin:'2px 0 0', lineHeight:1.4 },

    // Right panel
    right: { position:'relative', display:'flex', flexDirection:'column', padding:'56px 72px' },
    topBar: { display:'flex', justifyContent:'flex-end', gap:16, alignItems:'center', fontSize:13, color:'#64748B' },
    formWrap: { flex:1, display:'flex', flexDirection:'column', justifyContent:'center', maxWidth:440, width:'100%', marginInline:'auto' },
    formH: { fontSize:30, fontWeight:700, letterSpacing:'-0.02em', margin:0, color:'#0B1020' },
    formS: { fontSize:15, color:'#64748B', marginTop:8 },
    seg: { display:'none' },
    segOn: { background:'#fff', color:'#0B1020', borderRadius:9, padding:'9px 0', textAlign:'center', boxShadow:'0 1px 3px rgba(15,23,42,.08), 0 0 0 1px rgba(15,23,42,.04)' },
    segOff: { color:'#64748B', borderRadius:9, padding:'9px 0', textAlign:'center', cursor:'pointer' },
    field: { marginTop:18 },
    label: { fontSize:13, fontWeight:600, color:'#334155', marginBottom:6, display:'flex', justifyContent:'space-between' },
    inputWrap: { position:'relative', display:'flex', alignItems:'center' },
    input: { width:'100%', height:48, padding:'0 16px 0 44px', borderRadius:12, border:'1.5px solid #E2E8F0', background:'#fff', fontSize:15, fontFamily:'inherit', color:'#0B1020', outline:'none', transition:'border-color .15s, box-shadow .15s' },
    inputIcon: { position:'absolute', left:14, color:'#94A3B8', display:'flex' },
    inputEye: { position:'absolute', right:8, color:'#64748B', background:'transparent', border:0, padding:8, cursor:'pointer', borderRadius:8 },
    rememberRow: { display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:18, fontSize:13.5 },
    cb: { display:'flex', alignItems:'center', gap:8, cursor:'pointer', color:'#475569' },
    cbBox: (on)=>({ width:18, height:18, borderRadius:5, border:`1.5px solid ${on?'#4F46E5':'#CBD5E1'}`, background:on?'#4F46E5':'#fff', display:'flex', alignItems:'center', justifyContent:'center' }),
    forgot: { color:'#4F46E5', fontWeight:600, textDecoration:'none' },
    submit: { marginTop:24, height:50, borderRadius:12, border:0, color:'#fff', fontWeight:600, fontSize:15, cursor:'pointer', background:'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow:'0 12px 28px -10px rgba(79,70,229,.55)', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:'inherit' },
    divider: { display:'flex', alignItems:'center', gap:12, margin:'22px 0', color:'#94A3B8', fontSize:12 },
    dline: { flex:1, height:1, background:'#E2E8F0' },
    sso: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
    ssoBtn: { height:46, borderRadius:11, border:'1.5px solid #E2E8F0', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontSize:13.5, fontWeight:600, color:'#334155', cursor:'pointer', fontFamily:'inherit' },
    contact: { textAlign:'center', fontSize:13, color:'#64748B', marginTop:22 },
    contactLink: { color:'#4F46E5', fontWeight:600, textDecoration:'none' },
    bottomBar: { display:'flex', justifyContent:'space-between', fontSize:12, color:'#94A3B8', marginTop:24 },
  };

  return (
    <div style={v1.page}>
      <style>{`
        @keyframes v1scan { 0%{ top:0 } 50%{ top:calc(100% - 3px) } 100%{ top:0 } }
        @keyframes v1float { 0%,100%{ transform: translateY(0) rotate(2deg) } 50%{ transform: translateY(-6px) rotate(2deg) } }
        .v1-input:focus { border-color:#4F46E5 !important; box-shadow: 0 0 0 4px rgba(79,70,229,.12) !important; }
      `}</style>

      {/* LEFT */}
      <div style={v1.left}>
        <div style={v1.blob1}></div>
        <div style={v1.blob2}></div>
        <div style={v1.grid}></div>

        <div style={v1.brandRow}>
          <div style={v1.brandIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="16" rx="3" stroke="#fff" strokeWidth="2"/>
              <circle cx="9" cy="11" r="2" stroke="#fff" strokeWidth="2"/>
              <path d="M14 10h4M14 13h3M6 17h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={v1.brandName}>SmartCard</div>
            <div style={{ fontSize:11.5, color:'#64748B', fontWeight:500 }}>Business Card Intelligence</div>
          </div>
        </div>

        <div style={v1.hero}>
          <span style={v1.eyebrow}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#10B981' }}></span>
            v3.2 · เร็วขึ้น 40% สำหรับการสแกนบัตร
          </span>
          <h1 style={v1.h1}>เปลี่ยนนามบัตรเป็น<br/><span style={v1.h1Accent}>โอกาสทางธุรกิจ</span></h1>
          <p style={v1.sub}>สแกน จัดเก็บ และติดตามทุกการติดต่อในที่เดียว — แพลตฟอร์มที่ทีมขายและการตลาดเลือกใช้เพื่อปิดดีลได้เร็วกว่า</p>
        </div>

        <div style={v1.scanWrap}>
          <div style={v1.cardBack}>
            <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 80% 0%,rgba(167,139,250,.4),transparent 60%)' }}></div>
            <div style={{ position:'absolute', left:24, top:24, fontSize:10, fontWeight:600, color:'rgba(255,255,255,.5)', letterSpacing:'.18em' }}>SCANNED · 2 มิ.ย.</div>
            <div style={{ position:'absolute', left:24, bottom:24, color:'#fff', fontWeight:600, fontSize:14 }}>Sarawut · CTO, Lumen Co.</div>
          </div>
          <div style={{ ...v1.cardFront, animation:'v1float 5s ease-in-out infinite' }}>
            {/* corner brackets */}
            <div style={{ ...v1.corner, top:10, left:10, borderTop:'2.5px solid #4F46E5', borderLeft:'2.5px solid #4F46E5', borderTopLeftRadius:6 }}></div>
            <div style={{ ...v1.corner, top:10, right:10, borderTop:'2.5px solid #4F46E5', borderRight:'2.5px solid #4F46E5', borderTopRightRadius:6 }}></div>
            <div style={{ ...v1.corner, bottom:10, left:10, borderBottom:'2.5px solid #4F46E5', borderLeft:'2.5px solid #4F46E5', borderBottomLeftRadius:6 }}></div>
            <div style={{ ...v1.corner, bottom:10, right:10, borderBottom:'2.5px solid #4F46E5', borderRight:'2.5px solid #4F46E5', borderBottomRightRadius:6 }}></div>

            <div style={v1.scanLine}></div>

            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:54, height:54, borderRadius:'50%', background:'linear-gradient(135deg,#FCA5A5,#F472B6)', flex:'0 0 auto' }}></div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:16, color:'#0B1020' }}>คุณ ปริญญา วงศ์ภักดี</div>
                <div style={{ fontSize:12, color:'#64748B', marginTop:2 }}>Head of Marketing · Aurora Brands</div>
              </div>
            </div>
            <div style={{ marginTop:18, display:'flex', flexDirection:'column', gap:7, fontSize:11.5, color:'#475569' }}>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <div style={{ width:18, height:18, borderRadius:5, background:'#EEF2FF', color:'#4F46E5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11 }}>@</div>
                parinya@aurora.co.th
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <div style={{ width:18, height:18, borderRadius:5, background:'#EEF2FF', color:'#4F46E5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11 }}>☎</div>
                +66 81 234 5678
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <div style={{ width:18, height:18, borderRadius:5, background:'#EEF2FF', color:'#4F46E5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11 }}>⌂</div>
                www.aurora.co.th · BKK
              </div>
            </div>
            <div style={{ position:'absolute', right:18, top:18, padding:'4px 8px', borderRadius:6, background:'#ECFDF5', color:'#059669', fontSize:10, fontWeight:700, letterSpacing:'.06em' }}>OCR · 99.4%</div>
          </div>
        </div>

        <div style={v1.bullets}>
          {[
            { c:'#EEF2FF', a:'#4F46E5', t:'OCR แม่นยำ', s:'อ่านนามบัตรไทย-อังกฤษ' , icon:'⚡'},
            { c:'#FDF4FF', a:'#A21CAF', t:'CRM อัตโนมัติ', s:'ส่งเข้าทีมขายทันที', icon:'⇆' },
            { c:'#ECFEFF', a:'#0891B2', t:'ติดตาม follow-up', s:'แจ้งเตือนตามรอบ', icon:'◷' },
          ].map((b,i)=>(
            <div key={i} style={v1.bullet}>
              <div style={{ ...v1.bIcon, background:b.c, color:b.a, fontSize:16, fontWeight:700 }}>{b.icon}</div>
              <div style={v1.bTitle}>{b.t}</div>
              <div style={v1.bSub}>{b.s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div style={v1.right}>
        <div style={v1.formWrap}>
          <h2 style={v1.formH}>ยินดีต้อนรับกลับ 👋</h2>
          <p style={v1.formS}>เข้าสู่ระบบเพื่อจัดการนามบัตรและไปป์ไลน์ดีลของคุณ</p>

          <div style={v1.seg}>
            <div style={v1.segOn}>อีเมล / รหัสผ่าน</div>
            <div style={v1.segOff}>SSO องค์กร</div>
          </div>

          <div style={v1.field}>
            <div style={v1.label}><span>อีเมลที่ทำงาน</span></div>
            <div style={v1.inputWrap}>
              <span style={v1.inputIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 7l9 6 9-6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              <input className="v1-input" style={v1.input} type="email" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
          </div>

          <div style={v1.field}>
            <div style={v1.label}><span>รหัสผ่าน</span><a href="#" style={v1.forgot}>ลืมรหัสผ่าน?</a></div>
            <div style={v1.inputWrap}>
              <span style={v1.inputIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="11" width="16" height="9" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </span>
              <input className="v1-input" style={v1.input} type={show?'text':'password'} placeholder="••••••••" value={pw} onChange={e=>setPw(e.target.value)} />
              <button style={v1.inputEye} onClick={()=>setShow(!show)}>
                {show ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button style={v1.submit}>
            เข้าสู่ระบบ
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          <div style={v1.contact}>ยังไม่มีบัญชีหรือมีปัญหา? <a href="#" style={v1.contactLink}>ติดต่อผู้ดูแลระบบ</a></div>
        </div>

        <div style={v1.bottomBar}>
          <span>© 2026 Arnon Arpaket — All rights reserved</span>
          <span style={{ display:'flex', gap:18 }}>
            <a href="#" style={{ color:'#94A3B8', textDecoration:'none' }}>ความเป็นส่วนตัว</a>
            <a href="#" style={{ color:'#94A3B8', textDecoration:'none' }}>เงื่อนไข</a>
            <a href="#" style={{ color:'#94A3B8', textDecoration:'none' }}>EN ▾</a>
          </span>
        </div>
      </div>
    </div>
  );
};
window.LoginV1 = LoginV1;
