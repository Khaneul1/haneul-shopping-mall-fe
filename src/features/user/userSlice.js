import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { showToastMessage } from '../common/uiSlice';
import api from '../../utils/api';
import { initialCart } from '../cart/cartSlice';

export const loginWithEmail = createAsyncThunk(
  'user/loginWithEmail',
  async ({ email, password, navigate }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      // success >> mainPage
      // navigate 호출 방식도 있지만 로그인 페이지에서 처리할 것

      console.log('로그인 응답 확인: ', response.data);
      console.log('받은 토큰 확인 : ', response.data.token);

      // 토큰 저장 로그인 : (1) local storage (2) session storage
      // local : 브라우저가 꺼지거나 창을 새로 열어도 같은 주소로 접속했다면 유지가 됨
      // session : 브라우저 끈다 == 세션 끈다 라는 의미여서 브라우저 끄면 값 사라짐
      sessionStorage.setItem('token', response.data.token);

      //유저 정보만 넣어야 하는데 response.data를 하게 되면 모든 response data를 넣는 게 됨
      //이렇게 될 경우 level 값이 뜨지 않기 때문에 자꾸 admin page가 안 뜬 것 ㅠㅠ!!!!
      //response.data.user 를 해 줘야!!!! user 안에 level 값이 뜨면서 admin page가 렌더링 될 수 있음!!!
      //여기서 return 한 값은 extraReducers의 lowinWithEmail.fulfilled 값에 들어간다 ~~
      //따라서 fulfilled에 있는 값을 response.data가 아니라 response.data.user로 변경해 줘야 함
      return response.data.user;
      // return response.data.user; 도 가능

      //return에 response.data.user를 넘겨줄 경우, fulfilled 처리 부분에서는 action.payload 해 줘야 함
      //위의 주석 내용과 마찬가지로, return을 response.data만 해 줬을 경우에는 fulfilled 처리 부분에 action.payload.user 해 줘야 함
    } catch (error) {
      // 실패 : 토스트 메시지 보여줄 수 있지만
      // alert 메시지로 보여 줄 수 있도록 할 것 (로그인 페이지)
      // 실패시 생긴 에러값 reducer에 저장
      return rejectWithValue(error.error);
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'user/loginWithGoogle',
  async (token, { rejectWithValue }) => {}
);

export const logout = () => (dispatch) => {
  sessionStorage.removeItem('token'); //저장된 토큰 삭제
  dispatch(initialCart()); //장바구나 초기화
  dispatch(userSlice.actions.setUser(null)); //사용자 정보 제거
};

export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (
    { email, name, password, navigate },
    { dispatch, rejectWithValue }
  ) => {
    // 사실 이건 api 호출일 뿐이고, 결과물을 리듀서에 저장해 줘야 함!
    try {
      // api 호출
      const response = await api.post('/user', { email, name, password });
      // response 성공
      // 1. 성공 토스트 메시지 보여주기 >> features/common/uiSlice: showToastMessage() 정의
      // >> src/common/ToastMessage : 여기에서 토스트 메시지를 읽어와서 보여줌!
      // react-toastify에서 왔어용 시간 날 때 읽어 볼 것
      dispatch(
        // uiSlice의 reducer 액션 호출(객체 넣어주기)
        showToastMessage({
          message: '회원가입을 성공했습니다',
          status: 'success',
        })
      );
      // 2. 로그인 페이지로 리다이렉트
      navigate('/login');
      return response.data.data; //data라는 필드 안에 여러 데이터를 넣었기 때문에 data.data
    } catch (error) {
      // response 실패
      // 1. 실패 토스트 메시지 보여주기
      dispatch(
        showToastMessage({
          message: '회원가입에 실패했습니다',
          status: 'error',
        })
      );
      // 2. 에러값 저장
      return rejectWithValue(error.error);
    }
  }
);

export const loginWithToken = createAsyncThunk(
  'user/loginWithToken',
  async (_, { rejectWithValue }) => {
    // _ : 주는 정보가 없음 (토큰으로 로그인할 거라서)
    // 토큰 어디서 받아와요? :: 로그인 할 당시에 토큰을 저장해 두잖아용
    // 저장해 둔 토큰
    try {
      const response = await api.get('/user/me');
      console.log('토큰 로그인 결과: ', response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.error);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    loading: false,
    loginError: null,
    registrationError: null,
    success: false,
  },
  // reducers : async 없이 직접적으로 호출할 때
  reducers: {
    clearErrors: (state) => {
      state.loginError = null;
      state.registrationError = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  // async처럼 외부 함수를 통해 호출되는 경우
  extraReducers: (builder) => {
    // addCase() 상태 더하기
    // state : 초기에 만든 initialState 값
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.registrationError = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registrationError = action.payload;
      })
      .addCase(loginWithEmail.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.loginError = null; //초기화
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.loginError = action.payload;
      })
      // .addCase(loginWithToken.pending, (state, action) => {
      //   // 유저가 로그인을 했는가의 여부는 뒤에서 하는 작업이지 굳이 렌더링 해 줄 필요없음
      //   // 그래서 로딩 스피너는 필요없더요 ~~
      // }) // 그래서 지워 줍니다
      .addCase(loginWithToken.fulfilled, (state, action) => {
        // 성공 시 아래와 같이 세팅
        state.user = action.payload;
      });
    // .addCase(loginWithToken.rejected, (state, action) => {
    //   // 만약 실패했다면 > 다시 로그인 페이지 보여 주면 되잖아요?
    //   // 그래서 얘도 딱히 필요없음
    // });
  },
});
export const { clearErrors } = userSlice.actions;
export default userSlice.reducer;
