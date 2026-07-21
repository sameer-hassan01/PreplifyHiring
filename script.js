function show(id, title, sub, navId){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('visible'));
  document.getElementById(id).classList.add('visible');
  document.getElementById('pagetitle').textContent = title;
  document.getElementById('pagesub').textContent = sub;
  document.querySelector('.content').scrollTop = 0;
  if (navId) setActiveNav(navId);
}

function setActiveNav(navId){
  document.querySelectorAll('.navitem').forEach(n => n.classList.remove('active'));
  var el = document.getElementById(navId);
  if (el) el.classList.add('active');
}

/* Mirrors a screen's in-page breadcrumb trail into the compact one under the page title,
   so both are always in sync and both are always clickable. Call this LAST in every nav
   function, after any dynamic crumbnav content has been set. */
function syncCrumb(id){
  var screen = document.getElementById(id);
  var crumbnav = screen ? screen.querySelector('.crumbnav') : null;
  document.getElementById('crumb').innerHTML = crumbnav ? crumbnav.innerHTML : '';
}

function goBatches(){
  show('screen-batches', 'Hiring', 'Every hiring batch, past and current', 'nav-hiring');
  syncCrumb('screen-batches');
}
function goCreateBatch(){
  show('screen-create-batch', 'Create hiring batch', 'One post, several roles, one shared timeline', 'nav-hiring');
  resetBatchCal();
  renderWherePosted();
  resetBannerUpload();
  syncCrumb('screen-create-batch');
}

/* ---------- batch banner — standard 1200×630 image, previewed client-side ---------- */

function resetBannerUpload(){
  var frame = document.getElementById('bannerFrame');
  var input = document.getElementById('bannerFileInput');
  var text = document.getElementById('bannerDropText');
  if (!frame) return;
  frame.style.backgroundImage = '';
  frame.innerHTML = '<span class="banner-frame-label" id="bannerFrameLabel">1200 × 630</span>';
  text.innerHTML = '<b>Click to upload</b> or drag a JPG/PNG here';
  input.value = '';
}

function handleBannerUpload(e){
  var file = e.target.files && e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev){
    var frame = document.getElementById('bannerFrame');
    frame.innerHTML = '';
    frame.style.backgroundImage = 'url(' + ev.target.result + ')';
    document.getElementById('bannerDropText').innerHTML = '<b>' + file.name + '</b> — click to replace';
  };
  reader.readAsDataURL(file);
}

/* ---------- Calendly-style application-window (opens/closes) date-range picker ---------- */

var batchRangeStart = null;
var batchRangeEnd = null;
function resetBatchCal(){
  batchRangeStart = null;
  batchRangeEnd = null;
  renderBatchCal();
}
function pickBatchDate(el){
  var day = parseInt(el.getAttribute('data-day'), 10);
  if (batchRangeStart === null || batchRangeEnd !== null){
    batchRangeStart = day;
    batchRangeEnd = null;
  } else if (day <= batchRangeStart){
    batchRangeStart = day;
    batchRangeEnd = null;
  } else {
    batchRangeEnd = day;
  }
  renderBatchCal();
}
function renderBatchCal(){
  document.querySelectorAll('#batchCalGrid .cal-day[data-day]').forEach(function(el){
    var d = parseInt(el.getAttribute('data-day'), 10);
    el.classList.remove('range-start', 'range-end', 'in-range');
    if (batchRangeStart !== null && d === batchRangeStart) el.classList.add('range-start');
    if (batchRangeEnd !== null && d === batchRangeEnd) el.classList.add('range-end');
    if (batchRangeStart !== null && batchRangeEnd !== null && d > batchRangeStart && d < batchRangeEnd) el.classList.add('in-range');
  });

  var opensBox = document.getElementById('rpOpensBox'), closesBox = document.getElementById('rpClosesBox');
  var opensVal = document.getElementById('rpOpens'), closesVal = document.getElementById('rpCloses');
  opensVal.textContent = batchRangeStart !== null ? 'Sep ' + batchRangeStart + ', 2026' : 'Pick a date';
  opensBox.classList.toggle('set', batchRangeStart !== null);
  closesVal.textContent = batchRangeEnd !== null ? 'Sep ' + batchRangeEnd + ', 2026' : 'Pick a date';
  closesBox.classList.toggle('set', batchRangeEnd !== null);

  var note = document.getElementById('batchRangeNote');
  if (batchRangeStart !== null && batchRangeEnd !== null){
    note.innerHTML = 'Applications will be open for <b>' + (batchRangeEnd - batchRangeStart) + ' days</b> — Sep ' + batchRangeStart + ' to Sep ' + batchRangeEnd + ', 2026.';
  } else if (batchRangeStart !== null){
    note.textContent = 'Now click a closing date, after Sep ' + batchRangeStart + '.';
  } else {
    note.textContent = 'Click a day to set when applications open, then click another to set when they close.';
  }
}

function goBatchClosed(){
  show('screen-batch-closed', 'Summer Internship 2025', 'Closed · 15/15 positions filled', 'nav-hiring');
  syncCrumb('screen-batch-closed');
}
function goBatchFinal(){
  show('screen-batch-final', 'Engineering Hiring — Q3 2026', 'Stage 3 — Final Review · 8 candidates ready across 2 roles', 'nav-hiring');
  syncCrumb('screen-batch-final');
}
function goBatchOpen(){
  show('screen-batch-open', 'Summer Internship 2026', 'Stage 1 — Applications Open · closes in 9 days', 'nav-hiring');
  syncCrumb('screen-batch-open');
}
function goBatchInterviewing(){
  show('screen-batch-interviewing', 'Customer Support Hiring — Q3 2026', 'Stage 2 — Interviewing · 1 interview live right now', 'nav-hiring');
  syncCrumb('screen-batch-interviewing');
}
function goApplyForm(){
  renderApplyFormPreview();
  show('screen-apply-form', 'Application form preview', 'What a candidate sees after clicking the LinkedIn/Indeed post', 'nav-hiring');
  syncCrumb('screen-apply-form');
}

/* ---------------------------------------------------------------
   Application form builder — Google-Forms-style editor for the
   public application form (Summer Internship 2026), plus the
   data-driven candidate-facing preview it feeds.
   --------------------------------------------------------------- */

var FORM_INSTRUCTIONS = [
  'Apply using your own personal or official email address — applications from shared, work-shared, or clearly fake emails are automatically rejected.',
  'Upload your CV as a PDF or DOCX file, under 5MB.',
  'Double-check your role choice below — you can only submit one application per batch.'
];

var FORM_FIELDS = [
  { id:'name',  type:'short',      label:'Full name',                         required:true, locked:true },
  { id:'email', type:'short',      label:'Email address',                     required:true, locked:true, placeholder:'you@email.com' },
  { id:'age',   type:'short',      label:'Age',                               required:true, placeholder:'e.g. 21' },
  { id:'city',  type:'short',      label:'City / Address',                    required:true, placeholder:'e.g. Lahore, Pakistan' },
  { id:'role',  type:'role',       label:'Which role are you applying for?',  required:true, locked:true },
  { id:'cv',    type:'file',       label:'Upload your CV',                    required:true, locked:true }
];

var FB_TYPE_LABEL = { short:'Short answer', paragraph:'Paragraph', choice:'Dropdown', file:'File upload', role:'Multiple choice (roles)' };

function goFormBuilder(){
  renderFormBuilder();
  show('screen-form-builder', 'Application Form', 'Summer Internship 2026 · questions and instructions candidates see', 'nav-hiring');
  syncCrumb('screen-form-builder');
}

function renderFormBuilder(){
  document.getElementById('fbInstrList').innerHTML = FORM_INSTRUCTIONS.map(function(text, i){
    return '<li><span>' + text + '</span><button class="fb-instr-remove" onclick="removeInstruction(' + i + ')" title="Remove">✕</button></li>';
  }).join('');

  document.getElementById('fbQuestions').innerHTML = FORM_FIELDS.map(function(f, i){
    var actions = f.locked
      ? '<span class="fb-locked-note">Required by the system</span>'
      : '<button title="Move up" onclick="moveQuestion(' + i + ',-1)">▲</button><button title="Move down" onclick="moveQuestion(' + i + ',1)">▼</button><button title="Remove" onclick="removeQuestion(' + i + ')">✕</button>';
    return '<div class="fb-question">' +
      '<div class="fb-q-main"><span class="fb-type-badge">' + FB_TYPE_LABEL[f.type] + '</span><span class="fb-q-label">' + f.label + '</span>' + (f.required ? '<span class="fb-required">Required</span>' : '') + '</div>' +
      '<div class="fb-q-actions">' + actions + '</div>' +
    '</div>';
  }).join('');
}

function addInstruction(){
  var input = document.getElementById('fbInstrInput');
  var text = input.value.trim();
  if (!text) return;
  FORM_INSTRUCTIONS.push(text);
  input.value = '';
  renderFormBuilder();
}
function removeInstruction(i){
  FORM_INSTRUCTIONS.splice(i, 1);
  renderFormBuilder();
}

function moveQuestion(i, dir){
  var j = i + dir;
  if (j < 0 || j >= FORM_FIELDS.length || FORM_FIELDS[j].locked) return;
  var tmp = FORM_FIELDS[i];
  FORM_FIELDS[i] = FORM_FIELDS[j];
  FORM_FIELDS[j] = tmp;
  renderFormBuilder();
}
function removeQuestion(i){
  if (FORM_FIELDS[i].locked) return;
  FORM_FIELDS.splice(i, 1);
  renderFormBuilder();
}
function toggleAddQuestion(){
  var panel = document.getElementById('fbAddPanel');
  var opening = (panel.style.display === 'none' || !panel.style.display);
  panel.style.display = opening ? 'block' : 'none';
  if (opening){
    document.getElementById('fbNewLabel').value = '';
    document.getElementById('fbNewRequired').checked = true;
    document.getElementById('fbNewLabel').focus();
  }
}
function addQuestion(){
  var label = document.getElementById('fbNewLabel').value.trim();
  if (!label){ document.getElementById('fbNewLabel').focus(); return; }
  var type = document.getElementById('fbNewType').value;
  var required = document.getElementById('fbNewRequired').checked;
  var field = { id:'q' + FORM_FIELDS.length + '_' + Math.round(Math.random() * 9999), type:type, label:label, required:required };
  if (type === 'choice') field.options = ['Option 1', 'Option 2'];
  FORM_FIELDS.push(field);
  toggleAddQuestion();
  renderFormBuilder();
  showToast('<b>Question added.</b> "' + label + '" now appears on the live application form.');
}
function saveFormBuilder(){
  showToast('<b>Application form saved.</b> Candidates opening the form now see the updated questions and instructions.');
}

