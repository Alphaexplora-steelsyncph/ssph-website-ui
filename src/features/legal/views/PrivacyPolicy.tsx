import { PRIVACY_POLICY } from '../models/legalContent'
import { LegalPage } from './LegalPage'

const PrivacyPolicy = () => <LegalPage doc={PRIVACY_POLICY} other={{ to: '/terms', label: 'Terms of Service' }} />
export default PrivacyPolicy
