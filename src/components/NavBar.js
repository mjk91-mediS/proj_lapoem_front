import React, { useState, useEffect } from 'react';
import './navbar.css';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser, clearMessage } from '../redux/features/auth/authSlice';
import { useNavigate } from 'react-router-dom'; // useNavigate 훅 임포트

import logo_w from '../assets/images/logo-w.png';
import login from '../assets/images/login.png';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // useNavigate 훅 호출
  const { isLoggedIn, message } = useSelector((state) => state.auth);
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 메뉴 열림 상태 관리

  const navItems = [
    { path: '/', label: 'HOME' },
    { path: '/book_list', label: 'BOOK LIST' },
    { path: '/chatstella', label: 'STELLA CHAT' },
    { path: '/thread_on', label: 'THREAD ON' },
    { path: '/community', label: 'COMMUNITY' },
  ];

  const handleLogout = async () => {
    await dispatch(logoutUser()); // 서버와 클라이언트 모두에서 로그아웃 처리
    setIsMenuOpen(false); // 로그아웃 후 메뉴 닫기
  };

  useEffect(() => {
    // 로그아웃 성공 시 메시지 표시
    if (message) {
      alert(message); // "로그아웃 되었습니다." 메시지 표시
      dispatch(clearMessage()); // 메시지 초기화
      navigate('/'); // 홈으로 리다이렉트
    }
  }, [message, dispatch, navigate]);

  return (
    <nav className="nav-container">
      <div className="nav-wrapper">
        <div>
          <Link to="/">
            <img src={logo_w} alt="logo" className="w-[140px] h-[48px]" />
          </Link>
        </div>
        <div className="nav-list">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <p>{item.label}</p>
            </Link>
          ))}
        </div>
        <div className="ml-10">
          {isLoggedIn ? (
            <div className="profile-container">
              <img
                src={login}
                alt="login"
                className="profile-icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)} // 클릭 시 메뉴 토글
              />
              {isMenuOpen && (
                <div className="profile-menu">
                  <Link to="/mypage" onClick={() => setIsMenuOpen(false)}>
                    마이페이지
                  </Link>
                  <button onClick={handleLogout}>로그아웃</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <img src={login} alt="login" className="w-10 h-10" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