function renderApplyFormPreview(){
  document.getElementById('applyInstructions').innerHTML = FORM_INSTRUCTIONS.length
    ? '<div class="apply-instructions"><div class="ai-t">Before you apply</div><ul>' + FORM_INSTRUCTIONS.map(function(t){ return '<li>' + t + '</li>'; }).join('') + '</ul></div>'
    : '';

  document.getElementById('applyFields').innerHTML = FORM_FIELDS.map(function(f){
    var star = f.required ? ' <span class="fb-req-star">*</span>' : '';
    if (f.type === 'role'){
      var roleOpts = Object.keys(ROLE_META).map(function(k){ return '<label><input type="radio" name="role"> ' + ROLE_META[k].label + '</label>'; }).join('');
      return '<div class="formfield"><label>' + f.label + star + '</label><div class="radiorow" style="flex-direction:column;gap:8px;">' + roleOpts + '</div></div>';
    }
    if (f.type === 'file'){
      return '<div class="formfield"><label>' + f.label + star + '</label><input class="searchbox" type="text" placeholder="PDF or DOCX, up to 5MB" disabled></div>';
    }
    if (f.type === 'paragraph'){
      return '<div class="formfield"><label>' + f.label + star + '</label><textarea class="jd-textarea" style="min-height:70px;" placeholder="Your answer"></textarea></div>';
    }
    if (f.type === 'choice'){
      var opts = (f.options || []).map(function(o){ return '<option>' + o + '</option>'; }).join('');
      return '<div class="formfield"><label>' + f.label + star + '</label><select class="searchbox"><option value="">Select…</option>' + opts + '</select></div>';
    }
    return '<div class="formfield"><label>' + f.label + star + '</label><input class="searchbox" type="text" placeholder="' + (f.placeholder || 'Your answer') + '"></div>';
  }).join('');
}

function goPipeline(){
  show('screen-pipeline', 'Senior React Developer', 'Role within Engineering Hiring — Q3 2026', 'nav-hiring');
  syncCrumb('screen-pipeline');
}
function goShortlist(){
  show('screen-shortlist', 'Shortlist — Senior React Developer', '5 candidates forwarded after the AI interview round', 'nav-hiring');
  syncCrumb('screen-shortlist');
}
function openCandidate(id){
  show('screen-detail', 'Hassan Ali', 'Full Stack Developer · Applicant for Senior React Developer', 'nav-hiring');
  document.getElementById('hireToast').classList.remove('show');
  resetAudioPlayer();
  syncCrumb('screen-detail');
}

/* ---------- interview recording playback (visual simulation, no real audio file) ---------- */

var audioState = { playing:false, elapsed:0, duration:1926 }; // 32:06
var audioTimer = null;

function resetAudioPlayer(){
  clearInterval(audioTimer);
  audioState = { playing:false, elapsed:0, duration:1926 };
  document.getElementById('audioPlayerWrap').style.display = 'none';
  document.getElementById('audioPlayBtn').textContent = '▶';
  updateAudioUI();
}
function toggleRecordingPanel(){
  var wrap = document.getElementById('audioPlayerWrap');
  wrap.style.display = (wrap.style.display === 'none' || !wrap.style.display) ? 'block' : 'none';
}
function fmtTime(s){
  var m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
}
function updateAudioUI(){
  document.getElementById('audioTime').textContent = fmtTime(audioState.elapsed) + ' / ' + fmtTime(audioState.duration);
  document.getElementById('audioProgress').style.width = (audioState.elapsed / audioState.duration * 100) + '%';
}
function toggleAudioPlay(){
  var btn = document.getElementById('audioPlayBtn');
  if (audioState.playing){
    audioState.playing = false;
    btn.textContent = '▶';
    clearInterval(audioTimer);
    return;
  }
  audioState.playing = true;
  btn.textContent = '⏸';
  var speed = parseFloat(document.getElementById('audioSpeed').value) || 1;
  audioTimer = setInterval(function(){
    audioState.elapsed = Math.min(audioState.duration, audioState.elapsed + 8 * speed);
    updateAudioUI();
    if (audioState.elapsed >= audioState.duration){
      audioState.playing = false;
      btn.textContent = '▶';
      clearInterval(audioTimer);
    }
  }, 100);
}
function scrubAudio(e){
  var track = e.currentTarget;
  var rect = track.getBoundingClientRect();
  var pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  audioState.elapsed = pct * audioState.duration;
  updateAudioUI();
}
function selectCandidate(){
  document.getElementById('hireToast').classList.add('show');
  document.getElementById('pill-hassan').textContent = 'Selected for offer';
  document.getElementById('pill-hassan').className = 'status-pill status-pill--active';
  document.getElementById('card-hassan').classList.add('selected');
}
function rejectCandidate(){
  alert('Would send Hassan Ali a rejection notice and remove him from this role\'s active pipeline. He stays in the CV Pool.');
}

function goApplicants(){
  show('screen-applicants', 'All applicants', 'Every applicant for Senior React Developer — screened out or not', 'nav-hiring');
  document.getElementById('overrideToast').classList.remove('show');
  syncCrumb('screen-applicants');
}
function openApplicantCV(){
  show('screen-cv', 'Ali Raza', 'Frontend Developer · Rejected, score 61', 'nav-hiring');
  syncCrumb('screen-cv');
}
function overrideAddToShortlist(){
  document.getElementById('overrideToast').classList.add('show');
}

const SCHEDULES = {
  eng: {
    batchLabel: 'Engineering Hiring — Q3 2026',
    batchFn: 'goBatchFinal',
    sub: '9 interviews · all complete',
    rows: [
      { name:'Ayesha Raza', role:'Senior React Developer', time:'Jul 2 — 10:00 AM', status:'completed', onclick:"openCandidate('ayesha')" },
      { name:'Bilal Ahmed', role:'Senior React Developer', time:'Jul 2 — 11:00 AM', status:'completed', onclick:"openCandidate('bilal')" },
      { name:'Hassan Ali', role:'Senior React Developer', time:'Jul 2 — 2:00 PM', status:'completed', onclick:"openCandidate('hassan')" },
      { name:'Mehak Fatima', role:'Senior React Developer', time:'Jul 3 — 9:30 AM', status:'completed', onclick:"openCandidate('mehak')" },
      { name:'Usman Tariq', role:'Senior React Developer', time:'Jul 3 — 11:00 AM', status:'completed', onclick:"openCandidate('usman')" },
      { name:'Fahad Sheikh', role:'Senior React Developer', time:'Jul 3 — 3:00 PM', status:'completed' },
      { name:'Zainab Qureshi', role:'Senior React Developer', time:'Jul 4 — 10:00 AM', status:'noshow' },
      { name:'Ahsan Bhatti', role:'Backend Engineer', time:'Jul 5 — 10:00 AM', status:'completed' },
      { name:'Nimra Javed', role:'Backend Engineer', time:'Jul 5 — 1:00 PM', status:'completed' }
    ]
  },
  support: {
    batchLabel: 'Customer Support Hiring — Q3 2026',
    batchFn: 'goBatchInterviewing',
    sub: '8 interviews · 1 happening now, 2 still to come',
    rows: [
      { name:'Zara Ahmed', role:'Customer Support Officer', time:'Jul 4 — 10:00 AM', status:'completed' },
      { name:'Bilal Anwar', role:'Customer Support Officer', time:'Jul 4 — 2:00 PM', status:'completed' },
      { name:'Mehwish Tariq', role:'Support Team Lead', time:'Jul 5 — 11:00 AM', status:'completed' },
      { name:'Kamran Sheikh', role:'Customer Support Officer', time:'Jul 8 — 10:00 AM', status:'noshow' },
      { name:'Rabia Sultan', role:'Customer Support Officer', time:'Today, Jul 9 — 12:30 PM', status:'live', onclick:"goLiveMonitor()" },
      { name:'Sara Bukhari', role:'Customer Support Officer', time:'Today, Jul 9 — 3:30 PM', status:'scheduled' },
      { name:'Hassan Iqbal', role:'Customer Support Officer', time:'Jul 10 — 10:00 AM', status:'scheduled' },
      { name:'Ayesha Malik', role:'Support Team Lead', time:'Jul 10 — 2:00 PM', status:'scheduled' }
    ]
  }
};

const SCHEDULE_STATUS = {
  completed: { pill:'<span class="status-pill status-pill--active">Completed</span>', action:'View →' },
  noshow: { pill:'<span class="status-pill status-pill--probation">No-show</span>', action:'View →' },
  scheduled: { pill:'<span class="status-pill status-pill--on-leave">Scheduled</span>', action:'View →' },
  live: { pill:'<span class="livebadge"><span class="dotpulse"></span>In progress</span>', action:'Monitor live →' }
};

function goInterviewSchedule(batchKey){
  var sched = SCHEDULES[batchKey];
  document.getElementById('scheduleCrumb').innerHTML = '<button onclick="goBatches()">Hiring</button><span class="sep">/</span><button onclick="' + sched.batchFn + '()">' + sched.batchLabel + '</button><span class="sep">/</span><span class="current">Interview schedule</span>';
  document.getElementById('scheduleRows').innerHTML = sched.rows.map(function(r){
    var s = SCHEDULE_STATUS[r.status];
    var rowClass = r.onclick ? 'rowhover' + (r.status === 'live' ? ' schedule-row-live' : '') : '';
    var onclickAttr = r.onclick ? ' onclick="' + r.onclick + '"' : '';
    return '<tr class="' + rowClass + '"' + onclickAttr + '><td class="namecell">' + r.name + '</td><td class="rolecell">' + r.role + '</td>' +
      '<td class="mono" style="font-size:12.5px;">' + r.time + '</td><td>' + s.pill + '</td>' +
      '<td>' + (r.onclick ? '<button class="viewlink">' + s.action + '</button>' : '') + '</td></tr>';
  }).join('');
  show('screen-interview-schedule', 'Interview schedule', sched.batchLabel + ' · ' + sched.sub, 'nav-hiring');
  syncCrumb('screen-interview-schedule');
}

