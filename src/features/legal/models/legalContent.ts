import { COMPANY_NAME } from '../../../shared/brand/product'

/** The company details used in both legal pages. Keep them in one place. */
export const LEGAL = {
  company: COMPANY_NAME,
  address: '6 T. Bugallon St., Marikina Heights, Marikina City 1810, Philippines',
  privacyEmail: 'privacy@steelsync.ph',
  supportEmail: 'inquire@alphaexplora.com',
  version: '2026-11',
  updated: 'November 2026',
  court: 'Marikina City',
} as const

export type LegalBlock =
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'table'; head: string[]; rows: string[][] }

export interface LegalSection {
  id: string
  heading: string
  blocks: LegalBlock[]
}

export interface LegalDocument {
  title: string
  intro: string
  sections: LegalSection[]
}

const p = (text: string): LegalBlock => ({ kind: 'p', text })
const ul = (...items: string[]): LegalBlock => ({ kind: 'ul', items })
const table = (head: string[], rows: string[][]): LegalBlock => ({ kind: 'table', head, rows })

export const PRIVACY_POLICY: LegalDocument = {
  title: 'Privacy Policy',
  intro: `SteelSync PH is run by ${LEGAL.company}, ${LEGAL.address}. This policy explains how we handle personal data under the Data Privacy Act of 2012 (Republic Act No. 10173). Version ${LEGAL.version}, last updated ${LEGAL.updated}.`,
  sections: [
    {
      id: 'who',
      heading: '1. Who we are and how to reach us',
      blocks: [
        p(`**ALPHAEXPLORA INC.** ("SteelSync PH", "we", "us"). Our Data Protection Officer can be reached at **${LEGAL.privacyEmail}**.`),
      ],
    },
    {
      id: 'roles',
      heading: '2. The two roles we play',
      blocks: [
        ul(
          '**For gym owners, gym staff and people who contact us**, SteelSync PH decides why and how their data is used. We are the "personal information controller".',
          '**For gym members**, the gym decides why and how the data is used. SteelSync PH only handles it on the gym\'s instructions to run the platform. We are the "personal information processor", and the gym is the controller. Each gym gives its members its own privacy notice.',
        ),
      ],
    },
    {
      id: 'collect',
      heading: '3. What we collect',
      blocks: [
        table(
          ['Who', 'What', 'Why'],
          [
            ['Gym owners and staff', 'Name, work email, phone, role, gym name and address, login records, actions taken in the platform (audit log)', 'To set up and run the gym\'s account, keep it secure, and bill the gym'],
            ['People who use the Contact Us form', 'Name, email, phone, gym name and address, landmark', 'To reply to your inquiry and set up a demo'],
            ['Gym members (handled for the gym)', 'Name, email, phone, city, photo, membership plan and dates, check-in records, payment records and receipt images', 'To run the gym\'s membership, check-in and payments'],
            ['Members of gyms that use the Coach add-on', 'The training program the coach writes for the member, and the coach\'s notes. We do not collect weight, height or BMI. Coaches are told not to record medical details.', 'To let the coach plan and share training'],
          ],
        ),
        p('We do not collect government ID numbers or health measurements such as weight, height or BMI, and we do not profile members or make automated decisions about them.'),
      ],
    },
    {
      id: 'use',
      heading: '4. How we use it',
      blocks: [
        ul(
          'To provide, secure and support the platform.',
          'To send service messages, for example expiry or payment reminders sent on behalf of a gym.',
          'To meet legal duties and handle disputes.',
          'To create de-identified, aggregated statistics (for example peak check-in hours or plan popularity) that cannot identify a person. We may keep these for up to 5 years to improve the platform.',
        ),
        p('We do not sell personal data and we do not use it for advertising.'),
      ],
    },
    {
      id: 'basis',
      heading: '5. Why we may use it',
      blocks: [
        p('For members, the gym relies on the member\'s consent and on the membership contract. For gym owners, we rely on our service contract and our legitimate interest in running and securing the service. For people who contact us, we rely on your consent. We keep proof of consent: when it was given, who recorded it, and which notice version applied.'),
      ],
    },
    {
      id: 'share',
      heading: '6. Who we share it with',
      blocks: [
        p('We share data only with service providers that help us run the platform, under written terms:'),
        table(
          ['Provider', 'What for', 'Where'],
          [
            ['Supabase', 'Database, sign-in, file storage', 'Singapore'],
            ['Render', 'Hosting of our server', 'Outside the Philippines'],
            ['Cloudflare', 'Website delivery and network protection', 'Global network'],
            ['Resend', 'Sending email', 'Outside the Philippines'],
            ['GitHub', 'Storing encrypted backup files', 'Outside the Philippines'],
          ],
        ),
        p('Because these providers store data outside the Philippines, your data may be processed abroad. We use contracts and security measures that keep it protected. We may also disclose data when the law, a court or the National Privacy Commission requires it.'),
        p('The gym a member belongs to can see that member\'s data. We never share one gym\'s data with another gym.'),
      ],
    },
    {
      id: 'keep',
      heading: '7. How long we keep it',
      blocks: [
        table(
          ['Data', 'How long'],
          [
            ['Active member data', 'While the member is active'],
            ['A terminated member\'s identifying data', 'Removed automatically 6 months after termination. A gym can also erase a member at any time, and the member can ask for it'],
            ['Payment amounts and dates', 'Kept for accounting and tax purposes for the period the law requires, without receipt images or personal details'],
            ['De-identified statistics', 'Up to 5 years'],
            ['Encrypted backups', '30 days, then deleted'],
            ['Audit log (a security record)', 'Kept. It cannot be edited, so lines written before a member was erased may still show the name'],
            ['Contact Us messages', 'Emailed to our team and a copy to you. Not stored in our database. Kept in our email for up to 12 months'],
          ],
        ),
        p('When identifying data is removed, we keep a record with no name, contact details, photo or receipt. It cannot be traced to a person. Data in backups is deleted when the backup expires.'),
      ],
    },
    {
      id: 'protect',
      heading: '8. How we protect it',
      blocks: [
        ul(
          'Data is encrypted in transit (HTTPS) and at rest by our database provider.',
          'Each gym\'s data is separated from every other gym\'s by database access rules.',
          'Photos and receipts are kept in private storage and opened with short-lived links.',
          'Access is by role. Sensitive actions are recorded in an audit log that cannot be edited.',
          'Encrypted daily backups, kept for 30 days.',
          'If a breach puts people at real risk of serious harm, we tell the National Privacy Commission and the people affected within 72 hours, as the law requires. For member data we tell the gym without delay.',
        ),
      ],
    },
    {
      id: 'rights',
      heading: '9. Your rights',
      blocks: [
        p('You have the right to be informed, to access your data, to correct it, to object, to ask us to erase or block it, to data portability, to claim damages if you are harmed, and to complain to the National Privacy Commission (privacy.gov.ph).'),
        ul(
          '**Members:** ask your gym first. The gym can download your data and erase it from the platform. You can also email us and we will pass your request to the gym and help it respond.',
          '**Gym owners, staff and people who contacted us:** email ' + LEGAL.privacyEmail + '.',
        ),
        p('We aim to answer within 15 days.'),
      ],
    },
    {
      id: 'cookies',
      heading: '10. Cookies and similar storage',
      blocks: [p('The platform uses only the browser storage it needs to keep you signed in. We do not use advertising or tracking cookies.')],
    },
    {
      id: 'children',
      heading: '11. Children',
      blocks: [p('The platform is for gyms and their adult members. A gym must get a parent or guardian\'s consent for any member under 18.')],
    },
    {
      id: 'changes',
      heading: '12. Changes',
      blocks: [p(`We will post changes here with a new version and date, and tell gym owners when a change is important. Questions: ${LEGAL.privacyEmail}.`)],
    },
  ],
}

