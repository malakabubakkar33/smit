export interface NewLessonEmailData {
  studentName: string;
  courseTitle: string;
  topicTitle: string;
  lessonTitle: string;
  lessonUrl: string;
  teacherName: string;
}

export const getNewLessonEmailTemplate = (data: NewLessonEmailData): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Lesson Available</title>
  <style>
    body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 0; color: #0F172A; }
    .container { max-width: 600px; margin: 30px auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #2563EB, #7C3AED); padding: 36px 30px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
    .body-content { padding: 32px 30px; }
    .greeting { font-size: 17px; font-weight: 600; margin-bottom: 12px; }
    .info-card { background: #EFF6FF; border-left: 4px solid #2563EB; border-radius: 8px; padding: 18px; margin: 20px 0; }
    .info-row { margin-bottom: 8px; font-size: 14px; }
    .info-label { font-weight: 600; color: #1E3A8A; display: inline-block; width: 80px; }
    .info-value { color: #1E293B; }
    .cta-container { text-align: center; margin: 30px 0 20px; }
    .btn { display: inline-block; background-color: #2563EB; color: #FFFFFF !important; font-weight: 600; font-size: 15px; padding: 14px 28px; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }
    .footer { background: #F1F5F9; padding: 20px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SMIT Web Class</h1>
      <p>Official Web Development Course Platform</p>
    </div>
    <div class="body-content">
      <div class="greeting">Hello ${data.studentName},</div>
      <p style="font-size: 15px; line-height: 1.5; color: #334155;">
        A new video lesson has just been uploaded by your instructor <strong>${data.teacherName}</strong>.
      </p>

      <div class="info-card">
        <div class="info-row"><span class="info-label">Course:</span> <span class="info-value"><strong>${data.courseTitle}</strong></span></div>
        <div class="info-row"><span class="info-label">Topic:</span> <span class="info-value">${data.topicTitle}</span></div>
        <div class="info-row"><span class="info-label">Lesson:</span> <span class="info-value" style="color: #2563EB; font-weight: 600;">${data.lessonTitle}</span></div>
      </div>

      <p style="font-size: 14px; color: #475569;">
        Keep up your momentum! Watch the tutorial, follow along with the code, and mark the lesson as completed to track your class progress.
      </p>

      <div class="cta-container">
        <a href="${data.lessonUrl}" class="btn">Open Lesson &rarr;</a>
      </div>
    </div>
    <div class="footer">
      &copy; 2026 SMIT Web Class. All rights reserved.<br>
      You are receiving this update because you are enrolled in the Web Development class.
    </div>
  </div>
</body>
</html>
  `.trim();
};