function goLiveMonitor(){
  show('screen-live-monitor', 'Rabia Sultan — live interview', 'Customer Support Officer · in progress', 'nav-hiring');
  syncCrumb('screen-live-monitor');
}

function goCVPool(){
  show('screen-cvpool', 'CV Pool', 'Every CV ever submitted, across every batch — kept, searchable, reusable', 'nav-cvpool');
  syncCrumb('screen-cvpool');
}

function goSettings(batchKey){
  if (batchKey) currentSettingsBatch = batchKey;
  renderSettings();
  show('screen-settings', 'Hiring Settings', BATCH_SETTINGS[currentSettingsBatch].label, 'nav-settings');
  syncCrumb('screen-settings');
}

function addRoleRow(){
  var wrap = document.querySelector('.rolerow-block').parentElement;
  var addBtn = wrap.querySelector('.linkbtn');
  var block = document.createElement('div');
  block.className = 'rolerow-block';
  block.innerHTML = '<div class="rolerow"><input class="searchbox" type="text" placeholder="Role title"><input class="threshold-input mono" type="text" value="1"><span style="font-size:12px;color:var(--ink-faint);">positions</span><button class="viewlink" style="color:var(--danger-fg);" onclick="this.closest(\'.rolerow-block\').remove(); updateBatchTotal();">Remove</button></div>' +
    '<label class="rolerow-jd-label">Job description — what the AI will score applications against</label>' +
    '<textarea class="jd-textarea" style="min-height:110px;" placeholder="Describe the role and its requirements — this is the text every incoming application gets scored against."></textarea>';
  wrap.insertBefore(block, addBtn);
  updateBatchTotal();
}
function updateBatchTotal(){
  var rows = document.querySelectorAll('.rolerow');
  var total = 0;
  rows.forEach(r => { var n = parseInt(r.querySelector('.threshold-input').value) || 0; total += n; });
  var totalEl = document.getElementById('totalPositions');
  var rolesEl = document.getElementById('totalRoles');
  if (totalEl) totalEl.textContent = total;
  if (rolesEl) rolesEl.textContent = rows.length;
}

/* ---------- Job description: shared view/edit/disclosure component, used by every role ---------- */

function toggleJdEdit(key){
  var view = document.getElementById('jdView-' + key);
  var edit = document.getElementById('jdEditArea-' + key);
  var btn = document.getElementById('jdEditBtn-' + key);
  document.getElementById('jdTextarea-' + key).value = view.textContent.trim();
  view.style.display = 'none';
  if (btn) btn.style.display = 'none';
  edit.style.display = 'block';
}
function cancelJdEdit(key){
  document.getElementById('jdEditArea-' + key).style.display = 'none';
  document.getElementById('jdView-' + key).style.display = 'block';
  var btn = document.getElementById('jdEditBtn-' + key);
  if (btn) btn.style.display = 'inline-flex';
}
function saveJd(key){
  var text = document.getElementById('jdTextarea-' + key).value;
  document.getElementById('jdView-' + key).textContent = text;
  if (key === 'roleapp' && typeof currentRoleAppKey !== 'undefined' && ROLE_META[currentRoleAppKey]){
    ROLE_META[currentRoleAppKey].jd = text;
  }
  cancelJdEdit(key);
  showToast('<b>Job description saved.</b> New applications for this role will be scored against the updated text — candidates already screened keep their original score unless you re-run screening.');
}
function toggleJdDisclosure(key){
  var body = document.getElementById('jdBody-' + key);
  body.style.display = (body.style.display === 'none' || !body.style.display) ? 'block' : 'none';
}

function showToast(message, ms){
  var t = document.getElementById('globalToast');
  t.innerHTML = message;
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(function(){ t.classList.remove('show'); }, ms || 4500);
}

/* ---------- Stage 1 (Summer Internship 2026): role applicant lists + viewable profiles ---------- */

const ROLE_META = {
  frontend: { label: 'Frontend Intern', applied: 24, sampleIds: ['hira','zeeshan','ayesha_n','faizan','mahnoor','waleed','kinza','owais'],
    jd: "Summer internship for a Frontend-track student or recent grad. You'll work alongside our product engineering team building real features in our React codebase.\n\nRequirements:\n- Currently pursuing or recently completed a CS degree (or equivalent self-taught background)\n- Basic HTML/CSS/JavaScript fluency\n- Some exposure to React (coursework, personal projects, or bootcamp) preferred but not required\n- Eagerness to learn — this is an entry-level program" },
  backend:  { label: 'Backend Intern',  applied: 19, sampleIds: ['mariam','ahsan_r','talha','sameen','bilal_z','nida'],
    jd: "Summer internship for a Backend-track student. You'll work with our engineering team on API and database work for our core product.\n\nRequirements:\n- Currently pursuing or recently completed a CS degree\n- Basic understanding of at least one backend language/framework (Node.js, Django, etc.) and SQL\n- Personal or coursework projects demonstrating backend logic preferred" },
  aiml:     { label: 'AI/ML Intern',    applied: 9,  sampleIds: ['rameen','danish_u','abdullah','sadia','hamid'],
    jd: "Summer internship for a Machine Learning-track student. You'll support our data team on model experimentation and evaluation work.\n\nRequirements:\n- Currently pursuing or recently completed a CS/Data Science degree\n- Coursework or personal projects in Python, pandas, and at least one ML library (scikit-learn, PyTorch, etc.)\n- Hands-on project work (even small ones) valued over certificates alone" }
};

const CANDIDATES = {
  hira:     { name:'Hira Sultan',      role:'Frontend Intern', score:84, status:'shortlisted', b:[['Skills match',88],['Experience relevance',82],['Education fit',85],['Career stability',80]], chips:[['match','React'],['match','JavaScript'],['match','CSS']], resume:'Built two personal React apps (a portfolio site and a weather dashboard) and has strong CSS/Flexbox fundamentals. Currently a CS sophomore at LUMS.' },
  zeeshan:  { name:'Zeeshan Baig',     role:'Frontend Intern', score:79, status:'shortlisted', b:[['Skills match',80],['Experience relevance',75],['Education fit',78],['Career stability',76]], chips:[['match','HTML/CSS'],['match','JavaScript'],['gap','React — limited']], resume:'Solid HTML/CSS/JS fundamentals from coursework, plus one group hackathon project built with React.' },
  ayesha_n: { name:'Ayesha Noor',      role:'Frontend Intern', score:76, status:'shortlisted', b:[['Skills match',79],['Experience relevance',70],['Education fit',74],['Career stability',78]], chips:[['match','HTML/CSS'],['match','JavaScript']], resume:'Coding bootcamp graduate with a well-built personal portfolio site, but no listed team-project experience.' },
  faizan:   { name:'Faizan Sheikh',    role:'Frontend Intern', score:71, status:'shortlisted', b:[['Skills match',74],['Experience relevance',68],['Education fit',72],['Career stability',70]], chips:[['match','React'],['gap','Mobile — side project only']], resume:'Currently building a React Native app as a side project; CS junior at FAST-NUCES.' },
  mahnoor:  { name:'Mahnoor Siddiqui', role:'Frontend Intern', score:67, status:'shortlisted', b:[['Skills match',70],['Experience relevance',62],['Education fit',65],['Career stability',68]], chips:[['match','JavaScript'],['gap','React — self-taught only']], resume:'Strong JavaScript fundamentals from self-directed freeCodeCamp coursework; no formal CS degree listed.' },
  waleed:   { name:'Waleed Aslam',     role:'Frontend Intern', score:58, status:'review', b:[['Skills match',72],['Experience relevance',50],['Education fit',55],['Career stability',60]], chips:[['match','Design'],['gap','Skills parsing — flagged']], resume:"Personal portfolio site is genuinely impressive, but the resume's formatting made several claimed skills difficult for the parser to confidently extract.", note:"The AI flagged this one because of a parsing problem, not a skills problem — the resume's layout (a two-column design-heavy template) broke automated field extraction. Worth a human read." },
  kinza:    { name:'Kinza Malik',      role:'Frontend Intern', score:44, status:'rejected', b:[['Skills match',35],['Experience relevance',48],['Education fit',50],['Career stability',45]], chips:[['gap','Frontend framework'],['match','Backend coursework']], resume:'Coursework and projects are almost entirely backend-focused (Java, SQL) — no frontend framework experience listed.' },
  owais:    { name:'Owais Khalid',     role:'Frontend Intern', score:32, status:'rejected', b:[['Skills match',20],['Experience relevance',25],['Education fit',40],['Career stability',35]], chips:[['gap','Frontend experience']], resume:'Work history is mostly retail/customer service; one introductory CS course, no frontend projects listed.' },

  mariam:   { name:'Mariam Yousaf',    role:'Backend Intern', score:79, status:'shortlisted', b:[['Skills match',82],['Experience relevance',76],['Education fit',78],['Career stability',80]], chips:[['match','Django'],['match','PostgreSQL']], resume:'Built a Django + PostgreSQL personal project (a task tracker with authentication); CS junior at NUST.' },
  ahsan_r:  { name:'Ahsan Raza',       role:'Backend Intern', score:72, status:'shortlisted', b:[['Skills match',75],['Experience relevance',68],['Education fit',70],['Career stability',74]], chips:[['match','Node.js'],['gap','Docker — coursework only']], resume:'Node.js/Express REST API project with some Docker exposure from a university systems course.' },
  talha:    { name:'Talha Mir',        role:'Backend Intern', score:68, status:'shortlisted', b:[['Skills match',70],['Experience relevance',64],['Education fit',66],['Career stability',69]], chips:[['match','MySQL'],['match','REST APIs']], resume:'Built a REST API connecting to a MySQL database for a course project; CS sophomore at Bahria University.' },
  sameen:   { name:'Sameen Fatima',    role:'Backend Intern', score:61, status:'review', b:[['Skills match',68],['Experience relevance',40],['Education fit',58],['Career stability',60]], chips:[['match','SQL'],['gap','Primary focus — unclear']], resume:'Strong SQL/database coursework, but the resume also lists several frontend bootcamp certificates.', note:"The AI couldn't confidently tell whether her primary track is backend or frontend — the resume genuinely mixes both. Worth a quick human read to clarify." },
  bilal_z:  { name:'Bilal Zafar',      role:'Backend Intern', score:39, status:'rejected', b:[['Skills match',30],['Experience relevance',35],['Education fit',42],['Career stability',40]], chips:[['gap','Backend experience']], resume:'No backend-specific coursework, frameworks, or projects found anywhere in the resume.' },
  nida:     { name:'Nida Kamal',       role:'Backend Intern', score:36, status:'rejected', b:[['Skills match',15],['Experience relevance',20],['Education fit',30],['Career stability',32]], chips:[['gap','Programming experience']], resume:'Resume is focused entirely on graphic design work; no programming experience listed.' },

  rameen:   { name:'Rameen Shah',      role:'AI/ML Intern', score:81, status:'shortlisted', b:[['Skills match',85],['Experience relevance',78],['Education fit',80],['Career stability',82]], chips:[['match','Python'],['match','scikit-learn']], resume:'Finished top-15% in a Kaggle competition; solid project work in Python, pandas, and scikit-learn.' },
  danish_u: { name:'Danish Umar',      role:'AI/ML Intern', score:74, status:'shortlisted', b:[['Skills match',76],['Experience relevance',70],['Education fit',72],['Career stability',75]], chips:[['match','Python'],['match','Machine Learning']], resume:'University ML course project building an image classifier, with a clean, well-documented GitHub repo.' },
  abdullah: { name:'Abdullah Nasir',   role:'AI/ML Intern', score:63, status:'review', b:[['Skills match',75],['Experience relevance',30],['Education fit',65],['Career stability',60]], chips:[['match','ML coursework'],['gap','Hands-on projects']], resume:'Strong machine learning coursework, including a completed Andrew Ng specialization — but the resume lists no hands-on project, only certificates.', note:"Real coursework depth, but zero applied project work is a meaningful gap for an ML internship. The AI couldn't decide whether coursework alone is enough — that's a judgment call worth making by hand." },
  sadia:    { name:'Sadia Bano',       role:'AI/ML Intern', score:29, status:'rejected', b:[['Skills match',20],['Experience relevance',25],['Education fit',32],['Career stability',30]], chips:[['gap','ML coursework or projects']], resume:'General CS coursework only; no machine-learning-specific projects or coursework listed.' },
  hamid:    { name:'Hamid Raza',       role:'AI/ML Intern', score:40, status:'rejected', b:[['Skills match',25],['Experience relevance',30],['Education fit',38],['Career stability',35]], chips:[['gap','ML exposure']], resume:'One introductory Python course; no exposure to machine learning found in the resume.' }
};

