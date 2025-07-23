import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

export const sendEmail = async (to, subject, text) => {
  // Проверка наличия и валидности email
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    console.error('Invalid recipient email:', to);
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: '"PTSD Therapy" <sagkzizni@gmail.com>',
      to: to, // Убедитесь, что это строка (не массив)
      subject: subject,
      text: text,
      html: `<b>${text}</b>`
    });

    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};