const NewRequestTemplate = (
  UserFullName,
  TextParagraph,
  UserName,
  UserPassword,
  LoginLink,
  EventingClubLogo
) => {
  return `
    <!DOCTYPE html>
<html>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
      <tr>
        <td>
          <table align="center" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Logo Section -->
            <tr>
              <td align="center" style="padding: 20px;">
                <img src="${process.env.BACKEND_BASE_URL}/assets/Ypo_SouthAsia_Email_logo.png" alt="Your Logo" style="max-width: 150px; display: block;">
              </td>
            </tr>
            <!-- Content Section -->
            <tr>
              <td style="padding: 20px; text-align: left; line-height: 1.6; color: #333;">
                <p style="margin: 0 0 10px;">Hello,</p>
                <p style="margin: 0 0 10px;">A new request has been received</p>
                <p style="margin: 10px 0 0;">Please review the request at your earliest convenience.</p>
              </td>
            </tr>
            <!-- Button Section -->
            <tr>
              <td align="center" style="padding: 20px;">
                <a href="${process.env.ADMIN_PANEL_BASE_URL}/sp/dashboard/sarequests" style="display: inline-block; background-color: #007bff; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px; font-weight: bold;">Check Now</a>
              </td>
            </tr>
            <!-- Footer Section -->
            <tr>
              <td align="center" style="padding: 20px; font-size: 12px; color: #888;">
                <p style="margin: 0;">Thank you,</p>
                <p style="margin: 0;">YPO South Asia</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

export { NewRequestTemplate };
