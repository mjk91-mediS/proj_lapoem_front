import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { CREATE_BOOK_REVIEW_API_URL } from '../../util/apiUrl';
// 별점 처리 이미지
import heartRating from '../../assets/images/heart-rating.png';
import heartRatingHalf from '../../assets/images/heart-half-rating.png';
import heartRatingEmpty from '../../assets/images/heart-rating-empty.png';

import './Booklist.css';

const BookCreateReview = ({ handleAddReview }) => {
  const { bookId } = useParams();
  const [reviewContent, setReviewContent] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const navigate = useNavigate();
  const reviewBoxRef = useRef(null);

  const member_num = useSelector((state) => state.auth.user?.memberNum);

  useEffect(() => {
    console.log('Redux member_num:', member_num); // Redux에서 member_num 확인
  }, [member_num]); // member_num이 변경될 때마다 실행

  const handleReviewSubmit = async () => {
    if (!member_num) {
      alert('회원 로그인이 필요합니다.'); // 로그인 확인
      console.log('User not logged in'); // 로그인 확인 콘솔 출력
      return;
    }
    console.log('Logged in user:', member_num);

    try {
      const response = await axios.post(
        CREATE_BOOK_REVIEW_API_URL(bookId),
        {
          review_content: reviewContent,
          rating,
          member_num,
        },
        { withCredentials: true }
      );

      console.log('Review successfully posted:', response.data);

      // 날짜를 'DD.MM.YY (HH24:MI)' 형식으로 포맷팅하는 함수
      const formatDate = (date) => {
        const options = {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        };
        const formattedDate = date.toLocaleString('en-GB', options); // 'en-GB'를 사용하여 24시간 형식을 지원

        // 문자열을 분리하여 형식에 맞게 조합
        const [day, month, year, hour, minute] =
          formattedDate.split(/[\/,\s:]+/);
        return `${day}.${month}.${year} (${hour}:${minute})`;
      };

      // 서버에서 반환되는 데이터 구조 확인
      const newReview = {
        review_num: response.data.review_num, // 서버에서 제공되는 review ID
        review_content: reviewContent,
        rating: rating,
        review_created_at: formatDate(new Date()), // 서버가 반환하는 시간 형식에 맞춰서 저장
        member_nickname: response.data.member_nickname, // 서버가 반환하는 작성자 별명
        member_num: member_num,
      };

      setReviewContent(''); // 리뷰 내용 초기화
      setRating(0); // 평점 초기화

      if (reviewBoxRef.current) {
        reviewBoxRef.current.textContent = ''; //편집한 내용 초기화
      }
      handleAddReview(newReview);
    } catch (error) {
      console.error('Error posting review:', error); // 에러 발생 시 콘솔 출력
    }
  };

  // 리뷰 입력창 클릭 이벤트 핸들러 추가
  const handleReviewBoxClick = () => {
    if (!member_num) {
      alert('회원 로그인이 필요합니다.');
      navigate('/login');
    }
  };

  // 별점 처리
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const score = i * 2; // 2, 4, 6, 8, 10 점

      // 반 개 하트 여부를 판단하는 함수
      const handleMouseEnter = (e) => {
        const halfWidth = e.target.offsetWidth / 2; // 하트의 절반 너비
        const mouseX = e.clientX - e.target.getBoundingClientRect().left; // 마우스 위치 (좌측 기준)
        if (mouseX < halfWidth) {
          setHoverRating(i * 2 - 1); // 마우스가 왼쪽 절반에 있을 때 반 개 하트
        } else {
          setHoverRating(i * 2); // 마우스가 오른쪽 절반에 있을 때 전체 하트
        }
      };

      const handleMouseLeave = () => {
        setHoverRating(0); // 마우스가 벗어나면 기본 상태로
      };

      // 로그인 않을 경우 알럭 처리
      const handleClick = () => {
        if (!member_num) {
          alert('회원 로그인이 필요합니다.'); // Show alert for unauthenticated users
          navigate('/login'); // Redirect to login page
        } else {
          setRating(i * 2); // Set the rating if user is logged in
        }
      };

      // 채워진 하트 이미지 결정
      let starImage;
      if (score <= (hoverRating || rating)) {
        // 색이 채워진 경우
        if (hoverRating === i * 2 - 1 || rating === i * 2 - 1) {
          // 반개 하트일 때
          starImage = heartRatingHalf;
        } else {
          // 전체 하트일 때
          starImage = heartRating;
        }
      } else {
        starImage = heartRatingEmpty; // 빈 하트
      }

      stars.push(
        <img
          key={i}
          src={starImage} // 반개 하트 또는 전체 하트 전환
          alt={`star-${i}`}
          className="star"
          onClick={handleClick}
          onMouseEnter={handleMouseEnter} // 마우스 올리면 반개 하트로 색 변화 (0.5 단위)
          onMouseMove={handleMouseEnter} // 마우스 이동할 때도 색 변화
          onMouseLeave={handleMouseLeave} // 마우스가 벗어나면 기본 상태로
        />
      );
    }
    return stars;
  };

  return (
    <div className="book-review-create">
      <div
        className="book-review-box"
        ref={reviewBoxRef}
        contentEditable
        onClick={handleReviewBoxClick} // 로그인 확인 기능 추가
        onInput={(e) => setReviewContent(e.currentTarget.textContent)}
        placeholder="책에 대한 리뷰를 작성해주세요."
        suppressContentEditableWarning={true}
      ></div>
      <div className="book-rating">{renderStars()}</div>
      <button onClick={handleReviewSubmit}>Submit Review</button>
      {/* 새로 제출된 리뷰를 바로 화면에 표시 */}
    </div>
  );
};

export default BookCreateReview;
