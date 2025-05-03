import React, { useEffect } from 'react';
import { useLocation } from 'react-router';
import { Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../common/component/Sidebar';
import Navbar from '../common/component/Navbar';
import ToastMessage from '../common/component/ToastMessage';
import { loginWithToken } from '../features/user/userSlice';
import { getCartQty } from '../features/cart/cartSlice';

const AppLayout = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.user);
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
