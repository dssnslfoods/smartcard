// V3 — Pulse: bold marketing, full-bleed gradient with glassmorphic form + social proof
const LoginV3 = () => {
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [show, setShow] = React.useState(false);

  const v3 = {
    page: { width:'100%', height:'100%', position:'relative', background:'#0F0820', fontFamily:"'IBM Plex Sans Thai','Plus Jakarta Sans',sans-serif", color:'#fff', overflow:'hidden', display:'grid', gridTemplateColumns:'1.15fr 1fr' },
    bg: { position:'absolute', inset:0, background:'radial-gradient(60% 80% at 20% 20%, #4338CA, transparent 60%), radial-gradient(60% 70% at 100% 50%, #BE185D, transparent 60%), radial-gradient(80% 70% at 50% 110%, #7C3AED, transparent 60%), #0F0820' },
    grain: { position:'absolute', inset:0, opacity:.4, backgroundImage:'radial-gradient(rgba(255,255,255,.05) 1px,transparent 1px)', backgroundSize:'3px 3px' },
    rings: { position:'absolute', inset:0, background:'repeating-radial-gradient(circle at 80% 30%, transparent 0, transparent 60px, rgba(255,255,255,.04) 60px, rgba(255,255,255,.04) 61px)', maskImage:'radial-gradient(circle at 80% 30%, #000, transparent 60%)' },

    // LEFT — marketing hero
    left: { position:'relative', zIndex:2, padding:'48px 56px', display:'flex', flexDirection:'column', justifyContent:'space-between' },
    brandRow: { display:'flex', alignItems:'center', gap:12 },
    brandIcon: { width:40, height:40, borderRadius:11, background:'rgba(255,255,255,.12)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center' },
    brandName: { fontWeight:800, fontSize:18, letterSpacing:'-0.01em' },

    eyebrow: { display:'inline-flex', alignItems:'center', gap:8, fontSize:12, fontWeight:700, color:'#FBCFE8', background:'rgba(244,114,182,.15)', border:'1px solid rgba(244,114,182,.3)', padding:'7px 14px', borderRadius:999, alignSelf:'flex-start' },
    h1: { fontSize:64, lineHeight:.98, fontWeight:800, letterSpacing:'-0.03em', margin:'18px 0 0', maxWidth:600 },
    italic: { fontStyle:'italic', fontWeight:500, fontFamily:"'Plus Jakarta Sans',serif" },
    sub: { fontSize:16.5, lineHeight:1.55, color:'rgba(248,232,255,.75)', marginTop:22, maxWidth:480 },

    // Pull quote / testimonial
    quote: { position:'relative', background:'rgba(255,255,255,.06)', backdropFilter:'blur(18px)', border:'1px solid rgba(255,255,255,.12)', borderRadius:18, padding:24, marginTop:30, maxWidth:460 },
    quoteText: { fontSize:15, lineHeight:1.55, color:'rgba(255,255,255,.92)', fontWeight:500, margin:0 },
    quoteAuthor: { display:'flex', alignItems:'center', gap:10, marginTop:14 },
    avatar: { width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#FCA5A5,#F0ABFC)' },

    // social proof
    proof: { display:'flex', alignItems:'center', gap:24, paddingTop:22, borderTop:'1px solid rgba(255,255,255,.1)', flexWrap:'wrap' },
    proofLabel: { fontSize:11, color:'rgba(248,232,255,.5)', letterSpacing:'.16em', fontWeight:700, textTransform:'uppercase' },
    logoChip: { padding:'6px 14px', borderRadius:8, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.08)', fontSize:13, fontWeight:700, color:'rgba(255,255,255,.85)', letterSpacing:'.04em' },

    // RIGHT — form
    right: { position:'relative', zIndex:2, padding:'48px 56px', display:'flex', flexDirection:'column' },
    topRight: { display:'flex', justifyContent:'flex-end', gap:12, fontSize:13, color:'rgba(248,232,255,.7)', alignItems:'center' },
    formWrap: { flex:1, display:'flex', flexDirection:'column', justifyContent:'center' },
    formCard: { position:'relative', background:'rgba(255,255,255,.95)', borderRadius:24, padding:'40px 36px', boxShadow:'0 30px 80px -20px rgba(0,0,0,.5), inset 0 0 0 1px rgba(255,255,255,.4)', color:'#0F0820' },
    cardBadge: { position:'absolute', top:-14, right:24, padding:'7px 14px', borderRadius:999, background:'linear-gradient(135deg,#F472B6,#A855F7)', fontSize:11, fontWeight:700, color:'#fff', letterSpacing:'.04em', boxShadow:'0 8px 20px -6px rgba(168,85,247,.6)' },
    formH: { fontSize:28, fontWeight:800, margin:0, letterSpacing:'-0.025em' },
    formS: { fontSize:14.5, color:'#5B5670', marginTop:8 },
    field: { marginTop:18 },
    label: { fontSize:12.5, fontWeight:700, color:'#0F0820', marginBottom:7, display:'flex', justifyContent:'space-between' },
    inputWrap: { position:'relative', display:'flex', alignItems:'center' },
    input: { width:'100%', height:50, padding:'0 16px 0 46px', borderRadius:13, border:'1.5px solid #E5E2EA', background:'#fff', fontSize:15, color:'#0F0820', outline:'none', fontFamily:'inherit' },
    inputIcon: { position:'absolute', left:14, color:'#9087A0', display:'flex' },
    eye: { position:'absolute', right:8, color:'#5B5670', background:'transparent', border:0, padding:8, cursor:'pointer' },
    forgot: { color:'#A855F7', fontWeight:700, textDecoration:'none', fontSize:12.5 },
    submit: { marginTop:22, width:'100%', height:54, borderRadius:13, border:0, color:'#fff', fontWeight:700, fontSize:15.5, cursor:'pointer', background:'linear-gradient(135deg,#7C3AED 0%,#EC4899 100%)', boxShadow:'0 16px 36px -10px rgba(168,85,247,.6)', display:'flex', alignItems:'center', justifyContent:'center', gap:10, fontFamily:'inherit' },
    divider: { display:'flex', alignItems:'center', gap:12, margin:'22px 0', color:'#9087A0', fontSize:11.5 },
    dline: { flex:1, height:1, background:'#E5E2EA' },
    sso: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
    ssoBtn: { height:46, borderRadius:11, border:'1.5px solid #E5E2EA', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontSize:13.5, fontWeight:700, color:'#0F0820', cursor:'pointer', fontFamily:'inherit' },
    contact: { textAlign:'center', fontSize:13, color:'#5B5670', marginTop:20 },
    contactLink: { color:'#A855F7', fontWeight:700, textDecoration:'none' },

    bottomBar: { display:'flex', justifyContent:'space-between', fontSize:11.5, color:'rgba(248,232,255,.5)', marginTop:24 },
  };

  return (
    <div style={v3.page}>
      <style>{`
        .v3-input:focus { border-color: #A855F7 !important; box-shadow: 0 0 0 4px rgba(168,85,247,.15) !important; }
        @keyframes v3blink { 0%,100% { opacity: 1 } 50% { opacity: .35 } }
      `}</style>
      <div style={v3.bg}></div>
      <div style={v3.rings}></div>
      <div style={v3.grain}></div>

      {/* LEFT */}
      <div style={v3.left}>
        <div style={v3.brandRow}>
          <div style={v3.brandIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="16" rx="3" stroke="#fff" strokeWidth="2"/>
              <circle cx="9" cy="11" r="2" stroke="#fff" strokeWidth="2"/>
              <path d="M14 10h4M14 13h3M6 17h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={v3.brandName}>SmartCard</div>
        </div>

        <div>
          <span style={v3.eyebrow}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#FBCFE8', animation:'v3blink 1.6s infinite' }}></span>
            ใหม่ · AI Lead Scoring 2026
          </span>
          <h1 style={v3.h1}>
            ปิดดีลได้<br/>
            <span style={{ background:'linear-gradient(135deg,#FBCFE8,#FEF3C7,#A5B4FC)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>เร็วกว่า 3 เท่า</span><br/>
            <span style={v3.italic}>ด้วยนามบัตรใบเดียว.</span>
          </h1>
          <p style={v3.sub}>เปลี่ยนทุกการพบกันให้กลายเป็นโอกาส — สแกน คัดกรอง ติดตาม ส่งต่อทีมขาย ทั้งหมดในระบบเดียวที่ทีมการตลาดทั่วเอเชียเลือกใช้</p>
        </div>

        <div style={v3.quote}>
          <div style={{ position:'absolute', top:-12, left:22, fontSize:48, color:'rgba(244,114,182,.6)', lineHeight:1, fontFamily:'Georgia,serif' }}>"</div>
          <p style={v3.quoteText}>หลังเปลี่ยนมาใช้ SmartCard ทีมขายของเราตามลีดได้ทันใน 4 ชั่วโมง อัตราการปิดดีลเพิ่มขึ้น 38% ภายในไตรมาสแรก</p>
          <div style={v3.quoteAuthor}>
            <div style={v3.avatar}></div>
            <div>
              <div style={{ fontSize:13, fontWeight:700 }}>คุณวรรณภา ศิริ​ชัย</div>
              <div style={{ fontSize:11.5, color:'rgba(255,255,255,.6)' }}>VP of Sales · Aurora Brands</div>
            </div>
            <div style={{ marginLeft:'auto', display:'flex', gap:2, color:'#FCD34D', fontSize:13 }}>★★★★★</div>
          </div>
        </div>

        <div style={v3.proof}>
          <div style={v3.proofLabel}>Trusted by</div>
          <div style={v3.logoChip}>SCG</div>
          <div style={v3.logoChip}>True</div>
          <div style={v3.logoChip}>BANGCHAK</div>
          <div style={v3.logoChip}>SCB×</div>
          <div style={v3.logoChip}>+1,200</div>
        </div>
      </div>

      {/* RIGHT */}
      <div style={v3.right}>
        <div style={v3.formWrap}>
          <div style={v3.formCard}>
            <div style={v3.cardBadge}>SECURE LOGIN</div>
            <h2 style={v3.formH}>เริ่มสร้างไปป์ไลน์</h2>
            <p style={v3.formS}>เข้าสู่ระบบเพื่อจัดการนามบัตรและลีดของคุณ</p>

            <div style={v3.field}>
              <div style={v3.label}>อีเมลที่ทำงาน</div>
              <div style={v3.inputWrap}>
                <span style={v3.inputIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 7l9 6 9-6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                <input className="v3-input" style={v3.input} type="email" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)} />
              </div>
            </div>

            <div style={v3.field}>
              <div style={v3.label}><span>รหัสผ่าน</span><a href="#" style={v3.forgot}>ลืมรหัสผ่าน?</a></div>
              <div style={v3.inputWrap}>
                <span style={v3.inputIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="11" width="16" height="9" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></span>
                <input className="v3-input" style={v3.input} type={show?'text':'password'} placeholder="••••••••" value={pw} onChange={e=>setPw(e.target.value)} />
                <button style={v3.eye} onClick={()=>setShow(!show)}>{show?'🙈':'👁'}</button>
              </div>
            </div>

            <button style={v3.submit}>
              เข้าสู่ระบบ
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            <div style={v3.contact}>มีปัญหาเข้าสู่ระบบ? <a href="#" style={v3.contactLink}>ติดต่อผู้ดูแล</a></div>
          </div>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:14, marginTop:20, fontSize:11.5, color:'rgba(248,232,255,.5)' }}>
            <span>🛡 SOC 2</span><span>·</span><span>ISO 27001</span><span>·</span><span>PDPA</span>
          </div>
        </div>

        <div style={v3.bottomBar}>
          <span>© 2026 SmartCard</span>
          <span style={{ display:'flex', gap:14 }}>
            <a href="#" style={{ color:'rgba(248,232,255,.5)', textDecoration:'none' }}>Privacy</a>
            <a href="#" style={{ color:'rgba(248,232,255,.5)', textDecoration:'none' }}>Terms</a>
          </span>
        </div>
      </div>
    </div>
  );
};
window.LoginV3 = LoginV3;
