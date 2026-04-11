// src/services/email.service.ts
import nodemailer from "nodemailer";
import { config } from "../config";

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    // Verify connection in development
    if (!config.isProduction) {
      this.transporter.verify((error, success) => {
        if (error) {
          console.log("⚠️ Erreur SMTP:", error);
        } else {
          console.log("✅ Serveur email prêt à envoyer des emails");
        }
      });
    }
  }

  async sendOTP(email: string, otp: string, userName: string): Promise<boolean> {
    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: `"HevGestion DSF" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Code de vérification - HevGestion DSF",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center; }
                .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
                .content { padding: 40px 30px; }
                .otp-box { background: #f8fafc; border: 2px dashed #2563eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                .otp-code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px; }
                .footer { background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔐 HevGestion DSF</h1>
                </div>
                <div class="content">
                  <h2 style="color: #1e293b; margin-top: 0;">Bonjour ${userName},</h2>
                  <p style="color: #475569; line-height: 1.6;">
                    Voici votre code de vérification pour accéder à votre compte HevGestion DSF.
                  </p>
                  <div class="otp-box">
                    <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">Votre code :</p>
                    <div class="otp-code">${otp}</div>
                  </div>
                  <p style="color: #64748b; font-size: 13px;">
                    Ce code expire dans <strong>10 minutes</strong>.
                  </p>
                  <p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">
                    Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email en toute sécurité.
                  </p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} HevGestion DSF - Tous droits réservés</p>
                </div>
              </div>
            </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ OTP email sent to ${email}`);
      return true;
    } catch (error) {
      console.error("❌ Erreur envoi OTP email:", error);
      return false;
    }
  }

  async sendPasswordResetOTP(email: string, otp: string, userName: string): Promise<boolean> {
    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: `"HevGestion DSF" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Code de réinitialisation de mot de passe - HevGestion DSF",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; text-align: center; }
                .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
                .content { padding: 40px 30px; }
                .otp-box { background: #fef2f2; border: 2px dashed #dc2626; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                .otp-code { font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 4px; }
                .footer { background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔑 HevGestion DSF</h1>
                </div>
                <div class="content">
                  <h2 style="color: #1e293b; margin-top: 0;">Bonjour ${userName},</h2>
                  <p style="color: #475569; line-height: 1.6;">
                    Vous avez demandé la réinitialisation de votre mot de passe HevGestion DSF.
                  </p>
                  <div class="otp-box">
                    <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">Votre code de réinitialisation :</p>
                    <div class="otp-code">${otp}</div>
                  </div>
                  <p style="color: #64748b; font-size: 13px;">
                    Ce code expire dans <strong>5 minutes</strong>.
                  </p>
                  <p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">
                    Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
                  </p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} HevGestion DSF - Tous droits réservés</p>
                </div>
              </div>
            </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Password reset OTP email sent to ${email}`);
      return true;
    } catch (error) {
      console.error("❌ Erreur envoi password reset OTP email:", error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, userName: string): Promise<boolean> {
    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: `"HevGestion DSF" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Bienvenue sur HevGestion DSF",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center; }
                .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
                .content { padding: 40px 30px; }
                .features { margin: 20px 0; }
                .feature { display: flex; align-items: center; margin: 15px 0; }
                .feature-icon { background: #eff6ff; color: #2563eb; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; }
                .footer { background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Bienvenue sur HevGestion DSF</h1>
                </div>
                <div class="content">
                  <h2 style="color: #1e293b; margin-top: 0;">Bonjour ${userName},</h2>
                  <p style="color: #475569; line-height: 1.6;">
                    Nous sommes ravis de vous accueillir sur HevGestion DSF ! Votre compte a été créé avec succès.
                  </p>
                  <div class="features">
                    <div class="feature">
                      <div class="feature-icon">📊</div>
                      <span style="color: #475569;">Génération automatique des états financiers DSF</span>
                    </div>
                    <div class="feature">
                      <div class="feature-icon">🏢</div>
                      <span style="color: #475569;">Gestion multi-sociétés et exercices</span>
                    </div>
                    <div class="feature">
                      <div class="feature-icon">📁</div>
                      <span style="color: #475569;">Import de balances et téléversement DGI</span>
                    </div>
                  </div>
                  <p style="color: #64748b; font-size: 13px; margin-top: 30px;">
                    Connectez-vous dès maintenant pour commencer à utiliser l'application.
                  </p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} HevGestion DSF - Tous droits réservés</p>
                </div>
              </div>
            </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      console.error("❌ Erreur envoi welcome email:", error);
      return false;
    }
  }
}

export const emailService = new EmailService();