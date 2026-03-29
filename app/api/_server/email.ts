import { Resend } from "resend";

// ─── Resend client ────────────────────────────────────────────────────────────
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[email] RESEND_API_KEY not set — skipping email send");
    return null;
  }
  return new Resend(key);
}

// ─── Shared email chrome ──────────────────────────────────────────────────────
function wrapHtml(body: string, orgName: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#080d1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080d1a;min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#0d1120;border-radius:20px;border:1px solid #1e2a45;overflow:hidden;max-width:100%;">
          ${body}
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid #1e2a45;text-align:center;">
              <p style="color:#475569;font-size:11px;margin:0;line-height:1.6;">
                This email was sent by <strong style="color:#7c3aed;">${orgName}</strong> AI-HRMS Platform.<br/>
                If you did not expect this, contact your HR administrator.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function credentialsBox(email: string, password: string) {
  return `
<table width="100%" cellpadding="0" cellspacing="0"
  style="background:#080d1a;border:1px solid #1e2a45;border-radius:14px;overflow:hidden;margin-bottom:28px;">
  <tr>
    <td style="padding:22px 24px;">
      <div style="color:#7c3aed;font-size:10px;font-weight:700;letter-spacing:1.5px;
        text-transform:uppercase;margin-bottom:16px;">🔐 Login Credentials</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom:12px;">
            <div style="color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;
              letter-spacing:0.8px;margin-bottom:4px;">Email / Username</div>
            <div style="color:#f1f5f9;font-size:14px;font-weight:600;font-family:monospace;
              background:#0d1120;border:1px solid #1e2a45;border-radius:8px;padding:10px 14px;
              word-break:break-all;">${email}</div>
          </td>
        </tr>
        <tr>
          <td>
            <div style="color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;
              letter-spacing:0.8px;margin-bottom:4px;">Password</div>
            <div style="color:#34d399;font-size:16px;font-weight:700;font-family:monospace;
              background:#0d1120;border:1px solid #1e2a45;border-radius:8px;padding:10px 14px;
              letter-spacing:1px;">${password}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

function ctaButton(url: string, label = "Log In to HRMS →") {
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
  <tr>
    <td align="center">
      <a href="${url}"
        style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#06b6d4);
          color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;
          padding:14px 40px;border-radius:12px;letter-spacing:0.3px;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

// ─── Welcome Email (sent on employee creation) ────────────────────────────────
export async function sendWelcomeEmail(opts: {
  to: string;
  fullName: string;
  orgName: string;
  password: string;
  role: string;
  createdByName: string;
  appUrl?: string;
}): Promise<{ sent: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) return { sent: false, error: "Email service not configured" };

  const loginUrl = `${opts.appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/login`;
  const roleLabel = opts.role.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const body = `
    <!-- Header band -->
    <tr>
      <td style="background:linear-gradient(135deg,#7c3aed,#06b6d4);padding:36px 40px;text-align:center;">
        <div style="font-size:36px;margin-bottom:12px;">👋</div>
        <div style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">
          Welcome to ${opts.orgName}
        </div>
        <div style="color:rgba(255,255,255,0.75);font-size:13px;margin-top:6px;">
          Your AI-HRMS account is ready · ${roleLabel}
        </div>
      </td>
    </tr>
    <!-- Body -->
    <tr>
      <td style="padding:36px 40px;">
        <p style="color:#e2e8f0;font-size:15px;margin:0 0 8px;">
          Hi <strong style="color:#ffffff;">${opts.fullName}</strong>,
        </p>
        <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 24px;">
          <strong style="color:#c4b5fd;">${opts.createdByName}</strong> has created your workforce profile
          at <strong style="color:#c4b5fd;">${opts.orgName}</strong> as a
          <strong style="color:#34d399;">${roleLabel}</strong>.
          Use the credentials below to log in and start tracking your tasks and progress.
        </p>

        <!-- Role badge row -->
        <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            <td style="background:#7c3aed22;border:1px solid #7c3aed44;border-radius:10px;padding:10px 18px;">
              <span style="color:#c4b5fd;font-size:12px;font-weight:700;">Your Role: </span>
              <span style="color:#ffffff;font-size:12px;font-weight:700;">${roleLabel}</span>
            </td>
          </tr>
        </table>

        ${credentialsBox(opts.to, opts.password)}
        ${ctaButton(loginUrl)}

        <!-- Security note -->
        <table width="100%" cellpadding="0" cellspacing="0"
          style="background:#7c3aed11;border:1px solid #7c3aed33;border-radius:12px;">
          <tr>
            <td style="padding:14px 18px;">
              <p style="color:#c4b5fd;font-size:12px;margin:0;line-height:1.6;">
                ⚠️ <strong>Keep your credentials safe.</strong> This is a system-generated
                temporary password. Your admin can reset it from the Employees panel at any time.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;

  // In Resend test mode (no verified domain), we can only send to the Resend account email.
  // Use RESEND_TEST_TO to override the recipient for testing.
  const testTo = process.env.RESEND_TEST_TO;
  const recipient = testTo || opts.to;

  try {
    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: recipient,
      subject: `Welcome to ${opts.orgName} — Your HRMS Account is Ready${testTo ? ` [intended for ${opts.to}]` : ""}`,
      html: wrapHtml(body, opts.orgName),
      replyTo: "suryasriramamurthy2003@gmail.com",
    });

    if (result.error) {
      console.error("[email] Resend error:", result.error);
      return { sent: false, error: result.error.message };
    }
    console.info(`[email] Welcome email sent → ${recipient}${testTo ? ` (test mode, original: ${opts.to})` : ""} (id: ${result.data?.id})`);
    return { sent: true };
  } catch (err) {
    console.error("[email] sendWelcomeEmail failed:", err);
    return { sent: false, error: String(err) };
  }
}

