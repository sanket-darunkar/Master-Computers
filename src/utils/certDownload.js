/**
 * certDownload.js
 * ───────────────
 * Generates certificate HTML matching the AICIT and Typing certificate
 * PDFs and opens a new window pre-configured for PDF printing.
 *
 * Zero external dependencies — uses the browser's native print-to-PDF.
 * Works on desktop and mobile (Chrome, Safari, Firefox).
 *
 * Usage:
 *   downloadAicitCertificate(cert)
 *   downloadTypingCertificate(cert)
 */

/** Format ISO date to DD/MM/YYYY */
function fd(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return iso; }
}

/** Resolve photo to a usable src string */
function photoSrc(cert) {
  if (cert.photoData && cert.photoMimeType) {
    return `data:${cert.photoMimeType};base64,${cert.photoData}`;
  }
  return cert.studentPhotoUrl || '';
}

/** Open a new window, write HTML, trigger print */
function printWindow(html, filename) {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    alert('Pop-up blocked. Please allow pop-ups for this site and try again.');
    return;
  }
  win.document.write(html);
  win.document.close();
  // Give images/fonts a moment to load, then trigger print
  win.onload = () => {
    setTimeout(() => {
      win.focus();
      win.print();
      // Close the window after the print dialog is dismissed
      win.onafterprint = () => win.close();
    }, 400);
  };
}

