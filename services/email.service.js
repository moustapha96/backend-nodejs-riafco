// const nodemailer = require("nodemailer")
// const prisma = require("../config/db")

// class EmailService {
//   constructor() {
//     this.transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: process.env.SMTP_PORT,
//       secure: process.env.SMTP_SECURE === "true",
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     })
//     this.transporter.verify().then(
//       () => console.log("SMTP ready"),
//       (err) => console.error("SMTP error:", err)
//     )
//   }

//   async sendEmail({ to, subject, html, text, attachments = [] }) {
//     try {
//       const mailOptions = {
//         from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
//         to,
//         subject,
//         html,
//         text,
//         attachments
//       }

//       const result = await this.transporter.sendMail(mailOptions)
//       console.log("Email sent successfully:", result.messageId)
//       return result
//     } catch (error) {
//       console.error("Failed to send email:", error)
//       throw error
//     }
//   }

//   async sendWelcomeEmail(user) {
//     const subject = "Welcome to RIAFCO!"
//     const html = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2>Welcome to RIAFCO, ${user.firstName}!</h2>
//         <p>Your account has been successfully created.</p>
//         <p>You can now access the RIAFCO backoffice system with your credentials.</p>
//         <p>If you have any questions, please don't hesitate to contact our support team.</p>
//         <br>
//         <p>Best regards,<br>The RIAFCO Team</p>
//       </div>
//     `

//     return this.sendEmail({
//       to: user.email,
//       subject,
//       html,
//       text: `Welcome to RIAFCO, ${user.firstName}! Your account has been successfully created.`,
//     })
//   }


//   async sendInvitationEmail(user, tempPassword, registerToken) {
//     const siteSettings = await prisma.siteSettings.findFirst();

//     const siteUrl = siteSettings?.siteUrl || "http://localhost:3000";
//     const siteName = siteSettings?.siteName || "RIAFCO";

//     const logoUrl = `${process.env.BACKEND_URL}/${siteSettings?.logo}` || "http://localhost:3000/logo.png";

//     const contactEmail = siteSettings?.contactEmail || "support@riafco.org";
//     const subject = `${siteName} - Activez votre compte`;

//     const activationLink = `${siteUrl}/auth/activate?email=${user.email}&token=${registerToken}`;

//     const html = `
//   <!DOCTYPE html>
//   <html lang="fr">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>${subject}</title>
//     <style>
//       body {
//         font-family: Arial, sans-serif;
//         line-height: 1.6;
//         color: #333;
//         max-width: 600px;
//         margin: 0 auto;
//         padding: 20px;
//       }
//       .header {
//         text-align: center;
//         padding: 20px 0;
//         border-bottom: 1px solid #eee;
//       }
//       .logo {
//         max-width: 150px;
//       }
//       .content {
//         padding: 20px 0;
//       }
//       .credentials {
//         background-color: #f9f9f9;
//         padding: 15px;
//         margin: 20px 0;
//         border-radius: 5px;
//         border-left: 4px solid #1e81b0;
//       }
//       .password {
//         font-size: 18px;
//         font-weight: bold;
//         color: #1e81b0;
//         letter-spacing: 1px;
//       }
//       .button {
//         display: inline-block;
//         background-color: #1e81b0;
//         color: white !important;
//         text-decoration: none;
//         padding: 12px 24px;
//         border-radius: 5px;
//         margin: 20px 0;
//         font-size: 16px;
//       }
//       .footer {
//         margin-top: 20px;
//         padding-top: 10px;
//         border-top: 1px solid #eee;
//         font-size: 12px;
//         color: #e28743;
//         text-align: center;
//       }
//     </style>
//   </head>
//   <body>
//     <div class="header">
//       <img src="${logoUrl}" alt="${siteName}" class="logo">
//       <h2>Bienvenue sur ${siteName}</h2>
//     </div>

//     <div class="content">
//       <p>Bonjour ${user.firstName},</p>
//       <p>Un compte vous a été créé sur la plateforme <strong>${siteName}</strong>. Pour finaliser votre inscription et activer votre compte, cliquez sur le bouton ci-dessous :</p>

//       <p style="text-align: center;">
//         <a href="${activationLink}" class="button">Activer mon compte</a>
//       </p>

//       <div class="credentials">
//         <p><strong>Adresse e-mail :</strong> ${user.email}</p>
//         <p><strong>Mot de passe temporaire :</strong> <span class="password">${tempPassword}</span></p>
//       </div>

//       <p><strong>Important :</strong> vous devrez changer votre mot de passe dès votre première connexion pour des raisons de sécurité.</p>

//       <p>Si vous rencontrez des difficultés, contactez-nous à : <a href="mailto:${contactEmail}">${contactEmail}</a>.</p>
//     </div>

//     <div class="footer">
//       <p>&copy; ${new Date().getFullYear()} ${siteName}. Tous droits réservés.</p>
//       <p>Cet e-mail a été envoyé automatiquement. Merci de ne pas y répondre.</p>
//     </div>
//   </body>
//   </html>
// `;

//     const text = `
//   Bonjour ${user.firstName},

//   Un compte vous a été créé sur la plateforme ${siteName}.

//   Pour activer votre compte, cliquez sur le lien suivant :
//   ${activationLink}

//   Identifiants temporaires :
//   - Adresse e-mail : ${user.email}
//   - Mot de passe temporaire : ${tempPassword}

//   Vous devrez modifier votre mot de passe dès votre première connexion.

//   En cas de problème, contactez-nous à ${contactEmail}.

//   L'équipe ${siteName}
// `;

//     return this.sendEmail({
//       to: user.email,
//       subject,
//       html,
//       text,
//     });
//   }


//   async sendPasswordResetEmail(user, resetToken) {
//     const siteSettings = await prisma.siteSettings.findFirst();
//     const siteName = siteSettings?.siteName || "RIAFCO";
//     const logoUrl = `${process.env.BACKEND_URL}/${siteSettings?.logo}` || "http://localhost:3000/logo.png";

//     const resetUrl = `${process.env.FRONTEND_URL}/auth/new-password?token=${resetToken}`;

//     const subject = `${siteName} - Réinitialisation de votre mot de passe`;

//     const html = `
//     <!DOCTYPE html>
//     <html lang="fr">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>${subject}</title>
//       <style>
//         body {
//           font-family: Arial, sans-serif;
//           line-height: 1.6;
//           color: #333;
//           max-width: 600px;
//           margin: 0 auto;
//           padding: 20px;
//         }
//         .header {
//           text-align: center;
//           padding: 20px 0;
//           border-bottom: 1px solid #eee;
//         }
//         .logo {
//           max-width: 150px;
//         }
//         .content {
//           padding: 20px 0;
//         }
//         .button {
//           display: inline-block;
//           background-color: #1e81b0;
//           color: white !important;
//           text-decoration: none;
//           padding: 12px 24px;
//           border-radius: 5px;
//           margin: 25px 0;
//           font-weight: bold;
//         }
//         .warning {
//           background-color: #fff3cd;
//           padding: 15px;
//           border-radius: 5px;
//           border-left: 4px solid #ffc107;
//           margin: 20px 0;
//         }
//         .footer {
//           margin-top: 20px;
//           padding-top: 10px;
//           border-top: 1px solid #eee;
//           font-size: 12px;
//           color: #777;
//           text-align: center;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="header">
//         <img src="${logoUrl}" alt="${siteName}" class="logo">
//         <h2>Réinitialisation de votre mot de passe</h2>
//       </div>

