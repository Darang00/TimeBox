// api.js
// 백엔드 API 호출 설정 (axios 인스턴스)

import axios from 'axios'; // axios: 브라우저에서 HTTP 요청을 쉽게 보낼 수 있게 해주는 라이브러리

// axios 인스턴스 생성 - 모든 API 요청의 기본 설정
const api = axios.create({
  baseURL: 'https://timebox-gzom.onrender.com/api', // 백엔드 서버 주소
});

// 요청 인터셉터 - API 요청 보내기 전에 자동으로 실행
// JWT 토큰을 매 요청마다 헤더에 자동으로 붙여줌
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // localStorage: 브라우저가 기본으로 제공하는 전역 객체. 별도로 import하거나 선언할 필요 없이 JavaScript 어디서든 바로 쓸 수 있음.

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;