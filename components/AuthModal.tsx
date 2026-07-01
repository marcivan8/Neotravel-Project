'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'

interface Props {
  mode: 'login' | 'signup'
  onClose: () => void
  onSwitchMode: (mode: 'login' | 'signup') => void
}

interface StoredUser {
  email: string
  password?: string
  name: string
}

export default function AuthModal({ mode, onClose, onSwitchMode }: Props) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Initialize mock users in localStorage on mount
  useEffect(() => {
    const existing = localStorage.getItem('neo_users')
    if (!existing) {
      const defaultUsers: StoredUser[] = [
        { email: 'user@neotravel.com', password: 'password123', name: 'Jean Voyageur' },
        { email: 'admin@neotravel.com', password: 'admin', name: 'Admin NeoTravel' },
      ]
      localStorage.setItem('neo_users', JSON.stringify(defaultUsers))
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!email || !password || (mode === 'signup' && !name)) {
      setErrorMsg('Veuillez remplir tous les champs.')
      return
    }

    const usersStr = localStorage.getItem('neo_users') || '[]'
    let users: StoredUser[] = []
    try {
      users = JSON.parse(usersStr)
    } catch {
      users = []
    }

    if (mode === 'login') {
      const found = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      )
      if (found) {
        setSuccessMsg('Connexion réussie !')
        setTimeout(() => {
          login(found.email, found.name)
          onClose()
        }, 800)
      } else {
        setErrorMsg('Identifiants incorrects. Testez avec user@neotravel.com / password123')
      }
    } else {
      // Sign-up
      const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase())
      if (exists) {
        setErrorMsg('Cet email est déjà enregistré.')
        return
      }

      const newUser: StoredUser = {
        email: email.toLowerCase(),
        password,
        name,
      }
      users.push(newUser)
      localStorage.setItem('neo_users', JSON.stringify(users))

      setSuccessMsg('Inscription réussie ! Bienvenue chez NeoTravel.')
      setTimeout(() => {
        login(newUser.email, newUser.name)
        onClose()
      }, 1000)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(21, 24, 14, 0.65)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'ntFade 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#ffffff',
          borderRadius: 20,
          boxShadow: '0 24px 60px -15px rgba(21, 24, 14, 0.35)',
          overflow: 'hidden',
          fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
          color: '#1b1f15',
          border: '1px solid rgba(46,58,31,0.08)',
          position: 'relative',
          padding: '36px 30px',
          animation: 'ntZoom 0.24s cubic-bezier(0.2,0.8,0.2,1)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'rgba(46,58,31,0.06)',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            color: '#565a4d',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(46,58,31,0.12)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(46,58,31,0.06)')}
        >
          &times;
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <img
              src="/brand/svg/neotravel-logo.svg"
              alt="NeoTravel"
              height={48}
              style={{ objectFit: 'contain' }}
            />
          </div>
          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(46,58,31,0.08)', marginBottom: 20 }} />
          <h2
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 22,
              fontWeight: 700,
              color: '#15180e',
              margin: '0 0 6px',
            }}
          >
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </h2>
          <p style={{ fontSize: 13.5, color: '#565a4d', margin: 0 }}>
            {mode === 'login'
              ? "Accédez à vos devis et à l'assistant NeoTravel"
              : "Rejoignez-nous pour organiser votre trajet de groupe"}
          </p>
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div
            style={{
              background: '#fbeae3',
              border: '1px solid #f0c9b8',
              color: '#b4471f',
              padding: '11px 14px',
              borderRadius: 10,
              fontSize: 13.5,
              fontWeight: 500,
              marginBottom: 20,
              lineHeight: 1.4,
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              background: '#eef8eb',
              border: '1px solid #cce8c4',
              color: '#387c2b',
              padding: '11px 14px',
              borderRadius: 10,
              fontSize: 13.5,
              fontWeight: 500,
              marginBottom: 20,
              lineHeight: 1.4,
            }}
          >
            ✓ {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'signup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#33382a' }}>Nom complet</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Jean Voyageur"
                required
                style={{
                  padding: '11px 14px',
                  borderRadius: 10,
                  border: '1px solid rgba(46,58,31,0.16)',
                  fontSize: 15,
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#2e3a1f')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(46,58,31,0.16)')}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#33382a' }}>Adresse e-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex. nom@compagnie.com"
              required
              style={{
                padding: '11px 14px',
                borderRadius: 10,
                border: '1px solid rgba(46,58,31,0.16)',
                fontSize: 15,
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#2e3a1f')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(46,58,31,0.16)')}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#33382a' }}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                padding: '11px 14px',
                borderRadius: 10,
                border: '1px solid rgba(46,58,31,0.16)',
                fontSize: 15,
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#2e3a1f')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(46,58,31,0.16)')}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{
              background: '#2e3a1f',
              color: '#f3f2ec',
              border: 'none',
              padding: '13px 20px',
              borderRadius: 12,
              fontSize: 15.5,
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: 8,
              transition: 'transform 0.2s, background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1f2613'
              e.currentTarget.style.transform = 'scale(1.02)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2e3a1f'
              e.currentTarget.style.transform = 'none'
            }}
          >
            {mode === 'login' ? 'Se connecter' : 'S’inscrire'}
          </button>
        </form>

        {/* Footer switcher */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#565a4d' }}>
          {mode === 'login' ? (
            <>
              Nouveau sur NeoTravel ?{' '}
              <button
                onClick={() => onSwitchMode('signup')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2e3a1f',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                  fontFamily: 'inherit',
                }}
              >
                Créer un compte
              </button>
            </>
          ) : (
            <>
              Déjà inscrit ?{' '}
              <button
                onClick={() => onSwitchMode('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2e3a1f',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                  fontFamily: 'inherit',
                }}
              >
                Se connecter
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
