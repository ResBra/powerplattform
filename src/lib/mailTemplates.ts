export const getNotificationTemplate = (data: { name: string, email: string, phone: string, message: string }) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
    <h2 style="color: #1e7536; text-transform: uppercase;">Neue Kontaktanfrage</h2>
    <p>Hallo Power Platform Team,</p>
    <p>eine neue Nachricht ist eingegangen:</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>E-Mail:</strong> ${data.email}</p>
    <p><strong>Telefon:</strong> ${data.phone || 'Nicht angegeben'}</p>
    <p><strong>Nachricht:</strong></p>
    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; font-style: italic;">
      ${data.message.replace(/\n/g, '<br>')}
    </div>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="font-size: 12px; color: #999;">Diese E-Mail wurde automatisch von Ihrer Website generiert.</p>
  </div>
`;

export const getConfirmationTemplate = (name: string) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; background: #ffffff; border-radius: 20px; border: 1px solid #f0f0f0;">
    <div style="text-align: center; margin-bottom: 30px;">
       <h1 style="color: #1e7536; font-style: italic; text-transform: uppercase;">Power Platform <span style="font-weight: normal; color: #333;">Immobilien</span></h1>
    </div>
    <h2 style="color: #111;">Vielen Dank für Ihre Nachricht, ${name.split(' ')[0]}!</h2>
    <p style="color: #555; line-height: 1.6;">
      Wir haben Ihre Anfrage erhalten und freuen uns über Ihr Interesse. 
      Unser Team wird sich schnellstmöglich persönlich bei Ihnen melden.
    </p>
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f0f0f0;">
      <p style="margin: 0; font-weight: bold; color: #1e7536;">Power Platform Team</p>
      <p style="margin: 5px 0; color: #999; font-size: 14px;">Alte Kölner Str. 16, 51674 Wiehl</p>
    </div>
  </div>
`;
