import React, { useEffect } from 'react';
import { useLocation } from 'react-router';
import { Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../common/component/Sidebar';
import Navbar from '../common/component/Navbar';
import ToastMessage from '../common/component/ToastMessage';
import { loginWithToken } from '../features/user/userSlice';
import { getCartQty } from '../features/cart/cartSlice';

// 각 컴포넌트별로 NavBar 컴포넌트를 계속 사용해 줘야 하는 번거로움이 있는데
// 이 컴포넌트로 App.js에서 모든 페이지를 감싸면 공통적으로 보여 줄 수 있음
// AppLayout == NavBar/SideBar
const AppLayout = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.user);
  // useEffect : 페이지 처음 렌더링 될 때 useEffect 안에 있는 함수가 실행됨 (기능 1)
  // (기능 2) : 배열 안에 state 함수를 넣으면 state가 바뀔 때마다 useEffect 안에 있는 게 또 실행됨
  useEffect(() => {
    dispatch(loginWithToken()); //토큰으로 로그인하기
  }, []);

  useEffect(() => {
    if (user) {
      dispatch(getCartQty());
    }
  }, [user]);
  return (
    <div>
      <ToastMessage />
      {location.pathname.includes('admin') ? (
        <Row className="vh-100">
          <Col xs={12} md={3} className="sidebar mobile-sidebar">
            <Sidebar />
          </Col>
          <Col xs={12} md={9}>
            {children}
          </Col>
        </Row>
      ) : (
        <>
          {/* 앱 레이아웃에서 네브바도 만들어 주고 있음 */}
          <Navbar user={user} />
          {children}
        </>
      )}
    </div>
  );
};

export default AppLayout;
