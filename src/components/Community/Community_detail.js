import React, { useEffect, useState } from 'react';
import './Community_detail.css';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchCommunityPostDetail,
  addCommentToPost,
  fetchCommentsByPostId,
  updateCommunityPostData,
  deleteCommunityPostData,
  deleteCommentData,
  fetchUserStats,
  fetchHotTopics,
  fetchTopUsers,
} from '../../redux/features/auth/apiSlice';
import publicIcon from '../../assets/images/public-icon.png';
import vectorIcon from '../../assets/images/Vector.png';
import meIcon from '../../assets/images/only-me-icon.png';
import documentIcon from '../../assets/images/document.png';
import chartIcon from '../../assets/images/chart.png';
import rank1Icon from '../../assets/images/rank1-icon.png';
import rank2Icon from '../../assets/images/rank2-icon.png';
import rank3Icon from '../../assets/images/rank3-icon.png';
import deleteIcon from '../../assets/images/delete.png';

const CommunityDetail = () => {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  const [commentLength, setCommentLength] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [userStats, setUserStats] = useState({
    totalPosts: 0,
    totalComments: 0,
  });
  const [hotTopics, setHotTopics] = useState([]);
  const [topUsers, setTopUsers] = useState([]);

  // Redux state에서 postDetail을 가져올 때 구조를 확인하고 적절히 수정
  const postDetail = useSelector((state) => state.api.postDetail);
  const comments = useSelector((state) => state.api.comments);
  const isLoading = useSelector((state) => state.api.isLoading);
  const isError = useSelector((state) => state.api.isError);
  const errorMessage = useSelector((state) => state.api.errorMessage);
  const memberNum = useSelector((state) => state.auth.user?.memberNum);

  const {
    user: currentUser,
    isLoggedIn,
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

  useEffect(() => {
    console.log('Current Post ID:', postId); // postId가 제대로 들어오는지 확인
    if (postId) {
      dispatch(fetchCommunityPostDetail(postId));
      dispatch(fetchCommentsByPostId(postId));
    }
  }, [dispatch, postId]);

  useEffect(() => {
    console.log('Comments:', comments); // 댓글 상태가 제대로 업데이트되는지 확인
  }, [comments]);

  useEffect(() => {
    console.log('Post Detail:', postDetail);
    if (postDetail) {
      setEditTitle(postDetail.post_title);
      setEditContent(postDetail.post_content);
    }
  }, [postDetail]);

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

  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
    setCommentLength(e.target.value.length);
  };

  const handleCommentSubmit = async () => {
    if (commentText.trim() === '') {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    if (!memberNum) {
      alert('로그인 후 댓글을 작성하실 수 있습니다.');
      return;
    }

    const newComment = {
      posts_id: postId,
      member_num: memberNum,
      member_nickname: postDetail.member_nickname,
      comment_content: commentText,
      comment_created_at: new Date().toISOString(),
    };

    try {
      // 댓글 작성 액션 호출
      await dispatch(addCommentToPost(newComment));
      // 댓글 작성 후 최신 게시글 정보를 다시 가져옴
      dispatch(fetchCommunityPostDetail(postId));
      dispatch(fetchCommentsByPostId(postId));
      // 작성 후 텍스트 및 길이 초기화
      setCommentText('');
      setCommentLength(0);
    } catch (error) {
      console.error('Failed to submit comment:', error);
    }
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('이 댓글을 삭제하시겠습니까?')) {
      dispatch(deleteCommentData(commentId)).then(() => {
        dispatch(fetchCommentsByPostId(postId));
      });
    }
  };

  const handleEditClick = () => {
    if (window.confirm('이 게시글을 수정하시겠습니까?')) {
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    const updatedData = {
      ...(editTitle && { post_title: editTitle }),
      ...(editContent && { post_content: editContent }),
    };

    dispatch(updateCommunityPostData({ postId, updatedData })).then(() => {
      setIsEditing(false);
      dispatch(fetchCommunityPostDetail(postId));
    });
  };

  const handleNewForumClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault(); // 기본 링크 동작 막기
      alert('로그인 후 게시글을 작성하실 수 있습니다.');
    }
  };

  const handleDeletePost = () => {
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      dispatch(deleteCommunityPostData(postId)).then(() => {
        navigate('/community');
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {errorMessage}</div>;
  }

  if (!postDetail || !postDetail.post_title) {
    return <div>Loading post details...</div>;
  }

  return (
    <div className="community-detail-container">
      <div className="content-wrapper">
        <div className="main-content">
          <h1 className="community-title">COMMUNITY</h1>
          {isEditing ? (
            <div>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              ></textarea>
              <button onClick={handleSaveEdit}>저장</button>
              <button onClick={handleCancelEdit}>취소</button>
            </div>
          ) : (
            <>
              <div className="post-title">{postDetail.post_title}</div>
              <div className="post-meta">
                <span className="post-author">
                  {postDetail.member_nickname}
                </span>
                <span className="post-date">
                  {new Date(postDetail.post_created_at).toLocaleString()}
                </span>
                <img
                  src={postDetail.visibility ? publicIcon : meIcon}
                  alt={postDetail.visibility ? 'Public' : 'Only me'}
                  className="icon"
                />
              </div>
              <div className="post-content">
                {postDetail.post_content}
                {postDetail.member_num === memberNum && (
                  <div className="post-edit-delete-buttons">
                    <button
                      className="post-edit-button"
                      onClick={handleEditClick}
                    >
                      수정
                    </button>
                    <button
                      className="post-delete-button"
                      onClick={handleDeletePost}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          <div className="comment-section">
            <h2>전체 댓글</h2>
            <div className="comment-count-wrapper">
              <img
                src={require('../../assets/images/comment.png')}
                alt="Comment count icon"
                className="comment-icon"
              />
              <span className="comment-count">
                {postDetail.comments_count || 0}
              </span>
            </div>
          </div>
          <div className="comments-list">
            {comments?.map((comment) => (
              <div key={comment.comment_id} className="comment">
                <div className="comment-header">
                  <span className="comment-author">
                    {comment.member_nickname}
                  </span>
                  <span className="comment-date">
                    {new Date(comment.comment_created_at).toLocaleString()}
                  </span>
                </div>
                <div className="comment-text">{comment.comment_content}</div>
                {comment.member_num === memberNum && (
                  <button
                    className="comment-delete-button"
                    onClick={() => handleDeleteComment(comment.comment_id)}
                  >
                    <img src={deleteIcon} alt="Delete Comment" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Sidebar */}
        <div className="sidebar">
          <div className="my-forums-section">
            <div className="my-forums-header">
              {currentUser?.nickname || currentUser?.name || 'User'} 님
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
                <div className="my-comment-stat-title">Total Comment</div>
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
      <div className="big-add-comment">
        <div className="add-comment">
          <div className="comment-input-wrapper">
            <textarea
              placeholder="댓글을 입력해주세요."
              maxLength={300}
              value={commentText}
              onChange={handleCommentChange}
            ></textarea>
          </div>
          <div className="comment-length-button-wrapper">
            <span className="comment-length">({commentLength}/300)</span>
            <button className="comment-button" onClick={handleCommentSubmit}>
              Leave a Comment
            </button>
          </div>
        </div>
        <Link to="/community" className="to-list-button">
          To list <img src={vectorIcon} alt="vector" className="v_icon" />
        </Link>
      </div>
    </div>
  );
};

export default CommunityDetail;
