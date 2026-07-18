import * as React from 'react';
import { ContactFormData } from '@/lib/validations/contact';

interface ContactConfirmationEmailProps {
  data: ContactFormData;
}

export const ContactConfirmationEmail: React.FC<Readonly<ContactConfirmationEmailProps>> = ({
  data,
}) => (
  <div style={{ fontFamily: 'sans-serif', color: '#333' }}>
    <h1>Thank you for your submission, {data.name}!</h1>
    <p>We have successfully received your editing brief.</p>
    <p>Our editorial team will review your project details and get back to you shortly at <strong>{data.email}</strong>.</p>
    
    <p>If you have any immediate questions, feel free to reply to this email or reach us at hello@tweaks.co.za.</p>

    <br />
    <p>Best regards,</p>
    <p><strong>The Tweaks Team</strong></p>
  </div>
);

export default ContactConfirmationEmail;
