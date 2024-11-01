import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import Main from './components/Main/Main';
import Booklist from './components/BookList/Booklist';
import Stella from './components/Stella/Stella';
import Community from './components/Community/Community';
import Community_detail from './components/Community/Community_detail';
import NewForum from './components/Community/NewForum';
import Join from './components/Auth/Join';
import Login from './components/Auth/Login';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { initializeAuth } from './redux/features/auth/authSlice';

function App() {
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(initializeAuth()); // 앱 로드 시 인증 상태 초기화
  }, [dispatch]);

  return (
    <BrowserRouter>
      <div className="App">
        <NavBar />
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/join" element={<Join />} />
          <Route path="/login" element={<Login />} />
          <Route path="/booklist" element={<Booklist />} />
          <Route path="/chatstella" element={<Stella />} />
          <Route path="/community" element={<Community />} />
          <Route path="/new-forum" element={<NewForum />} />
          <Route path="/community_detail" element={<Community_detail />} />

          <Route path="/community/:communityid" element={<Community_detail />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {/* Catch all unmatched routes and redirect to Home */}
      </div>
    </BrowserRouter>
  );
}

export default App;
