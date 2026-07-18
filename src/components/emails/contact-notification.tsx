import * as React from 'react';
import { ContactFormData } from '@/lib/validations/contact';

interface ContactNotificationEmailProps {
  data: ContactFormData;
}

export const ContactNotificationEmail: React.FC<Readonly<ContactNotificationEmailProps>> = ({
  data,
}) => (
  <div style={{ fontFamily: 'sans-serif', color: '#333' }}>
    <h1>New Editing Brief Submitted</h1>
    <p>A new project brief has been submitted on tweaks.co.za.</p>
    
    <h2>Contact Details</h2>
    <ul>
      <li><strong>Name:</strong> {data.name}</li>
      <li><strong>Email:</strong> {data.email}</li>
      <li><strong>WhatsApp:</strong> {data.whatsapp}</li>
    </ul>

    <h2>Project Details</h2>
    <ul>
      <li><strong>Document Types:</strong> {data.documentTypes.join(', ')} {data.documentTypeOther ? `(${data.documentTypeOther})` : ''}</li>
      <li><strong>Study Level:</strong> {data.studyLevel} {data.studyLevelOther ? `(${data.studyLevelOther})` : ''}</li>
      <li><strong>Page Count:</strong> {data.pageCount}</li>
      <li><strong>Reference Page Count:</strong> {data.referencePageCount}</li>
    </ul>

    <h2>Editing Requirements</h2>
    <ul>
      <li><strong>Services Required:</strong> {data.services.join(', ')} {data.serviceOther ? `(${data.serviceOther})` : ''}</li>
      <li><strong>Main Goal:</strong> {data.mainGoal || 'N/A'}</li>
      <li><strong>Concerns:</strong> {data.concerns || 'N/A'}</li>
      <li><strong>Referencing Style:</strong> {data.referencingStyle}</li>
    </ul>

    <h2>Logistics</h2>
    <ul>
      <li><strong>Deadline:</strong> {data.deadline}</li>
      <li><strong>Submission Date:</strong> {data.submissionDate}</li>
      <li><strong>Tracked Changes:</strong> {data.trackedChanges} {data.trackedChangesOther ? `(${data.trackedChangesOther})` : ''}</li>
      <li><strong>Certificate Required:</strong> {data.certificate}</li>
      <li><strong>Funding:</strong> {data.funding || 'N/A'}</li>
    </ul>

    <h2>Additional Info</h2>
    <p>{data.additionalInfo || 'None provided.'}</p>
  </div>
);

export default ContactNotificationEmail;
