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
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('이메일 형식을 확인하세요.');
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
  
    try {
      const response = await api.post(endpoint, payload);
  
      if (mode === 'login') {
        localStorage.setItem('token', response.data.token);
        onLogin(response.data.user);
        return;
      }
  
      setMode('login');
      setError('회원가입 완료! 로그인해주세요.');
    } catch (err) {
      const code = err.response?.data?.code;
  
      if (code === 'USER_NOT_FOUND') {
        setError('해당 사용자를 찾을 수 없습니다.');
        return;
      }
      if (code === 'INVALID_PASSWORD') {
        setError('비밀번호를 확인하세요.');
        return;
      }
      setError(err.response?.data?.message || '오류가 발생했습니다.');
    }
  };

  // 4. return 안에 HTML처럼 생긴 JSX 반환
  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
      <h1>Time Box</h1>
      <h2>{mode === 'login' ? '로그인' : '회원가입'}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        {mode === 'register' && (
          <input
            type="text"
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        )}

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button onClick={handleSubmit}>
          {mode === 'login' ? '로그인' : '회원가입'}
        </button>

        <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? '회원가입하기' : '로그인하기'}
        </button>
      </div>
    </div>
  );
}

export default LoginPage;