//       <div class="content">
//         <p>Bonjour ${user.firstName},</p>
//         <p>Vous avez demandé la réinitialisation du mot de passe de votre compte <strong>${siteName}</strong>.</p>

//         <p>Pour définir un nouveau mot de passe, cliquez sur le bouton ci-dessous :</p>
//         <div style="text-align: center;">
//           <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
//         </div>

//         <div class="warning">
//           <p><strong>Ce lien expirera dans 1 heure.</strong></p>
//           <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail ou nous contacter immédiatement.</p>
//         </div>

//         <p>Pour des raisons de sécurité, nous vous recommandons de choisir un mot de passe robuste et de ne le partager avec personne.</p>
//       </div>

//       <div class="footer">
//         <p>&copy; ${new Date().getFullYear()} ${siteName}. Tous droits réservés.</p>
//         <p>Cet e-mail a été envoyé automatiquement. Merci de ne pas y répondre.</p>
//       </div>
//     </body>
//     </html>
//   `;

//     const text = `
//     Bonjour ${user.firstName},

//     Vous avez demandé la réinitialisation du mot de passe de votre compte ${siteName}.

//     Pour définir un nouveau mot de passe, visitez ce lien :
//     ${resetUrl}

//     Ce lien expirera dans 1 heure.
//     Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail.

//     Cordialement,
//     L'équipe ${siteName}
//   `;

//     return this.sendEmail({
//       to: user.email,
//       subject,
//       html,
//       text,
//     });
//   }

//   async sendPasswordResetNotification(user, newPassword) {
//     const subject = "Your Password Has Been Reset"
//     const html = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2>Password Reset Notification</h2>
//         <p>Hello ${user.firstName},</p>
//         <p>Your password has been reset by an administrator.</p>
//         <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
//           <p><strong>New Temporary Password:</strong> ${newPassword}</p>
//         </div>
//         <p><strong>Important:</strong> Please change this password after your next login for security reasons.</p>
//         <br>
//         <p>Best regards,<br>The RIAFCO Team</p>
//       </div>
//     `

//     return this.sendEmail({
//       to: user.email,
//       subject,
//       html,
//       text: `Your password has been reset. New temporary password: ${newPassword}`,
//     })
//   }


//   async sendNewsletterEmail(subscribers, newsletter) {
//     const siteSettings = await prisma.siteSettings.findFirst();
//     const siteName = siteSettings?.siteName || "RIAFCO";

//     const logoUrl = `${process.env.BACKEND_URL}/${siteSettings?.logo}` || "http://localhost:3000/logo.png";

//     const contactEmail = siteSettings?.contactEmail || "contact@riafco.org";
//     const socialMedia = siteSettings?.socialMedia || {};

//     const promises = subscribers.map((subscriber) => {
//       // const unsubscribeUrl = `${process.env.FRONTEND_URL}/actualites/${newsletter.id}/desabonnement?email=${encodeURIComponent(subscriber.email)}`;
//       const unsubscribeUrl = `${process.env.BACKEND_URL}/api/newsletter/unsubscribe/${encodeURIComponent(subscriber.email)}`;

//       const html = `
//       <!DOCTYPE html>
//       <html lang="fr">
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>${newsletter.subject}</title>
//         <style>
//           body {
//             font-family: Arial, sans-serif;
//             line-height: 1.6;
//             color: #333;
//             max-width: 600px;
//             margin: 0 auto;
//             padding: 20px;
//           }
//           .header {
//             text-align: center;
//             padding: 20px 0;
//             border-bottom: 1px solid #eee;
//           }
//           .logo {
//             max-width: 150px;
//           }
//           .content {
//             padding: 20px 0;
//           }
//           .footer {
//             margin-top: 30px;
//             padding-top: 20px;
//             border-top: 1px solid #eee;
//             font-size: 12px;
//             color: #777;
//             text-align: center;
//           }
//           .social-icons {
//             margin: 15px 0;
//           }
//           .social-icons a {
//             margin: 0 8px;
//             display: inline-block;
//           }
//           .unsubscribe {
//             margin-top: 15px;
//             font-size: 11px;
//           }
//           .unsubscribe a {
//             color: #e28743;
//             text-decoration: none;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="header">
//           <img src="${logoUrl}" alt="${siteName}" class="logo">
//           <h2 style="color: #1e81b0;">${newsletter.subject}</h2>
//         </div>

//         <div class="content">
//           ${newsletter.htmlContent || `<p>${newsletter.content.replace(/\n/g, '<br>')}</p>`}
//         </div>

//         <div class="footer">
//           <p>Envoyé par <strong>${siteName}</strong></p>

//           <div class="social-icons">
//             ${socialMedia.facebook ? `<a href="${socialMedia.facebook}"><img src="https://via.placeholder.com/24/3b5998/ffffff?text=F" alt="Facebook"></a>` : ''}
//             ${socialMedia.twitter ? `<a href="${socialMedia.twitter}"><img src="https://via.placeholder.com/24/1da1f2/ffffff?text=T" alt="Twitter"></a>` : ''}
//             ${socialMedia.linkedin ? `<a href="${socialMedia.linkedin}"><img src="https://via.placeholder.com/24/0077b5/ffffff?text=L" alt="LinkedIn"></a>` : ''}
//             ${socialMedia.instagram ? `<a href="${socialMedia.instagram}"><img src="https://via.placeholder.com/24/e4405f/ffffff?text=I" alt="Instagram"></a>` : ''}
//           </div>

//           <p>Vous recevez cet e-mail car vous êtes abonné(e) à notre newsletter.</p>

//           <div class="unsubscribe">
//             <p>Si vous ne souhaitez plus recevoir nos actualités, vous pouvez
//             <a href="${unsubscribeUrl}">vous désabonner ici</a>.</p>
//           </div>

//           <p style="font-size: 10px; margin-top: 15px;">
//             <a href="mailto:${contactEmail}">Nous contacter</a> |
//             <a href="${process.env.FRONTEND_URL}/mentions-legales">Mentions légales</a>
//           </p>
//         </div>
//       </body>
//       </html>
//     `;

//       const text = `
//       ${newsletter.subject}

//       ${newsletter.content}

//       ---
//       Vous recevez cet e-mail car vous êtes abonné(e) à la newsletter ${siteName}.

//       Pour vous désabonner : ${unsubscribeUrl}

//       Contact : ${contactEmail}
//     `;

//       return this.sendEmail({
//         to: subscriber.email,
//         subject: newsletter.subject,
//         html,
//         text,
//       });
//     });

//     return Promise.allSettled(promises);
//   }



//   async sendUnsubscribeConfirmation(email) {
//     const siteSettings = await prisma.siteSettings.findFirst();
//     const siteName = siteSettings?.siteName || "RIAFCO";

//     const logoUrl = `${process.env.BACKEND_URL}/${siteSettings?.logo}` || "http://localhost:3000/logo.png";

//     const contactEmail = siteSettings?.contactEmail || "contact@riafco.org";
//     const subject = `${siteName} — Désabonnement confirmé`;


