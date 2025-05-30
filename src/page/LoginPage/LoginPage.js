import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './style/login.style.css';
import { loginWithEmail, loginWithGoogle } from '../../features/user/userSlice';
import { clearErrors } from '../../features/user/userSlice';
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loginError } = useSelector((state) => state.user);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (loginError) {
      dispatch(clearErrors());
    }
  }, [navigate]);
  const handleLoginWithEmail = (event) => {
    event.preventDefault();
    dispatch(loginWithEmail({ email, password, navigate }));
  };

  const handleGoogleLogin = async (googleData) => {
    //구글 로그인 하기
    // console.log('heheheh', googleData);
    // dispatch(loginWithGoogle(googleData.credential)); //보내야 되는 정보 : goolgedata의 credential
  };

  // user 값이 있다면 굳이 로그인 페이지 안 보여 줘도 됨
  // 그래서 user가 로그인했을 경우 메인페이지가 렌더링 되도록 설정한 것
  if (user) {
    navigate('/');
  }

  return (
    <>
      <Container className="login-area">
        {loginError && (
          <div className="error-message">
            <Alert variant="danger">{loginError}</Alert>
          </div>
        )}
        <Form className="login-form" onSubmit={handleLoginWithEmail}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              required
              onChange={(event) => setEmail(event.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              required
              onChange={(event) => setPassword(event.target.value)}
            />
          </Form.Group>
          <div className="display-space-between login-button-area">
            <Button variant="danger" type="submit">
              Login
            </Button>
            <div>
              아직 계정이 없으세요?<Link to="/register">회원가입 하기</Link>{' '}
            </div>
          </div>

          <div className="text-align-center mt-2">
            <p>-외부 계정으로 로그인하기-</p>
            <div className="display-center">
              {/* <GoogleLogin onSuccess={handleGoogleLogin}
              onError={() => {
                console.log("Login Failed")
              }}
              /> */}
              {/* 
              1. 구글 로그인 버튼 가져오기
              2. Oauth 로그인을 위해서 google api 사이트에 가입하고 클라이언트 키, 시크릿 키 받아오기
              3. 로그인
              4. 백엔드에서 로그인하기
               a. 이미 로그인을 한 적이 있는 유저 => 로그인 시키고 토큰값 주면 장땡
               b. 처음 로그인 시도를 한 유저 => 유저 정보 새로 생성 => 토큰값 넘기기
              */}
              <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => {
                    console.log('Login Failed');
                  }}
                />
              </GoogleOAuthProvider>
            </div>
          </div>
        </Form>
      </Container>
    </>
  );
};

export default Login;
