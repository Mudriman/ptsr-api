import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
})

export const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: '"PTSD Therapy" <sagkzizni@gmail.com>',
      to,
      subject,
      text,
      html: `<b>${text}</b>`
    })
    return true
  } catch (error) {
    console.error('Email error:', error)
    return false
  }
}