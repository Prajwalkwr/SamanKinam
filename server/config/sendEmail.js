import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv'

dotenv.config({ path: new URL('../.env', import.meta.url).pathname })

const resendApiKey = process.env.RESEND_API?.trim()
const hasValidResendApiKey = typeof resendApiKey === 'string' && resendApiKey.startsWith('re_')
const resend = hasValidResendApiKey ? new Resend(resendApiKey) : null
const emailFrom = process.env.EMAIL_FROM?.trim() || process.env.EMAIL_USER?.trim() || 'stockidfour@gmail.com'

if (resendApiKey && !hasValidResendApiKey) {
    console.warn('RESEND_API is set but not a valid Resend API key. Falling back to SMTP if configured.')
}

if (!process.env.EMAIL_FROM) {
    console.warn('EMAIL_FROM is not set in .env. Using fallback sender address:', emailFrom)
}

if (process.env.EMAIL_SERVICE === 'gmail' && process.env.EMAIL_USER && !process.env.EMAIL_USER.includes('@')) {
    console.warn('EMAIL_USER should be a valid Gmail address when EMAIL_SERVICE=gmail. Current value:', process.env.EMAIL_USER)
}

const transporter = process.env.EMAIL_USER && process.env.EMAIL_PASS ? nodemailer.createTransport({
    host: process.env.EMAIL_SERVICE === 'gmail' ? 'smtp.gmail.com' : process.env.EMAIL_HOST,
    port: process.env.EMAIL_SERVICE === 'gmail' ? 465 : Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SERVICE === 'gmail' ? true : Boolean(process.env.EMAIL_SECURE === 'true'),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
}) : null

const sendWithResend = async({ sendTo, subject, html, text }) => {
    const result = await resend.emails.send({
        from: emailFrom,
        to: sendTo,
        subject,
        html,
        text,
    })
    console.log('Resend email response:', { to: sendTo, subject, id: result?.id })
    return result
}

const sendWithSmtp = async({ sendTo, subject, html, text }) => {
    const info = await transporter.sendMail({
        from: emailFrom,
        to: sendTo,
        subject,
        html,
        text,
    })
    console.log('SMTP email response:', { to: sendTo, subject, messageId: info?.messageId })
    return info
}

const sendEmail = async({sendTo, subject, html, text })=>{
    const useGmailSmtp = process.env.EMAIL_SERVICE === 'gmail' && transporter

    if (useGmailSmtp) {
        try {
            return await sendWithSmtp({ sendTo, subject, html, text })
        } catch (error) {
            console.log('Gmail SMTP failed:', error)
            if (error.responseCode === 535 || error.code === 'EAUTH') {
                throw new Error('Gmail authentication failed. Use a valid Gmail app password and ensure your account allows SMTP access.')
            }
            // Fall back to Resend if available
            if (resend) {
                console.warn('Gmail SMTP failed, trying Resend fallback:', error?.message || error)
                return await sendWithResend({ sendTo, subject, html, text })
            }
            throw error
        }
    }

    if (resend) {
        try {
            return await sendWithResend({ sendTo, subject, html, text })
        } catch (error) {
            console.warn('Resend failed, retrying with SMTP if available:', error?.message || error)
            if (transporter) {
                return await sendWithSmtp({ sendTo, subject, html, text })
            }
            throw error
        }
    }

    if (transporter) {
        try {
            return await sendWithSmtp({ sendTo, subject, html, text })
        } catch (error) {
            console.log(error)
            if (error.responseCode === 535 || error.code === 'EAUTH') {
                throw new Error('SMTP authentication failed. Use a valid app password and ensure your account allows SMTP access.')
            }
            throw error
        }
    }

    throw new Error('Email provider is not configured. Set RESEND_API or EMAIL_USER and EMAIL_PASS in the server .env file.')
}

export default sendEmail

