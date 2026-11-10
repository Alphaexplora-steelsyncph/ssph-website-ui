import { TERMS } from '../models/legalContent'
import { LegalPage } from './LegalPage'

const Terms = () => <LegalPage doc={TERMS} other={{ to: '/privacy', label: 'Privacy Policy' }} />
export default Terms
