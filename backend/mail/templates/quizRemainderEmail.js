exports.quizReminderEmail = (quizTitle, startTime, endTime, name) => {
  // Format start and end time as readable strings
  const start = new Date(startTime).toLocaleString();
  const end = new Date(endTime).toLocaleString();

  return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Quiz Reminder - ${quizTitle}</title>
        <style>
            body {
                background-color: #f4f4f4;
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
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
    
            .logo {
                max-width: 150px;
                margin-bottom: 20px;
            }
    
            .message {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 20px;
                text-align: center;
                color: #333333;
            }
    
            .body {
                font-size: 16px;
                margin-bottom: 20px;
                text-align: center;
            }
    
            .highlight {
                font-weight: bold;
                color: #FFD60A;
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
                text-align: center;
            }
    
            .time-info {
                font-weight: bold;
                color: #2C3E50;
            }
        </style>
    
    </head>
    
    <body>
        <div class="container">
            <a href="#"><img class="logo" src="https://i.ibb.co/b5D7Dwd3/Untitled-design.png" alt="EduSphere Logo"></a>
            <div class="message">Quiz Reminder: "${quizTitle}"</div>
            <div class="body">
                <p>Dear ${name},</p>
                <p>This is a friendly reminder that the quiz <span class="highlight">"${quizTitle}"</span> you are eligible for is about to begin.</p>
                <p>Here are the details:</p>
                <p class="time-info">Start Time: ${start}</p>
                <p class="time-info">End Time: ${end}</p>
                <p>Be sure to log in on time to take the quiz!</p>
                <a class="cta" href="#">Go to Quiz</a>
            </div>
            <div class="support">If you have any questions or need assistance, please feel free to reach out to us at <a href="mailto:support@yourplatform.com">support@yourplatform.com</a>. We're here to help!</div>
        </div>
    </body>
    
    </html>`;
};