const STATUS_PILL = {
  shortlisted: '<span class="status-pill status-pill--active">Shortlisted</span>',
  rejected: '<span class="status-pill status-pill--probation">Rejected</span>',
  review: '<span class="status-pill status-pill--brand">Human intervention needed</span>'
};
const SCORE_COLOR = { shortlisted:'var(--success-fg)', rejected:'var(--danger-fg)', review:'var(--warning-fg)' };

var currentRoleAppKey = null;
function goRoleApplicants(role){
  var meta = ROLE_META[role];
  currentRoleAppKey = role;
  document.getElementById('roleAppCrumb').textContent = meta.label;
  document.getElementById('roleAppCount').textContent = 'Showing ' + meta.sampleIds.length + ' of ' + meta.applied + ' — a representative sample for this walkthrough';
  document.getElementById('jdView-roleapp').textContent = meta.jd;
  document.getElementById('jdEditArea-roleapp').style.display = 'none';
  document.getElementById('jdView-roleapp').style.display = 'block';
  document.getElementById('jdEditBtn-roleapp').style.display = 'inline-flex';
  var rows = meta.sampleIds.map(function(id){
    var c = CANDIDATES[id];
    return '<tr class="rowhover" onclick="openStage1Profile(\'' + id + '\')"><td class="namecell">' + c.name + '</td>' +
      '<td class="score mono" style="color:' + SCORE_COLOR[c.status] + ';">' + c.score + '</td>' +
      '<td>' + STATUS_PILL[c.status] + '</td><td><button class="viewlink">View →</button></td></tr>';
  }).join('');
  document.getElementById('roleAppRows').innerHTML = rows;
  show('screen-role-applicants', meta.label + ' — Applicants', 'Summer Internship 2026 · ' + meta.applied + ' applied so far', 'nav-hiring');
  syncCrumb('screen-role-applicants');
}

function openStage1Profile(id){
  var c = CANDIDATES[id];
  document.getElementById('stage1Toast').classList.remove('show');
  document.getElementById('stage1Initials').textContent = c.name.split(' ').map(function(w){return w[0];}).join('').slice(0,2).toUpperCase();
  document.getElementById('stage1Name').textContent = c.name;
  document.getElementById('stage1RoleLine').textContent = c.role + ' applicant · Summer Internship 2026';
  document.getElementById('stage1Score').textContent = c.score;
  document.getElementById('stage1Crumb').innerHTML = '<button onclick="goBatches()">Hiring</button><span class="sep">/</span><button onclick="goBatchOpen()">Summer Internship 2026</button><span class="sep">/</span><button onclick="goRoleApplicants(\'' + roleKeyFor(c.role) + '\')">' + c.role + '</button><span class="sep">/</span><span class="current">' + c.name + '</span>';

  var scoreBox = document.getElementById('stage1ScoreBox');
  var label = document.getElementById('stage1ScoreLabel');
  if (c.status === 'shortlisted'){ scoreBox.style.background = 'var(--success-bg)'; document.getElementById('stage1Score').style.color = 'var(--success-fg)'; label.textContent = 'Screening score — Shortlisted'; }
  else if (c.status === 'rejected'){ scoreBox.style.background = 'var(--danger-bg)'; document.getElementById('stage1Score').style.color = 'var(--danger-fg)'; label.textContent = 'Screening score — Rejected'; }
  else { scoreBox.style.background = 'var(--warning-bg)'; document.getElementById('stage1Score').style.color = 'var(--warning-fg)'; label.textContent = 'Screening score — Needs your input'; }

  document.getElementById('stage1Breakdown').innerHTML = c.b.map(function(row){
    return '<div class="critrow"><div class="lbl">' + row[0] + '</div><div class="critbar"><div class="fill" style="width:' + row[1] + '%;"></div></div><div class="val mono">' + row[1] + '</div></div>';
  }).join('');

  document.getElementById('stage1Resume').textContent = '"' + c.resume + '"';
  document.getElementById('stage1Chips').innerHTML = c.chips.map(function(ch){
    return '<span class="chip ' + ch[0] + '">' + ch[1] + '</span>';
  }).join('');

  var extra = document.getElementById('stage1ExtraNote');
  extra.innerHTML = c.note ? '<div class="overridecard"><div class="t">Why the AI flagged this one for you</div><p class="s">' + c.note + '</p></div>' : '';

  var emailBtn = !BATCH_SETTINGS.open26.aiEnabled ? '<button class="btn btn-line" onclick="alert(\'Would open an email composer addressed to ' + c.name + '.\')">✉ Email candidate</button>' : '';
  var actions = document.getElementById('stage1Actions');
  if (c.status === 'shortlisted'){
    actions.innerHTML = emailBtn + '<button class="btn btn-danger-ghost" onclick="stage1Action(\'' + id + '\',\'remove\')">Remove from shortlist</button><span class="mono" style="align-self:center;color:var(--ink-faint);font-size:12px;">Otherwise stays shortlisted — invited to interview once applications close</span>';
  } else if (c.status === 'rejected'){
    actions.innerHTML = emailBtn + '<button class="btn btn-line" onclick="goRoleApplicants(\'' + roleKeyFor(c.role) + '\')">Keep as rejected</button><button class="btn btn-primary" onclick="stage1Action(\'' + id + '\',\'add\')">Add to shortlist anyway →</button>';
  } else {
    actions.innerHTML = emailBtn + '<button class="btn btn-danger-ghost" onclick="stage1Action(\'' + id + '\',\'reject\')">Reject</button><button class="btn btn-primary" onclick="stage1Action(\'' + id + '\',\'shortlist\')">Shortlist for interview →</button>';
  }

  show('screen-stage1-profile', c.name, c.role + ' · Applicant, Summer Internship 2026', 'nav-hiring');
  syncCrumb('screen-stage1-profile');
}

function roleKeyFor(label){
  for (var k in ROLE_META){ if (ROLE_META[k].label === label) return k; }
  return 'frontend';
}

function stage1Action(id, action){
  var c = CANDIDATES[id];
  var msg = '';
  if (action === 'remove'){ msg = '<b>' + c.name + ' removed from the shortlist.</b> She stays in the CV Pool and won\'t be invited to interview.'; }
  if (action === 'add'){ msg = '<b>' + c.name + ' added to the shortlist.</b> He\'ll be invited to interview once applications close — your override reason is saved to the audit log.'; }
  if (action === 'reject'){ msg = '<b>' + c.name + ' rejected.</b> He stays in the CV Pool for future roles.'; }
  if (action === 'shortlist'){ msg = '<b>' + c.name + ' shortlisted.</b> Added to the interview queue for once applications close.'; }
  document.getElementById('stage1ToastMsg').innerHTML = msg;
  document.getElementById('stage1Toast').classList.add('show');
}

/* ---------------------------------------------------------------
   Preplify Intelligence — per-batch AI on/off switch + manual-mode tools
   (interview scheduling, "email candidate", per-stage AI hand-back,
   and the per-role interview question set)
   --------------------------------------------------------------- */

const BATCH_SETTINGS = {
  eng:      { label:'Engineering Hiring — Q3 2026',      aiEnabled:true },
  support:  { label:'Customer Support Hiring — Q3 2026', aiEnabled:true },
  open26:   { label:'Summer Internship 2026',            aiEnabled:true },
  closed25: { label:'Summer Internship 2025',            aiEnabled:true }
};

