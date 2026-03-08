require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendWithResend() {
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_USER,
            subject: 'FTMM Email Configuration Test (Resend)',
            html: `
                <h2>Email Configuration Test</h2>
                <p>Your Resend setup is working correctly.</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            `,
        }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.message || data?.error || `HTTP ${response.status}`);
    }

    console.log('Email sent successfully via Resend!');
    console.log(`Response: ${JSON.stringify(data)}\n`);
}

async function sendWithSmtp() {
    const smtpPort = Number(process.env.EMAIL_PORT) || 587;
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: smtpPort,
        secure: smtpPort === 465,
        requireTLS: smtpPort !== 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: Number(process.env.EMAIL_CONNECTION_TIMEOUT_MS) || 15000,
        greetingTimeout: Number(process.env.EMAIL_GREETING_TIMEOUT_MS) || 10000,
        socketTimeout: Number(process.env.EMAIL_SOCKET_TIMEOUT_MS) || 20000,
    });

    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection successful!\n');

    console.log('Sending test email...');
    const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_USER,
        subject: 'FTMM Email Configuration Test (SMTP)',
        html: `
            <h2>Email Configuration Test</h2>
            <p>Your SMTP setup is working correctly.</p>
            <p><strong>Email Address:</strong> ${process.env.EMAIL_USER}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        `,
    });

    console.log('Email sent successfully via SMTP!');
    console.log(`Message ID: ${info.messageId}\n`);
}

async function testEmail() {
    const provider = (process.env.EMAIL_PROVIDER || 'auto').toLowerCase();
    const useResend =
        provider === 'resend' ||
        (provider === 'auto' && Boolean(process.env.RESEND_API_KEY));

    console.log(`Testing email configuration (${useResend ? 'Resend' : 'SMTP'})...\n`);

    try {
        if (useResend) {
            await sendWithResend();
        } else {
            await sendWithSmtp();
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        console.error('\nTroubleshooting tips:');
        console.error('1. Verify EMAIL_FROM and recipient address');
        console.error('2. For SMTP, use a valid app password and open SMTP ports');
        console.error('3. On Render, prefer Resend API if SMTP times out');
        process.exit(1);
    }
}

testEmail();
