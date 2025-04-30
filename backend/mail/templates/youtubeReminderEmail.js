exports.youtubeReminderEmail = (
  courseName,
  sectionName,
  videoCallTitle,
  meetStartTime,
  meetUrl,
  name
) => {
  // Convert meetStartTime (in UTC) to IST
  const start = new Date(meetStartTime).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Format the IST start time as a readable string
  const capitalizeWords = (str) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };
  return `<!DOCTYPE html>
      <html>
      
      <head>
          <meta charset="UTF-8">
          <title>YouTube Class Reminder - ${videoCallTitle}</title>
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
              <div class="message">Video Call Reminder: "${videoCallTitle}"</div>
              <div class="body">
                  <p>Dear ${name},</p>
                  <p>This is a friendly reminder that your youtube live class for the course <span class="highlight">"${capitalizeWords(
                    courseName
                  )}", titled <span class="highlight">"${videoCallTitle}"</span> is about to begin.</p>
                  <p>Here are the details:</p>
                  <p class="time-info">Start Time (IST): ${start}</p>
                  <p>Be sure to join the video call on time!</p>
                  <a class="cta" href="${meetUrl}">Join Video Call</a>
              </div>
              <div class="support">If you have any questions or need assistance, please feel free to reach out to us at <a href="mailto:support@yourplatform.com">support@edusphere.com</a>. We're here to help!</div>
          </div>
      </body>
      
      </html>`;
};