const BATCH_ROLES = {
  eng: [
    { key:'srd', label:'Senior React Developer', questions:[
      'Walk me through a recent project where you had to trade off performance against code readability.',
      'How do you approach testing in your own projects?',
      'Tell me about a time you disagreed with a code review comment — how did you handle it?',
      'How would you structure state management for a growing dashboard product?'
    ]},
    { key:'backendeng', label:'Backend Engineer', questions:[
      'Describe how you\'d design a REST API for a resource with complex nested relationships.',
      'Tell me about a time a database query became a performance bottleneck — what did you do?',
      'How do you approach writing migrations for a production database?'
    ]}
  ],
  support: [
    { key:'cso', label:'Customer Support Officer', questions:[
      'Tell me about a time a customer was upset about something that genuinely wasn\'t your fault.',
      'How do you prioritize when you have five open tickets and one urgent call?',
      'Describe a time you had to explain a policy a customer didn\'t like.'
    ]},
    { key:'stl', label:'Support Team Lead', questions:[
      'Tell me about a time you coached a team member through a difficult customer interaction.',
      'How do you decide when an escalation needs to come to you directly?',
      'What metric would you look at first to know if your team is struggling?'
    ]}
  ],
  open26: [
    { key:'frontend', label:'Frontend Intern', questions:[
      'Walk me through a personal project you\'re proud of — what was hard about it?',
      'What\'s something in React you find confusing, and how have you worked around it?',
      'How would you explain what CSS specificity is to someone who\'s never coded?'
    ]},
    { key:'backend', label:'Backend Intern', questions:[
      'Explain what happens, step by step, when a user submits a login form on a website you built.',
      'What\'s the difference between SQL and NoSQL, and when would you pick one over the other?'
    ]},
    { key:'aiml', label:'AI/ML Intern', questions:[
      'Walk me through a model you\'ve trained — what did you do when it underperformed?',
      'How do you know when a model is overfitting, and what would you do about it?'
    ]}
  ],
  closed25: [
    { key:'frontend25', label:'Frontend Intern', questions:['(archived — this batch is closed)'] },
    { key:'backend25', label:'Backend Intern', questions:['(archived — this batch is closed)'] },
    { key:'aiml25', label:'AI/ML Intern', questions:['(archived — this batch is closed)'] }
  ]
};

var currentSettingsBatch = 'eng';

function pickSettingsBatch(key){
  currentSettingsBatch = key;
  renderSettings();
}

function renderSettings(){
  var s = BATCH_SETTINGS[currentSettingsBatch];
  document.getElementById('settingsBatchPicker').innerHTML = Object.keys(BATCH_SETTINGS).map(function(k){
    var b = BATCH_SETTINGS[k];
    return '<button class="' + (k === currentSettingsBatch ? 'active' : '') + '" onclick="pickSettingsBatch(\'' + k + '\')"><span class="dot" style="background:' + (b.aiEnabled ? 'var(--success-fg)' : 'var(--ink-faint)') + ';"></span>' + b.label + '</button>';
  }).join('');

  document.getElementById('aiSwitchInput').checked = s.aiEnabled;
  document.getElementById('aiSwitchState').textContent = s.aiEnabled ? 'ON' : 'OFF';
  document.getElementById('aiSwitchDesc').textContent = s.aiEnabled
    ? 'Preplify screens every application, conducts the AI interview, and ranks candidates automatically for ' + s.label + '.'
    : 'Turned off for ' + s.label + ' — you\'re screening CVs, contacting candidates, and scheduling interviews yourself. Hand any single stage back to AI any time from the batch page.';
  document.getElementById('settingsAiOnly').style.display = s.aiEnabled ? 'block' : 'none';
  document.getElementById('settingsManualOnly').style.display = s.aiEnabled ? 'none' : 'block';
  document.getElementById('qeditorLabel').textContent = s.aiEnabled ? 'AI-generated per role, editable before it goes live.' : 'Your own list, per role — this becomes your interview guide since you\'re conducting these yourself.';
  document.getElementById('qeditorPanel').style.display = 'none';

  renderQEditor();
}

function toggleIntelligence(){
  var s = BATCH_SETTINGS[currentSettingsBatch];
  s.aiEnabled = !s.aiEnabled;
  renderSettings();
  refreshBatchUI();
  showToast(s.aiEnabled
    ? '<b>Preplify Intelligence turned back on for ' + s.label + '.</b> New applications, interviews, and shortlisting will run automatically again.'
    : '<b>Preplify Intelligence turned off for ' + s.label + '.</b> "Email candidate" and manual scheduling are now available throughout this batch — hand any single stage back to AI whenever you want.');
}

function refreshBatchUI(){
  document.querySelectorAll('[data-batch]').forEach(function(el){
    var s = BATCH_SETTINGS[el.getAttribute('data-batch')];
    var on = s ? s.aiEnabled : true;
    if (el.classList.contains('stage-cta')) el.classList.toggle('show', !on);
    else if (el.classList.contains('email-cta')) el.classList.toggle('show', !on);
    else if (el.classList.contains('manual-chip')) el.style.display = on ? 'none' : 'inline-flex';
  });
}

function aiCompleteStage(batchKey, stageLabel){
  showToast('<b>AI is completing ' + stageLabel + '.</b> This one stage now runs automatically — everything else in ' + BATCH_SETTINGS[batchKey].label + ' stays manual.');
}

/* ---------- interview question editor (per role, per batch) ---------- */

var currentQRole = null;
function openQEditor(){
  var roles = BATCH_ROLES[currentSettingsBatch];
  currentQRole = roles[0].key;
  var panel = document.getElementById('qeditorPanel');
  panel.style.display = 'block';
  renderQEditor();
  panel.scrollIntoView({ behavior:'smooth', block:'center' });
}
function renderQEditor(){
  var panel = document.getElementById('qeditorPanel');
  if (!panel || panel.style.display === 'none') return;
  var roles = BATCH_ROLES[currentSettingsBatch];
  if (!currentQRole || !roles.some(function(r){ return r.key === currentQRole; })) currentQRole = roles[0].key;
  document.getElementById('qeditorRoles').innerHTML = roles.map(function(r){
    return '<button class="' + (r.key === currentQRole ? 'active' : '') + '" onclick="pickQRole(\'' + r.key + '\')">' + r.label + '</button>';
  }).join('');
  var role = roles.filter(function(r){ return r.key === currentQRole; })[0];
  document.getElementById('qeditorTextarea').value = role.questions.join('\n');
}
function pickQRole(key){
  currentQRole = key;
  renderQEditor();
}
function saveQuestions(){
  var roles = BATCH_ROLES[currentSettingsBatch];
  var role = roles.filter(function(r){ return r.key === currentQRole; })[0];
  role.questions = document.getElementById('qeditorTextarea').value.split('\n').map(function(s){ return s.trim(); }).filter(Boolean);
  document.getElementById('qeditorPanel').style.display = 'none';
  showToast('<b>Interview questions saved for ' + role.label + '.</b>');
}

/* ---------- Calendly-style availability picker (manual scheduling) ---------- */

var calSelectedDay = null;
var calSelectedSlot = null;
function selectCalDay(el, label){
  document.querySelectorAll('.cal-day.selected').forEach(function(d){ d.classList.remove('selected'); });
  el.classList.add('selected');
  calSelectedDay = label;
  calSelectedSlot = null;
  document.querySelectorAll('.cal-slot.selected').forEach(function(s){ s.classList.remove('selected'); });
  document.getElementById('calSlotsWrap').style.display = 'block';
  document.getElementById('calPickedDay').textContent = label;
  updateCalConfirm();
}
function selectCalSlot(el, label){
  document.querySelectorAll('.cal-slot.selected').forEach(function(s){ s.classList.remove('selected'); });
  el.classList.add('selected');
  calSelectedSlot = label;
  updateCalConfirm();
}
function updateCalConfirm(){
  var txt = document.getElementById('calConfirmText');
  txt.innerHTML = (calSelectedDay && calSelectedSlot)
    ? 'Marked available: <b>' + calSelectedDay + ', ' + calSelectedSlot + '</b>'
    : 'Pick a day, then a time slot.';
}
function saveAvailability(){
  showToast('<b>Availability saved.</b> Candidates in manually-run batches will be offered these slots when you schedule their interview.');
}

/* ---------------------------------------------------------------
   Publish a real new batch — reads whatever is in the Create Batch
   form, generates ~100 applicants across its roles, and drops it
   into manual mode so HR can walk the without-AI shortlisting flow
   candidate by candidate. Supports one active custom batch at a time
   — publishing again replaces it.
   --------------------------------------------------------------- */

var FIRST_NAMES = ['Ayesha','Bilal','Sara','Hamza','Zainab','Ali','Mahnoor','Usman','Hina','Faisal','Sadia','Omar','Rabia','Talha','Nida','Kashif','Amina','Waqas','Sana','Junaid','Mariam','Adeel','Noor','Shahzad','Komal','Rizwan','Iqra','Zeeshan','Farah','Asad','Laiba','Imran','Rida','Salman','Aiman','Danish','Sidra','Fahad','Anum','Haris'];
var LAST_NAMES = ['Khan','Ahmed','Raza','Malik','Hussain','Iqbal','Sheikh','Butt','Farooq','Chaudhry','Abbasi','Rehman','Qureshi','Baig','Siddiqui','Awan','Tariq','Yousaf','Zafar','Aslam'];
var CITIES = ['Karachi','Lahore','Islamabad','Rawalpindi','Faisalabad','Multan','Peshawar','Quetta','Sialkot','Hyderabad'];

var CUSTOM_BATCH = null;
var currentCustomRoleKey = null;
var currentCustomProfileId = null;

var CUSTOM_STATUS_PILL = {
  pending: '<span id="customProfileStatusPill" class="status-pill status-pill--on-leave">Pending review</span>',
  shortlisted: '<span id="customProfileStatusPill" class="status-pill status-pill--active">Shortlisted</span>',
  rejected: '<span id="customProfileStatusPill" class="status-pill status-pill--probation">Rejected</span>'
};
var CUSTOM_ROW_PILL = {
  pending: '<span class="status-pill status-pill--on-leave">Pending review</span>',
  shortlisted: '<span class="status-pill status-pill--active">Shortlisted</span>',
  rejected: '<span class="status-pill status-pill--probation">Rejected</span>'
};

