//.js → 일반 JavaScript
//.jsx → React 컴포넌트 (JavaScript + HTML 섞어서 쓰는 문법)

// LoginPage.jsx
// 로그인 / 회원가입 화면

// 1. React 훅 import
import { useState } from 'react'; // React 라이브러리에서 useState라는 기능을 가져오는 것. node_modules 안에 react 폴더가 있고 거기서 꺼내오는 것이다.
import api from '../services/api';

// 2. 컴포넌트 = 함수 형태
function LoginPage({ onLogin }) {
  // 현재 모드 (login: 로그인, register: 회원가입)

  // 3. useState - 화면 상태 관리
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    // Frontend Validation
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    if (mode === 'register' && !nickname) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
    const payload = mode === 'login'
      ? { email, password }
      : { email, password, nickname };

    const response = await api.post(endpoint, payload);

    // 로그인 성공 시 토큰 저장 후 부모 컴포넌트에 알림
    if (mode === 'login') {
      localStorage.setItem('token', response.data.token);
      onLogin(response.data.user);
      return;
    }

    // 회원가입 성공 시 로그인 모드로 전환
    setMode('login');
    setError('회원가입 완료! 로그인해주세요.');
  };


  const styles = {
    page: {
      minHeight: '100vh',
      //background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      background: 'linear-gradient(135deg, #e0f2f1 0%, #78ddf7 30%, #80deea 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    card: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '24px',
      padding: '48px 40px',
      width: '100%',
      maxWidth: '400px',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
    },
    title: {
      fontSize: '32px',
      fontWeight: '800',
      color: '#0a90c1',
      textAlign: 'center',
      marginBottom: '4px',
      letterSpacing: '-0.5px',
    },
    subtitle: {
      fontSize: '14px',
      color: '#0a90c1',
      textAlign: 'center',
      marginBottom: '32px',
    },
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '600',
      color: 'rgba(10,114,193,0.8)',
      textAlign: 'center',
      marginBottom: '8px',
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      background: 'rgba(255,255,255)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '12px',
      color: 'rgba(10,114,193,0.8)',
      fontSize: '15px',
      marginBottom: '16px',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s',
    },
    primaryBtn: {
      width: '100%',
      padding: '15px',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      border: 'none',
      borderRadius: '12px',
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: '700',
      cursor: 'pointer',
      marginBottom: '12px',
      letterSpacing: '0.3px',
    },
    secondaryBtn: {
      width: '100%',
      padding: '14px',
      background: 'transparent',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '12px',
      color: 'rgba(0,0,0,0.7)',
      fontSize: '14px',
      cursor: 'pointer',
    },
    error: {
      color: '#ff6b6b',
      fontSize: '13px',
      textAlign: 'center',
      marginBottom: '16px',
      padding: '10px',
      background: 'rgba(255,107,107,0.1)',
      borderRadius: '8px',    },
    success: {
      color: '#4ecdc4',
      fontSize: '13px',
      textAlign: 'center',
      marginBottom: '16px',
      padding: '10px',
      background: 'rgba(78,205,196,0.1)',
      borderRadius: '8px',
    },
  };

  const isSuccess = error.includes('완료');


  // 4. return 안에 HTML처럼 생긴 JSX 반환
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>⏱ Time Box</h1>
        <p style={styles.subtitle}>
          {mode === 'login' ? '일론 머스크처럼 하루를 설계하세요' : '계정을 만들어 시작하세요'}
        </p>

        <div>
          <label style={styles.label}>이메일</label>
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            style={styles.input}
          />

          <label style={styles.label}>비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            style={styles.input}
          />

          {mode === 'register' && (
            <>
              <label style={styles.label}>닉네임</label>
              <input
                type="text"
                placeholder="닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                style={styles.input}
              />
            </>
          )}

          {error && (
            <p style={isSuccess ? styles.success : styles.error}>{error}</p>
          )}

          <button style={styles.primaryBtn} onClick={handleSubmit}>
            {mode === 'login' ? '로그인' : '회원가입'}
          </button>

          <button
            style={styles.secondaryBtn}
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
          >
            {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;