//     const html = `<!DOCTYPE html><html lang="fr"><head>
//       <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
//       <title>${escapeHtml(subject)}</title>
//       <style>
//         body{font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#333;background:#f7f7f7;margin:0}
//         .container{max-width:600px;margin:0 auto;background:#fff;padding:24px}
//         .header{text-align:center;border-bottom:1px solid #eee;padding-bottom:12px}
//         .logo{max-width:150px;height:auto}
//         .footer{margin-top:24px;border-top:1px solid #eee;padding-top:12px;font-size:12px;color:#777;text-align:center}
//       </style></head><body>
//         <div class="container">
//           <div class="header">
//             <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(siteName)}" class="logo">
//             <h2>${escapeHtml(subject)}</h2>
//           </div>
//           <p>Votre adresse a bien été désabonnée de la newsletter <strong>${escapeHtml(siteName)}</strong>.</p>
//           <p>Si c’était une erreur, vous pouvez vous réabonner depuis notre site.</p>
//           <p>Pour toute question, écrivez-nous : <a href="mailto:${escapeHtml(contactEmail)}">${escapeHtml(contactEmail)}</a>.</p>
//           <div class="footer">
//             <p>&copy; ${new Date().getFullYear()} ${escapeHtml(siteName)}</p>
//           </div>
//         </div>
//       </body>
//       </html>`;

//     const text =
//       `${subject}
//             Votre adresse a bien été désabonnée de la newsletter ${siteName}.
//             Pour toute question : ${contactEmail}
//       `;

//     return this.sendEmail({
//       to: email,
//       subject,
//       html,
//       text,
//       headers: {
//         "List-Unsubscribe": `<mailto:${contactEmail}?subject=Unsubscribe>`,
//         "Auto-Submitted": "auto-generated",
//       },
//     });
//   }


//   async sendResponseEmail({ to, name, subject, message }) {
//     const siteSettings = await prisma.siteSettings.findFirst();
//     const siteName = siteSettings?.siteName || "RIAFCO";

//     const logoCandidate = siteSettings?.logo || ""; // ex: "/uploads/logo.png" ou URL absolue
//     const computedLogo = toAbsoluteUrl(logoCandidate);
//     const logoUrl = computedLogo || "http://localhost:3000/logo.png";

//     const safeName = escapeHtml(name || "Madame/Monsieur");
//     const safeSubject = escapeHtml(subject || "Votre demande");
//     const safeMessage = escapeHtml(message || "").replace(/\n/g, "<br>");

//     const mailSubject = `${subject}`;

//     const html = `
//       <!DOCTYPE html>
//       <html lang="fr">
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
//         <title>${mailSubject}</title>
//         <meta name="color-scheme" content="light only">
//         <style>
//           /* Base layout (même esprit que reset password) */
//           body {
//             margin:0; padding:0; background:#f7f8fb; color:#333;
//             font-family: Arial, sans-serif; line-height:1.6;
//           }
//           .container {
//             max-width: 600px; margin: 0 auto; padding: 20px;
//           }
//           .card {
//             background:#ffffff; border:1px solid #eee; border-radius:8px;
//             box-shadow: 0 1px 2px rgba(16,24,40,0.04);
//             overflow:hidden;
//           }
//           .header {
//             text-align:center; padding:24px 20px; border-bottom:1px solid #eee; background:#ffffff;
//           }
//           .logo { max-width:150px; height:auto; display:block; margin:0 auto 8px; }
//           h2 { margin:8px 0 0; font-size:20px; }
//           .content { padding: 20px; }
//           .greeting { font-weight:bold; margin-bottom:12px; }
//           .response {
//             margin:16px 0; padding:14px; border-left:4px solid #1e81b0; background:#f1f7fb; border-radius:4px;
//           }
//           .footer {
//             text-align:center; color:#777; font-size:12px; padding:16px; border-top:1px solid #eee; background:#ffffff;
//           }
//           a.button {
//             display:inline-block; background:#1e81b0; color:#fff !important; text-decoration:none;
//             padding:12px 20px; border-radius:6px; font-weight:bold; margin-top:12px;
//           }
//           /* Mobile */
//           @media (max-width: 620px) {
//             .container { padding: 12px; }
//             .content { padding: 16px; }
//           }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <!-- Pré-header masqué -->
//           <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
//             Réponse à votre demande - ${siteName}
//           </div>

//           <div class="card">
//             <div class="header">
//               <img src="${logoUrl}" alt="${escapeHtml(siteName)}" class="logo"/>
//               <h2>Réponse à votre demande</h2>
//             </div>

//             <div class="content">
//               <div class="greeting">Bonjour ${safeName},</div>
//               <p>Merci d'avoir contacté <strong>${escapeHtml(siteName)}</strong>. Nous avons bien pris en compte votre demande concernant&nbsp; <br/>  <strong>${safeSubject}</strong>.</p>

//               <p>Voici notre réponse&nbsp;:</p>
//               <div class="response">
//                 ${safeMessage}
//               </div>

//               <p>Si vous avez d'autres questions, n'hésitez pas à nous répondre à ce mail ou à nous recontacter via le site.</p>
//             </div>

//             <div class="footer">
//               © ${new Date().getFullYear()} ${escapeHtml(siteName)}. Tous droits réservés.<br/>
//                Merci de ne pas y répondre directement si cela n'est pas nécessaire.
//             </div>
//           </div>
//         </div>
//       </body>
//       </html>
//   `;

//     const text = `
//       Bonjour ${name || "Madame/Monsieur"},

//       Merci d'avoir contacté ${siteName}. Nous avons bien pris en compte votre demande concernant : "${subject || "Votre demande"}".

//       Voici notre réponse :
//       ${message || ""}

//       Si vous avez d'autres questions, n'hésitez pas à nous recontacter.

//       Cordialement,
//       L'équipe ${siteName}
//         `;

//     return this.sendEmail({
//       to,
//       subject: mailSubject,
//       html,
//       text,
//     });
//   }

//   async sendInactiveStatusEmail(user) {
//     const siteSettings = await prisma.siteSettings.findFirst();
//     const siteName = siteSettings?.siteName || "RIAFCO";
//     const logoUrl = `${process.env.BACKEND_URL}/${siteSettings?.logo}` || "http://localhost:3000/logo.png";

//     const contactEmail = siteSettings?.contactEmail || "support@riafco.org";
//     const loginUrl = `${process.env.FRONTEND_URL}/auth/login`;

//     const subject = `Votre compte ${siteName} a été désactivé`;

//     const html = `
//     <!DOCTYPE html>
//     <html lang="fr">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Compte désactivé - ${siteName}</title>
//       <style>
//         body {
//           font-family: 'Nunito', Arial, sans-serif;
//           font-size: 15px;
//           line-height: 1.6;
//           color: #333;
//           margin: 0;
//           padding: 0;
//           background-color: #f8f9fc;
//         }
//         .email-container {
//           max-width: 600px;
//           margin: 30px auto;
//           background-color: #fff;
//           border-radius: 6px;
//           overflow: hidden;
//           box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
//         }
//         .header {
//           background-color: #e28743;
//           padding: 20px 0;
//           text-align: center;
//           color: #fff;
//         }
//         .header img {
//           max-width: 150px;
//           height: auto;
//         }
//         .content {
//           padding: 24px;
//         }
//         .warning {
//           background-color: #fff3cd;
//           padding: 15px;
//           border-radius: 6px;
//           border-left: 4px solid #ffc107;
//           margin: 20px 0;
//         }
//         .greeting {
//           font-size: 18px;
//           font-weight: 600;
//           color: #e28743;
//           margin-bottom: 16px;
//         }
//         .message {
//           margin-bottom: 20px;
//           color: #555;
//         }
//         .action-button {
//           display: inline-block;
//           background-color: #1e81b0;
//           color: white !important;
//           text-decoration: none;
//           padding: 12px 24px;
//           border-radius: 6px;
//           margin: 20px 0;
//           font-weight: 600;
//           text-align: center;
//         }
//         .signature {
//           margin-top: 24px;
//           color: #8492a6;
//           font-size: 14px;
//         }
//         .footer {
//           text-align: center;
//           padding: 16px;
//           background-color: #f8f9fc;
//           color: #8492a6;
//           font-size: 12px;
//           border-top: 1px solid #eaeaea;
//         }
//         .highlight {
//           font-weight: 600;
//           color: #e28743;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="email-container">
//         <div class="header">
//           <img src="${logoUrl}" alt="${siteName}" />
//           <h2 style="color: white; margin-top: 10px;">Notification importante</h2>
//         </div>