/* ═══════════════════════════════════════════════════════════════
   1.  AICIT CERTIFICATE
   Reference: AICIT Certificate.pdf
   Blue gradient background, AICIT logo header, cursive typography,
   wave footer, grade system bar at bottom.
═══════════════════════════════════════════════════════════════ */
export function downloadAicitCertificate(cert) {
  const photo = photoSrc(cert);
  const name  = cert.studentName  || '';
  const course = cert.courseName  || '';
  const grade  = cert.grade       || '…………';
  const marks  = cert.marks       || '';
  const certNo = cert.certificateNumber || '';
  const issueDate = fd(cert.issueDate);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>AICIT Certificate – ${certNo}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Open+Sans:wght@400;600;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  @page{size:A4 portrait;margin:0;}
  body{
    width:210mm;height:297mm;
    font-family:'Open Sans',Arial,sans-serif;
    background: linear-gradient(160deg,#e8f4fd 0%,#cce8f8 40%,#a8d8f0 70%,#7ec8e3 100%);
    -webkit-print-color-adjust:exact;
    print-color-adjust:exact;
    color-adjust:exact;
    overflow:hidden;
    position:relative;
  }
  /* Wave decorations */
  .wave-top{
    position:absolute;top:0;left:0;right:0;height:120px;
    background:linear-gradient(135deg,#b0ddf5 0%,#7ec8e3 50%,#5bb8d4 100%);
    clip-path:ellipse(110% 100% at 50% 0%);
    opacity:0.7;
  }
  .wave-bottom{
    position:absolute;bottom:0;left:0;right:0;height:80px;
    background:linear-gradient(135deg,#5bb8d4 0%,#3498c4 50%,#2183a8 100%);
    clip-path:ellipse(110% 100% at 50% 100%);
  }
  .container{
    position:relative;z-index:2;
    width:100%;height:100%;
    display:flex;flex-direction:column;
    align-items:center;
    padding:12mm 16mm;
  }
  /* Header */
  .header{
    display:flex;align-items:center;justify-content:space-between;
    width:100%;margin-bottom:6mm;
  }
  .logo-left img,.logo-right img{height:50px;object-fit:contain;}
  .header-center{text-align:center;flex:1;padding:0 8mm;}
  .aicit-title{
    font-size:46pt;font-weight:900;letter-spacing:4px;
    color:#1a6fa0;
    text-shadow:2px 2px 0 #fff,3px 3px 0 rgba(0,0,0,0.1);
    line-height:1;
  }
  .aicit-sub{font-size:8pt;font-weight:700;color:#1a5a80;letter-spacing:2px;margin-top:2px;}
  /* Divider */
  .org-bar{
    background:#1a6fa0;color:#fff;
    width:100%;padding:5px 0;text-align:center;
    font-size:14pt;font-weight:800;letter-spacing:1px;
    margin-bottom:3mm;
  }
  .iso-note{font-size:9pt;font-weight:600;color:#1a5a80;margin-bottom:6mm;text-align:center;}
  /* Certificate word */
  .cert-word{
    font-family:'Dancing Script',cursive;
    font-size:52pt;color:#e8342a;
    line-height:1;margin-bottom:4mm;
  }
  .cert-certify{
    font-family:'Dancing Script',cursive;
    font-size:22pt;color:#333;
    margin-bottom:6mm;
  }
  /* Student name area */
  .name-box{
    border-bottom:2px solid #1a6fa0;
    min-width:280px;max-width:420px;
    text-align:center;margin-bottom:2mm;
    padding:2px 12px;
  }
  .name-text{font-size:22pt;font-weight:800;color:#1a3050;letter-spacing:1px;}
  /* Photo */
  .photo-box{
    width:70px;height:85px;
    border:2px solid #1a6fa0;
    overflow:hidden;
    display:flex;align-items:center;justify-content:center;
    background:#fff;
    position:absolute;right:16mm;top:56mm;
  }
  .photo-box img{width:100%;height:100%;object-fit:cover;}
  .photo-placeholder{font-size:7pt;color:#aaa;text-align:center;}
  /* Marks/grade area */
  .grade-line{
    font-family:'Dancing Script',cursive;
    font-size:18pt;color:#444;
    margin:3mm 0 1mm;text-align:center;
  }
  .awarded-line{
    font-family:'Dancing Script',cursive;
    font-size:18pt;color:#444;
    margin-bottom:4mm;text-align:center;
  }
  /* Course box */
  .course-box{
    border:2px solid #1a6fa0;border-radius:4px;
    padding:4px 20px;margin-bottom:4mm;
    font-size:13pt;font-weight:800;color:#1a3050;letter-spacing:0.5px;
    text-align:center;
  }
  /* Design credit */
  .design-line{font-size:9pt;font-style:italic;color:#555;margin-bottom:1mm;text-align:center;}
  .design-org{
    font-family:'Dancing Script',cursive;
    font-size:16pt;color:#e8342a;text-align:center;margin-bottom:1mm;
  }
  .design-iso{font-size:8pt;font-weight:700;color:#1a5a80;text-align:center;margin-bottom:6mm;}
  /* Cert number / date */
  .cert-meta{
    display:flex;justify-content:space-between;width:100%;
    margin-top:auto;margin-bottom:12mm;
    font-size:8pt;color:#555;
  }
  /* Signature area */
  .sig-area{
    display:flex;justify-content:flex-end;width:100%;
    margin-bottom:4mm;
  }
  .sig-block{text-align:center;}
  .sig-line{border-top:1.5px solid #333;width:120px;margin:0 auto 3px;}
  .sig-text{font-size:8pt;font-weight:800;color:#1a3050;line-height:1.4;}
  /* Grade system bar */
  .grade-bar{
    position:absolute;bottom:0;left:0;right:0;
    background:#1a6fa0;color:#fff;
    font-size:7pt;font-weight:700;
    padding:6px 10px;text-align:center;
    z-index:3;
  }
</style>
</head>
<body>
<div class="wave-top"></div>
<div class="wave-bottom"></div>

<div class="container">
  <!-- Header -->
  <div class="header">
    <div class="logo-left">
      <img src="https://mastercomputeracademy.netlify.app/images/master-computer-academy-icon.svg" alt="MCA" onerror="this.style.display='none'"/>
    </div>
    <div class="header-center">
      <div class="aicit-title">AICIT</div>
      <div class="aicit-sub">ALL INDIA COUNCIL FOR INFORMATION TECHNOLOGY</div>
    </div>
    <div class="logo-right">
      <!-- ISO 9001 seal placeholder -->
      <div style="width:56px;height:56px;border-radius:50%;border:3px solid #b8860b;display:flex;align-items:center;justify-content:center;flex-direction:column;background:#fff4d0;">
        <div style="font-size:7pt;font-weight:900;color:#8B6914;line-height:1.1;text-align:center;">ISO<br/>9001</div>
      </div>
    </div>
  </div>

  <!-- Photo box (absolute) -->
  <div class="photo-box">
    ${photo ? `<img src="${photo}" alt="Student"/>` : `<div class="photo-placeholder">Photo</div>`}
  </div>

  <!-- Org bar -->
  <div class="org-bar">ALL INDIA COUNCIL FOR INFORMATION TECHNOLOGY</div>
  <div class="iso-note">An ISO 9001 : 2015 Certified Organisation</div>

  <!-- Certificate word -->
  <div class="cert-word">Certificate</div>
  <div class="cert-certify">This is to certify that,</div>

  <!-- Student name -->
  <div class="name-box">
    <div class="name-text">${name}</div>
  </div>
  ${certNo ? `<div style="font-size:8pt;color:#555;margin-bottom:4mm;text-align:center;">Cert. No: <strong>${certNo}</strong></div>` : ''}

  <!-- Grade / award lines -->
  <div class="grade-line">has passed the prescribed examination with ………… Grade &nbsp;<strong style="font-family:'Open Sans';font-size:14pt;color:#e8342a;">${grade}</strong>&nbsp; …………</div>
  <div class="awarded-line">has been awarded the</div>

  <!-- Course -->
  <div class="course-box">${course || 'Certificate in Computer Application'}</div>

  <!-- Design credit -->
  <div class="design-line">Design and developed as per the standards of</div>
  <div class="design-org">All India Council For Information Technology</div>
  <div class="design-iso">An ISO 9001 : 2015 Certified Organisation</div>

  <!-- Cert meta -->
  <div class="cert-meta">
    ${issueDate ? `<span>Issue Date: ${issueDate}</span>` : '<span></span>'}
    ${marks ? `<span>Marks: ${marks}</span>` : '<span></span>'}
  </div>

  <!-- Signature -->
  <div class="sig-area">
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-text">EXAM EXECUTIVE<br/>ALL INDIA COUNCIL FOR<br/>INFORMATION TECHNOLOGY</div>
    </div>
  </div>
</div>

<!-- Grade bar -->
<div class="grade-bar">
  Grade System : A+ Excellent (85% to Above) &nbsp;A : Very Good (70% to 84%) &nbsp;B: Good (55% to 69%) &nbsp;C: Average (40% to 54%)
</div>

<script>
  window.onload = function() {
    document.title = 'AICIT_Certificate_${certNo.replace(/[^A-Za-z0-9-]/g, '_')}';
  };
</script>
</body>
</html>`;

  printWindow(html, `AICIT_Certificate_${certNo}`);
}

/* ═══════════════════════════════════════════════════════════════
   2.  COMPUTER BASED TYPING CERTIFICATE
   Reference: typing certificate.pdf
   Cream/gold border design, AICIT header, structured table layout.
═══════════════════════════════════════════════════════════════ */
export function downloadTypingCertificate(cert) {
  const photo  = photoSrc(cert);
  const name   = cert.studentName  || '';
  const course = cert.courseName   || '';
  const certNo = cert.certificateNumber || '';
  const grade  = cert.grade  || '';
  const marks  = cert.marks  || '';
  const issueDate = fd(cert.issueDate);
  const duration  = cert.duration || '';
  const institution = cert.institutionName || 'Master Computer Academy';

  // Try to parse WPM from course name (e.g. "30 W.P.M." or "40 WPM")
  const wpmMatch = course.match(/(\d+)\s*[Ww]\.?[Pp]\.?[Mm]\.?/);
  const wpm = wpmMatch ? wpmMatch[1] : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Typing Certificate – ${certNo}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Open+Sans:wght@400;600;700;800&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  @page{size:A4 portrait;margin:0;}
  body{
    width:210mm;height:297mm;
    font-family:'Open Sans',Arial,sans-serif;
    background:#fdf6e3;
    -webkit-print-color-adjust:exact;
    print-color-adjust:exact;
    color-adjust:exact;
    overflow:hidden;
    position:relative;
  }
  /* Gold ornamental border */
  .outer-border{
    position:absolute;inset:4mm;
    border:4px solid #b8860b;
    box-shadow:0 0 0 2px #daa520 inset,0 0 0 6px #fdf6e3 inset,0 0 0 8px #b8860b inset;
  }
  /* Corner ornaments */
  .corner{position:absolute;font-size:22pt;color:#b8860b;line-height:1;}
  .tl{top:5mm;left:5mm;} .tr{top:5mm;right:5mm;}
  .bl{bottom:5mm;left:5mm;} .br{bottom:5mm;right:5mm;}
  .container{
    position:relative;z-index:2;
    width:100%;height:100%;
    display:flex;flex-direction:column;
    align-items:center;
    padding:14mm 18mm 10mm;
  }
  /* Header */
  .header{
    display:flex;align-items:center;justify-content:space-between;
    width:100%;margin-bottom:5mm;
  }
  .logo-circle{
    width:60px;height:60px;border-radius:50%;
    border:2px solid #b8860b;
    display:flex;align-items:center;justify-content:center;
    background:#fff;overflow:hidden;
  }
  .logo-circle img{width:90%;object-fit:contain;}
  .header-center{text-align:center;flex:1;padding:0 6mm;}
  .aicit-gold{
    font-size:40pt;font-weight:900;letter-spacing:4px;
    color:#b8860b;
    text-shadow:1px 1px 0 rgba(0,0,0,0.15);
    line-height:1;
  }
  .aicit-gold-sub{font-size:7pt;color:#8B6914;letter-spacing:1.5px;margin-top:1px;}
  .iso-seal{
    width:55px;height:55px;border-radius:50%;
    border:2px solid #b8860b;background:#fff4d0;
    display:flex;align-items:center;justify-content:center;flex-direction:column;
  }
  .iso-seal-text{font-size:8pt;font-weight:900;color:#8B6914;text-align:center;line-height:1.2;}
  /* Org name */
  .org-name{
    color:#1a3a8a;font-size:13pt;font-weight:800;letter-spacing:0.5px;
    text-align:center;margin-bottom:1mm;
  }
  .org-iso{font-size:8pt;color:#555;text-align:center;margin-bottom:4mm;}
  /* Certificate title */
  .cert-title{
    font-size:22pt;font-weight:800;font-style:italic;
    color:#1a3a8a;text-align:center;margin-bottom:5mm;
  }
  /* Info table */
  .info-table{
    width:100%;border-collapse:collapse;margin-bottom:4mm;
  }
  .info-table th{
    border:1.5px solid #b8860b;padding:4px 6px;
    background:#fdf0c0;font-size:8pt;font-weight:800;
    color:#1a3050;text-align:center;
  }
  .info-table td{
    border:1.5px solid #b8860b;padding:6px;
    font-size:9pt;font-weight:700;color:#111;
    text-align:center;min-height:24px;
  }
  /* Certify line */
  .certify-row{
    display:flex;align-items:center;gap:6mm;
    width:100%;margin-bottom:4mm;
  }
  .certify-label{
    font-size:10pt;font-weight:800;font-style:italic;
    color:#1a3a8a;white-space:nowrap;
  }
  .certify-name-box{
    border:1.5px solid #b8860b;flex:1;padding:4px 8px;
    font-size:11pt;font-weight:800;color:#111;min-height:26px;
    background:#fff;
  }
  /* Photo box */
  .photo-box{
    width:72px;height:88px;
    border:2px solid #b8860b;
    overflow:hidden;display:flex;align-items:center;justify-content:center;
    background:#fff;
  }
  .photo-box img{width:100%;height:100%;object-fit:cover;}
  .photo-placeholder{font-size:6.5pt;color:#aaa;text-align:center;padding:2px;}
  /* Passed text */
  .passed-text{
    font-size:11pt;font-style:italic;font-weight:600;
    color:#333;text-align:center;line-height:1.5;margin-bottom:2mm;
  }
  .passed-course{font-style:italic;color:#1a3a8a;font-weight:700;}
  /* Held at row */
  .held-row{
    display:flex;justify-content:space-between;width:100%;
    font-size:9pt;color:#333;margin-bottom:3mm;
  }
  .held-item span{font-style:italic;}
  /* Marks table */
  .marks-table{
    width:100%;border-collapse:collapse;margin-bottom:6mm;
  }
  .marks-table th{
    border:1.5px solid #b8860b;padding:4px 6px;
    background:#fdf0c0;font-size:7.5pt;font-weight:800;color:#1a3050;text-align:center;
  }
  .marks-table td{
    border:1.5px solid #b8860b;padding:5px 6px;
    font-size:9pt;color:#111;text-align:center;min-height:28px;
  }
  /* Signature row */
  .sig-row{
    display:flex;justify-content:space-between;align-items:flex-end;
    width:100%;margin-top:auto;margin-bottom:4mm;
  }
  .sig-left{display:flex;align-items:flex-end;gap:6mm;}
  .sig-stamp{
    font-size:7.5pt;color:#555;line-height:1.5;
  }
  .logo-row{display:flex;align-items:center;gap:4mm;}
  .logo-small img{height:32px;object-fit:contain;}
  .sig-right{text-align:center;}
  .sig-scribble{
    font-family:'Dancing Script',cursive;
    font-size:20pt;color:#1a3a8a;line-height:1;margin-bottom:2px;
  }
  .sig-line{border-top:1.5px solid #333;width:100px;margin:0 auto 3px;}
  .sig-title{font-size:7.5pt;font-weight:800;color:#1a3050;line-height:1.4;text-align:center;}
  /* Grade bar */
  .grade-bar{
    width:100%;background:#fdf0c0;border:1.5px solid #b8860b;
    font-size:7.5pt;font-weight:700;color:#333;
    padding:4px 8px;text-align:center;margin-top:2mm;
  }
</style>
</head>
<body>
<div class="outer-border"></div>
<div class="corner tl">✦</div>
<div class="corner tr" style="transform:scaleX(-1)">✦</div>
<div class="corner bl" style="transform:scaleY(-1)">✦</div>
<div class="corner br" style="transform:scale(-1)">✦</div>

<div class="container">
  <!-- Header -->
  <div class="header">
    <div class="logo-circle">
      <img src="https://mastercomputeracademy.netlify.app/images/master-computer-academy-icon.svg" alt="MCA" onerror="this.style.display='none'"/>
    </div>
    <div class="header-center">
      <div class="aicit-gold">AICIT</div>
      <div class="aicit-gold-sub">ALL INDIA COUNCIL FOR INFORMATION TECHNOLOGY</div>
    </div>
    <div class="iso-seal">
      <div class="iso-seal-text">ISO<br/>9001</div>
    </div>
  </div>

  <div class="org-name">ALL INDIA COUNCIL FOR INFORMATION TECHNOLOGY</div>
  <div class="org-iso">An ISO 9001 : 2015 Certified Organization</div>

  <!-- Title -->
  <div class="cert-title">Computer Based Typing Examination</div>

  <!-- Info table + photo -->
  <div style="display:flex;gap:4mm;width:100%;margin-bottom:4mm;align-items:flex-start;">
    <table class="info-table" style="flex:1;">
      <thead><tr>
        <th>STUDENT ID</th>
        <th>CENTER CODE</th>
        <th>AUTHORISED TRAINING CENTRE (ATC) NAME</th>
      </tr></thead>
      <tbody><tr>
        <td>${certNo}</td>
        <td>14210808</td>
        <td>${institution}</td>
      </tr></tbody>
    </table>
    <div class="photo-box">
      ${photo ? `<img src="${photo}" alt="Student"/>` : `<div class="photo-placeholder">Photo</div>`}
    </div>
  </div>

  <!-- Certify -->
  <div class="certify-row">
    <div class="certify-label">THIS IS TO CERTIFY THAT WITHIN SIGNED</div>
    <div class="certify-name-box">${name}</div>
  </div>

  <!-- Passed text -->
  <div class="passed-text">
    has passed in the following subject of the<br/>
    <span class="passed-course">Computer Based Typing Examination</span><br/>
    <em style="font-size:8pt;color:#555;">Designed and Developed as per the Standards of all India Council for Information Technology</em>
  </div>

  <!-- Held at row -->
  <div class="held-row">
    <div class="held-item"><span>held at</span></div>
    <div class="held-item"><span>in the month of</span>&nbsp;&nbsp;${issueDate}</div>
    <div class="held-item"><span>in</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span>Centre</span></div>
    <div class="held-item"><span>Grade</span>&nbsp;&nbsp;<strong>${grade}</strong></div>
  </div>

  <!-- Marks table -->
  <table class="marks-table">
    <thead><tr>
      <th>NAME OF THE SUBJECT</th>
      <th>SPEED W.P.M.</th>
      <th>MAXIMUM MARKS</th>
      <th>MINIMUM MARKS</th>
      <th>MARKS OBTAINED</th>
    </tr></thead>
    <tbody><tr>
      <td>${course}</td>
      <td>${wpm}</td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>${marks}</td>
    </tr></tbody>
  </table>

  <!-- Signature row -->
  <div class="sig-row">
    <div class="sig-left">
      <div class="sig-stamp">
        Signature of the<br/>Head of the Institute<br/>with Institution Seal
      </div>
      <div class="logo-row">
        <div class="logo-small">
          <div style="width:36px;height:36px;background:#e8c88a;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:7pt;font-weight:900;color:#654;text-align:center;">EGAC</div>
        </div>
        <div class="logo-small">
          <div style="width:36px;height:36px;background:#3a5aaa;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:6pt;font-weight:900;color:#fff;text-align:center;line-height:1.1;">IAF<br/>MLA</div>
        </div>
        <div class="logo-small">
          <div style="width:36px;height:36px;background:#e8f4e8;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:5.5pt;font-weight:700;color:#286;text-align:center;line-height:1.1;">National<br/>Career<br/>Service</div>
        </div>
      </div>
    </div>
    <div class="sig-right">
      <div class="sig-scribble">Signature</div>
      <div class="sig-line"></div>
      <div class="sig-title">EXAM EXECUTIVE<br/>ALL INDIA COUNCIL FOR<br/>INFORMATION TECHNOLOGY</div>
    </div>
  </div>

  <!-- Grade bar -->
  <div class="grade-bar">
    GRADE System A+ 95% &amp; Above &nbsp;(A : 90% to 94%) &nbsp;(B : 85% to 89%) &nbsp;(C : 80% to 84%)
  </div>
</div>

<script>
  window.onload = function() {
    document.title = 'Typing_Certificate_${certNo.replace(/[^A-Za-z0-9-]/g, '_')}';
  };
</script>
</body>
</html>`;

  printWindow(html, `Typing_Certificate_${certNo}`);
}