function generateApplicantName(seed){
  var f = FIRST_NAMES[seed % FIRST_NAMES.length];
  var l = LAST_NAMES[(seed * 7 + 3) % LAST_NAMES.length];
  return f + ' ' + l;
}

/* ---------- CV data generation — used by "Scan CV → Build profile" in manual mode ---------- */

var UNIVERSITIES = ['LUMS', 'NUST', 'FAST-NUCES', 'Bahria University', 'UET Lahore', 'COMSATS', 'IBA Karachi', 'GIKI'];
var SKILL_TRACKS = {
  frontend: { degree:'Computer Science', skills:['HTML','CSS','JavaScript','React','Git','Responsive Design','Tailwind CSS','TypeScript'], sources:['a campus web dev club', 'a freelance client project', 'a university hackathon team'] },
  backend:  { degree:'Computer Science', skills:['Node.js','Python','SQL','REST APIs','PostgreSQL','Django','Docker','Java'], sources:['a university systems lab', 'a backend coursework project', 'a part-time developer role'] },
  data:     { degree:'Data Science', skills:['Python','pandas','scikit-learn','SQL','Data Visualization','PyTorch','NumPy','Excel'], sources:['a research lab', 'a Kaggle competition team', 'a university AI club'] },
  support:  { degree:'Business Administration', skills:['Customer Communication','CRM Tools','Conflict Resolution','Ticketing Systems','Email Etiquette','Multitasking'], sources:['a retail customer service role', 'a call center internship', 'a campus help desk'] },
  general:  { degree:'General Studies', skills:['Communication','Teamwork','Problem Solving','Microsoft Office','Time Management'], sources:['a part-time role', 'a student organization', 'a volunteer project'] }
};
function trackForRole(label){
  var l = label.toLowerCase();
  if (l.indexOf('front') > -1 || l.indexOf('ui') > -1 || l.indexOf('design') > -1) return 'frontend';
  if (l.indexOf('back') > -1 || l.indexOf('server') > -1 || l.indexOf('api') > -1) return 'backend';
  if (l.indexOf('ai') > -1 || l.indexOf('ml') > -1 || l.indexOf('data') > -1) return 'data';
  if (l.indexOf('support') > -1 || l.indexOf('customer') > -1) return 'support';
  return 'general';
}
function pickSkills(track, seed, n){
  var picks = [];
  for (var k = 0; picks.length < n && k < track.skills.length * 2; k++){
    var s = track.skills[(seed + k * 3) % track.skills.length];
    if (picks.indexOf(s) === -1) picks.push(s);
  }
  return picks;
}
function buildApplicantCvData(name, roleLabel, seed){
  var track = SKILL_TRACKS[trackForRole(roleLabel)];
  var uni = UNIVERSITIES[seed % UNIVERSITIES.length];
  var gradYear = 2024 + (seed % 3);
  var skills = pickSkills(track, seed, 4);
  var source = track.sources[seed % track.sources.length];
  return {
    education: 'BS ' + track.degree + ' — ' + uni + ', Class of ' + gradYear,
    experience: 'Hands-on experience through ' + source + ', with coursework directly relevant to ' + roleLabel + '.',
    skills: skills,
    summary: name.split(' ')[0] + ' is a ' + gradYear + ' ' + track.degree + ' candidate from ' + uni + ' applying for ' + roleLabel + ', with practical exposure to ' + skills.slice(0, 2).join(' and ') + '.'
  };
}
function buildFullCvText(name, roleLabel, seed, city){
  var track = SKILL_TRACKS[trackForRole(roleLabel)];
  var uni = UNIVERSITIES[seed % UNIVERSITIES.length];
  var gradYear = 2024 + (seed % 3);
  var skills = pickSkills(track, seed, 5);
  var email = name.toLowerCase().replace(' ', '.') + '@gmail.com';
  var phone = '+92 3' + (10000000 + (seed * 7919) % 90000000);
  var source = track.sources[seed % track.sources.length];
  return name.toUpperCase() + '\n' + city + ', Pakistan  ·  ' + email + '  ·  ' + phone + '\n\n' +
    'EDUCATION\n' + uni + ' — BS ' + track.degree + ', Class of ' + gradYear + '\n\n' +
    'EXPERIENCE\n' +
    '— Contributed to ' + source + ', applying ' + skills[0] + ' and ' + skills[1] + ' in a real project setting.\n' +
    '— Completed coursework and independent projects directly relevant to the ' + roleLabel + ' role.\n\n' +
    'SKILLS\n' + skills.join(', ') + '\n\n' +
    'PROJECTS\n' +
    '— Built a personal project applying ' + skills[2] + ', shared publicly on GitHub.\n\n' +
    'Applying for: ' + roleLabel;
}

function publishBatch(){
  var nameInput = document.getElementById('newBatchNameInput');
  var batchName = (nameInput && nameInput.value.trim()) || 'New Hiring Batch';

  var roles = [];
  document.querySelectorAll('#screen-create-batch .rolerow-block').forEach(function(block, i){
    var titleInput = block.querySelector('.rolerow input.searchbox');
    var posInput = block.querySelector('.rolerow input.threshold-input');
    var jdArea = block.querySelector('.jd-textarea');
    var title = (titleInput && titleInput.value.trim()) || ('Role ' + (i + 1));
    var positions = parseInt(posInput && posInput.value, 10) || 1;
    roles.push({
      key: 'r' + i,
      label: title,
      positions: positions,
      jd: (jdArea && jdArea.value.trim()) || ('Open role: ' + title + '.'),
      applicants: []
    });
  });
  if (!roles.length) roles = [{ key:'r0', label:'General Applicant', positions:1, jd:'General application.', applicants:[] }];

  var TOTAL_APPLICANTS = 100;
  var weightSum = roles.reduce(function(s, r){ return s + r.positions; }, 0);
  var seed = 0;
  var assignedSoFar = 0;
  roles.forEach(function(r, i){
    var count = (i === roles.length - 1)
      ? (TOTAL_APPLICANTS - assignedSoFar)
      : Math.max(1, Math.round(TOTAL_APPLICANTS * (r.positions / weightSum)));
    assignedSoFar += count;
    for (var n = 0; n < count; n++){
      seed++;
      var name = generateApplicantName(seed);
      var city = CITIES[seed % CITIES.length];
      var hasFullCv = n < 2;
      r.applicants.push({
        id: r.key + '_' + n,
        name: name,
        city: city,
        status: 'pending',
        resume: name.split(' ')[0] + ' applied for ' + r.label + '. Résumé and CV are on file — open this profile to read it before deciding.',
        cv: buildApplicantCvData(name, r.label, seed),
        scanned: false,
        hasFullCv: hasFullCv,
        fullCvText: hasFullCv ? buildFullCvText(name, r.label, seed, city) : null
      });
    }
  });

  CUSTOM_BATCH = { key:'custom', name: batchName, roles: roles };
  BATCH_SETTINGS.custom = { label: batchName, aiEnabled: false };
  BATCH_ROLES.custom = roles.map(function(r){
    return { key: r.key, label: r.label, questions: ['(no interview questions set yet — this batch is running manually)'] };
  });

  addCustomBatchCard();
  goBatchCustom();
  refreshBatchUI();
  showToast('<b>' + batchName + ' published.</b> ' + TOTAL_APPLICANTS + ' applicants generated across ' + roles.length + ' role' + (roles.length > 1 ? 's' : '') + ' — running in manual mode so you can screen them yourself. Turn Preplify Intelligence on for this batch any time from Settings.');
}

function addCustomBatchCard(){
  var grid = document.querySelector('.batchgrid');
  var createCard = grid.querySelector('.batchcard-create');
  var existing = document.getElementById('customBatchCard');
  if (existing) existing.remove();

  var totalApplied = CUSTOM_BATCH.roles.reduce(function(s, r){ return s + r.applicants.length; }, 0);
  var totalPositions = CUSTOM_BATCH.roles.reduce(function(s, r){ return s + r.positions; }, 0);
  var chips = CUSTOM_BATCH.roles.map(function(r){ return '<span class="rolechip">' + r.label + ' <b>' + r.positions + '</b></span>'; }).join('');

  var card = document.createElement('div');
  card.className = 'batchcard';
  card.id = 'customBatchCard';
  card.onclick = goBatchCustom;
  card.innerHTML =
    '<div class="batchcard-top">' +
      '<div><div class="bc-name">' + CUSTOM_BATCH.name + '</div><div class="bc-meta">JUST PUBLISHED · APPLICATIONS OPEN</div></div>' +
      '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">' +
        '<span class="status-pill status-pill--brand">Stage 1 — Applications Open</span>' +
        '<span class="manual-chip" data-batch="custom">🤝 Manual</span>' +
      '</div>' +
    '</div>' +
    '<div class="rolechips">' + chips + '</div>' +
    '<div class="bc-progress"><div class="bc-progress-fill" style="width:8%;"></div></div>' +
    '<div class="bc-foot"><span class="mono">' + totalApplied + '</span> applications so far · target <span class="mono">' + totalPositions + '</span> hires</div>';
  grid.insertBefore(card, createCard);
}