//         <div class="content">
//           <div class="greeting">Bonjour ${user.firstName},</div>

//           <div class="warning">
//             <p>Votre compte ${siteName} a été <span class="highlight">désactivé</span>.</p>
//           </div>

//           <div class="message">
//             <p>Nous vous informons que votre compte a été désactivé pour l'une des raisons suivantes :</p>
//             <ul>
//               <li>Inactivité prolongée</li>
//               <li>Non-respect des conditions d'utilisation</li>
//               <li>Mise à jour de nos politiques internes</li>
//             </ul>

//             <p>Si vous souhaitez réactiver votre compte, veuillez <a href="mailto:${contactEmail}">nous contacter</a> pour plus d'informations.</p>

//             <p>Pour consulter vos données avant une éventuelle suppression, vous pouvez encore vous connecter :</p>
//             <div style="text-align: center;">
//               <a href="${loginUrl}" class="action-button">Accéder à mon compte</a>
//             </div>

//             <p>Conformément à notre politique de conservation des données, votre compte et ses informations associées pourraient être définitivement supprimés après 30 jours d'inactivité.</p>

//             <p>Nous restons à votre disposition pour toute question.</p>
//           </div>

//           <div class="signature">
//             Cordialement,<br />
//             <strong>L'équipe ${siteName}</strong>
//           </div>
//         </div>

//         <div class="footer">
//           <p>Service support - ${siteName}</p>
//           <p><a href="mailto:${contactEmail}" style="color: #8492a6;">${contactEmail}</a></p>
//           <p>© ${new Date().getFullYear()} ${siteName}. Tous droits réservés.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;

//     const text = `
//     Bonjour ${user.firstName},

//     Votre compte ${siteName} a été désactivé.

//     Nous vous informons que votre compte a été désactivé pour l'une des raisons suivantes :
//     - Inactivité prolongée
//     - Non-respect des conditions d'utilisation
//     - Mise à jour de nos politiques internes

//     Si vous souhaitez réactiver votre compte, veuillez nous contacter à ${contactEmail}.

//     Vous pouvez encore accéder à vos données en vous connectant ici : ${loginUrl}

//     Attention : votre compte et ses informations pourraient être définitivement supprimés après 30 jours d'inactivité.

//     Cordialement,
//     L'équipe ${siteName}
//   `;

//     return this.sendEmail({
//       to: user.email,
//       subject,
//       html,
//       text,
//     });
//   }


//   async sendActiveStatusEmail(user) {
//     const siteSettings = await prisma.siteSettings.findFirst();
//     const siteName = siteSettings?.siteName || "RIAFCO";

//     const logoUrl = `${process.env.BACKEND_URL}/${siteSettings?.logo}` || "http://localhost:3000/logo.png";

//     const contactEmail = siteSettings?.contactEmail || "support@riafco.org";
//     const loginUrl = `${process.env.FRONTEND_URL}/auth/login`;

//     const subject = `Votre compte ${siteName} est maintenant actif`;

//     const html = `
//     <!DOCTYPE html>
//     <html lang="fr">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Compte activé - ${siteName}</title>
//       <style>
//         body {
//           font-family: 'Nunito', Arial, sans-serif;
//           font-size: 15px;
//           line-height: 1.6;
//           color: #333;
//           margin: 0;
//           padding: 0;
//           background-color: #f8f9fc;
//         }
//         .email-container {
//           max-width: 600px;
//           margin: 30px auto;
//           background-color: #fff;
//           border-radius: 6px;
//           overflow: hidden;
//           box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
//         }
//         .header {
//           background-color: #28a745;
//           padding: 20px 0;
//           text-align: center;
//           color: #fff;
//         }
//         .header img {
//           max-width: 150px;
//           height: auto;
//         }
//         .content {
//           padding: 24px;
//         }
//         .success {
//           background-color: #d4edda;
//           padding: 15px;
//           border-radius: 6px;
//           border-left: 4px solid #28a745;
//           margin: 20px 0;
//         }
//         .greeting {
//           font-size: 18px;
//           font-weight: 600;
//           color: #28a745;
//           margin-bottom: 16px;
//         }
//         .message {
//           margin-bottom: 20px;
//           color: #555;
//         }
//         .action-button {
//           display: inline-block;
//           background-color: #1e81b0;
//           color: white !important;
//           text-decoration: none;
//           padding: 12px 24px;
//           border-radius: 6px;
//           margin: 20px 0;
//           font-weight: 600;
//           text-align: center;
//         }
//         .signature {
//           margin-top: 24px;
//           color: #8492a6;
//           font-size: 14px;
//         }
//         .footer {
//           text-align: center;
//           padding: 16px;
//           background-color: #f8f9fc;
//           color: #8492a6;
//           font-size: 12px;
//           border-top: 1px solid #eaeaea;
//         }
//         .highlight {
//           font-weight: 600;
//           color: #28a745;
//         }
//         .features {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//           gap: 15px;
//           margin: 25px 0;
//         }
//         .feature {
//           text-align: center;
//           padding: 15px;
//         }
//         .feature-icon {
//           font-size: 24px;
//           color: #1e81b0;
//           margin-bottom: 10px;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="email-container">
//         <div class="header">
//           <img src="${logoUrl}" alt="${siteName}" />
//           <h2 style="color: white; margin-top: 10px;">Compte activé avec succès</h2>
//         </div>

//         <div class="content">
//           <div class="greeting">Bonjour ${user.firstName},</div>

//           <div class="success">
//             <p>Votre compte ${siteName} est maintenant <span class="highlight">actif</span>.</p>
//           </div>

//           <div class="message">
//             <p>Nous sommes ravis de vous informer que votre compte a été activé avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités de notre plateforme.</p>

//             <p>Pour commencer, connectez-vous à votre compte en utilisant le bouton ci-dessous :</p>
//             <div style="text-align: center;">
//               <a href="${loginUrl}" class="action-button">Se connecter à mon compte</a>
//             </div>

//             <p>Si vous avez des questions ou besoin d'aide pour utiliser notre plateforme, n'hésitez pas à consulter notre centre d'aide ou à contacter notre équipe support.</p>

//             <p>Nous vous recommandons de :</p>
//             <ul>
//               <li>Mettre à jour vos informations personnelles</li>
//               <li>Vérifier vos permissions et accès</li>
//               <li>Explorer les différentes fonctionnalités disponibles</li>
//             </ul>
//           </div>

//           <div class="signature">
//             Cordialement,<br />
//             <strong>L'équipe ${siteName}</strong>
//           </div>
//         </div>

//         <div class="footer">
//           <p>Service support <a href="mailto:${contactEmail}" style="color: #8492a6;">${contactEmail}</a></p>
//           <p>© ${new Date().getFullYear()} ${siteName}. Tous droits réservés.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;

//     const text = `
//     Bonjour ${user.firstName},

//     Votre compte ${siteName} est maintenant actif.

