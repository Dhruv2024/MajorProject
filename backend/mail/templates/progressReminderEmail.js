exports.progressReminderEmail = (userName, progressSummaries, websiteUrl) => {
  const capitalizeWords = (str) => {
    return str
      .split(" ") // Split the string into words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
      .join(" "); // Join the words back together
  };
  const progressBlocks = progressSummaries
    .map((item) => {
      const percentage = item.percentage;
      return `
        <tr>
          <td style="padding: 10px 0;">
            <strong>${capitalizeWords(item.courseName)}</strong>
            <div class="progress-bar-container" style="background-color: #e0e0e0; border-radius: 10px; overflow: hidden; width: 100%; height: 20px; margin-top: 5px;">
              <div style="background-color: #4CAF50; width: ${percentage}%; height: 100%;">
                <div style="color: white; font-size: 12px; line-height: 20px; text-align: center;">${percentage}%</div>
              </div>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weekly Progress Update</title>
  <style>
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        padding: 10px !important;
      }
      .button {
        width: 100% !important;
        display: block !important;
      }
      .progress-bar-container {
        height: 16px !important;
      }
    }
  </style>
</head>
<body style="background-color: #ffffff; font-family: Arial, sans-serif; font-size: 16px; color: #333; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table class="email-container" width="600" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd;">
          <tr>
            <td align="center">
              <img src="https://i.ibb.co/DPKd2Qns/Untitled-design.png" alt="EduSphere Logo" width="200" style="margin-bottom: 20px; max-width: 100%;">
            </td>
          </tr>
          <tr>
            <td align="center" style="font-size: 22px; font-weight: bold; padding-bottom: 10px;">
              Keep Going, ${userName}! 💪
            </td>
          </tr>
          <tr>
            <td style="text-align: center; font-size: 16px; padding-bottom: 20px;">
              Here’s your current progress in your enrolled courses:
            </td>
          </tr>
          ${progressBlocks}
          <tr>
            <td align="center" style="padding-top: 20px;">
              <a href="${websiteUrl}" class="button" style="background-color: #FFD60A; color: #000000; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">
                Continue Learning
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="font-size: 14px; color: #999; padding-top: 30px;">
              Need help? Contact us at <a href="mailto:info@edusphere.com">info@edusphere.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
