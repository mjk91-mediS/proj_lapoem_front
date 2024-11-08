import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchCommunityPostsData,
  fetchUserStats,
  fetchHotTopics,
  fetchTopUsers,
} from '../../redux/features/auth/apiSlice';
import './Community.css';
import publicIcon from '../../assets/images/public-icon.png';
import meIcon from '../../assets/images/only-me-icon.png';
import documentIcon from '../../assets/images/document.png';
import chartIcon from '../../assets/images/chart.png';
import rank1Icon from '../../assets/images/rank1-icon.png';
import rank2Icon from '../../assets/images/rank2-icon.png';
import rank3Icon from '../../assets/images/rank3-icon.png';

const Community = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [viewType, setViewType] = useState('Public'); // Public or Only me
  const [userStats, setUserStats] = useState({
    totalPosts: 0,
    totalComments: 0,
  });
  const [hotTopics, setHotTopics] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  const {
    fetchCommunityPosts: communityPosts,
    isLoading,
    isError,
    errorMessage,
  } = useSelector((state) => state.api);
  const {
    user: currentUser,
    isLoggedIn,
    isAuthInitializing,
    authInitialized,
  } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log('Current user state:', currentUser);
  }, [currentUser]);

  useEffect(() => {
    dispatch(fetchHotTopics()).then((result) => {
      if (result.payload) {
        setHotTopics(result.payload);
      }
    });
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchTopUsers()).then((result) => {
      if (result.payload) {
        setTopUsers(result.payload);
      }
    });
  }, [dispatch]);

  const notices = [
    {
      id: 1,
      isNotice: true,
      title:
        '라보엠 커뮤니티 공지사항입니다. 커뮤니티 사용 전에 꼭 읽어주세요.',
      date: '2024-11-07',
    },
    {
      id: 2,
      isNotice: true,
      title: '커뮤니티 기능 업데이트 공지',
      date: '2024-11-07',
    },
  ];

  useEffect(() => {
    if (authInitialized && currentUser?.memberNum) {
      const memberNum = currentUser.memberNum;
      console.log('Fetching stats for member_num:', memberNum);
      dispatch(fetchUserStats(memberNum)).then((result) => {
        if (result.error) {
          console.error('Error fetching user stats:', result.error);
        } else if (result.payload) {
          setUserStats({
            totalPosts: result.payload.total_posts,
            totalComments: result.payload.total_comments,
          });
        }
      });
    }
  }, [authInitialized, currentUser, dispatch]);

  useEffect(() => {
    setIsLoadingPosts(true);
    if (viewType === 'Public') {
      // 로그인 여부와 관계없이 Public 게시물 로드
      dispatch(fetchCommunityPostsData({ viewType: 'Public' })).then(() => {
        setIsLoadingPosts(false);
      });
    } else if (viewType === 'Only me' && isLoggedIn && currentUser?.memberNum) {
      // 로그인된 사용자만 'Only me' 게시물 로드
      dispatch(
        fetchCommunityPostsData({
          viewType: 'Only me',
          member_num: currentUser.memberNum,
        })
      ).then(() => {
        setIsLoadingPosts(false);
      });
    } else {
      setIsLoadingPosts(false); // 로그인하지 않고 'Only me'인 경우에는 로딩 상태를 종료
    }
  }, [viewType, isLoggedIn, currentUser, dispatch]);

  const handleViewChange = (type) => {
    setViewType(type);
  };

  // 필터링된 게시글
  const filteredPosts = communityPosts.filter((post) => {
    if (viewType === 'Public') {
      return post.visibility === true;
    } else if (viewType === 'Only me') {
      return (
        post.visibility === false &&
        Number(post.member_num) === Number(currentUser?.memberNum)
      );
    }
    return false;
  });

  if (filteredPosts.length > 0) {
    console.log('Filtered Posts:', filteredPosts);
  }

  const handlePostClick = (postId) => {
    navigate(`/community/${postId}`);
  };

  const handleNewForumClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault(); // 기본 링크 동작 막기
      const confirmLogin = window.confirm(
        '회원 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?'
      );
      if (confirmLogin) {
        navigate('/login'); // 확인을 누르면 로그인 페이지로 이동
      }
    }
  };

  const truncateContent = (content, maxLength = 100) => {
    if (content.length > maxLength) {
      return (
        <>
          {content.substring(0, maxLength)}...
          <span className="read-more">자세히 보기</span>
        </>
      );
    }
    return content;
  };

  return (
    <div className="community-container">
      <div className="content-wrapper">
        <div className="main-content">
          <div className="header">
            <h1 className="community-title">COMMUNITY</h1>
            <div className="view-options">
              <button
                className={viewType === 'Public' ? 'active' : ''}
                onClick={() => handleViewChange('Public')}
              >
                <img src={publicIcon} alt="Public" className="icon" />
                Public
              </button>
              <button
                className={viewType === 'Only me' ? 'active' : ''}
                onClick={() => handleViewChange('Only me')}
              >
                <img src={meIcon} alt="Only me" className="icon" />
                Only me
              </button>
            </div>
          </div>

          <div className="posts-container">
            {/* 공지사항 표시 */}
            {notices.map((notice) => (
              <div key={notice.id} className="post-item notice-post">
                <div className="post-header">
                  <span className="notice-tag">[공지]</span>
                  <div className="notice-contents">
                    <h3>{notice.title}</h3>
                  </div>
                  <span className="date">{notice.date}</span>
                </div>
              </div>
            ))}

            {/* 작성된 게시글 표시 */}
            {isLoadingPosts ? (
              <div>Loading posts...</div>
            ) : isError ? (
              <p>{errorMessage}</p>
            ) : viewType === 'Only me' && !isLoggedIn ? (
              <p>로그인 후 이용해주세요.</p>
            ) : filteredPosts.length === 0 ? (
              <p>No posts found.</p>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.posts_id}
                  className="post-item regular-post"
                  onClick={() => handlePostClick(post.posts_id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="post-middle">
                    <div className="post-contents">
                      <h3>{post.post_title}</h3>
                      <p>{truncateContent(post.post_content, 200)}</p>
                    </div>
                    <div className="post-footer">
                      <div className="post-info-left">
                        <span className="post-author">
                          작성자: {post.member_nickname}
                        </span>
                        <span className="post-date">
                          작성날짜:{' '}
                          {new Date(post.post_created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="comment-count-wrapper">
                        <img
                          src={require('../../assets/images/comment.png')}
                          alt="Comment Icon"
                          className="comment-icon"
                        />
                        <span className="comment-count">
                          {post.comments_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          <div className="my-forums-section">
            <div className="my-forums-header">
              {isLoggedIn
                ? currentUser?.nickname || currentUser?.name || 'User'
                : '로그아웃 상태'}{' '}
            </div>
            <div className="my-forums-stats">
              <div className="my-forums-stat">
                <img src={documentIcon} alt="My Forums Icon" />
                <div className="my-forums-stat-title">My Forums</div>
                <div className="my-forums-stat-value">
                  {userStats.totalPosts}
                </div>
              </div>
              <div className="my-forums-stat">
                <img src={chartIcon} alt="Total Views Icon" />
                <div className="my-comment-stat-title">My Comment</div>
                <div className="my-comment-stat-value">
                  {userStats.totalComments}
                </div>
              </div>
            </div>
          </div>
          <div className="sidebar-section">
            <h2>Today's Hot Forums</h2>
            <div className="hot-topics">
              {hotTopics.map((topic, index) => (
                <div
                  key={topic.posts_id}
                  className="topic-item"
                  onClick={() => navigate(`/community/${topic.posts_id}`)}
                >
                  <img
                    src={
                      index === 0
                        ? rank1Icon
                        : index === 1
                        ? rank2Icon
                        : rank3Icon
                    }
                    alt={`Rank ${index + 1} Icon`}
                    className="topic-icon"
                  />
                  <span>{topic.post_title}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="sidebar-section">
            <h2>Today's People</h2>
            <div className="top-users">
              {topUsers.map((user, index) => (
                <div key={index} className="user-item">
                  <img
                    src={
                      index === 0
                        ? rank1Icon
                        : index === 1
                        ? rank2Icon
                        : rank3Icon
                    }
                    alt={`Rank ${index + 1} Icon`}
                    className="user-icon"
                  />
                  <span>{user.member_nickname}</span>
                </div>
              ))}
            </div>
          </div>

          {/* New Forums Button */}
          <div className="sidebar-section">
            <Link to="/new_forum" onClick={handleNewForumClick}>
              <button className="new-forum-button">New Forum</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