function goBatchCustom(){
  if (!CUSTOM_BATCH) return;
  var b = CUSTOM_BATCH;
  document.getElementById('customBatchCrumb').innerHTML = '<button onclick="goBatches()">Hiring</button><span class="sep">/</span><span class="current">' + b.name + '</span>';
  document.getElementById('customBatchTimeline').innerHTML =
    '<div class="tl-step active"><div class="tl-dot">1</div><div class="tl-label">Applications<br>Open</div><div class="tl-date">Started today</div></div>' +
    '<div class="tl-line"></div>' +
    '<div class="tl-step"><div class="tl-dot">2</div><div class="tl-label">Interviewing</div><div class="tl-date">Not yet</div></div>' +
    '<div class="tl-line"></div>' +
    '<div class="tl-step"><div class="tl-dot">3</div><div class="tl-label">Final Review</div><div class="tl-date">Not yet</div></div>' +
    '<div class="tl-line"></div>' +
    '<div class="tl-step"><div class="tl-dot">4</div><div class="tl-label">Closed</div><div class="tl-date">Not yet</div></div>';

  var totalApplied = b.roles.reduce(function(s, r){ return s + r.applicants.length; }, 0);
  document.getElementById('customBatchInfo').innerHTML =
    '<div class="infoitem"><div class="il">Hiring manager</div><div class="iv">Sara Ahmed</div></div>' +
    '<div class="infoitem"><div class="il">Department</div><div class="iv">Multiple</div></div>' +
    '<div class="infoitem"><div class="il">Applicants so far</div><div class="iv mono">' + totalApplied + '</div></div>' +
    '<div class="infoitem"><div class="il">Mode</div><div class="iv">🤝 Manual — screened by you</div></div>';

  document.getElementById('customBatchRoles').innerHTML = b.roles.map(function(r){
    var pending = r.applicants.filter(function(a){ return a.status === 'pending'; }).length;
    var shortlisted = r.applicants.filter(function(a){ return a.status === 'shortlisted'; }).length;
    var rejected = r.applicants.filter(function(a){ return a.status === 'rejected'; }).length;
    return '<div class="rolecard rolecard-click" onclick="goCustomRoleApplicants(\'' + r.key + '\')">' +
      '<div class="rc-head"><span class="rc-name">' + r.label + ' <span class="mono" style="color:var(--ink-faint);font-weight:400;">· ' + r.positions + ' positions</span></span><span class="mono" style="color:var(--ink-soft);">' + r.applicants.length + ' applied</span></div>' +
      '<div class="ss-legend" style="margin-top:8px;"><span><i style="background:var(--ink-faint);"></i>' + pending + ' pending review</span><span><i style="background:var(--success-fg);"></i>' + shortlisted + ' shortlisted</span><span><i style="background:var(--danger-fg);"></i>' + rejected + ' rejected</span></div>' +
    '</div>';
  }).join('');

  var allApplicants = [];
  b.roles.forEach(function(r){ allApplicants = allApplicants.concat(r.applicants); });
  var doneCount = allApplicants.filter(function(a){ return a.scanned; }).length;
  updateProfileBuildProgress(doneCount, allApplicants.length);
  var buildBtn = document.getElementById('buildAllBtn');
  buildBtn.disabled = false;
  buildBtn.textContent = (doneCount === allApplicants.length) ? '✓ All profiles built' : '🗂 Build all profiles →';

  show('screen-batch-custom', b.name, 'Stage 1 — Applications Open · running manually · ' + totalApplied + ' applicants', 'nav-hiring');
  syncCrumb('screen-batch-custom');
}

/* ---------- bulk "Build all profiles" — treats CV scanning as its own completable stage ---------- */

function updateProfileBuildProgress(done, total){
  var pct = total ? Math.round(done / total * 100) : 0;
  var fill = document.getElementById('profileBuildFill');
  if (fill) fill.style.width = pct + '%';
  var status = document.getElementById('profileBuildStatus');
  if (status) status.textContent = done + ' of ' + total + ' profiles built';
}

function buildAllProfiles(){
  if (!CUSTOM_BATCH) return;
  var all = [];
  CUSTOM_BATCH.roles.forEach(function(r){ all = all.concat(r.applicants); });
  var total = all.length;
  var alreadyDone = all.filter(function(a){ return a.scanned; }).length;
  if (alreadyDone === total){
    showToast('<b>All ' + total + ' profiles are already built.</b> Every applicant in this batch has a standard profile ready to review.');
    return;
  }

  var btn = document.getElementById('buildAllBtn');
  btn.disabled = true;
  btn.textContent = 'Building profiles…';
  var chunkSize = Math.max(1, Math.ceil(total / 12));

  var timer = setInterval(function(){
    var remaining = all.filter(function(a){ return !a.scanned; });
    remaining.slice(0, chunkSize).forEach(function(a){ a.scanned = true; });
    var done = all.filter(function(a){ return a.scanned; }).length;
    updateProfileBuildProgress(done, total);

    if (done >= total){
      clearInterval(timer);
      btn.disabled = false;
      btn.textContent = '✓ All profiles built';

      if (currentCustomRoleKey && document.getElementById('screen-batch-custom-applicants').classList.contains('visible')){
        renderCustomRoleRows();
      }
      if (currentCustomProfileId && document.getElementById('screen-batch-custom-profile').classList.contains('visible')){
        var found = findCustomApplicant(currentCustomProfileId);
        if (found) renderCvProfile(found.applicant);
      }
      showToast('<b>' + total + ' candidate profiles built.</b> Every applicant in ' + CUSTOM_BATCH.name + ' now has a standard profile — ready for you to review and shortlist.');
    }
  }, 150);
}

function goCustomRoleApplicants(roleKey){
  currentCustomRoleKey = roleKey;
  var role = CUSTOM_BATCH.roles.filter(function(r){ return r.key === roleKey; })[0];
  document.getElementById('customRoleCrumb').innerHTML = '<button onclick="goBatches()">Hiring</button><span class="sep">/</span><button onclick="goBatchCustom()">' + CUSTOM_BATCH.name + '</button><span class="sep">/</span><span class="current">' + role.label + '</span>';
  document.getElementById('customRoleCount').textContent = role.applicants.length + ' applicants for ' + role.label + ' — click any of them to review manually';
  renderCustomRoleRows();
  show('screen-batch-custom-applicants', role.label + ' — Applicants', CUSTOM_BATCH.name + ' · manual review', 'nav-hiring');
  syncCrumb('screen-batch-custom-applicants');
}

function renderCustomRoleRows(){
  var role = CUSTOM_BATCH.roles.filter(function(r){ return r.key === currentCustomRoleKey; })[0];
  document.getElementById('customRoleRows').innerHTML = role.applicants.map(function(a){
    var clip = a.hasFullCv ? '<span class="cv-clip" title="Full mock CV on file">📎</span>' : '';
    var badge = a.scanned ? '<span class="cv-badge">Profile built</span>' : '';
    return '<tr class="rowhover" onclick="openCustomProfile(\'' + a.id + '\')"><td class="namecell">' + clip + a.name + '</td><td class="rolecell">' + a.city + '</td><td>' + CUSTOM_ROW_PILL[a.status] + badge + '</td><td><button class="viewlink">View →</button></td></tr>';
  }).join('');
}

function findCustomApplicant(id){
  for (var i = 0; i < CUSTOM_BATCH.roles.length; i++){
    var role = CUSTOM_BATCH.roles[i];
    for (var j = 0; j < role.applicants.length; j++){
      if (role.applicants[j].id === id) return { applicant: role.applicants[j], role: role };
    }
  }
  return null;
}

function openCustomProfile(id){
  currentCustomProfileId = id;
  var found = findCustomApplicant(id);
  var a = found.applicant, role = found.role;
  document.getElementById('customProfileToast').classList.remove('show');
  document.getElementById('customProfileCrumb').innerHTML = '<button onclick="goBatches()">Hiring</button><span class="sep">/</span><button onclick="goBatchCustom()">' + CUSTOM_BATCH.name + '</button><span class="sep">/</span><button onclick="goCustomRoleApplicants(\'' + role.key + '\')">' + role.label + '</button><span class="sep">/</span><span class="current">' + a.name + '</span>';
  document.getElementById('customProfileInitials').textContent = a.name.split(' ').map(function(w){ return w[0]; }).join('').slice(0,2).toUpperCase();
  document.getElementById('customProfileName').textContent = a.name;
  document.getElementById('customProfileRoleLine').textContent = role.label + ' applicant · ' + a.city + ' · ' + CUSTOM_BATCH.name;
  document.getElementById('customProfileStatusPill').outerHTML = CUSTOM_STATUS_PILL[a.status];
  document.getElementById('customProfileResume').textContent = a.resume;

  var viewCvBtn = document.getElementById('viewOriginalCvBtn');
  var cvBox = document.getElementById('originalCvBox');
  cvBox.style.display = 'none';
  if (a.hasFullCv){
    viewCvBtn.style.display = 'inline-flex';
    viewCvBtn.textContent = '📎 View original CV';
    cvBox.textContent = a.fullCvText;
  } else {
    viewCvBtn.style.display = 'none';
    cvBox.textContent = '';
  }

  renderCvProfile(a);

  var emailBtn = '<button class="btn btn-line" onclick="alert(\'Would open an email composer addressed to ' + a.name + '.\')">✉ Email candidate</button>';
  var actions;
  if (a.status === 'pending'){
    actions = emailBtn + '<button class="btn btn-danger-ghost" onclick="customProfileAction(\'rejected\')">Reject</button><button class="btn btn-primary" onclick="customProfileAction(\'shortlisted\')">Shortlist →</button>';
  } else if (a.status === 'shortlisted'){
    actions = emailBtn + '<button class="btn btn-danger-ghost" onclick="customProfileAction(\'rejected\')">Move to rejected</button><span class="mono" style="align-self:center;color:var(--ink-faint);font-size:12px;">Shortlisted — ready for the next stage</span>';
  } else {
    actions = emailBtn + '<button class="btn btn-primary" onclick="customProfileAction(\'shortlisted\')">Shortlist anyway →</button><span class="mono" style="align-self:center;color:var(--ink-faint);font-size:12px;">Rejected</span>';
  }
  document.getElementById('customProfileActions').innerHTML = actions;

  show('screen-batch-custom-profile', a.name, role.label + ' · Applicant, ' + CUSTOM_BATCH.name, 'nav-hiring');
  syncCrumb('screen-batch-custom-profile');
}

function customProfileAction(newStatus){
  var found = findCustomApplicant(currentCustomProfileId);
  found.applicant.status = newStatus;
  var msg = newStatus === 'shortlisted'
    ? '<b>' + found.applicant.name + ' shortlisted.</b> Moves forward once you\'re done reviewing this role.'
    : '<b>' + found.applicant.name + ' rejected.</b> Stays on file — you can still shortlist them anyway later.';
  openCustomProfile(currentCustomProfileId);
  document.getElementById('customProfileToastMsg').innerHTML = msg;
  document.getElementById('customProfileToast').classList.add('show');
}

/* ---------- "Scan CV → Build profile" — manual-mode CV parsing simulation ---------- */

function scanCandidateCv(){
  var found = findCustomApplicant(currentCustomProfileId);
  var a = found.applicant;
  if (a.scanned){ renderCvProfile(a); return; }
  var btn = document.getElementById('scanCvBtn');
  btn.disabled = true;
  document.getElementById('cvProfileBody').innerHTML = '<div class="cv-scanning"><span class="dotpulse"></span>Scanning résumé and building a standard profile…</div>';
  setTimeout(function(){
    a.scanned = true;
    btn.disabled = false;
    renderCvProfile(a);
    renderCustomRoleRows();
  }, 700);
}