//     Nous sommes ravis de vous informer que votre compte a été activé avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités de notre plateforme.

//     Pour commencer, connectez-vous à votre compte ici : ${loginUrl}

//     Nous vous recommandons de :
//     - Mettre à jour vos informations personnelles
//     - Vérifier vos permissions et accès
//     - Explorer les différentes fonctionnalités disponibles

//     Si vous avez des questions, contactez-nous à ${contactEmail}.

//     Cordialement,
//     L'équipe ${siteName}
//   `;

//     return this.sendEmail({
//       to: user.email,
//       subject,
//       html,
//       text,
//     });
//   }

//   async sendMailToUser(contactEmail, subject, message, userName = "", attachments = []) {
//     const siteSettings = await prisma.siteSettings.findFirst();
//     const siteUrl = siteSettings?.siteUrl || "http://localhost:3000";
//     const siteName = siteSettings?.siteName || "RIAFCO";

//     const logoUrl = `${process.env.BACKEND_URL}/${siteSettings?.logo}` || "http://localhost:3000/logo.png";

//     const contactEmailSupport = siteSettings?.contactEmail || "support@riafco.org";
//     const footer = siteSettings?.footer || `&copy; ${new Date().getFullYear()} ${siteName}. Tous droits réservés.`;

//     const loginUrl = `${siteUrl}/auth/login`;

//     // HTML du mail avec header, footer et contenu
//     const html = `
//         <!DOCTYPE html>
//         <html lang="fr">
//         <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <title>${subject}</title>
//           <style>
//             body {
//               font-family: Arial, sans-serif;
//               line-height: 1.6;
//               color: #333;
//               max-width: 600px;
//               margin: 0 auto;
//               padding: 20px;
//             }
//             .header {
//               text-align: center;
//               padding: 20px 0;
//               border-bottom: 1px solid #eee;
//             }
//             .logo {
//               max-width: 150px;
//             }
//             .content {
//               padding: 20px 0;
//             }
//             .button {
//               display: inline-block;
//               background-color: #1e81b0;
//               color: white !important;
//               text-decoration: none;
//               padding: 12px 24px;
//               border-radius: 5px;
//               margin: 20px 0;
//               font-size: 16px;
//             }
//             .footer {
//               margin-top: 20px;
//               padding-top: 10px;
//               border-top: 1px solid #eee;
//               font-size: 12px;
//               color: #e28743;
//               text-align: center;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="header">
//             <img src="${logoUrl}" alt="${siteName}" class="logo">
//             <h2>${siteName}</h2>
//           </div>

//           <div class="content">
//             <p>Bonjour ,</p>
//             <p>${message}</p>
//           </div>

//            <div style="text-align: center;">
//               <a href="${loginUrl}" class="action-button">Accéder à votre compte</a>
//             </div>

//           <div class="footer">
//             <p> ${footer} </p>
//           </div>
//         </body>
//         </html>
//         `;

//     // Texte alternatif pour les clients mail basiques
//     const text = `
//         Bonjour ${userName || "Utilisateur"},

//         ${message}

//         En cas de problème, contactez-nous à ${contactEmailSupport}.

//         L'équipe ${siteName}
//           `;

//     return this.sendEmail({
//       to: contactEmail,
//       subject,
//       html,
//       text,
//       attachments
//     });
//   }


//   async sendSimpleMail({ to, subject, message }) {
//     const siteSettings = await prisma.siteSettings.findFirst();
//     const { subject: finalSubject, html, text } = buildSimpleMailTemplate({
//       subject,
//       message,
//       siteSettings,
//     });

//     return this.sendEmail({
//       to,
//       subject: finalSubject,
//       html,
//       text,
//     });
//   }
// }

// module.exports = new EmailService()



// function escapeHtml(str = "") {
//   return String(str)
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&#039;");
// }
// function toAbsoluteUrl(path) {
//   if (!path) return null;
//   if (/^https?:\/\//i.test(path)) return path;
//   const base = process.env.BACKEND_URL?.replace(/\/+$/, "") || "";
//   const clean = String(path).replace(/^\/+/, "");
//   return `${base}/${clean}`;
// }


// function buildSimpleMailTemplate({ subject, message, siteSettings }) {
//   const siteName = siteSettings?.siteName || "RIAFCO";
//   const logoCandidate = siteSettings?.logo || "";
//   const computedLogo = toAbsoluteUrl(logoCandidate);
//   const logoUrl = computedLogo || "http://localhost:3000/logo.png";

//   const safeSubject = escapeHtml(subject || "Information");
//   const safeMessageHtml = escapeHtml(message || "").replace(/\n/g, "<br>");
//   const year = new Date().getFullYear();

//   const html = `<!DOCTYPE html>
//       <html lang="fr">
//       <head>
//       <meta charset="UTF-8" />
//       <meta name="viewport" content="width=device-width, initial-scale=1" />
//       <title>${safeSubject} - ${escapeHtml(siteName)}</title>
//       <meta name="color-scheme" content="light only" />
//       <style>
//         body { margin:0; padding:0; background:#f7f8fb; color:#333; font-family:Arial, sans-serif; line-height:1.6; }
//         .container { max-width:600px; margin:0 auto; padding:20px; }
//         .card { background:#fff; border:1px solid #eee; border-radius:8px; box-shadow:0 1px 2px rgba(16,24,40,.04); overflow:hidden; }
//         .header { text-align:center; padding:24px 20px; border-bottom:1px solid #eee; background:#fff; }
//         .logo { max-width:150px; height:auto; display:block; margin:0 auto 8px; }
//         h2 { margin:8px 0 0; font-size:20px; }
//         .content { padding:20px; }
//         .msg { margin-top:8px; padding:14px; border-left:4px solid #1e81b0; background:#f1f7fb; border-radius:4px; }
//         .footer { text-align:center; color:#777; font-size:12px; padding:16px; border-top:1px solid #eee; background:#fff; }
//         @media (max-width:620px){ .container{ padding:12px; } .content{ padding:16px; } }
//       </style>
//       </head>
//       <body>
//         <div class="container">
//           <div style="display:none;opacity:0;max-height:0;overflow:hidden;">${safeSubject} - ${escapeHtml(siteName)}</div>
//           <div class="card">
//             <div class="header">
//               <img src="${logoUrl}" alt="${escapeHtml(siteName)}" class="logo" />
//               <h2>${safeSubject}</h2>
//             </div>
//             <div class="content">
//               <p>Bonjour,</p>
//               <p>Vous trouverez ci-dessous le message :</p>
//               <div class="msg">${safeMessageHtml}</div>
//               <p>Bien cordialement,<br><strong>L’équipe ${escapeHtml(siteName)}</strong></p>
//             </div>
//             <div class="footer">
//               © ${year} ${escapeHtml(siteName)}. Tous droits réservés.
//             </div>
//           </div>
//         </div>
//       </body>
//       </html>`;

//   const text = `\
//       ${subject || "Information"} - ${siteName}

//       Bonjour,

//       ${message || ""}

//       Bien cordialement,
//       L'équipe ${siteName}
//       `;

//   return { subject: safeSubject, html, text };
// }


// /services/email.service.js
const nodemailer = require("nodemailer");
const prisma = require("../config/db");

/* ===========================
   Helpers globaux harmonisés
   =========================== */

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function toAbsoluteUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = process.env.BACKEND_URL?.replace(/\/+$/, "") || "";
  const clean = String(path).replace(/^\/+/, "");
  return `${base}/${clean}`;
}

