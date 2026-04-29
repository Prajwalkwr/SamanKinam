const forgotPasswordTemplate = ({ name, otp, url })=>{
    return `
<div>
    <p>Dear ${name},</p>
    <p>You requested a password reset for your Saman Kinam account.</p>
    <p>Click the link below to reset your password. This link is valid for 1 hour.</p>
    <p><a href="${url}" target="_blank" rel="noopener noreferrer">Reset your password</a></p>
    <p>If your email client does not show the link, copy and paste this URL into your browser:</p>
    <p><a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></p>
    <p>Or use this one-time code if you prefer:</p>
    <div style="background:yellow; font-size:20px;padding:20px;text-align:center;font-weight:800;">
        ${otp}
    </div>
    <p>If you did not request this, please ignore this email.</p>
    <br/>
    <p>Thanks,</p>
    <p>Saman Kinam</p>
</div>
    `
}

export default forgotPasswordTemplate