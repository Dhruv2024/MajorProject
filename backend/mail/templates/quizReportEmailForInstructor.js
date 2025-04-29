exports.quizReportEmailForInstructor = (
  instructorName,
  quizTitle,
  courseTitle,
  courseId,
  quizId,
  websiteUrl
) => {
  return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Quiz Report - ${quizTitle}</title>
        <style>
            body {
                background-color: #ffffff;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }

            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }

            .logo {
                max-width: 200px;
                margin-bottom: 20px;
            }

            .heading {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 20px;
                color: #1e40af; /* Tailwind blue-800 */
            }

            .body {
                font-size: 16px;
                margin-bottom: 20px;
            }

            .highlight {
                font-weight: bold;
                color: #000000;
            }

            .cta {
                display: inline-block;
                padding: 10px 20px;
                background-color: #FFD60A;
                color: #000000;
                text-decoration: none;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
                margin-top: 20px;
            }

            .support {
                font-size: 14px;
                color: #999999;
                margin-top: 20px;
            }
        </style>
    </head>
    
    <body>
        <div class="container">
            <a href="#"><img class="logo"
                src="https://i.ibb.co/b5D7Dwd3/Untitled-design.png" alt="EduSphere Logo"></a>

            <div class="heading">Quiz Completed: ${quizTitle}</div>

            <div class="body">
                <p>Dear ${instructorName},</p>
                <p>The quiz <span class="highlight">"${quizTitle}"</span> from your course <span class="highlight">"${courseTitle}"</span> has now ended.</p>
                <p>Students have submitted their responses and the quiz report is ready.</p>
                <p>You can now view detailed performance data for all participants.</p>

                <a class="cta" href="${websiteUrl}/quizResult/${courseId}/${quizId}">View Full Quiz Report</a>
            </div>

            <div class="support">
                If you have any questions, feel free to contact us at <a href="mailto:info@edusphere.com">info@edusphere.com</a>.
            </div>
        </div>
    </body>
    
    </html>`;
};
