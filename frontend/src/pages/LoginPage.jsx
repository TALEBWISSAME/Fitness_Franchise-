import AuthForm from '../components/AuthForm.jsx'

export default function LoginPage({ onNavigate }) {
  return <AuthForm mode="login" onNavigate={onNavigate} />
}