function renderCvProfile(a){
  var btn = document.getElementById('scanCvBtn');
  if (!a.scanned){
    document.getElementById('cvProfileBody').innerHTML = '<p style="margin:0;color:var(--ink-faint);font-size:12.5px;">Not scanned yet — click "Scan CV" to extract a standard profile from this candidate\'s résumé.</p>';
    btn.textContent = '📄 Scan CV → Build profile';
    return;
  }
  btn.textContent = '🔄 Re-scan CV';
  var chips = a.cv.skills.map(function(s){ return '<span class="chip match">' + s + '</span>'; }).join('');
  document.getElementById('cvProfileBody').innerHTML =
    '<div class="cv-profile-grid">' +
      '<div class="infoitem"><div class="il">Education</div><div class="iv" style="font-weight:400;font-size:13px;">' + a.cv.education + '</div></div>' +
      '<div class="infoitem"><div class="il">Experience</div><div class="iv" style="font-weight:400;font-size:13px;">' + a.cv.experience + '</div></div>' +
    '</div>' +
    '<div class="il" style="margin:14px 0 6px;font-family:var(--font-mono);font-size:9.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-faint);">Skills</div>' +
    '<div class="chiprow">' + chips + '</div>' +
    '<p style="font-size:13px;color:var(--ink-soft);margin:12px 0 0;">' + a.cv.summary + '</p>';
}

function toggleOriginalCv(){
  var box = document.getElementById('originalCvBox');
  box.style.display = (box.style.display === 'none' || !box.style.display) ? 'block' : 'none';
}

/* ---------------------------------------------------------------
   Connect Platforms — job board connections. Each platform's
   "mode" reflects the actual access model researched for it:
     auto        — no connection needed (Google for Jobs)
     connect     — a direct Preplify-owned integration (Indeed, ZipRecruiter)
     bundled     — comes free with another platform's connection (Glassdoor via Indeed)
     byo         — customer must bring their own distributor subscription (LinkedIn)
     pending     — access depends on a direct business conversation (Rozee.pk, Bayt.com)
     notplanned  — not being built right now (Monster, CareerBuilder)
   --------------------------------------------------------------- */

var PLATFORMS = [
  { key:'google',       name:'Google for Jobs', color:'#0F7A45', initial:'G', mode:'auto',
    desc:'Automatic — every application form page is already structured for it. Nothing to connect.' },
  { key:'indeed',        name:'Indeed',          color:'#2557A7', initial:'in', mode:'connect', connected:false,
    desc:'Direct integration — posting to Indeed also covers Glassdoor automatically, at no extra step.' },
  { key:'glassdoor',     name:'Glassdoor',       color:'#0CAA41', initial:'G', mode:'bundled', bundledWith:'indeed',
    desc:'Included automatically once Indeed is connected — there is no separate Glassdoor step.' },
  { key:'zip',           name:'ZipRecruiter',    color:'#00A9E0', initial:'Z', mode:'connect', connected:false,
    desc:'Direct integration, pending our own partner approval with ZipRecruiter.' },
  { key:'linkedin',      name:'LinkedIn',        color:'#0A66C2', initial:'in', mode:'byo', connected:false,
    desc:'LinkedIn\'s posting API is closed to new partners — reachable only through your own distributor subscription (e.g. Veritone Hire / Broadbean).' },
  { key:'rozee',         name:'Rozee.pk',        color:'#C4272B', initial:'R', mode:'pending', requested:false,
    desc:'Pakistan\'s largest job board. No public posting API — access is pending a direct conversation with their team.' },
  { key:'bayt',          name:'Bayt.com',        color:'#5B4FC4', initial:'B', mode:'pending', requested:false,
    desc:'Leading Gulf / Middle East board. No public posting API — access is pending a direct conversation with their team.' },
  { key:'monster',       name:'Monster',         color:'#6E46AE', initial:'M', mode:'notplanned',
    desc:'Lower priority for now — limited reach in our current markets.' },
  { key:'careerbuilder', name:'CareerBuilder',   color:'#2E9E5B', initial:'C', mode:'notplanned',
    desc:'Lower priority for now — limited reach in our current markets.' }
];

function goConnectPlatforms(){
  renderPlatforms();
  show('screen-connect-platforms', 'Connections', 'Where "Publish batch" can post automatically — shared across every batch', 'nav-connections');
  syncCrumb('screen-connect-platforms');
}

function renderPlatforms(){
  var list = document.getElementById('platformList');
  if (!list) return;
  list.innerHTML = PLATFORMS.map(function(p){ return renderPlatformCard(p); }).join('');
}

function renderPlatformCard(p){
  var badge = '', action = '', extra = '';
  if (p.mode === 'auto'){
    badge = '<span class="platform-badge auto">Always on</span>';
    action = '<span class="mono" style="font-size:11.5px;color:var(--ink-faint);">No setup needed</span>';
  } else if (p.mode === 'connect'){
    if (p.connected){
      badge = '<span class="platform-badge connected">Connected</span>';
      action = '<button class="btn btn-line" onclick="togglePlatformConnect(\'' + p.key + '\')">Disconnect</button>';
    } else {
      action = '<button class="btn btn-primary" onclick="togglePlatformConnect(\'' + p.key + '\')">Connect →</button>';
    }
  } else if (p.mode === 'bundled'){
    var parent = PLATFORMS.filter(function(x){ return x.key === p.bundledWith; })[0];
    if (parent && parent.connected){
      badge = '<span class="platform-badge connected">Connected via ' + parent.name + '</span>';
    } else {
      badge = '<span class="platform-badge bundled">Included with ' + (parent ? parent.name : 'another platform') + '</span>';
    }
    action = '<span class="mono" style="font-size:11.5px;color:var(--ink-faint);">Nothing to connect separately</span>';
  } else if (p.mode === 'byo'){
    if (p.connected){
      badge = '<span class="platform-badge connected">Your account connected</span>';
      action = '<button class="btn btn-line" onclick="togglePlatformConnect(\'' + p.key + '\')">Disconnect</button>';
    } else {
      action = '<button class="btn btn-primary" onclick="toggleByoPanel(\'' + p.key + '\')">Bring your own subscription →</button>';
      extra = '<div class="byo-panel" id="byoPanel-' + p.key + '" style="display:' + (openByoPanelKey === p.key ? 'block' : 'none') + ';">' +
        '<div class="t">Connect through your distributor account</div>' +
        '<div class="byo-choice">' +
          '<button class="btn btn-line" onclick="connectByo(\'' + p.key + '\')">I already have a Veritone Hire / Broadbean account →</button>' +
          '<button class="btn btn-ghost" onclick="alert(\'Would open Veritone Hire\\\'s sign-up page in a new tab. Pricing is quote-based — their sales team would follow up directly.\')">I need to create one</button>' +
        '</div>' +
      '</div>';
    }
  } else if (p.mode === 'pending'){
    if (p.requested){
      badge = '<span class="platform-badge pending">Request sent</span>';
      action = '<span class="mono" style="font-size:11.5px;color:var(--ink-faint);">We\'ll follow up once access is confirmed</span>';
    } else {
      badge = '<span class="platform-badge pending">Pending access</span>';
      action = '<button class="btn btn-line" onclick="requestPending(\'' + p.key + '\')">Request access →</button>';
    }
  } else {
    badge = '<span class="platform-badge notplanned">Not planned yet</span>';
    action = '<span class="mono" style="font-size:11.5px;color:var(--ink-faint);">—</span>';
  }

  return '<div class="platform-card">' +
    '<div class="platform-icon" style="background:' + p.color + ';">' + p.initial + '</div>' +
    '<div class="platform-mid"><div class="platform-name">' + p.name + badge + '</div><div class="platform-desc">' + p.desc + '</div></div>' +
    '<div class="platform-action">' + action + '</div>' +
    extra +
  '</div>';
}

function togglePlatformConnect(key){
  var p = PLATFORMS.filter(function(x){ return x.key === key; })[0];
  p.connected = !p.connected;
  renderPlatforms();
  renderWherePosted();
  showToast(p.connected
    ? '<b>' + p.name + ' connected.</b> New batches can post here automatically from now on.'
    : '<b>' + p.name + ' disconnected.</b> Future batches won\'t post here until it\'s reconnected.');
}

var openByoPanelKey = null;
function toggleByoPanel(key){
  openByoPanelKey = (openByoPanelKey === key) ? null : key;
  renderPlatforms();
}

function connectByo(key){
  var p = PLATFORMS.filter(function(x){ return x.key === key; })[0];
  p.connected = true;
  renderPlatforms();
  renderWherePosted();
  showToast('<b>' + p.name + ' connected through your own distributor account.</b> Preplify will send new batches to it — billing for that subscription stays between you and the distributor.');
}

function requestPending(key){
  var p = PLATFORMS.filter(function(x){ return x.key === key; })[0];
  p.requested = true;
  renderPlatforms();
  showToast('<b>Access requested for ' + p.name + '.</b> Our partnerships team will reach out to start that conversation.');
}

/* ---------- "Where it's posted" — reflects real connected-platform state on Create Batch ---------- */

function renderWherePosted(){
  var wrap = document.getElementById('wherePostedList');
  if (!wrap) return;
  wrap.innerHTML = PLATFORMS.filter(function(p){ return p.mode !== 'notplanned'; }).map(function(p){
    var available = p.mode === 'auto' || p.connected || (p.mode === 'bundled' && PLATFORMS.filter(function(x){ return x.key === p.bundledWith; })[0].connected);
    var checked = available ? 'checked' : '';
    var disabled = available ? '' : 'disabled';
    var note = available ? '' : '<span class="mono" style="font-size:11px;color:var(--ink-faint);">not connected</span>';
    return '<div class="wp-row' + (available ? '' : ' disabled') + '"><label><input type="checkbox" ' + checked + ' ' + disabled + '> ' + p.name + '</label>' + note + '</div>';
  }).join('');
}

document.addEventListener('DOMContentLoaded', refreshBatchUI);
