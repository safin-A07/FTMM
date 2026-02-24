require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('🔧 Testing Gmail Configuration...\n');

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        // Verify the connection
        console.log('📞 Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection successful!\n');

        // Send test email
        console.log('📧 Sending test email...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_USER,
            subject: '✅ FTMM Email Configuration Test',
            html: `
                <h2>Email Configuration Test</h2>
                <p>Congratulations! Your NodeMailer Gmail setup is working correctly.</p>
                <p><strong>Email Address:</strong> ${process.env.EMAIL_USER}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                <hr>
                <p>This is a test email from FTMM (Football Turf Match Management)</p>
            `,
        });

        console.log('✅ Email sent successfully!');
        console.log(`📨 Message ID: ${info.messageId}\n`);
        console.log('✨ Your Gmail setup is ready to send notifications!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\n⚠️  Troubleshooting tips:');
        console.error('1. Make sure you\'re using an App Password (not your regular Gmail password)');
        console.error('2. Verify the email and password in your .env file');
        console.error('3. Check that "Less secure app access" is not the issue (use App Password instead)');
        console.error('4. Ensure SMTP port 587 is not blocked by your firewall\n');
        process.exit(1);
    }
}

testEmail();
