import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '465'),
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${options.to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendSalesTeamInvite(email: string, name: string, referralCode: string): Promise<void> {
    const html = `
      <h2>Welcome to VALYGO Sales Team!</h2>
      <p>Hi ${name},</p>
      <p>You have been added to the VALYGO Sales Team. Here are your details:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Referral Code:</strong> <code>${referralCode}</code></li>
      </ul>
      <p>Use your referral code to track your referrals and earn commissions.</p>
      <p>Login to your dashboard: <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/sales-dashboard">Sales Dashboard</a></p>
      <p>Best regards,<br>VALYGO Team</p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Welcome to VALYGO Sales Team',
      html,
    });
  }

  async sendMeetingInvite(
    email: string,
    meetingTitle: string,
    startTime: string,
    meetingLink: string
  ): Promise<void> {
    const html = `
      <h2>Meeting Invitation</h2>
      <p>You are invited to a meeting:</p>
      <ul>
        <li><strong>Title:</strong> ${meetingTitle}</li>
        <li><strong>Time:</strong> ${startTime}</li>
        <li><strong>Join Link:</strong> <a href="${meetingLink}">${meetingLink}</a></li>
      </ul>
      <p>See you there!</p>
      <p>Best regards,<br>VALYGO Team</p>
    `;

    await this.sendEmail({
      to: email,
      subject: `Meeting Invitation: ${meetingTitle}`,
      html,
    });
  }

  async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    const html = `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>VALYGO Team</p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
      <h2>Welcome to VALYGO Admin Dashboard!</h2>
      <p>Hi ${name},</p>
      <p>Your admin account has been created successfully.</p>
      <p>Login to your dashboard: <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login">Admin Dashboard</a></p>
      <p>Best regards,<br>VALYGO Team</p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Welcome to VALYGO Admin Dashboard',
      html,
    });
  }

  async sendDailyReport(email: string, stats: any): Promise<void> {
    const html = `
      <h2>Daily Report - ${new Date().toLocaleDateString()}</h2>
      <h3>Statistics</h3>
      <ul>
        <li><strong>Total Users:</strong> ${stats.totalUsers}</li>
        <li><strong>New Users Today:</strong> ${stats.newUsersToday}</li>
        <li><strong>Total Subscriptions:</strong> ${stats.totalSubscriptions}</li>
        <li><strong>New Subscriptions Today:</strong> ${stats.newSubscriptionsToday}</li>
        <li><strong>Total Transactions:</strong> ${stats.totalTransactions}</li>
        <li><strong>Revenue Today:</strong> $${stats.revenueToday}</li>
      </ul>
      <p>Best regards,<br>VALYGO Team</p>
    `;

    await this.sendEmail({
      to: email,
      subject: `Daily Report - ${new Date().toLocaleDateString()}`,
      html,
    });
  }
}

export default new EmailService();
