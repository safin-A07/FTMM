const nodemailer = require('nodemailer');

const DEFAULT_SMTP_PORT = 587;
const SMTP_PORT = Number(process.env.EMAIL_PORT) || DEFAULT_SMTP_PORT;
const EMAIL_PROVIDER = (process.env.EMAIL_PROVIDER || 'auto').toLowerCase();

const useResend =
    EMAIL_PROVIDER === 'resend' ||
    (EMAIL_PROVIDER === 'auto' && Boolean(process.env.RESEND_API_KEY));

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    requireTLS: SMTP_PORT !== 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: Number(process.env.EMAIL_CONNECTION_TIMEOUT_MS) || 15000,
    greetingTimeout: Number(process.env.EMAIL_GREETING_TIMEOUT_MS) || 10000,
    socketTimeout: Number(process.env.EMAIL_SOCKET_TIMEOUT_MS) || 20000,
});

const sendViaResend = async ({ to, subject, html }) => {
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        const detail = data?.message || data?.error || `HTTP ${response.status}`;
        const error = new Error(`Resend error: ${detail}`);
        error.code = 'RESEND_ERROR';
        throw error;
    }

    return data;
};

const sendViaSmtp = async ({ to, subject, html }) => {
    return transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
    });
};

const sendEmail = async (options) => {
    const payload = {
        to: options.to,
        subject: options.subject,
        html: options.message,
    };

    try {
        const info = useResend ? await sendViaResend(payload) : await sendViaSmtp(payload);
        console.log(`Email sent via ${useResend ? 'Resend' : 'SMTP'} to ${payload.to}`);
        return info;
    } catch (error) {
        console.error(`Email error (${useResend ? 'Resend' : 'SMTP'}):`, error);
        throw error;
    }
};

module.exports = sendEmail;
