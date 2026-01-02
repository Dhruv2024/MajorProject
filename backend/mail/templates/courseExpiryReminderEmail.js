exports.courseExpiryReminderEmail = (name, courseList) => {
  const capitalizeWords = (str) => {
    return str
      .split(" ") // Split the string into words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter
      .join(" "); // Join the words back together
  };
  const courseItems = courseList
    .map((course, index) => `<li> ${capitalizeWords(course)}</li>`)
    .join("\n");

  return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Course Expiry Reminder</title>
        <style>
            body {
                background-color: #f4f4f4;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.5;
                color: #333333;
                margin: 0;
                padding: 0;
            }
    
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
    
            .logo {
                max-width: 150px;
                display: block;
                margin: 0 auto 20px;
            }
    
            .header {
                text-align: center;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
                color: #2C3E50;
            }
    
            .content {
                text-align: center;
            }
  
            .highlight {
                color: #FFD60A;
                font-weight: bold;
            }
  
            ul {
                text-align: left;
                margin-top: 10px;
                padding-left: 20px;
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
    
            .footer {
                font-size: 14px;
                color: #999999;
                margin-top: 30px;
                text-align: center;
            }
        </style>
    </head>
    
    <body>
        <div class="container">
            <img class="logo" src="https://i.ibb.co/DPKd2Qns/Untitled-design.png" alt="EduSphere Logo">
            <div class="header">Course Expiry Notice</div>
            <div class="content">
                <p>Hi ${name},</p>
                <p>Just a quick reminder — the following course(s) you're enrolled in will <span class="highlight">expire in 15 days</span>:</p>
                <ul>${courseItems}</ul>
                <p>We recommend completing them soon to make the most of your learning journey.</p>
                <a class="cta" href="#">Go to My Courses</a>
            </div>
            <div class="footer">
                Need help? Contact us at 
                <a href="mailto:support@yourplatform.com">support@yourplatform.com</a>
            </div>
        </div>
    </body>
    
    </html>`;
};
