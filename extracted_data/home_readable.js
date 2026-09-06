function C5(){
m5();
const{
theme:a,toggleTheme:s
}
=h5(),[i,l]=E.useState(!1),[c,f]=E.useState(!1),[d,p]=E.useState(!1),[m,y]=E.useState(""),[b,v]=E.useState("draft"),[S,j]=E.useState(""),[M,C]=E.useState(""),[B,Q]=E.useState(null),[F,$]=E.useState(""),tt=E.useRef(null),[K,V]=E.useState(null),[T,L]=E.useState(""),et=E.useRef(null),[nt,it]=E.useState(""),[W,ot]=E.useState(!1),[lt,dt]=E.useState(""),[O,U]=E.useState(!1),N=Es.access.verifyBossCode.useMutation({
onSuccess:Z=>{
Z.success?(U(!0),ln.success("Boss mode खुल्यो",{
description:"अब payment बिना Kundali upload गर्न सक्नुहुन्छ।"
}
)):ln.error("Code मिलेन",{
description:"Boss code जाँच गरेर फेरि प्रयास गर्नुहोस्।"
}
)
}

}
),rt=!W||O||!!(nt&&K),[ut,w]=E.useState(!1),[P,z]=E.useState(""),[Y,I]=E.useState([{
type:"",date:""
}
]),[ht,ft]=E.useState(()=>{
try{
return JSON.parse(localStorage.getItem("astro-tiwari-review-history")||"[]")
}
catch{
return[]
}

}
),[St,_t]=E.useState(""),[fe,ge]=E.useState(""),[de,ea]=E.useState(""),[Ye,pn]=E.useState(""),[gn,wa]=E.useState(""),[Wn,Ce]=E.useState(""),[ts,yn]=E.useState(""),ye=Es.kundali.extract.useMutation({
onSuccess:Z=>{
ge(Z.name||""),ea(Z.gender||""),Z.dobBs?ma(Z.dobBs):Z.dobAd?vn(Z.dobAd):(j(""),C("")),yn(Z.birthPlace||""),w(!Z.birthTime.trim());
const xt=Z.birthTime.replace(/[०-९]/g,wt=>String("०१२३४५६७८९".indexOf(wt))).match(/(\d{
1,2
}
)(?:\s*[:.]\s*(\d{
1,2
}
))?\s*(AM|PM|बिहान|पूर्वाह्न|दिउँसो|अपराह्न|बेलुका|साँझ|राति)?/i);
if(xt){
let wt=Number(xt[1]||0);
wa(xt[2]||"00");
const Lt=(xt[3]||"").toLowerCase(),ee=Lt.includes("pm")||Lt.includes("अपराह्न")||Lt.includes("दिउँसो")||Lt.includes("बेलुका")||Lt.includes("साँझ")||Lt.includes("राति")?"अपराह्न (PM)":Lt?"पूर्वाह्न (AM)":"",ae=!ee&&wt>=13?"अपराह्न (PM)":!ee&&wt===0||!ee&&wt>=1&&wt<=5?"पूर्वाह्न (AM)":"",De=ee||ae;
wt>12&&(wt-=12),wt===0&&(wt=12),pn(String(wt)),Ce(De)
}
ln.success("Kundali photo पढियो",{
description:"Form भरिएको विवरण जाँचेर सच्याउनुहोस्।"
}
)
}
,onError:()=>ln.error("Photo पढ्न सकिएन",{
description:"पूरै page, राम्रो उज्यालो, glare नभएको र camera सिधा भएको photo upload गर्नुहोस्।"
}
)
}
),ma=Z=>{
if(j(Z),!!/^\d{
4
}
-\d{
1,2
}
-\d{
1,2
}
$/.test(Z))try{
const at=new M0(Z).getAD();
C(`${
at.year
}
-${
String(at.month+1).padStart(2,"0")
}
-${
String(at.date).padStart(2,"0")
}
`)
}
catch{

}

}
,we=Z=>new Promise((at,xt)=>{
const wt=new Image,Lt=URL.createObjectURL(Z);
wt.onload=()=>{
const ee=Math.min(1,2200/Math.max(wt.naturalWidth,wt.naturalHeight)),ae=document.createElement("canvas");
ae.width=Math.max(1,Math.round(wt.naturalWidth*ee)),ae.height=Math.max(1,Math.round(wt.naturalHeight*ee));
const De=ae.getContext("2d");
if(!De){
URL.revokeObjectURL(Lt),xt(new Error("Canvas unavailable"));
return
}
De.filter="contrast(1.12) saturate(0.92)",De.drawImage(wt,0,0,ae.width,ae.height),URL.revokeObjectURL(Lt),at(ae.toDataURL("image/jpeg",.92))
}
,wt.onerror=()=>{
URL.revokeObjectURL(Lt),xt(new Error("Image could not be prepared"))
}
,wt.src=Lt
}
),zr=Z=>{
const at=Z.target.files?.[0];
if(!at)return;
if(!at.type.startsWith("image/")||at.size>8*1024*1024){
ln.error("कृपया ८ MB भन्दा सानो clear image छान्नुहोस्।");
return
}
Q(at);
const xt=new FileReader;
xt.onload=()=>$(String(xt.result||"")),xt.readAsDataURL(at),we(at).then(wt=>ye.mutate({
imageDataUrl:wt
}
)).catch(()=>ln.error("Photo तयार गर्न सकिएन",{
description:"अर्को clear photo प्रयास गर्नुहोस्।"
}
))
}
,Ua=()=>{
Q(null),$(""),tt.current&&(tt.current.value=""),ln.success("Kundali photo हटाइयो",{
description:"अब फेरि नयाँ photo छान्न सक्नुहुन्छ।"
}
)
}
,Rs=Z=>{
const at=Z.target.files?.[0];
if(!at)return;
if(!at.type.startsWith("image/")||at.size>8*1024*1024){
ln.error("कृपया ८ MB भन्दा सानो payment screenshot छान्नुहोस्।");
return
}
V(at);
const xt=new FileReader;
xt.onload=()=>L(String(xt.result||"")),xt.readAsDataURL(at)
}
,qa=Z=>{
Z.preventDefault(),N.mutate({
code:lt
}
)
}
,vn=Z=>{
if(C(Z),!!/^\d{
4
}
-\d{
1,2
}
-\d{
1,2
}
$/.test(Z))try{
const at=new M0(new Date(`${
Z
}
T00:00:00`)).getBS();
j(`${
at.year
}
-${
String(at.month+1).padStart(2,"0")
}
-${
String(at.date).padStart(2,"0")
}
`)
}
catch{

}

}
,Ut=Z=>{
document.getElementById(Z)?.scrollIntoView({
behavior:"smooth"
}
),l(!1)
}
,Ds=async Z=>{
Z.preventDefault(),f(!0);
const at=new FormData(Z.currentTarget),xt=String(at.get("name")||""),wt=String(at.get("phone")||""),Lt=String(at.get("gender")||""),ee=String(at.get("dob_bs")||""),ae=String(at.get("dob_ad")||""),De=String(at.get("birth_hour")||""),xn=String(at.get("birth_minute")||""),Pa=String(at.get("birth_period")||""),aa=String(at.get("birth_place")||""),At=String(at.get("topic")||""),Vt=String(at.get("message")||""),ve=[Y.map(Ae=>[Ae.type,Ae.date].filter(Boolean).join(" — ")).filter(Boolean).join(" | "),String(at.get("rectification")||"")].filter(Boolean).join(" — "),ja=St?`
Boss review note: ${
St
}
`:"",Xt=B?`
Kundali photo: ${
B.name
}
 (WhatsApp मा attach गरिनेछ)`:`
Kundali photo: छैन`,Te=K?`
Payment screenshot: ${
K.name
}
 (जाँचका लागि attach गरिनेछ)`:`
Payment screenshot: छैन`,La=`नमस्कार Astro Tiwari, म ${
xt
}
 हुँ।

लिङ्ग: ${
Lt
}

जन्म मिति (वि.सं.): ${
ee
}

जन्म मिति (ई.सं.): ${
ae
}

जन्म समय: ${
De
}
:${
xn
}
 ${
Pa
}

जन्म स्थान: ${
aa
}

सम्पर्क नम्बर: ${
wt
}

Package: ${
At
}

थप सन्देश: ${
Vt
}

जन्म समय सम्बन्धी जानकारी: ${
ve
}
${
ja
}
${
Te
}
${
Xt
}
`;
y(La),v("ready"),p(!0)
}
,Aa=async()=>{
const Z=[K,B].filter(at=>!!at);
if(Z.length>0&&navigator.share&&navigator.canShare?.({
files:Z
}
))try{
await navigator.share({
title:"Astro Tiwari Payment and Kundali Details",text:m,files:Z
}
)
}
catch{

}
else window.open(`https://wa.me/9779809192604?text=${
encodeURIComponent(m+`

कृपया यही chat मा Kundali photo attach गर्नुहोस्।`)
}
`,"_blank","noopener,noreferrer");
if(p(!1),f(!0),v("sent"),O&&m){
const at=[new Date().toLocaleString("ne-NP"),...ht].slice(0,10);
ft(at),localStorage.setItem("astro-tiwari-review-history",JSON.stringify(at))
}
ln.success("धन्यवाद! तपाईंको अनुरोध प्राप्त भयो।",{
description:"हामी चाँडै नै तपाईंलाई सम्पर्क गर्नेछौं।"
}
)
}
;
return 
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:300",className:`site-shell ${
a==="light"?"light-mode":"dark-mode"
}
 min-h-screen overflow-x-hidden bg-[#0b0a14] text-[#f7f3eb] selection:bg-[#d8b06a] selection:text-[#0b0a14]`,children:[
h.jsxs("header",{
"data-loc":"client/src/pages/Home.tsx:301",className:"fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-[#0b0a14]/80 backdrop-blur-xl",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:302",className:"mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12",children:[
h.jsxs("button",{
"data-loc":"client/src/pages/Home.tsx:303",className:"group flex items-center gap-3 text-left",onClick:()=>Ut("top"),"aria-label":"Astro Tiwari home",children:[
h.jsxs("span",{
"data-loc":"client/src/pages/Home.tsx:304",className:"relative flex h-10 w-10 items-center justify-center rounded-full border border-[#d8b06a]/60 bg-[#171324] text-[#e4bd73] shadow-[0_0_28px_rgba(216,176,106,0.12)]",children:[
h.jsx(Xf,{
"data-loc":"client/src/pages/Home.tsx:305",size:17,strokeWidth:1.5
}
),
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:306",className:"absolute -right-0.5 top-1 h-1.5 w-1.5 rounded-full bg-[#dba6bf]"
}
)]
}
),
h.jsxs("span",{
"data-loc":"client/src/pages/Home.tsx:308",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:309",className:"block font-display text-[22px] leading-none tracking-wide text-[#f7f3eb]",children:"Astro Tiwari"
}
),
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:310",className:"mt-1 block text-[9px] uppercase tracking-[0.32em] text-[#a79fab]",children:"Jyotish · Clarity · Guidance"
}
)]
}
)]
}
),
h.jsxs("nav",{
"data-loc":"client/src/pages/Home.tsx:314",className:"hidden items-center gap-9 md:flex","aria-label":"Main navigation",children:[
h.jsx("button",{
"data-loc":"client/src/pages/Home.tsx:315",className:"nav-link",onClick:()=>Ut("services"),children:"सेवाहरू"
}
),
h.jsx("button",{
"data-loc":"client/src/pages/Home.tsx:316",className:"nav-link",onClick:()=>Ut("packages"),children:"प्याकेजहरू"
}
),
h.jsx("button",{
"data-loc":"client/src/pages/Home.tsx:317",className:"nav-link",onClick:()=>Ut("payment"),children:"भुक्तानी"
}
),
h.jsx("button",{
"data-loc":"client/src/pages/Home.tsx:318",className:"nav-link",onClick:()=>Ut("process"),children:"कसरी हुन्छ?"
}
),
h.jsx("button",{
"data-loc":"client/src/pages/Home.tsx:319",className:"nav-link",onClick:()=>Ut("about"),children:"हाम्रो बारेमा"
}
),
h.jsx("button",{
"data-loc":"client/src/pages/Home.tsx:320",className:"nav-link",onClick:()=>Ut("contact"),children:"सम्पर्क"
}
)]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:323",className:"hidden items-center gap-5 md:flex",children:[
h.jsxs("a",{
"data-loc":"client/src/pages/Home.tsx:324",href:"tel:+9779809192604",className:"flex items-center gap-2 text-sm text-[#c7bdc9] transition-colors hover:text-[#e4bd73]",children:[
h.jsx(p0,{
"data-loc":"client/src/pages/Home.tsx:325",size:15
}
)," 9809192604"]
}
),
h.jsxs("button",{
"data-loc":"client/src/pages/Home.tsx:327",className:"gold-button",onClick:()=>Ut("booking"),children:["सल्लाह लिनुहोस् ",
h.jsx(ha,{
"data-loc":"client/src/pages/Home.tsx:327",size:15
}
)]
}
),
h.jsx("button",{
"data-loc":"client/src/pages/Home.tsx:327",className:"theme-toggle",onClick:s,"aria-label":"Toggle light and dark mode",children:a==="dark"?"☀ Light":"☾ Dark"
}
)]
}
),
h.jsx("button",{
"data-loc":"client/src/pages/Home.tsx:330",className:"flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#f7f3eb] md:hidden",onClick:()=>l(!i),"aria-label":"Toggle menu",children:i?
h.jsx(Pj,{
"data-loc":"client/src/pages/Home.tsx:331",size:20
}
):
h.jsx(kj,{
"data-loc":"client/src/pages/Home.tsx:331",size:20
}
)
}
)]
}
),i&&
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:335",className:"border-t border-white/[0.07] bg-[#0b0a14] px-5 pb-6 pt-3 md:hidden",children:
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:336",className:"flex flex-col gap-1",children:[[["services","सेवाहरू"],["packages","प्याकेजहरू"],["payment","भुक्तानी"],["process","कसरी हुन्छ?"],["about","हाम्रो बारेमा"],["contact","सम्पर्क"]].map(([Z,at])=>
h.jsx("button",{
"data-loc":"client/src/pages/Home.tsx:338",className:"border-b border-white/[0.06] py-4 text-left text-sm text-[#cfc5d0]",onClick:()=>Ut(Z),children:at
}
,Z)),
h.jsxs("button",{
"data-loc":"client/src/pages/Home.tsx:340",className:"gold-button mt-4 justify-center",onClick:()=>Ut("booking"),children:["सल्लाह लिनुहोस् ",
h.jsx(ha,{
"data-loc":"client/src/pages/Home.tsx:340",size:15
}
)]
}
),
h.jsx("button",{
"data-loc":"client/src/pages/Home.tsx:340",className:"theme-toggle mt-2 justify-center",onClick:s,children:a==="dark"?"☀ Light mode":"☾ Dark mode"
}
)]
}
)
}
)]
}
),
h.jsxs("main",{
"data-loc":"client/src/pages/Home.tsx:346",id:"top",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:347",className:"welcome-strip",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:347",className:"welcome-pulse"
}
)," नयाँ clients का लागि personal consultation अब WhatsApp मा उपलब्ध ",
h.jsxs("button",{
"data-loc":"client/src/pages/Home.tsx:347",onClick:()=>Ut("booking"),children:["सुरु गर्नुहोस् ",
h.jsx(ha,{
"data-loc":"client/src/pages/Home.tsx:347",size:13
}
)]
}
)]
}
),
h.jsxs("section",{
"data-loc":"client/src/pages/Home.tsx:348",className:"hero-grid relative isolate min-h-[720px] overflow-hidden pt-[126px] sm:min-h-[760px] sm:pt-[144px] lg:min-h-[800px] lg:pt-[154px]",children:[
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:349",className:"star-field absolute inset-0 -z-20"
}
),
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:350",className:"absolute -left-44 top-28 -z-10 h-[460px] w-[460px] rounded-full bg-[#b36a91]/10 blur-[110px]"
}
),
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:351",className:"absolute right-[-14%] top-[-12%] -z-10 h-[560px] w-[560px] rounded-full bg-[#9871bd]/10 blur-[120px]"
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:352",className:"mx-auto grid max-w-7xl items-center gap-16 px-5 pb-24 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:px-12 lg:pb-32",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:353",className:"relative z-10 max-w-2xl animate-fade-up",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:354",className:"eyebrow mb-7",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:354",className:"eyebrow-dot"
}
)," वैदिक ज्योतिष · काठमाडौं"]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:355",className:"mb-6 inline-flex items-center gap-2 rounded-full border border-[#d8b06a]/25 bg-[#d8b06a]/[0.08] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e4bd73]",children:[
h.jsx(Jf,{
"data-loc":"client/src/pages/Home.tsx:355",size:13
}
)," Personal guidance · WhatsApp consultation"]
}
),
h.jsxs("h1",{
"data-loc":"client/src/pages/Home.tsx:356",className:"font-display text-[clamp(3.7rem,9vw,7.6rem)] leading-[0.87] tracking-[-0.045em] text-[#f8f1e8]",children:["आकाशका संकेत,",
h.jsx("br",{
"data-loc":"client/src/pages/Home.tsx:357"
}
),
h.jsx("em",{
"data-loc":"client/src/pages/Home.tsx:357",className:"text-[#dfb96f]",children:"जीवनमा स्पष्टता।"
}
)]
}
),
h.jsx("p",{
"data-loc":"client/src/pages/Home.tsx:359",className:"mt-8 max-w-lg text-[16px] leading-8 text-[#bdb3c5] sm:text-[17px]",children:"तपाईंको जन्मकुण्डलीलाई केवल भविष्यवाणी होइन—आफूलाई अझ गहिरो बुझ्ने नक्साका रूपमा हेर्नुहोस्। सरल, व्यक्तिगत र संवेदनशील मार्गदर्शन।"
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:362",className:"mt-10 flex flex-col gap-4 sm:flex-row sm:items-center",children:[
h.jsxs("button",{
"data-loc":"client/src/pages/Home.tsx:363",className:"gold-button large",onClick:()=>Ut("booking"),children:["आफ्नो reading सुरु गर्नुहोस् ",
h.jsx(ha,{
"data-loc":"client/src/pages/Home.tsx:363",size:17
}
)]
}
),
h.jsxs("button",{
"data-loc":"client/src/pages/Home.tsx:364",className:"text-button",onClick:()=>Ut("services"),children:["सेवाहरू हेर्नुहोस् ",
h.jsx(m0,{
"data-loc":"client/src/pages/Home.tsx:364",size:16
}
)]
}
)]
}
),
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:366",className:"mt-8 grid max-w-xl grid-cols-3 gap-2 sm:gap-3",children:[["०१","सरल भाषा","जटिल कुरा स्पष्ट"],["०२","निजी सेवा","तपाईंका लागि मात्र"],["०३","छिटो reply","WhatsApp बाटै"]].map(([Z,at,xt])=>
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:367",className:"rounded-2xl border border-white/[0.09] bg-white/[0.035] px-3 py-3 backdrop-blur-sm sm:px-4",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:367",className:"text-[9px] tracking-[0.16em] text-[#d8b06a]",children:Z
}
),
h.jsx("strong",{
"data-loc":"client/src/pages/Home.tsx:367",className:"mt-1 block text-[11px] text-[#f6eee3] sm:text-xs",children:at
}
),
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:367",className:"mt-1 block text-[9px] leading-4 text-[#958a9c]",children:xt
}
)]
}
,Z))
}
),
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:369",className:"mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/10 pt-6 text-[11px] uppercase tracking-[0.16em] text-[#8f8597]",children:
h.jsxs("span",{
"data-loc":"client/src/pages/Home.tsx:370",className:"flex items-center gap-2",children:[
h.jsx(mo,{
"data-loc":"client/src/pages/Home.tsx:370",size:15,className:"text-[#d8b06a]"
}
)," १००% निजी र सुरक्षित"]
}
)
}
)]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:375",className:"relative mx-auto w-full max-w-[500px] animate-fade-up-delayed",children:[
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:376",className:"absolute -inset-7 rounded-[50%] border border-[#d8b06a]/10 [transform:rotate(-18deg)]"
}
),
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:377",className:"absolute -inset-14 rounded-[50%] border border-[#d8b06a]/[0.07] [transform:rotate(24deg)]"
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:378",className:"cosmic-card relative overflow-hidden rounded-[2rem] border border-white/15 px-7 pb-8 pt-8 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:px-10",children:[
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:379",className:"absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_10%,rgba(209,177,112,0.15),transparent_32%),linear-gradient(145deg,#211933_0%,#12101d_55%,#0d0c15_100%)]"
}
),
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:380",className:"absolute right-10 top-7 h-20 w-20 rounded-full border border-[#d8b06a]/30 bg-[#d8b06a]/10 blur-[0.3px]"
}
),
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:381",className:"absolute right-[58px] top-[43px] h-2 w-2 rounded-full bg-[#f6d697] shadow-[0_0_16px_5px_rgba(246,214,151,0.45)]"
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:382",className:"relative flex items-start justify-between",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:383",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:384",className:"text-[10px] uppercase tracking-[0.28em] text-[#aa9aa8]",children:"The cosmic note"
}
),
h.jsxs("h2",{
"data-loc":"client/src/pages/Home.tsx:385",className:"mt-3 font-display text-4xl leading-none text-[#f8f1e8]",children:["तपाईंको",
h.jsx("br",{
"data-loc":"client/src/pages/Home.tsx:385"
}
),
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:385",className:"text-[#dfb96f]",children:"समय आउँदैछ।"
}
)]
}
)]
}
),
h.jsx(Jf,{
"data-loc":"client/src/pages/Home.tsx:387",size:18,className:"mt-1 text-[#d8b06a]"
}
)]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:389",className:"relative mt-12 rounded-2xl border border-white/10 bg-[#0c0b14]/45 p-5 backdrop-blur-sm",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:390",className:"flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-[#a79eab]",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:390",children:"आजको ऊर्जा"
}
),
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:390",className:"text-[#d8b06a]",children:"७.८ / १०"
}
)]
}
),
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:391",className:"mt-4 flex items-end gap-1.5","aria-label":"Energy rating 7.8 out of 10",children:["h-5","h-7","h-9","h-12","h-10","h-14","h-11","h-16","h-14","h-20","h-16","h-24"].map((Z,at)=>
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:392",className:`block flex-1 rounded-t-sm ${
Z
}
 ${
at>7?"bg-[#d8b06a]":"bg-[#665177]"
}
`
}
,at))
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:394",className:"mt-3 flex justify-between text-[9px] uppercase tracking-[0.12em] text-[#736a7a]",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:394",children:"सुरुवात"
}
),
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:394",children:"चरम बिन्दु"
}
),
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:394",children:"अन्तरदृष्टि"
}
)]
}
)]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:396",className:"mt-7 flex items-center justify-between border-t border-white/10 pt-5",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:397",className:"flex -space-x-2",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:397",className:"avatar bg-[#b46b78]",children:"स"
}
),
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:397",className:"avatar bg-[#806a9e]",children:"म"
}
),
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:397",className:"avatar bg-[#b59660]",children:"अ"
}
),
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:397",className:"avatar more-avatar",children:"+२"
}
)]
}
),
h.jsxs("span",{
"data-loc":"client/src/pages/Home.tsx:398",className:"text-right text-[10px] leading-4 text-[#9e93a3]",children:["यस हप्ता",
h.jsx("br",{
"data-loc":"client/src/pages/Home.tsx:398"
}
),
h.jsx("strong",{
"data-loc":"client/src/pages/Home.tsx:398",className:"text-[#eee1d0]",children:"२७ readings"
}
)]
}
)]
}
)]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:401",className:"absolute -bottom-7 -left-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#171326] px-4 py-3 shadow-2xl sm:-left-10",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:402",className:"flex h-9 w-9 items-center justify-center rounded-xl bg-[#d8b06a]/15 text-[#e0b970]",children:
h.jsx(g0,{
"data-loc":"client/src/pages/Home.tsx:402",size:16,fill:"currentColor"
}
)
}
),
h.jsxs("span",{
"data-loc":"client/src/pages/Home.tsx:403",className:"text-xs leading-5 text-[#bcb1c4]",children:["विश्वासको rating",
h.jsx("br",{
"data-loc":"client/src/pages/Home.tsx:403"
}
),
h.jsx("strong",{
"data-loc":"client/src/pages/Home.tsx:403",className:"text-[#f6ede3]",children:"४.९ / ५.०"
}
)]
}
)]
}
)]
}
)]
}
)]
}
),
h.jsx("section",{
"data-loc":"client/src/pages/Home.tsx:409",className:"border-y border-white/[0.07] bg-[#11101b]","aria-label":"Trust statistics",children:
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:410",className:"mx-auto grid max-w-7xl grid-cols-2 px-5 py-8 sm:px-8 md:grid-cols-4 lg:px-12",children:[["८+","वर्षको अनुभव"],["१,२००+","सन्तुष्ट clients"],["४.९/५","औसत rating"],["१००%","व्यक्तिगत guidance"]].map(([Z,at])=>
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:411",className:"stat-item",children:[
h.jsx("strong",{
"data-loc":"client/src/pages/Home.tsx:411",children:Z
}
),
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:411",children:at
}
)]
}
,at))
}
)
}
),
h.jsx("section",{
"data-loc":"client/src/pages/Home.tsx:415",id:"services",className:"bg-[#f3eee6] py-24 text-[#19151e] sm:py-32",children:
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:416",className:"mx-auto max-w-7xl px-5 sm:px-8 lg:px-12",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:417",className:"flex flex-col justify-between gap-8 md:flex-row md:items-end",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:418",className:"max-w-xl",children:[
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:418",className:"light-eyebrow",children:"हामी के गर्छौं"
}
),
h.jsxs("h2",{
"data-loc":"client/src/pages/Home.tsx:418",className:"mt-4 font-display text-5xl leading-[0.95] tracking-[-0.035em] sm:text-6xl",children:["भोलि होइन,",
h.jsx("br",{
"data-loc":"client/src/pages/Home.tsx:418"
}
),
h.jsx("em",{
"data-loc":"client/src/pages/Home.tsx:418",className:"text-[#a8794f]",children:"आजलाई बुझ्नुहोस्।"
}
)]
}
)]
}
),
h.jsx("p",{
"data-loc":"client/src/pages/Home.tsx:419",className:"max-w-sm text-[15px] leading-7 text-[#6e6370]",children:"जीवनका ठूला प्रश्नहरूका लागि ठूला शब्द होइन—सही प्रश्न, सही समय र स्पष्ट दृष्टिकोण चाहिन्छ।"
}
)]
}
),
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:421",className:"mt-16 grid gap-4 md:grid-cols-3",children:j5.map(({
icon:Z,eyebrow:at,title:xt,description:wt,accent:Lt
}
,ee)=>
h.jsxs("article",{
"data-loc":"client/src/pages/Home.tsx:422",className:`service-card service-${
Lt
}
`,children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:422",className:"flex items-start justify-between",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:422",className:"service-number",children:at
}
),
h.jsx(Z,{
"data-loc":"client/src/pages/Home.tsx:422",size:25,strokeWidth:1.3
}
)]
}
),
h.jsx("h3",{
"data-loc":"client/src/pages/Home.tsx:422",children:xt
}
),
h.jsx("p",{
"data-loc":"client/src/pages/Home.tsx:422",children:wt
}
),
h.jsxs("button",{
"data-loc":"client/src/pages/Home.tsx:422",onClick:()=>Ut("booking"),className:"service-link",children:["सत्र बुक गर्नुहोस् ",
h.jsx(ha,{
"data-loc":"client/src/pages/Home.tsx:422",size:16
}
)]
}
),
h.jsxs("span",{
"data-loc":"client/src/pages/Home.tsx:422",className:"service-index",children:["0",ee+1]
}
)]
}
,xt))
}
)]
}
)
}
),
h.jsx("section",{
"data-loc":"client/src/pages/Home.tsx:427",className:"promise-section py-24 sm:py-32",children:
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:428",className:"mx-auto max-w-7xl px-5 sm:px-8 lg:px-12",children:
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:429",className:"grid gap-12 lg:grid-cols-[.7fr_1.3fr] lg:gap-24",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:430",children:[
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:430",className:"eyebrow",children:"किन Astro Tiwari?"
}
),
h.jsxs("h2",{
"data-loc":"client/src/pages/Home.tsx:430",className:"mt-5 max-w-md font-display text-5xl leading-[.95] tracking-[-.035em] text-[#f7f0e7] sm:text-6xl",children:["तपाईंलाई चाहिएको",
h.jsx("br",{
"data-loc":"client/src/pages/Home.tsx:430"
}
),
h.jsx("em",{
"data-loc":"client/src/pages/Home.tsx:430",className:"text-[#d9ae6b]",children:"सही किसिमको साथ।"
}
)]
}
),
h.jsx("p",{
"data-loc":"client/src/pages/Home.tsx:430",className:"mt-7 max-w-sm text-[15px] leading-7 text-[#aaa0b0]",children:"हरेक reading को केन्द्रमा एउटै कुरा हुन्छ—तपाईंलाई पहिलेभन्दा स्पष्ट, शान्त र तयार महसुस गराउनु।"
}
),
h.jsxs("button",{
"data-loc":"client/src/pages/Home.tsx:430",className:"gold-button mt-9",onClick:()=>Ut("booking"),children:["आफ्नो प्रश्न पठाउनुहोस् ",
h.jsx(ha,{
"data-loc":"client/src/pages/Home.tsx:430",size:15
}
)]
}
)]
}
),
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:431",className:"promise-grid",children:_5.map(([Z,at,xt])=>
h.jsxs("article",{
"data-loc":"client/src/pages/Home.tsx:431",className:"promise-card",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:431",children:xt
}
),
h.jsx("h3",{
"data-loc":"client/src/pages/Home.tsx:431",children:Z
}
),
h.jsx("p",{
"data-loc":"client/src/pages/Home.tsx:431",children:at
}
),
h.jsx(ha,{
"data-loc":"client/src/pages/Home.tsx:431",size:17
}
)]
}
,xt))
}
)]
}
)
}
)
}
),
h.jsx("section",{
"data-loc":"client/src/pages/Home.tsx:436",id:"packages",className:"packages-section py-24 sm:py-32",children:
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:437",className:"mx-auto max-w-7xl px-5 sm:px-8 lg:px-12",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:438",className:"mx-auto max-w-2xl text-center",children:[
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:439",className:"light-eyebrow justify-center",children:"आफ्नो बाटो रोज्नुहोस्"
}
),
h.jsxs("h2",{
"data-loc":"client/src/pages/Home.tsx:440",className:"mt-5 font-display text-5xl leading-[0.95] tracking-[-0.035em] text-[#201820] sm:text-6xl",children:["तपाईंको भविष्य,",
h.jsx("br",{
"data-loc":"client/src/pages/Home.tsx:440"
}
),
h.jsx("em",{
"data-loc":"client/src/pages/Home.tsx:440",className:"text-[#9d7048]",children:"तपाईंको रोजाइमा।"
}
)]
}
),
h.jsx("p",{
"data-loc":"client/src/pages/Home.tsx:441",className:"mt-6 text-[15px] leading-7 text-[#6e6370]",children:"जन्मकुण्डलीको गहिरो विश्लेषणद्वारा आफ्नो जीवनका महत्त्वपूर्ण प्रश्नहरूमा स्पष्टता पाउनुहोस्।"
}
)]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:443",className:"mt-14 grid gap-5 lg:grid-cols-3",children:[
h.jsxs("article",{
"data-loc":"client/src/pages/Home.tsx:444",className:"package-card package-basic",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:445",className:"package-topline",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:445",className:"package-medal",children:"🥉"
}
),
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:445",className:"package-label",children:"शुरुआती विश्लेषण"
}
)]
}
),
h.jsxs("h3",{
"data-loc":"client/src/pages/Home.tsx:446",children:["Basic ",
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:446",children:"Package"
}
)]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:446",className:"package-price",children:[
h.jsx("small",{
"data-loc":"client/src/pages/Home.tsx:446",children:"रु."
}
)," २९९",
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:446",children:"/-"
}
)]
}
),
h.jsx("p",{
"data-loc":"client/src/pages/Home.tsx:446",className:"package-tagline",children:"आफ्नो जन्मकुण्डली बुझ्न सुरु गर्नेहरूका लागि उत्तम।"
}
),
h.jsxs("ul",{
"data-loc":"client/src/pages/Home.tsx:447",children:[
h.jsx("li",{
"data-loc":"client/src/pages/Home.tsx:447",children:"३० पेजको महाभविष्यफल PDF रिपोर्ट"
}
),
h.jsx("li",{
"data-loc":"client/src/pages/Home.tsx:447",children:"राशि, नवग्रह र नक्षत्रको विस्तृत जानकारी"
}
),
h.jsx("li",{
"data-loc":"client/src/pages/Home.tsx:447",children:"शिक्षा, करियर, व्यापार र आर्थिक अवस्था"
}
),
h.jsx("li",{
"data-loc":"client/src/pages/Home.tsx:447",children:"स्वास्थ्य, दीर्घायु र धन-समृद्धिको विश्लेषण"
}
)]
}
),
h.jsxs("button",{
"data-loc":"client/src/pages/Home.tsx:448",className:"package-button",onClick:()=>Ut("booking"),children:["Basic रोज्नुहोस् ",
h.jsx(ha,{
"data-loc":"client/src/pages/Home.tsx:448",size:15
}
)]
}
)]
}
),
h.jsxs("article",{
"data-loc":"client/src/pages/Home.tsx:450",className:"package-card package-standard package-featured",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:451",className:"popular-ribbon",children:"सबैभन्दा लोकप्रिय"
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:452",className:"package-topline",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:452",className:"package-medal",children:"🥈"
}
),
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:452",className:"package-label",children:"धेरैले रुचाएको"
}
)]
}
),
h.jsxs("h3",{
"data-loc":"client/src/pages/Home.tsx:453",children:["Standard ",
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:453",children:"Package"
}
)]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:453",className:"package-price",children:[
h.jsx("small",{
"data-loc":"client/src/pages/Home.tsx:453",children:"रु."
}
)," ४९९",
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:453",children:"/-"
}
)]
}
),
h.jsx("p",{
"data-loc":"client/src/pages/Home.tsx:453",className:"package-tagline",children:"Basic का सबै सुविधा र थप व्यक्तिगत मार्गदर्शन।"
}
),
h.jsxs("ul",{
"data-loc":"client/src/pages/Home.tsx:454",children:[
h.jsx("li",{
"data-loc":"client/src/pages/Home.tsx:454",children:"Basic Package का सम्पूर्ण सुविधाहरू"
}
),
h.jsx("li",{
"data-loc":"client/src/pages/Home.tsx:454",children:"विवाह योग र उपयुक्त समयको विश्लेषण"
}
),
h.jsx("li",{
"data-loc":"client/src/pages/Home.tsx:454",children:"तपाईंका ३ व्यक्तिगत प्रश्नको उत्तर"
}
),
h.jsx("li",{
"data-loc":"client/src/pages/Home.tsx:454",children:"ग्रहदोष निवारण र भाग्यवृद्धिका सरल उपाय"
}
)]
}
),
h.jsxs("button",{
"data-loc":"client/src/pages/Home.tsx:455",className:"package-button featured-button",onClick:()=>Ut("booking"),children:["Standard रोज्नुहोस् ",
h.jsx(ha,{
"data-loc":"client/src/pages/Home.tsx:455",size:15
}
)]
}
)]
}
),
h.jsxs("article",{
"data-loc":"client/src/pages/Home.tsx:457",className:"package-card package-vip",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:458",className:"package-topline",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:458",className:"package-medal",children:"🥇"
}
),
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:458",className:"package-label",children:"सम्पूर्ण जीवन परामर्श"
}
)]
}
),
h.jsxs("h3",{
"data-loc":"client/src/pages/Home.tsx:459",children:["VIP ",
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:459",children:"Premium"
}
)]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:459",className:"package-price",children:[
h.jsx("small",{
"data-loc":"client/src/pages/Home.tsx:459",children:"रु."
}
)," १,०५५",
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:459",children:"/-"
}
)]
}
),
h.jsx("p",{
"data-loc":"client/src/pages/Home.tsx:459",className:"package-tagline",children:"विस्तृत रिपोर्ट र प्रत्यक्ष, व्यक्तिगत मार्गदर्शन।"
}
),
h.jsxs("ul",{
"data-loc":"client/src/pages/Home.tsx:460",children:[
h.jsx("li",{
"data-loc":"client/src/pages/Home.tsx:460",children:"३० पेजको महाभविष्यफल PDF रिपोर्ट"
}
),
h.jsx("li",{
"data-loc":"client/src/pages/Home.tsx:460",children:"५–६ प्रकारका प्रश्नसहित असीमित प्रश्नहरू"
}
),
h.jsx("li",{
"data-loc":"client/src/pages/Home.tsx:460",children:"रत्न, रुद्राक्ष तथा शुभ रत्न सिफारिस"
}
),
h.jsx("li",{
"data-loc":"client/src/pages/Home.tsx:460",children:"पूजा-पाठ र समस्याको समाधानसम्बन्धी सल्लाह"
}
)]
}
),
h.jsxs("button",{
"data-loc":"client/src/pages/Home.tsx:461",className:"package-button",onClick:()=>Ut("booking"),children:["VIP रोज्नुहोस् ",
h.jsx(ha,{
"data-loc":"client/src/pages/Home.tsx:461",size:15
}
)]
}
)]
}
)]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:464",className:"package-note",children:[
h.jsx(Ha,{
"data-loc":"client/src/pages/Home.tsx:464",size:17
}
)," सेवा लिनका लागि आफ्नो ",
h.jsx("strong",{
"data-loc":"client/src/pages/Home.tsx:464",children:"जन्म मिति, जन्म समय र जन्म स्थान"
}
)," SMS / Message गर्नुहोस्।"]
}
)]
}
)
}
),
h.jsx("section",{
"data-loc":"client/src/pages/Home.tsx:468",id:"payment",className:"payment-section py-24 sm:py-32",children:
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:469",className:"mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-24 lg:px-12",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:470",children:[
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:470",className:"eyebrow",children:"सजिलो र सुरक्षित payment"
}
),
h.jsxs("h2",{
"data-loc":"client/src/pages/Home.tsx:470",className:"mt-5 max-w-lg font-display text-5xl leading-[.95] tracking-[-.035em] text-[#f7f0e7] sm:text-6xl",children:["आफ्नो package",
h.jsx("br",{
"data-loc":"client/src/pages/Home.tsx:470"
}
),
h.jsx("em",{
"data-loc":"client/src/pages/Home.tsx:470",className:"text-[#d9ae6b]",children:"आजै confirm गर्नुहोस्।"
}
)]
}
),
h.jsx("p",{
"data-loc":"client/src/pages/Home.tsx:470",className:"mt-7 max-w-md text-[15px] leading-7 text-[#aaa0b0]",children:"तलको eSewa QR scan गरेर payment गर्नुहोस्। Payment पछि screenshot WhatsApp मा पठाउँदा तपाईंको consultation छिट्टै confirm हुन्छ।"
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:470",className:"mt-9 grid gap-4 sm:grid-cols-3",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:470",className:"payment-step",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:470",children:"01"
}
),
h.jsx("strong",{
"data-loc":"client/src/pages/Home.tsx:470",children:"QR scan"
}
),
h.jsx("small",{
"data-loc":"client/src/pages/Home.tsx:470",children:"eSewa app खोल्नुहोस्"
}
)]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:470",className:"payment-step",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:470",children:"02"
}
),
h.jsx("strong",{
"data-loc":"client/src/pages/Home.tsx:470",children:"Payment"
}
),
h.jsx("small",{
"data-loc":"client/src/pages/Home.tsx:470",children:"आफ्नो package रोज्नुहोस्"
}
)]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:470",className:"payment-step",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:470",children:"03"
}
),
h.jsx("strong",{
"data-loc":"client/src/pages/Home.tsx:470",children:"Screenshot"
}
),
h.jsx("small",{
"data-loc":"client/src/pages/Home.tsx:470",children:"WhatsApp मा पठाउनुहोस्"
}
)]
}
)]
}
),
h.jsxs("a",{
"data-loc":"client/src/pages/Home.tsx:470",className:"gold-button mt-9",href:"https://wa.me/9779809192604?text=नमस्कार%20Tiwari%20Astro,%20मैले%20payment%20गरेको%20छु।%20Screenshot%20पठाउँदैछु।",target:"_blank",rel:"noreferrer",children:["Payment screenshot पठाउनुहोस् ",
h.jsx(Ha,{
"data-loc":"client/src/pages/Home.tsx:470",size:15
}
)]
}
)]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:471",className:"payment-card",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:471",className:"payment-card-header",children:[
h.jsxs("span",{
"data-loc":"client/src/pages/Home.tsx:471",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:471",className:"esewa-dot",children:"e"
}
)," eSewa Payment"]
}
),
h.jsxs("span",{
"data-loc":"client/src/pages/Home.tsx:471",className:"payment-secure",children:[
h.jsx(mo,{
"data-loc":"client/src/pages/Home.tsx:471",size:13
}
)," Secure"]
}
)]
}
),
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:471",className:"qr-frame",children:
h.jsx("img",{
"data-loc":"client/src/pages/Home.tsx:471",src:"/manus-storage/eSewa_My_QR_9809192604_1788636795054_2026-09-06_01_18_15_45f0b9e9.jpg",alt:"eSewa QR for Ayush Tiwari"
}
)
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:471",className:"payment-account",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:471",children:"Account holder"
}
),
h.jsx("strong",{
"data-loc":"client/src/pages/Home.tsx:471",children:"Ayush Tiwari"
}
),
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:471",children:"eSewa number"
}
),
h.jsx("strong",{
"data-loc":"client/src/pages/Home.tsx:471",children:"9809192604"
}
)]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:471",className:"payment-amounts",children:[
h.jsxs("span",{
"data-loc":"client/src/pages/Home.tsx:471",children:["Basic ",
h.jsx("b",{
"data-loc":"client/src/pages/Home.tsx:471",children:"रु. २९९"
}
)]
}
),
h.jsxs("span",{
"data-loc":"client/src/pages/Home.tsx:471",children:["Standard ",
h.jsx("b",{
"data-loc":"client/src/pages/Home.tsx:471",children:"रु. ४९९"
}
)]
}
),
h.jsxs("span",{
"data-loc":"client/src/pages/Home.tsx:471",children:["VIP ",
h.jsx("b",{
"data-loc":"client/src/pages/Home.tsx:471",children:"रु. १,०५५"
}
)]
}
)]
}
)]
}
)]
}
)
}
),
h.jsxs("section",{
"data-loc":"client/src/pages/Home.tsx:475",id:"process",className:"relative overflow-hidden bg-[#191626] py-24 sm:py-32",children:[
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:476",className:"absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(ellipse_at_90%_50%,rgba(175,126,155,0.12),transparent_63%)]"
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:477",className:"mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24 lg:px-12",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:478",className:"relative",children:[
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:478",className:"eyebrow",children:"सत्रको अनुभव"
}
),
h.jsxs("h2",{
"data-loc":"client/src/pages/Home.tsx:478",className:"mt-5 max-w-md font-display text-5xl leading-[0.96] tracking-[-0.035em] text-[#f7f0e7] sm:text-6xl",children:["एक घण्टा,",
h.jsx("br",{
"data-loc":"client/src/pages/Home.tsx:478"
}
),
h.jsx("em",{
"data-loc":"client/src/pages/Home.tsx:478",className:"text-[#d9ae6b]",children:"आफूतिर फर्कने।"
}
)]
}
),
h.jsx("p",{
"data-loc":"client/src/pages/Home.tsx:478",className:"mt-7 max-w-sm text-[15px] leading-7 text-[#aaa0b0]",children:"यहाँ तपाईंलाई जटिल शब्दावलीले होइन, ध्यानपूर्वक सुन्ने र बुझ्ने दृष्टिकोणले स्वागत गरिन्छ।"
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:478",className:"mt-12 flex items-center gap-4",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:478",className:"flex h-12 w-12 items-center justify-center rounded-full border border-[#d8b06a]/30 text-[#d8b06a]",children:
h.jsx(Ha,{
"data-loc":"client/src/pages/Home.tsx:478",size:19
}
)
}
),
h.jsxs("span",{
"data-loc":"client/src/pages/Home.tsx:478",className:"text-xs leading-5 text-[#aaa0b0]",children:["प्रश्न लिएर आउनुहोस्।",
h.jsx("br",{
"data-loc":"client/src/pages/Home.tsx:478"
}
),
h.jsx("strong",{
"data-loc":"client/src/pages/Home.tsx:478",className:"text-[#f4e8d8]",children:"उत्तर लिएर फर्कनुहोस्।"
}
)]
}
)]
}
)]
}
),
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:479",className:"relative space-y-4",children:E5.map(([Z,at],xt)=>
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:479",className:"process-row",children:[
h.jsxs("span",{
"data-loc":"client/src/pages/Home.tsx:479",className:"process-count",children:["0",xt+1]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:479",children:[
h.jsx("h3",{
"data-loc":"client/src/pages/Home.tsx:479",children:Z
}
),
h.jsx("p",{
"data-loc":"client/src/pages/Home.tsx:479",children:at
}
)]
}
),
h.jsx(m0,{
"data-loc":"client/src/pages/Home.tsx:479",className:"ml-auto shrink-0 text-[#83778b]",size:18
}
)]
}
,Z))
}
)]
}
)]
}
),
h.jsx("section",{
"data-loc":"client/src/pages/Home.tsx:483",id:"about",className:"bg-[#0e0d17] py-24 sm:py-32",children:
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:484",className:"mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24 lg:px-12",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:485",className:"about-portrait",children:[
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:485",className:"portrait-ring"
}
),
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:485",className:"portrait-sun",children:
h.jsx(Xf,{
"data-loc":"client/src/pages/Home.tsx:485",size:48,strokeWidth:1
}
)
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:485",className:"portrait-caption",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:485",children:"Meet your guide"
}
),
h.jsx("strong",{
"data-loc":"client/src/pages/Home.tsx:485",children:"R. Tiwari"
}
),
h.jsx("small",{
"data-loc":"client/src/pages/Home.tsx:485",children:"Vedic Astrologer · Kathmandu"
}
)]
}
),
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:485",className:"portrait-star star-a",children:"✦"
}
),
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:485",className:"portrait-star star-b",children:"✧"
}
)]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:486",children:[
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:486",className:"eyebrow",children:"व्यक्तिगत मार्गदर्शन"
}
),
h.jsxs("h2",{
"data-loc":"client/src/pages/Home.tsx:486",className:"mt-5 max-w-lg font-display text-5xl leading-[0.97] tracking-[-0.035em] text-[#f7f0e7] sm:text-6xl",children:["ज्योतिष होइन,",
h.jsx("br",{
"data-loc":"client/src/pages/Home.tsx:486"
}
),
h.jsx("em",{
"data-loc":"client/src/pages/Home.tsx:486",className:"text-[#d9ae6b]",children:"समझदारीको भाषा।"
}
)]
}
),
h.jsx("p",{
"data-loc":"client/src/pages/Home.tsx:486",className:"mt-8 max-w-xl text-[16px] leading-8 text-[#aaa0b0]",children:"“तपाईंको भविष्य पहिले नै लेखिएको छ” भन्ने होइन। तपाईंका सम्भावना, pattern र समयको लय बुझेर अझ सचेत निर्णय लिन सकिन्छ भन्ने मेरो विश्वास हो।"
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:486",className:"mt-8 grid gap-4 sm:grid-cols-2",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:486",className:"about-point",children:[
h.jsx(ho,{
"data-loc":"client/src/pages/Home.tsx:486",size:16
}
)," गोपनीय र सम्मानपूर्ण"]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:486",className:"about-point",children:[
h.jsx(ho,{
"data-loc":"client/src/pages/Home.tsx:486",size:16
}
)," सरल नेपाली भाषामा"]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:486",className:"about-point",children:[
h.jsx(ho,{
"data-loc":"client/src/pages/Home.tsx:486",size:16
}
)," व्यवहारिक उपायमा केन्द्रित"]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:486",className:"about-point",children:[
h.jsx(ho,{
"data-loc":"client/src/pages/Home.tsx:486",size:16
}
)," डर होइन, स्पष्टता"]
}
)]
}
),
h.jsxs("button",{
"data-loc":"client/src/pages/Home.tsx:486",className:"text-button mt-10",onClick:()=>Ut("booking"),children:["आफ्नो कथा share गर्नुहोस् ",
h.jsx(ha,{
"data-loc":"client/src/pages/Home.tsx:486",size:16
}
)]
}
)]
}
)]
}
)
}
),
h.jsx("section",{
"data-loc":"client/src/pages/Home.tsx:490",className:"testimonial-section py-24 sm:py-32",children:
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:491",className:"mx-auto max-w-7xl px-5 sm:px-8 lg:px-12",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:492",className:"flex flex-col justify-between gap-8 md:flex-row md:items-end",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:493",children:[
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:493",className:"eyebrow",children:"हाम्रा clients भन्छन्"
}
),
h.jsxs("h2",{
"data-loc":"client/src/pages/Home.tsx:493",className:"mt-5 max-w-lg font-display text-5xl leading-[0.95] tracking-[-0.035em] text-[#f7f0e7] sm:text-6xl",children:["विश्वासबाट",
h.jsx("br",{
"data-loc":"client/src/pages/Home.tsx:493"
}
),
h.jsx("em",{
"data-loc":"client/src/pages/Home.tsx:493",className:"text-[#d9ae6b]",children:"सुरु भएको clarity।"
}
)]
}
)]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:494",className:"rating-chip",children:[
h.jsx(g0,{
"data-loc":"client/src/pages/Home.tsx:494",size:15,fill:"currentColor"
}
)," ",
h.jsx("strong",{
"data-loc":"client/src/pages/Home.tsx:494",children:"४.९"
}
)," ",
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:494",children:"/ ५.० average rating"
}
)]
}
)]
}
),
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:496",className:"mt-14 grid gap-4 md:grid-cols-3",children:O5.map(([Z,at,xt,wt])=>
h.jsxs("article",{
"data-loc":"client/src/pages/Home.tsx:497",className:"testimonial-card",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:497",className:"testimonial-quote",children:Z
}
),
h.jsx("p",{
"data-loc":"client/src/pages/Home.tsx:497",children:at
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:497",className:"testimonial-person",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:497",className:"testimonial-avatar",children:xt.charAt(0)
}
),
h.jsxs("span",{
"data-loc":"client/src/pages/Home.tsx:497",children:[
h.jsx("strong",{
"data-loc":"client/src/pages/Home.tsx:497",children:xt
}
),
h.jsx("small",{
"data-loc":"client/src/pages/Home.tsx:497",children:wt
}
)]
}
),
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:497",className:"testimonial-stars",children:"★★★★★"
}
)]
}
)]
}
,xt))
}
)]
}
)
}
),
h.jsx("section",{
"data-loc":"client/src/pages/Home.tsx:502",className:"faq-section py-24 sm:py-32",children:
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:503",className:"mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[.7fr_1.3fr] lg:gap-24 lg:px-12",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:504",children:[
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:504",className:"light-eyebrow",children:"सामान्य प्रश्न"
}
),
h.jsxs("h2",{
"data-loc":"client/src/pages/Home.tsx:504",className:"mt-5 font-display text-5xl leading-[.95] tracking-[-.035em] text-[#201820] sm:text-6xl",children:["अझै केही",
h.jsx("br",{
"data-loc":"client/src/pages/Home.tsx:504"
}
),
h.jsx("em",{
"data-loc":"client/src/pages/Home.tsx:504",className:"text-[#9d7048]",children:"जान्न चाहनुहुन्छ?"
}
)]
}
),
h.jsx("p",{
"data-loc":"client/src/pages/Home.tsx:504",className:"mt-7 max-w-sm text-[15px] leading-7 text-[#6e6370]",children:"सुरु गर्न सजिलो होस् भनेर clients ले प्रायः सोध्ने प्रश्नहरूको उत्तर यहाँ राखेका छौं।"
}
),
h.jsxs("a",{
"data-loc":"client/src/pages/Home.tsx:504",className:"package-button mt-9 inline-flex",href:"https://wa.me/9779809192604?text=नमस्कार%20Tiwari%20Astro,%20म%20थप%20जानकारी%20चाहन्छु।",target:"_blank",rel:"noreferrer",children:["WhatsApp मा सोध्नुहोस् ",
h.jsx(Ha,{
"data-loc":"client/src/pages/Home.tsx:504",size:15
}
)]
}
)]
}
),
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:505",className:"faq-list",children:M5.map(([Z,at],xt)=>
h.jsxs("details",{
"data-loc":"client/src/pages/Home.tsx:505",className:"faq-item",open:xt===0,children:[
h.jsxs("summary",{
"data-loc":"client/src/pages/Home.tsx:505",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:505",children:Z
}
),
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:505",className:"faq-plus",children:"+"
}
)]
}
),
h.jsx("p",{
"data-loc":"client/src/pages/Home.tsx:505",children:at
}
)]
}
,Z))
}
)]
}
)
}
),
h.jsx("section",{
"data-loc":"client/src/pages/Home.tsx:509",id:"booking",className:"booking-section py-24 sm:py-32",children:
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:510",className:"mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24 lg:px-12",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:511",children:[
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:511",className:"light-eyebrow",children:"अबको कदम"
}
),
h.jsxs("h2",{
"data-loc":"client/src/pages/Home.tsx:511",className:"mt-5 font-display text-5xl leading-[0.94] tracking-[-0.04em] text-[#201820] sm:text-6xl",children:["तपाईंको प्रश्न,",
h.jsx("br",{
"data-loc":"client/src/pages/Home.tsx:511"
}
),
h.jsx("em",{
"data-loc":"client/src/pages/Home.tsx:511",className:"text-[#9d7048]",children:"तपाईंको समय।"
}
)]
}
),
h.jsx("p",{
"data-loc":"client/src/pages/Home.tsx:511",className:"mt-7 max-w-sm text-[15px] leading-7 text-[#6e6370]",children:"तलको form भर्नुहोस्। तपाईंको लागि उपयुक्त session र समय मिलाउन हामी सम्पर्क गर्नेछौं।"
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:511",className:"mt-10 space-y-5 text-sm text-[#665b68]",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:511",className:"flex items-center gap-3",children:[
h.jsx(Tj,{
"data-loc":"client/src/pages/Home.tsx:511",size:18,className:"text-[#a8794f]"
}
)," Online वा Kathmandu मा in-person"]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:511",className:"flex items-center gap-3",children:[
h.jsx(Nj,{
"data-loc":"client/src/pages/Home.tsx:511",size:18,className:"text-[#a8794f]"
}
)," समय मिलाएर consultation"]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:511",className:"flex items-center gap-3",children:[
h.jsx(mo,{
"data-loc":"client/src/pages/Home.tsx:511",size:18,className:"text-[#a8794f]"
}
)," तपाईंको विवरण पूर्ण रूपमा गोप्य"]
}
)]
}
)]
}
),
h.jsxs("form",{
"data-loc":"client/src/pages/Home.tsx:512",onSubmit:Ds,className:"booking-form",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"mb-8 flex items-center justify-between",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:512",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:512",className:"text-[10px] uppercase tracking-[0.25em] text-[#907f91]",children:"Birth details request"
}
),
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:512",className:`submission-status ${
b
}
`,children:b==="draft"?"Draft":b==="ready"?"Preview ready":"Sent ✓"
}
),
h.jsx("h3",{
"data-loc":"client/src/pages/Home.tsx:512",className:"mt-2 font-display text-3xl text-[#201820]",children:"आफ्नो विवरण भर्नुहोस्"
}
)]
}
),
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:512",className:"flex h-11 w-11 items-center justify-center rounded-full bg-[#eee1d5] text-[#a8794f]",children:
h.jsx(Uj,{
"data-loc":"client/src/pages/Home.tsx:512",size:17
}
)
}
)]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"source-choice",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:512",className:"form-group-title compact",children:"तपाईंलाई कुन सुविधा चाहिन्छ?"
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"source-choice-buttons",children:[
h.jsx("button",{
"data-loc":"client/src/pages/Home.tsx:512",type:"button",className:W?"source-choice-button":"source-choice-button active",onClick:()=>ot(!1),children:"जन्ममिति मात्र छ"
}
),
h.jsx("button",{
"data-loc":"client/src/pages/Home.tsx:512",type:"button",className:W?"source-choice-button active":"source-choice-button",onClick:()=>ot(!0),children:"Kundali photo पनि छ"
}
)]
}
),
h.jsx("small",{
"data-loc":"client/src/pages/Home.tsx:512",children:W?"Photo upload गरेपछि AI ले देखिएका details पढ्छ।":"DOB, time र location भरेर photo बिना पनि अगाडि बढ्न सक्नुहुन्छ।"
}
),W&&
h.jsxs("form",{
"data-loc":"client/src/pages/Home.tsx:512",className:"boss-code-form photo-boss-code",onSubmit:qa,children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:512",children:"Boss code"
}
),
h.jsx("input",{
"data-loc":"client/src/pages/Home.tsx:512",value:lt,onChange:Z=>dt(Z.target.value),placeholder:"*3*6*9","aria-label":"Boss access code"
}
),
h.jsx("button",{
"data-loc":"client/src/pages/Home.tsx:512",type:"submit",disabled:N.isPending,children:N.isPending?"जाँच हुँदैछ…":"Photo unlock"
}
)]
}
)]
}
),W&&!rt?
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"payment-gate",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:512",className:"form-group-title compact",children:"पहिले payment confirm गर्नुहोस्"
}
),
h.jsx("strong",{
"data-loc":"client/src/pages/Home.tsx:512",children:"Payment screenshot upload गरेपछि मात्र Kundali photo खुल्छ"
}
),
h.jsxs("label",{
"data-loc":"client/src/pages/Home.tsx:512",className:"field-label",children:["कुन package चाहनुहुन्छ?",
h.jsxs("select",{
"data-loc":"client/src/pages/Home.tsx:512",required:!0,value:nt,onChange:Z=>it(Z.target.value),children:[
h.jsx("option",{
"data-loc":"client/src/pages/Home.tsx:512",value:"",disabled:!0,children:"Package छान्नुहोस्"
}
),
h.jsx("option",{
"data-loc":"client/src/pages/Home.tsx:512",children:"Basic — रु. २९९"
}
),
h.jsx("option",{
"data-loc":"client/src/pages/Home.tsx:512",children:"Standard — रु. ४९९"
}
),
h.jsx("option",{
"data-loc":"client/src/pages/Home.tsx:512",children:"VIP Premium — रु. १,०५५"
}
)]
}
)]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"payment-gate-actions",children:[
h.jsxs("a",{
"data-loc":"client/src/pages/Home.tsx:512",href:"#payment",onClick:()=>Ut("payment"),className:"payment-gate-link",children:["eSewa QR हेर्नुहोस् ",
h.jsx(ha,{
"data-loc":"client/src/pages/Home.tsx:512",size:14
}
)]
}
),
h.jsxs("label",{
"data-loc":"client/src/pages/Home.tsx:512",className:"proof-upload",children:[T?
h.jsx("img",{
"data-loc":"client/src/pages/Home.tsx:512",src:T,alt:"Payment screenshot preview"
}
):
h.jsxs("span",{
"data-loc":"client/src/pages/Home.tsx:512",children:["Payment screenshot",
h.jsx("br",{
"data-loc":"client/src/pages/Home.tsx:512"
}
),
h.jsx("b",{
"data-loc":"client/src/pages/Home.tsx:512",children:"छान्नुहोस्"
}
)]
}
),
h.jsx("input",{
"data-loc":"client/src/pages/Home.tsx:512",ref:et,type:"file",accept:"image/*",onChange:Rs
}
)]
}
)]
}
),
h.jsx("small",{
"data-loc":"client/src/pages/Home.tsx:512",className:"privacy-note",children:"Payment screenshot जाँचका लागि मात्र प्रयोग हुन्छ।"
}
)]
}
):W?
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"kundali-upload",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"kundali-upload-copy",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:512",className:"form-group-title compact",children:"Kundali photo"
}
),
h.jsx("strong",{
"data-loc":"client/src/pages/Home.tsx:512",children:"आफ्नो Kundali को clear photo राख्नुहोस्"
}
),
h.jsx("small",{
"data-loc":"client/src/pages/Home.tsx:512",children:"Photo छानेपछि AI ले देखिएका विवरण पढेर तलको form मा राख्छ।"
}
),
h.jsx("small",{
"data-loc":"client/src/pages/Home.tsx:512",className:"ocr-status",children:ye.isPending?"AI ले photo पढ्दैछ…":B?"विवरण जाँचेर आवश्यक भए सच्याउनुहोस्।":"पूरै Kundali page, सिधा camera, glare नभएको photo राख्नुहोस्।"
}
),
h.jsx("small",{
"data-loc":"client/src/pages/Home.tsx:512",className:"privacy-note",children:"यो photo अरू clients लाई देखिँदैन;
 तपाईंको consultation का लागि मात्र प्रयोग हुन्छ।"
}
)]
}
),
h.jsxs("label",{
"data-loc":"client/src/pages/Home.tsx:512",className:"upload-button",children:[F?
h.jsx("img",{
"data-loc":"client/src/pages/Home.tsx:512",src:F,alt:"Kundali preview"
}
):
h.jsxs("span",{
"data-loc":"client/src/pages/Home.tsx:512",children:["📷",
h.jsx("br",{
"data-loc":"client/src/pages/Home.tsx:512"
}
),
h.jsx("b",{
"data-loc":"client/src/pages/Home.tsx:512",children:"Photo छान्नुहोस्"
}
)]
}
),
h.jsx("input",{
"data-loc":"client/src/pages/Home.tsx:512",ref:tt,type:"file",accept:"image/*",onChange:zr
}
)]
}
),B&&
h.jsxs("span",{
"data-loc":"client/src/pages/Home.tsx:512",className:"upload-file-name",children:["✓ ",B.name,
h.jsx("button",{
"data-loc":"client/src/pages/Home.tsx:512",type:"button",className:"remove-photo-button",onClick:Ua,children:"हटाउनुहोस् ×"
}
)]
}
)]
}
):
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"details-only-note",children:[
h.jsx("strong",{
"data-loc":"client/src/pages/Home.tsx:512",children:"DOB-only mode"
}
),
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:512",children:"Kundali photo आवश्यक छैन। तल जन्ममिति, समय र स्थान भरेर अगाडि बढ्नुहोस्।"
}
)]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"grid gap-5 sm:grid-cols-2",children:[
h.jsxs("label",{
"data-loc":"client/src/pages/Home.tsx:512",className:"field-label",children:["पूरा नाम",
h.jsx("input",{
"data-loc":"client/src/pages/Home.tsx:512",required:!0,name:"name",value:fe,onChange:Z=>ge(Z.target.value),placeholder:"जस्तै: सुमन थापा"
}
)]
}
),
h.jsxs("label",{
"data-loc":"client/src/pages/Home.tsx:512",className:"field-label",children:["लिङ्ग",
h.jsxs("select",{
"data-loc":"client/src/pages/Home.tsx:512",required:!0,name:"gender",value:de,onChange:Z=>ea(Z.target.value),children:[
h.jsx("option",{
"data-loc":"client/src/pages/Home.tsx:512",value:"",disabled:!0,children:"छान्नुहोस्"
}
),
h.jsx("option",{
"data-loc":"client/src/pages/Home.tsx:512",children:"महिला"
}
),
h.jsx("option",{
"data-loc":"client/src/pages/Home.tsx:512",children:"पुरुष"
}
),
h.jsx("option",{
"data-loc":"client/src/pages/Home.tsx:512",children:"अन्य"
}
)]
}
)]
}
)]
}
),
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"form-group-title",children:"जन्म मिति"
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"grid gap-5 sm:grid-cols-2",children:[
h.jsxs("label",{
"data-loc":"client/src/pages/Home.tsx:512",className:"field-label",children:["जन्म मिति (वि.सं.)",
h.jsx("input",{
"data-loc":"client/src/pages/Home.tsx:512",required:!0,name:"dob_bs",value:S,onChange:Z=>ma(Z.target.value),placeholder:"YYYY-MM-DD"
}
)]
}
),
h.jsxs("label",{
"data-loc":"client/src/pages/Home.tsx:512",className:"field-label",children:["जन्म मिति (ई.सं.)",
h.jsx("input",{
"data-loc":"client/src/pages/Home.tsx:512",name:"dob_ad",value:M,onChange:Z=>vn(Z.target.value),placeholder:"YYYY-MM-DD"
}
)]
}
)]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"inline-payment",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:512",children:[
h.jsxs("span",{
"data-loc":"client/src/pages/Home.tsx:512",className:"inline-payment-title",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:512",className:"esewa-dot small",children:"e"
}
)," Date conversion पछि payment गर्नुहोस्"]
}
),
h.jsx("p",{
"data-loc":"client/src/pages/Home.tsx:512",children:"आफ्नो package छानेर eSewa मा payment गर्नुहोस्।"
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"inline-payment-amounts",children:[
h.jsxs("span",{
"data-loc":"client/src/pages/Home.tsx:512",children:["Basic ",
h.jsx("b",{
"data-loc":"client/src/pages/Home.tsx:512",children:"रु. २९९"
}
)]
}
),
h.jsxs("span",{
"data-loc":"client/src/pages/Home.tsx:512",children:["Standard ",
h.jsx("b",{
"data-loc":"client/src/pages/Home.tsx:512",children:"रु. ४९९"
}
)]
}
),
h.jsxs("span",{
"data-loc":"client/src/pages/Home.tsx:512",children:["VIP ",
h.jsx("b",{
"data-loc":"client/src/pages/Home.tsx:512",children:"रु. १,०५५"
}
)]
}
)]
}
)]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"qr-payment-wrap",children:[
h.jsx("img",{
"data-loc":"client/src/pages/Home.tsx:512",src:"/manus-storage/eSewa_My_QR_9809192604_1788636795054_2026-09-06_01_18_15_45f0b9e9.jpg",alt:"eSewa payment QR"
}
),
h.jsx("small",{
"data-loc":"client/src/pages/Home.tsx:512",className:"qr-name-note",children:"QR मा Ayush Tiwari नाम देखिन्छ;
 यो यही eSewa account हो।"
}
)]
}
),
h.jsxs("a",{
"data-loc":"client/src/pages/Home.tsx:512",href:"https://wa.me/9779809192604?text=नमस्कार%20Tiwari%20Astro,%20मैले%20payment%20गरेको%20छु।%20Screenshot%20पठाउँदैछु।",target:"_blank",rel:"noreferrer",children:[
h.jsx(Ha,{
"data-loc":"client/src/pages/Home.tsx:512",size:13
}
)," Screenshot पठाउनुहोस्"]
}
)]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"rectification-box",children:[
h.jsxs("label",{
"data-loc":"client/src/pages/Home.tsx:512",className:"rectification-toggle",children:[
h.jsx("input",{
"data-loc":"client/src/pages/Home.tsx:512",type:"checkbox",checked:ut,onChange:Z=>w(Z.target.checked)
}
)," ",
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:512",children:"जन्म समय थाहा छैन? Birth Time Rectification चाहिन्छ"
}
)]
}
),ut&&
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"rectification-fields",children:[
h.jsx("p",{
"data-loc":"client/src/pages/Home.tsx:512",children:"समय निकाल्न सहयोग गर्ने महत्वपूर्ण घटना छान्नुहोस् र मिति लेख्नुहोस्।"
}
),
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"rectification-event-list",children:Y.map((Z,at)=>
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"rectification-structured",children:[
h.jsxs("select",{
"data-loc":"client/src/pages/Home.tsx:512",value:Z.type,onChange:xt=>I(wt=>wt.map((Lt,ee)=>ee===at?{
...Lt,type:xt.target.value
}
:Lt)),"aria-label":`Rectification event ${
at+1
}
`,children:[
h.jsx("option",{
"data-loc":"client/src/pages/Home.tsx:512",value:"",children:"घटना छान्नुहोस्"
}
),
h.jsx("option",{
"data-loc":"client/src/pages/Home.tsx:512",children:"विवाह"
}
),
h.jsx("option",{
"data-loc":"client/src/pages/Home.tsx:512",children:"पहिलो जागिर"
}
),
h.jsx("option",{
"data-loc":"client/src/pages/Home.tsx:512",children:"विदेश यात्रा"
}
),
h.jsx("option",{
"data-loc":"client/src/pages/Home.tsx:512",children:"ठूलो स्वास्थ्य घटना"
}
),
h.jsx("option",{
"data-loc":"client/src/pages/Home.tsx:512",children:"शिक्षा/परीक्षा"
}
),
h.jsx("option",{
"data-loc":"client/src/pages/Home.tsx:512",children:"अन्य महत्वपूर्ण घटना"
}
)]
}
),
h.jsx("input",{
"data-loc":"client/src/pages/Home.tsx:512",type:"text",value:Z.date,onChange:xt=>I(wt=>wt.map((Lt,ee)=>ee===at?{
...Lt,date:xt.target.value
}
:Lt)),placeholder:"घटनाको मिति (BS/AD)"
}
),at>0&&
h.jsx("button",{
"data-loc":"client/src/pages/Home.tsx:512",type:"button",className:"remove-event-button",onClick:()=>I(xt=>xt.filter((wt,Lt)=>Lt!==at)),children:"हटाउनुहोस्"
}
)]
}
,at))
}
),
h.jsx("button",{
"data-loc":"client/src/pages/Home.tsx:512",type:"button",className:"add-event-button",onClick:()=>I(Z=>[...Z,{
type:"",date:""
}
]),children:"+ अर्को घटना थप्नुहोस्"
}
),
h.jsx("textarea",{
"data-loc":"client/src/pages/Home.tsx:512",name:"rectification",rows:3,value:P,onChange:Z=>z(Z.target.value),placeholder:"जस्तै: विवाहको मिति, पहिलो job, विदेश गएको मिति, ठूलो घटना..."
}
),
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"rectification-status",children:P.trim()?"✓ विवरण सुरक्षित भयो — Submit गरेपछि WhatsAppमा जानेछ।":"यहाँ घटना र मिति लेख्नुहोस्;
 यसले सम्भावित जन्म समय विश्लेषणमा सहयोग गर्छ।"
}
)]
}
)]
}
),O&&
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"boss-review-panel",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:512",className:"form-group-title compact",children:"Boss private review"
}
),
h.jsx("strong",{
"data-loc":"client/src/pages/Home.tsx:512",children:"सम्भावित जन्म समयबारे आफ्नो analysis note राख्नुहोस्"
}
),
h.jsx("textarea",{
"data-loc":"client/src/pages/Home.tsx:512",name:"boss_analysis",value:St,onChange:Z=>_t(Z.target.value),rows:2,placeholder:"जस्तै: ६:३० PM सम्भावित — विवाह/विदेश यात्रासँग मिलाएर हेर्नुहोस्"
}
),
h.jsx("small",{
"data-loc":"client/src/pages/Home.tsx:512",children:"यो note clientलाई देखिँदैन;
 तपाईंको WhatsApp reviewमा मात्र जान्छ।"
}
)]
}
),O&&ht.length>0&&
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"review-history",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:512",className:"form-group-title compact",children:"Private review history"
}
),ht.map((Z,at)=>
h.jsxs("span",{
"data-loc":"client/src/pages/Home.tsx:512",children:["✓ ",Z]
}
,`${
Z
}
-${
at
}
`))]
}
),
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"form-group-title",children:"जन्म समय र स्थान"
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"grid gap-5 sm:grid-cols-[1fr_1fr_1.25fr]",children:[
h.jsxs("label",{
"data-loc":"client/src/pages/Home.tsx:512",className:"field-label",children:["घण्टा",
h.jsx("input",{
"data-loc":"client/src/pages/Home.tsx:512",required:!ut,name:"birth_hour",value:Ye,onChange:Z=>pn(Z.target.value),inputMode:"numeric",placeholder:"HH"
}
)]
}
),
h.jsxs("label",{
"data-loc":"client/src/pages/Home.tsx:512",className:"field-label",children:["मिनेट",
h.jsx("input",{
"data-loc":"client/src/pages/Home.tsx:512",required:!ut,name:"birth_minute",value:gn,onChange:Z=>wa(Z.target.value),inputMode:"numeric",placeholder:"MM"
}
)]
}
),
h.jsxs("label",{
"data-loc":"client/src/pages/Home.tsx:512",className:"field-label",children:["AM / PM",
h.jsxs("select",{
"data-loc":"client/src/pages/Home.tsx:512",required:!ut,name:"birth_period",value:Wn,onChange:Z=>Ce(Z.target.value),children:[
h.jsx("option",{
"data-loc":"client/src/pages/Home.tsx:512",value:"",disabled:!0,children:"छान्नुहोस्"
}
),
h.jsx("option",{
"data-loc":"client/src/pages/Home.tsx:512",children:"पूर्वाह्न (AM)"
}
),
h.jsx("option",{
"data-loc":"client/src/pages/Home.tsx:512",children:"अपराह्न (PM)"
}
)]
}
)]
}
)]
}
),
h.jsxs("label",{
"data-loc":"client/src/pages/Home.tsx:512",className:"field-label mt-5",children:["जन्म स्थान",
h.jsx("input",{
"data-loc":"client/src/pages/Home.tsx:512",required:!0,name:"birth_place",value:ts,onChange:Z=>yn(Z.target.value),placeholder:"जस्तै: काठमाडौं, नेपाल"
}
)]
}
),
h.jsxs("label",{
"data-loc":"client/src/pages/Home.tsx:512",className:"field-label mt-5",children:["सम्पर्क नम्बर",
h.jsx("input",{
"data-loc":"client/src/pages/Home.tsx:512",required:!0,name:"phone",type:"tel",placeholder:"98XXXXXXXX"
}
)]
}
),
h.jsxs("label",{
"data-loc":"client/src/pages/Home.tsx:512",className:"field-label mt-5",children:["कुन package चाहनुहुन्छ?",
h.jsxs("select",{
"data-loc":"client/src/pages/Home.tsx:512",required:!0,name:"topic",value:nt,onChange:Z=>it(Z.target.value),children:[
h.jsx("option",{
"data-loc":"client/src/pages/Home.tsx:512",value:"",disabled:!0,children:"Package छान्नुहोस्"
}
),
h.jsx("option",{
"data-loc":"client/src/pages/Home.tsx:512",children:"Basic — रु. २९९"
}
),
h.jsx("option",{
"data-loc":"client/src/pages/Home.tsx:512",children:"Standard — रु. ४९९"
}
),
h.jsx("option",{
"data-loc":"client/src/pages/Home.tsx:512",children:"VIP Premium — रु. १,०५५"
}
)]
}
)]
}
),
h.jsxs("label",{
"data-loc":"client/src/pages/Home.tsx:512",className:"field-label mt-5",children:["थप प्रश्न वा सन्देश ",
h.jsx("textarea",{
"data-loc":"client/src/pages/Home.tsx:512",name:"message",rows:3,placeholder:"तपाईंको मुख्य प्रश्न लेख्नुहोस्..."
}
)]
}
),
h.jsxs("button",{
"data-loc":"client/src/pages/Home.tsx:512",type:"submit",className:"gold-button dark mt-6 w-full justify-center",children:["Preview हेर्नुहोस् ",
h.jsx(Ha,{
"data-loc":"client/src/pages/Home.tsx:512",size:16
}
)]
}
),d&&
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"submission-preview",role:"dialog","aria-modal":"true",children:
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"submission-preview-card",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"flex items-center justify-between",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:512",className:"form-group-title compact",children:"Final preview"
}
),
h.jsx("button",{
"data-loc":"client/src/pages/Home.tsx:512",type:"button",className:"preview-close",onClick:()=>p(!1),children:"×"
}
)]
}
),
h.jsx("p",{
"data-loc":"client/src/pages/Home.tsx:512",children:"WhatsAppमा पठाउनुअघि विवरण जाँच गर्नुहोस्।"
}
),
h.jsx("pre",{
"data-loc":"client/src/pages/Home.tsx:512",children:m
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:512",className:"preview-actions",children:[
h.jsx("button",{
"data-loc":"client/src/pages/Home.tsx:512",type:"button",className:"text-button",onClick:()=>p(!1),children:"फेरि सच्याउनुहोस्"
}
),
h.jsxs("button",{
"data-loc":"client/src/pages/Home.tsx:512",type:"button",className:"gold-button",onClick:Aa,children:["WhatsApp पठाउनुहोस् ",
h.jsx(Ha,{
"data-loc":"client/src/pages/Home.tsx:512",size:15
}
)]
}
)]
}
)]
}
)
}
),
h.jsx("p",{
"data-loc":"client/src/pages/Home.tsx:512",className:"mt-4 text-center text-[11px] text-[#907f91]",children:"Submit गरेपछि तपाईंको विवरणसहित WhatsApp खुल्नेछ।"
}
)]
}
)]
}
)
}
),
h.jsxs("section",{
"data-loc":"client/src/pages/Home.tsx:516",className:"closing-cta",children:[
h.jsx("div",{
"data-loc":"client/src/pages/Home.tsx:516",className:"closing-stars",children:"✦　·　✧　·　✦"
}
),
h.jsxs("h2",{
"data-loc":"client/src/pages/Home.tsx:516",children:["तपाईंको प्रश्नको",
h.jsx("br",{
"data-loc":"client/src/pages/Home.tsx:516"
}
),
h.jsx("em",{
"data-loc":"client/src/pages/Home.tsx:516",children:"समय यही हो।"
}
)]
}
),
h.jsx("p",{
"data-loc":"client/src/pages/Home.tsx:516",children:"जन्म विवरण पठाउनुहोस्—तपाईंको कथा सुन्न हामी तयार छौं।"
}
),
h.jsxs("a",{
"data-loc":"client/src/pages/Home.tsx:516",href:"https://wa.me/9779809192604?text=नमस्कार%20Tiwari%20Astro,%20म%20नयाँ%20client%20हुँ%20र%20consultation%20लिन%20चाहन्छु।",target:"_blank",rel:"noreferrer",className:"gold-button large",children:["WhatsApp बाट सुरु गर्नुहोस् ",
h.jsx(Ha,{
"data-loc":"client/src/pages/Home.tsx:516",size:17
}
)]
}
)]
}
),
h.jsxs("section",{
"data-loc":"client/src/pages/Home.tsx:518",id:"contact",className:"border-t border-white/[0.07] bg-[#0b0a14] py-14",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:519",className:"mx-auto flex max-w-7xl flex-col justify-between gap-7 px-5 sm:px-8 md:flex-row md:items-center lg:px-12",children:[
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:519",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:519",className:"font-display text-3xl text-[#f7f0e7]",children:"Astro Tiwari"
}
),
h.jsx("p",{
"data-loc":"client/src/pages/Home.tsx:519",className:"mt-2 text-sm text-[#938896]",children:"तपाईंको समयलाई अर्थपूर्ण बनाउने guidance."
}
)]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:519",className:"flex flex-wrap items-center gap-x-7 gap-y-4 text-sm text-[#b8adba]",children:[
h.jsxs("a",{
"data-loc":"client/src/pages/Home.tsx:519",className:"footer-link",href:"tel:+9779809192604",children:[
h.jsx(p0,{
"data-loc":"client/src/pages/Home.tsx:519",size:15
}
)," 9809192604"]
}
),
h.jsxs("a",{
"data-loc":"client/src/pages/Home.tsx:519",className:"footer-link",href:"https://wa.me/9779809192604",target:"_blank",rel:"noreferrer",children:[
h.jsx(Ha,{
"data-loc":"client/src/pages/Home.tsx:519",size:15
}
)," WhatsApp"]
}
),
h.jsxs("span",{
"data-loc":"client/src/pages/Home.tsx:519",className:"footer-link",children:[
h.jsx(zj,{
"data-loc":"client/src/pages/Home.tsx:519",size:15
}
)," Kathmandu, Nepal"]
}
)]
}
)]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:520",className:"footer-disclaimer",children:[
h.jsx(mo,{
"data-loc":"client/src/pages/Home.tsx:520",size:14
}
)," तपाईंका जन्म विवरण र व्यक्तिगत कुराकानी गोप्य राखिन्छन्। ज्योतिषीय guidance व्यक्तिगत आत्मचिन्तन र निर्णय सहयोगका लागि हो।"]
}
),
h.jsxs("div",{
"data-loc":"client/src/pages/Home.tsx:521",className:"mx-auto mt-8 max-w-7xl border-t border-white/[0.07] px-5 pt-6 text-[10px] uppercase tracking-[0.18em] text-[#62596a] sm:px-8 lg:px-12",children:[
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:521",children:"© 2026 Astro Tiwari"
}
),
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:521",className:"float-right",children:"Made with intention · Nepal"
}
)]
}
)]
}
)]
}
),
h.jsxs("a",{
"data-loc":"client/src/pages/Home.tsx:524",className:"floating-whatsapp",href:"https://wa.me/9779809192604?text=नमस्कार%20Tiwari%20Astro,%20म%20consultation%20का%20लागि%20सम्पर्क%20गर्दैछु।",target:"_blank",rel:"noreferrer","aria-label":"Open WhatsApp",children:[
h.jsx(Ha,{
"data-loc":"client/src/pages/Home.tsx:524",size:21
}
),
h.jsx("span",{
"data-loc":"client/src/pages/Home.tsx:524",children:"WhatsApp मा कुरा गर्नुहोस्"
}
)]
}
)]
}
)
}
function T5(){
return 
h.jsxs(u5,{
"data-loc":"client/src/App.tsx:12",children:[
h.jsx(xf,{
"data-loc":"client/src/App.tsx:13",path:"/",component:C5
}
),
h.jsx(xf,{
"data-loc":"client/src/App.tsx:14",path:"/404",component:j0
}
),
h.jsx(xf,{
"data-loc":"client/src/App.tsx:16",component:j0
}
)]
}
)
}
function H5(){
return 
h.jsx(f5,{
"data-loc":"client/src/App.tsx:28",children:
h.jsx(d5,{
"data-loc":"client/src/App.tsx:29",defaultTheme:"dark",switchable:!0,children:
h.jsxs(Sj,{
"data-loc":"client/src/App.tsx:33",children:[
h.jsx(NS,{
"data-loc":"client/src/App.tsx:34"
}
),
h.jsx(T5,{
"data-loc":"client/src/App.tsx:35"
}
)]
}
)
}
)
}
)
}
const _o=new H1,Qv=a=>{
!(a instanceof Or)||typeof window>"u"||!(a.message===d3)||kv()
}
;
_o.getQueryCache().subscribe(a=>{
if(a.type==="updated"&&a.action.type==="error"){
const s=a.query.state.error;
Qv(s),console.error("[API Query Error]",s)
}

}
);
_o.getMutationCache().subscribe(a=>{
if(a.type==="updated"&&a.action.type==="error"){
const s=a.mutation.state.error;
Qv(s),console.error("[API Mutation Error]",s)
}

}
);
const N5=Es.createClient({
links:[U2({
url:"/api/trpc",transformer:mn,headers(){
try{
const a=sessionStorage.getItem("manus-cookie");
if(a){
const s=`${
f3
}
=`,l=a.split(";
").find(c=>c.trim().startsWith(s))?.trim().slice(s.length);
if(l)return{
Authorization:`Bearer ${
l
}
`
}

}

}
catch{

}
return{

}

}
,fetch(a,s){
return globalThis.fetch(a,{
...s??{

}
,credentials:"include"
}
)
}

}
)]
}
);
b3.createRoot(document.getElementById("root")).render(
h.jsx(Es.Provider,{
"data-loc":"client/src/main.tsx:76",client:N5,queryClient:_o,children:
h.jsx(s1,{
"data-loc":"client/src/main.tsx:77",client:_o,children:
h.jsx(H5,{
"data-loc":"client/src/main.tsx:78"
}
)
}
)
}
));

