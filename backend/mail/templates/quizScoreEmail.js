exports.quizScoreEmail = (
  quizTitle,
  userName,
  score,
  totalQuestions,
  websiteUrl
) => {
  return `<!DOCTYPE html>
      <html>
      
      <head>
          <meta charset="UTF-8">
          <title>Your Quiz Results</title>
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
      
              .message {
                  font-size: 18px;
                  font-weight: bold;
                  margin-bottom: 20px;
              }
      
              .body {
                  font-size: 16px;
                  margin-bottom: 20px;
              }
      
              .score {
                  font-size: 20px;
                  font-weight: bold;
                  color: #4CAF50;
                  margin-bottom: 20px;
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
      
              .highlight {
                  font-weight: bold;
              }
          </style>
      
      </head>
      
      <body>
          <div class="container">
              <a href="#"><img class="logo"
                  src="https://i.ibb.co/b5D7Dwd3/Untitled-design.png" alt="EduSphere Logo"></a>
              <div class="message">Your Quiz Results</div>
              <div class="body">
                  <p>Dear ${userName},</p>
                  <p>Thank you for participating in the <span class="highlight">"${quizTitle}"</span> quiz.</p>
                  <p>Your score for this quiz is: <span class="score">${score} / ${totalQuestions}</span></p>
                  <p>We hope you did well! For a detailed report on your performance, please visit your dashboard.</p>
                  <a class="cta" href="${websiteUrl}">Go to Your Dashboard</a>
              </div>
              <div class="support">If you have any questions or need assistance, feel free to contact us at <a
                  href="mailto:info@edusphere.com">info@edusphere.com</a>. We are here to help!</div>
          </div>
      </body>
      
      </html>`;
};
