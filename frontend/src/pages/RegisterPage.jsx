import AuthForm from '../components/AuthForm.jsx'

export default function RegisterPage({ onNavigate }) {
  return <AuthForm mode="register" onNavigate={onNavigate} />
}