// ─── Password Reset Email ─────────────────────────────────────────────────────
export async function sendPasswordResetEmail(opts: {
  to: string;
  fullName: string;
  orgName: string;
  newPassword: string;
  resetByName: string;
  appUrl?: string;
}): Promise<{ sent: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) return { sent: false, error: "Email service not configured" };

  const loginUrl = `${opts.appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/login`;

  const body = `
    <!-- Header band -->
    <tr>
      <td style="background:linear-gradient(135deg,#dc2626,#7c3aed);padding:36px 40px;text-align:center;">
        <div style="font-size:36px;margin-bottom:12px;">🔑</div>
        <div style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">
          Password Reset
        </div>
        <div style="color:rgba(255,255,255,0.75);font-size:13px;margin-top:6px;">
          ${opts.orgName} AI-HRMS
        </div>
      </td>
    </tr>
    <!-- Body -->
    <tr>
      <td style="padding:36px 40px;">
        <p style="color:#e2e8f0;font-size:15px;margin:0 0 8px;">
          Hi <strong style="color:#ffffff;">${opts.fullName}</strong>,
        </p>
        <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 24px;">
          <strong style="color:#c4b5fd;">${opts.resetByName}</strong> has reset your password
          on the <strong style="color:#c4b5fd;">${opts.orgName}</strong> HRMS platform.
          Your new login credentials are below.
        </p>

        ${credentialsBox(opts.to, opts.newPassword)}
        ${ctaButton(loginUrl, "Log In with New Password →")}

        <!-- Alert note -->
        <table width="100%" cellpadding="0" cellspacing="0"
          style="background:#dc262611;border:1px solid #dc262633;border-radius:12px;">
          <tr>
            <td style="padding:14px 18px;">
              <p style="color:#fca5a5;font-size:12px;margin:0;line-height:1.6;">
                🔒 <strong>Security alert:</strong> If you did not request this reset,
                contact your HR administrator immediately at ${opts.orgName}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;

  const testTo = process.env.RESEND_TEST_TO;
  const recipient = testTo || opts.to;

  try {
    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: recipient,
      subject: `[${opts.orgName}] Your HRMS password has been reset${testTo ? ` [intended for ${opts.to}]` : ""}`,
      html: wrapHtml(body, opts.orgName),
      replyTo: "suryasriramamurthy2003@gmail.com",
    });

    if (result.error) {
      console.error("[email] Resend error:", result.error);
      return { sent: false, error: result.error.message };
    }
    console.info(`[email] Password reset email sent → ${recipient}${testTo ? ` (test mode, original: ${opts.to})` : ""} (id: ${result.data?.id})`);
    return { sent: true };
  } catch (err) {
    console.error("[email] sendPasswordResetEmail failed:", err);
    return { sent: false, error: String(err) };
  }
}