export const TERMS: LegalDocument = {
  title: 'Terms of Service',
  intro: `These Terms apply to anyone who uses the SteelSync PH website and platform (the "Service"), run by ${LEGAL.company}, ${LEGAL.address}. Version ${LEGAL.version}, last updated ${LEGAL.updated}.`,
  sections: [
    { id: 'about', heading: '1. About these Terms', blocks: [p('Gyms that subscribe also sign a Service Agreement. If the two conflict, the Service Agreement applies.')] },
    {
      id: 'accounts',
      heading: '2. Accounts',
      blocks: [
        ul(
          'Only gyms that have signed a Service Agreement, and people the gym invites, may use the platform.',
          'The gym owner is responsible for the staff and coaches it invites, and for what they do in the platform.',
          'Keep passwords secret. Tell us at once if you think an account has been misused. We may suspend an account that is being misused.',
        ),
      ],
    },
    {
      id: 'use',
      heading: '3. Acceptable use',
      blocks: [p('You must not access another gym\'s data, try to break or bypass security, upload unlawful or harmful content, use the platform to send spam, or collect personal data that you do not have a lawful reason to collect.')],
    },
    {
      id: 'gym',
      heading: '4. The gym\'s data and responsibilities',
      blocks: [
        ul(
          'The gym owns its data and is the controller of its members\' personal data. It must give members the privacy notice, obtain their consent, and answer their requests. The Data Processing Agreement covers this.',
          'The gym\'s coaches must not record medical diagnoses or conditions in coach notes.',
          'The gym is responsible for the accuracy of what it enters, and for its own legal duties, such as official receipts and taxes.',
        ),
      ],
    },
    {
      id: 'us',
      heading: '5. Our responsibilities',
      blocks: [
        ul(
          'We run the platform with reasonable care and security, and we handle member data only on the gym\'s instructions.',
          'We work to keep the platform available, but we do not promise it will never be interrupted. We will tell gyms in advance about planned maintenance when we can.',
        ),
      ],
    },
    { id: 'fees', heading: '6. Fees', blocks: [p('Fees, billing and payment terms are in the Service Agreement.')] },
    {
      id: 'ip',
      heading: '7. Intellectual property',
      blocks: [p('The platform, its design and software belong to ALPHAEXPLORA INC. We give the gym a limited, non-exclusive, non-transferable right to use it during the subscription. The gym keeps all rights to its own data. We may create de-identified, aggregated statistics from usage, as the Privacy Policy explains.')],
    },
    {
      id: 'end',
      heading: '8. Ending use',
      blocks: [p('A gym may end its subscription as the Service Agreement allows. When it ends, we make the gym\'s data available for export for 30 days and then handle it under the retention rules in the Privacy Policy.')],
    },
    {
      id: 'liability',
      heading: '9. Limits of liability',
      blocks: [p('To the extent the law allows, we are not liable for indirect or lost-profit losses. Our total liability for any claim is limited to the fees the gym paid in the 12 months before the claim. Nothing here limits liability that the law does not allow to be limited.')],
    },
    { id: 'changes', heading: '10. Changes', blocks: [p('We may update these Terms. We will give gym owners at least 30 days\' notice of material changes.')] },
    { id: 'law', heading: '11. Governing law', blocks: [p(`Philippine law applies. Disputes go first to good-faith discussion, and then to the courts of ${LEGAL.court}.`)] },
    { id: 'contact', heading: '12. Contact', blocks: [p(`General: ${LEGAL.supportEmail}. Privacy: ${LEGAL.privacyEmail}.`)] },
  ],
}
