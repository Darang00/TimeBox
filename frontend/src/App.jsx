// App.jsx
// 앱의 최상위 컴포넌트 - 어떤 화면을 보여줄지 결정

import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import TimeBoxPage from './pages/TimeBoxPage';

function App() {
  // user가 null이면 로그인 화면, 있으면 TimeBox 화면
  const [user, setUser] = useState(null); // user라는 변수를 선언함과 동시에 초기값이 null인 상태를 만듬, setUser → 상태를 바꾸는 함수 (setUSer 가 실행되면 user에 setUser 함수의 매개변수인 json 객체로 교체가 됨.)

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <TimeBoxPage user={user} onLogout={handleLogout} />;
}

export default App;