/**
 * Gabarit HTML commun (header/logo, cadre, footer)
 * @param {Object} params
 * @param {string} params.siteName
 * @param {string} params.logoUrl
 * @param {string} params.title       // <title> du document
 * @param {string} params.heading     // titre visuel H2 dans le header
 * @param {string} params.contentHtml // HTML du contenu (déjà échappé si besoin)
 */
function buildEmailHtml({ siteName, logoUrl, title, heading, contentHtml }) {
  const safeSite = escapeHtml(siteName);
  const safeTitle = escapeHtml(title || heading || siteName || "Message");
  const safeHeading = escapeHtml(heading || "");
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${safeTitle}</title>
      <meta name="color-scheme" content="light only" />
      <style>
        body { margin:0; padding:0; background:#f7f8fb; color:#333; font-family:Arial, sans-serif; line-height:1.6; }
        .container { max-width:600px; margin:0 auto; padding:20px; }
        .card { background:#fff; border:1px solid #eee; border-radius:8px; box-shadow:0 1px 2px rgba(16,24,40,.04); overflow:hidden; }
        .header { text-align:center; padding:24px 20px; border-bottom:1px solid #eee; background:#fff; }
        .logo { max-width:150px; height:auto; display:block; margin:0 auto 8px; }
        h2 { margin:8px 0 0; font-size:20px; }
        .content { padding:20px; }
        .box { margin:16px 0; padding:14px; border-left:4px solid #1e81b0; background:#f1f7fb; border-radius:4px; }
        .footer { text-align:center; color:#777; font-size:12px; padding:16px; border-top:1px solid #eee; background:#fff; }
        a.btn { display:inline-block; background:#1e81b0; color:#fff !important; text-decoration:none; padding:12px 20px; border-radius:6px; font-weight:bold; margin-top:12px; }
        @media (max-width:620px){ .container{ padding:12px; } .content{ padding:16px; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div style="display:none;opacity:0;max-height:0;overflow:hidden;">${safeTitle} - ${safeSite}</div>
        <div class="card">
          <div class="header">
            <img src="${escapeHtml(logoUrl)}" alt="${safeSite}" class="logo" />
            <h2>${safeHeading || safeTitle}</h2>
          </div>
          <div class="content">
            ${contentHtml}
            <p style="margin-top:16px;">Bien cordialement,<br><strong>L’équipe ${safeSite}</strong></p>
          </div>
          <div class="footer">© ${year} ${safeSite}. Tous droits réservés.</div>
        </div>
      </div>
    </body>
    </html>`;
    }

/**
 * Construit un texte brut propre avec des lignes
 * @param {string[]} lines
 */
function buildText(lines = []) {
  return lines.filter(Boolean).join("\n\n");
}

/**
 * Template simple (subject + message) prêt à l'emploi
 */
function buildSimpleMailTemplate({ subject, message, siteSettings }) {
  const siteName = siteSettings?.siteName || "RIAFCO";
  const computedLogo = toAbsoluteUrl(siteSettings?.logo || "");
  const logoUrl = computedLogo || "http://localhost:3000/logo.png";

  const safeSubject = escapeHtml(subject || "Information");
  const safeMessageHtml = escapeHtml(message || "").replace(/\n/g, "<br>");

  const html = buildEmailHtml({
    siteName,
    logoUrl,
    title: `${safeSubject} - ${siteName}`,
    heading: safeSubject,
    contentHtml: `
      <p>Bonjour,</p>
      <p>Vous trouverez ci-dessous le message :</p>
      <div class="box">${safeMessageHtml}</div>
    `,
  });

  const text = buildText([
    `${subject || "Information"} - ${siteName}`,
    "Bonjour,",
    message || "",
    `L'équipe ${siteName}`,
  ]);

  return { subject: safeSubject, html, text };
}

/* ===========================
   Service
   =========================== */

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    this.transporter.verify().then(
      () => console.log("SMTP ready"),
      (err) => console.error("SMTP error:", err)
    );
  }

  async sendEmail({ to, subject, html, text, attachments = [], headers = {} }) {
    try {
      const mailOptions = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to,
        subject,
        html,
        text,
        attachments,
        headers,
      };
      const result = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", result.messageId);
      return result;
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error;
    }
  }

  /* =============== Mails métiers harmonisés =============== */

  async sendWelcomeEmail(user) {
    const siteSettings = await prisma.siteSettings.findFirst();
    const siteName = siteSettings?.siteName || "RIAFCO";
    const logoUrl = toAbsoluteUrl(siteSettings?.logo) || "http://localhost:3000/logo.png";

    const subject = `Bienvenue sur ${siteName} !`;
    const html = buildEmailHtml({
      siteName,
      logoUrl,
      title: subject,
      heading: `Bienvenue sur ${siteName}`,
      contentHtml: `
        <p>Bonjour ${escapeHtml(user.firstName)},</p>
        <p>Votre compte a été créé avec succès.</p>
        <p>Vous pouvez désormais accéder à la plateforme ${escapeHtml(siteName)} avec vos identifiants.</p>
      `,
    });
    const text = buildText([
      subject,
      `Bonjour ${user.firstName},`,
      "Votre compte a été créé avec succès.",
      `Vous pouvez maintenant accéder à ${siteName}.`,
      `L'équipe ${siteName}`,
    ]);

    return this.sendEmail({ to: user.email, subject, html, text });
  }

  async sendInvitationEmail(user, tempPassword, registerToken) {
    const siteSettings = await prisma.siteSettings.findFirst();
    const siteUrl = siteSettings?.siteUrl || process.env.FRONTEND_URL || "http://localhost:3000";
    const siteName = siteSettings?.siteName || "RIAFCO";
    const logoUrl = toAbsoluteUrl(siteSettings?.logo) || "http://localhost:3000/logo.png";
    const contactEmail = siteSettings?.contactEmail || "support@riafco.org";
    const subject = `${siteName} - Activez votre compte`;
    const activationLink = `${siteUrl.replace(/\/+$/, "")}/auth/activate?email=${encodeURIComponent(user.email)}&token=${encodeURIComponent(registerToken)}`;

    const html = buildEmailHtml({
      siteName,
      logoUrl,
      title: subject,
      heading: "Activation de votre compte",
      contentHtml: `
        <p>Bonjour ${escapeHtml(user.firstName)},</p>
        <p>Un compte vous a été créé sur <strong>${escapeHtml(siteName)}</strong>.</p>
        <p style="text-align:center;"><a href="${escapeHtml(activationLink)}" class="btn">Activer mon compte</a></p>
        <div class="box">
          <p><strong>Adresse e-mail :</strong> ${escapeHtml(user.email)}</p>
          <p><strong>Mot de passe temporaire :</strong> ${escapeHtml(tempPassword)}</p>
        </div>
        <p><strong>Important :</strong> vous devrez changer votre mot de passe lors de votre première connexion.</p>
        <p>Besoin d’aide ? <a href="mailto:${escapeHtml(contactEmail)}">${escapeHtml(contactEmail)}</a></p>
      `,
    });

    const text = buildText([
      subject,
      `Bonjour ${user.firstName},`,
      `Activez votre compte : ${activationLink}`,
      `Identifiants temporaires :\n- Email: ${user.email}\n- Mot de passe: ${tempPassword}`,
      `Support: ${contactEmail}`,
      `L'équipe ${siteName}`,
    ]);

    return this.sendEmail({ to: user.email, subject, html, text });
  }

  async sendPasswordResetEmail(user, resetToken) {
    const siteSettings = await prisma.siteSettings.findFirst();
    const siteName = siteSettings?.siteName || "RIAFCO";
    const logoUrl = toAbsoluteUrl(siteSettings?.logo) || "http://localhost:3000/logo.png";
    const resetUrl = `${(process.env.FRONTEND_URL || "").replace(/\/+$/, "")}/auth/new-password?token=${encodeURIComponent(resetToken)}`;
    const subject = `${siteName} - Réinitialisation de votre mot de passe`;

    const html = buildEmailHtml({
      siteName,
      logoUrl,
      title: subject,
      heading: "Réinitialisation de votre mot de passe",
      contentHtml: `
        <p>Bonjour ${escapeHtml(user.firstName)},</p>
        <p>Vous avez demandé la réinitialisation du mot de passe de votre compte <strong>${escapeHtml(siteName)}</strong>.</p>
        <p>Pour définir un nouveau mot de passe :</p>
        <p style="text-align:center;"><a href="${escapeHtml(resetUrl)}" class="btn">Réinitialiser mon mot de passe</a></p>
        <div class="box">
          <p><strong>Ce lien expirera dans 1 heure.</strong></p>
          <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>
        </div>
        <p>Conseil : choisissez un mot de passe robuste et ne le partagez jamais.</p>
      `,
    });

    const text = buildText([
      subject,
      `Bonjour ${user.firstName},`,
      `Réinitialisez votre mot de passe : ${resetUrl}`,
      `Le lien expire dans 1 heure.`,
      `L'équipe ${siteName}`,
    ]);

    return this.sendEmail({ to: user.email, subject, html, text });
  }

  async sendPasswordResetNotification(user, newPassword) {
    const siteSettings = await prisma.siteSettings.findFirst();
    const siteName = siteSettings?.siteName || "RIAFCO";
    const logoUrl = toAbsoluteUrl(siteSettings?.logo) || "http://localhost:3000/logo.png";
    const subject = `${siteName} - Votre mot de passe a été réinitialisé`;

    const html = buildEmailHtml({
      siteName,
      logoUrl,
      title: subject,
      heading: "Mot de passe réinitialisé",
      contentHtml: `
        <p>Bonjour ${escapeHtml(user.firstName)},</p>
        <p>Votre mot de passe a été réinitialisé par un administrateur.</p>
        <div class="box"><strong>Nouveau mot de passe temporaire :</strong> ${escapeHtml(newPassword)}</div>
        <p><strong>Important :</strong> modifiez ce mot de passe après votre prochaine connexion.</p>
      `,
    });

    const text = buildText([
      subject,
      `Bonjour ${user.firstName},`,
      `Nouveau mot de passe temporaire : ${newPassword}`,
      `Merci de le changer après connexion.`,
      `L'équipe ${siteName}`,
    ]);

    return this.sendEmail({ to: user.email, subject, html, text });
  }

  async sendNewsletterEmail(subscribers, newsletter) {
    const siteSettings = await prisma.siteSettings.findFirst();
    const siteName = siteSettings?.siteName || "RIAFCO";
    const logoUrl = toAbsoluteUrl(siteSettings?.logo) || "http://localhost:3000/logo.png";
    const contactEmail = siteSettings?.contactEmail || "contact@riafco.org";
    const social = siteSettings?.socialMedia || {};

    const results = await Promise.allSettled(
      subscribers.map((subscriber) => {
        const unsubscribeUrl = `${(process.env.BACKEND_URL || "").replace(/\/+$/, "")}/api/newsletter/unsubscribe/${encodeURIComponent(subscriber.email)}`;
        const subject = newsletter.subject;

        const contentHtml =
          newsletter.htmlContent ||
          `<div class="box">${escapeHtml(newsletter.content || "").replace(/\n/g, "<br>")}</div>`;

        const html = `<!DOCTYPE html>
          <html lang="fr">
          <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <title>${escapeHtml(subject)}</title>
          <style>
            body { margin:0; padding:0; background:#f7f8fb; color:#333; font-family:Arial, sans-serif; line-height:1.6; }
            .container { max-width:600px; margin:0 auto; padding:20px; }
            .card { background:#fff; border:1px solid #eee; border-radius:8px; box-shadow:0 1px 2px rgba(16,24,40,.04); overflow:hidden; }
            .header { text-align:center; padding:24px 20px; border-bottom:1px solid #eee; background:#fff; }
            .logo { max-width:150px; height:auto; display:block; margin:0 auto 8px; }
            h2 { margin:8px 0 0; font-size:20px; color:#1e81b0; }
            .content { padding:20px; }
            .footer { text-align:center; color:#777; font-size:12px; padding:16px; border-top:1px solid #eee; background:#fff; }
            .social a { margin:0 6px; text-decoration:none; }
            .unsubscribe { font-size:11px; margin-top:10px; }
            .box { margin:16px 0; padding:14px; border-left:4px solid #1e81b0; background:#f1f7fb; border-radius:4px; }
          </style>
          </head>
          <body>
            <div class="container">
              <div class="card">
                <div class="header">
                  <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(siteName)}" class="logo" />
                  <h2>${escapeHtml(subject)}</h2>
                </div>
                <div class="content">
                  ${contentHtml}
                </div>
                <div class="footer">
                  <p>Envoyé par <strong>${escapeHtml(siteName)}</strong></p>
                  <div class="social">
                    ${social.facebook ? `<a href="${escapeHtml(social.facebook)}">Facebook</a>` : ""}
                    ${social.twitter ? `<a href="${escapeHtml(social.twitter)}">Twitter</a>` : ""}
                    ${social.linkedin ? `<a href="${escapeHtml(social.linkedin)}">LinkedIn</a>` : ""}
                    ${social.instagram ? `<a href="${escapeHtml(social.instagram)}">Instagram</a>` : ""}
                  </div>
                  <p class="unsubscribe">
                    Vous recevez cet e-mail car vous êtes abonné(e) à notre newsletter. 
                    <a href="${escapeHtml(unsubscribeUrl)}">Se désabonner</a>
                  </p>
                  <p style="font-size:10px;">
                    <a href="mailto:${escapeHtml(contactEmail)}">Nous contacter</a> |
                    <a href="${escapeHtml((process.env.FRONTEND_URL || "") + "/mentions-legales")}">Mentions légales</a>
                  </p>
                </div>
              </div>
            </div>
          </body>
          </html>`;

        const text = buildText([
          subject,
          newsletter.content || "",
          `Se désabonner : ${unsubscribeUrl}`,
          `Contact : ${contactEmail}`,
        ]);

        return this.sendEmail({
          to: subscriber.email,
          subject,
          html,
          text,
          headers: {
            "List-Unsubscribe": `<${unsubscribeUrl}>`,
          },
        });
      })
    );

    return results;
  }

  async sendUnsubscribeConfirmation(email) {
    const siteSettings = await prisma.siteSettings.findFirst();
    const siteName = siteSettings?.siteName || "RIAFCO";
    const logoUrl = toAbsoluteUrl(siteSettings?.logo) || "http://localhost:3000/logo.png";
    const contactEmail = siteSettings?.contactEmail || "contact@riafco.org";
    const subject = `${siteName} — Désabonnement confirmé`;

    const html = buildEmailHtml({
      siteName,
      logoUrl,
      title: subject,
      heading: "Désabonnement confirmé",
      contentHtml: `
        <p>Votre adresse a bien été désabonnée de la newsletter <strong>${escapeHtml(siteName)}</strong>.</p>
        <p>Si c’était une erreur, vous pourrez vous réabonner depuis notre site.</p>
        <p>Pour toute question : <a href="mailto:${escapeHtml(contactEmail)}">${escapeHtml(contactEmail)}</a>.</p>
      `,
    });

    const text = buildText([
      subject,
      `Votre adresse a bien été désabonnée de la newsletter ${siteName}.`,
      `Contact : ${contactEmail}`,
    ]);

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
      headers: {
        "List-Unsubscribe": `<mailto:${contactEmail}?subject=Unsubscribe>`,
        "Auto-Submitted": "auto-generated",
      },
    });
  }

  /**
   * Réponse libre : prend (to, subject, message) et optionnellement name
   */
  async sendResponseEmail({ to, subject, message, name = "Madame/Monsieur" }) {
    const siteSettings = await prisma.siteSettings.findFirst();
    const siteName = siteSettings?.siteName || "RIAFCO";
    const logoUrl = toAbsoluteUrl(siteSettings?.logo) || "http://localhost:3000/logo.png";

    const safeSubject = escapeHtml(subject || "Votre demande");
    const safeName = escapeHtml(name);
    const safeMessage = escapeHtml(message || "").replace(/\n/g, "<br>");

    const html = buildEmailHtml({
      siteName,
      logoUrl,
      title: safeSubject,
      heading: "Réponse à votre demande",
      contentHtml: `
        <p>Bonjour ${safeName},</p>
        <p>Nous avons bien pris en compte votre demande concernant&nbsp;: <strong>${safeSubject}</strong>.</p>
        <p>Voici notre réponse :</p>
        <div class="box">${safeMessage}</div>
        <p>Si vous avez d'autres questions, n'hésitez pas à nous recontacter.</p>
      `,
    });

    const text = buildText([
      `Réponse - ${subject || "Votre demande"}`,
      `Bonjour ${name},`,
      `Sujet : ${subject || "Votre demande"}`,
      `Réponse :\n${message || ""}`,
      `L'équipe ${siteName}`,
    ]);

    return this.sendEmail({ to, subject: subject || "Réponse", html, text });
  }

  async sendInactiveStatusEmail(user) {
    const siteSettings = await prisma.siteSettings.findFirst();
    const siteName = siteSettings?.siteName || "RIAFCO";
    const logoUrl = toAbsoluteUrl(siteSettings?.logo) || "http://localhost:3000/logo.png";
    const contactEmail = siteSettings?.contactEmail || "support@riafco.org";
    const loginUrl = `${(process.env.FRONTEND_URL || "").replace(/\/+$/, "")}/auth/login`;
    const subject = `Votre compte ${siteName} a été désactivé`;

    const html = buildEmailHtml({
      siteName,
      logoUrl,
      title: subject,
      heading: "Notification importante",
      contentHtml: `
        <p>Bonjour ${escapeHtml(user.firstName)},</p>
        <div class="box"><strong>Votre compte ${escapeHtml(siteName)} a été désactivé.</strong></div>
        <p>Raisons possibles :</p>
        <ul>
          <li>Inactivité prolongée</li>
          <li>Non-respect des conditions d'utilisation</li>
          <li>Mise à jour de nos politiques internes</li>
        </ul>
        <p>Pour en savoir plus, contactez-nous : <a href="mailto:${escapeHtml(contactEmail)}">${escapeHtml(contactEmail)}</a>.</p>
        <p style="text-align:center;"><a href="${escapeHtml(loginUrl)}" class="btn">Accéder à mon compte</a></p>
        <p>Attention : vos données pourraient être supprimées après 30 jours d'inactivité.</p>
      `,
    });

    const text = buildText([
      subject,
      `Bonjour ${user.firstName},`,
      `Compte désactivé sur ${siteName}.`,
      `Contact : ${contactEmail}`,
      `Accès : ${loginUrl}`,
    ]);

    return this.sendEmail({ to: user.email, subject, html, text });
  }

  async sendActiveStatusEmail(user) {
    const siteSettings = await prisma.siteSettings.findFirst();
    const siteName = siteSettings?.siteName || "RIAFCO";
    const logoUrl = toAbsoluteUrl(siteSettings?.logo) || "http://localhost:3000/logo.png";
    const contactEmail = siteSettings?.contactEmail || "support@riafco.org";
    const loginUrl = `${(process.env.FRONTEND_URL || "").replace(/\/+$/, "")}/auth/login`;
    const subject = `Votre compte ${siteName} est maintenant actif`;

    const html = buildEmailHtml({
      siteName,
      logoUrl,
      title: subject,
      heading: "Compte activé avec succès",
      contentHtml: `
        <p>Bonjour ${escapeHtml(user.firstName)},</p>
        <div class="box"><strong>Votre compte ${escapeHtml(siteName)} est maintenant actif.</strong></div>
        <p style="text-align:center;"><a href="${escapeHtml(loginUrl)}" class="btn">Se connecter à mon compte</a></p>
        <p>Recommandations :</p>
        <ul>
          <li>Mettre à jour vos informations personnelles</li>
          <li>Vérifier vos permissions et accès</li>
          <li>Explorer les fonctionnalités disponibles</li>
        </ul>
        <p>Besoin d’aide ? ${escapeHtml(contactEmail)}</p>
      `,
    });

    const text = buildText([
      subject,
      `Bonjour ${user.firstName},`,
      `Votre compte est actif. Connexion : ${loginUrl}`,
      `Support : ${contactEmail}`,
    ]);

    return this.sendEmail({ to: user.email, subject, html, text });
  }

  async sendMailToUser(contactEmail, subject, message, userName = "", attachments = []) {
    const siteSettings = await prisma.siteSettings.findFirst();
    const siteUrl = siteSettings?.siteUrl || process.env.FRONTEND_URL || "http://localhost:3000";
    const siteName = siteSettings?.siteName || "RIAFCO";
    const logoUrl = toAbsoluteUrl(siteSettings?.logo) || "http://localhost:3000/logo.png";
    const footer = siteSettings?.footer || `© ${new Date().getFullYear()} ${siteName}. Tous droits réservés.`;
    const loginUrl = `${siteUrl.replace(/\/+$/, "")}/auth/login`;

    const html = buildEmailHtml({
      siteName,
      logoUrl,
      title: subject || `Message - ${siteName}`,
      heading: siteName,
      contentHtml: `
        <p>Bonjour ${escapeHtml(userName || "Utilisateur")},</p>
        <div class="box">${escapeHtml(message || "").replace(/\n/g, "<br>")}</div>
        <p style="text-align:center;"><a href="${escapeHtml(loginUrl)}" class="btn">Accéder à votre compte</a></p>
        <p style="color:#777;font-size:12px;margin-top:16px;">${footer}</p>
      `,
    });

    const text = buildText([
      subject || `Message - ${siteName}`,
      `Bonjour ${userName || "Utilisateur"},`,
      message || "",
      `Accès : ${loginUrl}`,
      `L'équipe ${siteName}`,
    ]);

    return this.sendEmail({
      to: contactEmail,
      subject: subject || `Message - ${siteName}`,
      html,
      text,
      attachments,
    });
  }

  /** Template ultra-simple : seulement subject + message */
  async sendSimpleMail({ to, subject, message }) {
    const siteSettings = await prisma.siteSettings.findFirst();
    const { subject: finalSubject, html, text } = buildSimpleMailTemplate({
      subject,
      message,
      siteSettings,
    });
    return this.sendEmail({ to, subject: finalSubject, html, text });
  }
}

module.exports = new EmailService();
