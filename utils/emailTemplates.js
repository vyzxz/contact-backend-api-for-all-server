export const createOwnerEmailTemplate = (data) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; }
        .email-container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; position: relative; }
        .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0,0 L100,0 L100,100 Z" fill="rgba(255,255,255,0.1)"/></svg>'); background-size: cover; }
        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 10px; position: relative; z-index: 1; }
        .header p { font-size: 16px; opacity: 0.9; position: relative; z-index: 1; }
        .content { padding: 40px 30px; }
        .notification-badge { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-block; margin-bottom: 20px; }
        .lead-info { background: #f8f9fa; padding: 25px; border-radius: 15px; border-left: 4px solid #667eea; margin-bottom: 30px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
        .info-item { display: flex; flex-direction: column; gap: 5px; }
        .info-label { font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
        .info-value { font-size: 16px; font-weight: 600; color: #333; }
        .message-section { background: white; border: 2px solid #f1f3f4; border-radius: 12px; padding: 20px; margin-top: 20px; }
        .message-label { font-size: 14px; font-weight: 600; color: #667eea; margin-bottom: 10px; display: block; }
        .message-content { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 3px solid #667eea; font-size: 14px; line-height: 1.8; white-space: pre-wrap; }
        .priority-indicator { background: linear-gradient(135deg, #ffd93d 0%, #ff9a3d 100%); color: white; padding: 12px 20px; border-radius: 10px; text-align: center; margin: 25px 0; font-weight: 600; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 25px; font-weight: 600; text-align: center; margin: 20px 0; transition: transform 0.3s ease; }
        .cta-button:hover { transform: translateY(-2px); }
        .footer { background: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef; }
        .footer-links { display: flex; justify-content: center; gap: 20px; margin: 15px 0; }
        .footer-link { color: #667eea; text-decoration: none; font-size: 14px; }
        .timestamp { font-size: 12px; color: #666; margin-top: 15px; }
        @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } .content { padding: 25px 20px; } .header { padding: 30px 20px; } }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🚀 New Lead Alert!</h1>
            <p>Someone just contacted you through your portfolio</p>
        </div>
        
        <div class="content">
            <div class="notification-badge">🔥 HIGH PRIORITY - RESPOND WITHIN 24H</div>
            
            <div class="lead-info">
                <h2 style="color: #333; margin-bottom: 20px;">Contact Details</h2>
                
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">👤 Full Name</span>
                        <span class="info-value">${data.name}</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">📧 Email Address</span>
                        <span class="info-value">
                            <a href="mailto:${data.email}" style="color: #667eea; text-decoration: none;">${data.email}</a>
                        </span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">🎯 Subject</span>
                        <span class="info-value">${data.subject}</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">⏰ Received</span>
                        <span class="info-value">${new Date().toLocaleString('en-US', { 
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}</span>
                    </div>
                </div>
            </div>
            
            <div class="message-section">
                <span class="message-label">💬 Message Content</span>
                <div class="message-content">${data.message}</div>
            </div>
            
            <div class="priority-indicator">⚡ Opportunity Alert: This could be your next big project!</div>
            
            <center>
                <a href="mailto:${data.email}?subject=Re: ${data.subject}&body=Hi ${data.name.split(' ')[0]}," class="cta-button">✨ Reply Now</a>
            </center>
        </div>
        
        <div class="footer">
            <p style="color: #666; margin-bottom: 15px;">This message was sent automatically from your portfolio contact form.</p>
            
            <div class="footer-links">
                <a href="#" class="footer-link">View Portfolio</a>
                <a href="#" class="footer-link">Contact Settings</a>
                <a href="#" class="footer-link">Privacy Policy</a>
            </div>
            
            <div class="timestamp">Message ID: ${Date.now()}-${Math.random().toString(36).substr(2, 9)}</div>
        </div>
    </div>
</body>
</html>
  `;
};

export const createUserEmailTemplate = (data) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Contacting VYZ Portfolio</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; }
        .email-container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 50px 30px; text-align: center; position: relative; }
        .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0,0 L100,0 L100,100 Z" fill="rgba(255,255,255,0.1)"/></svg>'); background-size: cover; }
        .header-content { position: relative; z-index: 1; }
        .welcome-icon { font-size: 48px; margin-bottom: 20px; display: block; }
        .header h1 { font-size: 32px; font-weight: 700; margin-bottom: 10px; }
        .header p { font-size: 18px; opacity: 0.9; }
        .content { padding: 50px 30px; }
        .greeting { font-size: 24px; color: #333; margin-bottom: 30px; font-weight: 600; }
        .thank-you-message { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 25px; border-radius: 15px; text-align: center; margin-bottom: 30px; }
        .thank-you-message h2 { font-size: 20px; margin-bottom: 10px; }
        .confirmation-details { background: #f8f9fa; padding: 25px; border-radius: 15px; border-left: 4px solid #667eea; margin-bottom: 30px; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .detail-item { display: flex; flex-direction: column; gap: 5px; }
        .detail-label { font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
        .detail-value { font-size: 16px; font-weight: 600; color: #333; }
        .next-steps { background: white; border: 2px solid #e9ecef; border-radius: 12px; padding: 25px; margin: 30px 0; }
        .steps-title { font-size: 20px; color: #333; margin-bottom: 20px; text-align: center; font-weight: 600; }
        .steps-list { list-style: none; padding: 0; }
        .step-item { display: flex; align-items: flex-start; gap: 15px; margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px; transition: transform 0.3s ease; }
        .step-item:hover { transform: translateX(5px); }
        .step-icon { font-size: 20px; background: #667eea; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .step-content h3 { font-size: 16px; color: #333; margin-bottom: 5px; }
        .step-content p { font-size: 14px; color: #666; line-height: 1.6; }
        .assurance { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 12px; text-align: center; margin: 25px 0; }
        .social-links { display: flex; justify-content: center; gap: 15px; margin: 25px 0; }
        .social-link { width: 40px; height: 40px; background: #667eea; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; transition: transform 0.3s ease; }
        .social-link:hover { transform: translateY(-3px); }
        .footer { background: #2d3748; color: white; padding: 30px; text-align: center; }
        .footer-links { display: flex; justify-content: center; gap: 20px; margin: 20px 0; }
        .footer-link { color: #cbd5e0; text-decoration: none; font-size: 14px; }
        .footer-link:hover { color: white; }
        .copyright { font-size: 12px; color: #a0aec0; margin-top: 20px; }
        @media (max-width: 600px) { .details-grid { grid-template-columns: 1fr; } .content { padding: 30px 20px; } .header { padding: 40px 20px; } }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="header-content">
                <span class="welcome-icon">🎉</span>
                <h1>Thank You, ${data.name}!</h1>
                <p>Your message has been received successfully</p>
            </div>
        </div>
        
        <div class="content">
            <div class="greeting">Hi ${data.name.split(' ')[0]},</div>
            
            <div class="thank-you-message">
                <h2>✨ Welcome to the VYZ Family!</h2>
                <p>We're thrilled that you've taken the first step toward your next amazing project.</p>
            </div>
            
            <div class="confirmation-details">
                <h3 style="color: #333; margin-bottom: 20px;">📋 Message Confirmation</h3>
                
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Message ID</span>
                        <span class="detail-value">VYZ-${Date.now().toString().slice(-6)}</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">Submitted On</span>
                        <span class="detail-value">${new Date().toLocaleString('en-US', { 
                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">Subject</span>
                        <span class="detail-value">${data.subject}</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">Priority</span>
                        <span class="detail-value" style="color: #48bb78;">⭐ High Priority</span>
                    </div>
                </div>
            </div>
            
            <div class="next-steps">
                <h2 class="steps-title">🚀 What Happens Next?</h2>
                
                <ul class="steps-list">
                    <li class="step-item">
                        <div class="step-icon">1</div>
                        <div class="step-content">
                            <h3>Immediate Review</h3>
                            <p>Our team is already reviewing your project requirements and will get back to you within 24 hours.</p>
                        </div>
                    </li>
                    
                    <li class="step-item">
                        <div class="step-icon">2</div>
                        <div class="step-content">
                            <h3>Initial Consultation</h3>
                            <p>We'll schedule a free discovery call to understand your vision and requirements in detail.</p>
                        </div>
                    </li>
                    
                    <li class="step-item">
                        <div class="step-icon">3</div>
                        <div class="step-content">
                            <h3>Project Proposal</h3>
                            <p>You'll receive a detailed proposal with timeline, deliverables, and investment details.</p>
                        </div>
                    </li>
                    
                    <li class="step-item">
                        <div class="step-icon">4</div>
                        <div class="step-content">
                            <h3>Kick-off & Development</h3>
                            <p>Once approved, we'll start bringing your vision to life with regular updates.</p>
                        </div>
                    </li>
                </ul>
            </div>
            
            <div class="assurance">
                <h3 style="margin-bottom: 10px;">💫 Your Vision, Our Mission</h3>
                <p>We're committed to delivering exceptional results that exceed your expectations. Your project success is our top priority!</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <p style="color: #666; margin-bottom: 15px;">
                    <strong>Need immediate assistance?</strong><br>
                    Feel free to reply directly to this email or contact us through our social channels:
                </p>
                
                <div class="social-links">
                    <a href="#" class="social-link">💼</a>
                    <a href="#" class="social-link">🐦</a>
                    <a href="#" class="social-link">📸</a>
                    <a href="#" class="social-link">💻</a>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p style="margin-bottom: 15px; font-size: 14px;">Thank you for considering VYZ Portfolio for your project needs.</p>
            
            <div class="footer-links">
                <a href="#" class="footer-link">Our Portfolio</a>
                <a href="#" class="footer-link">Services</a>
                <a href="#" class="footer-link">Privacy Policy</a>
                <a href="#" class="footer-link">Unsubscribe</a>
            </div>
            
            <div class="copyright">© 2024 VYZ Portfolio. All rights reserved.<br>Transforming ideas into digital reality.</div>
        </div>
    </div>
</body>
</html>
  `;

};