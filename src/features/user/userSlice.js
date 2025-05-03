import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { showToastMessage } from '../common/uiSlice';
import api from '../../utils/api';
import { initialCart } from '../cart/cartSlice';

export const loginWithEmail = createAsyncThunk(
  'user/loginWithEmail',
  async ({ email, password }, { rejectWithValue }) => {}
);

export const loginWithGoogle = createAsyncThunk(
  'user/loginWithGoogle',
  async (token, { rejectWithValue }) => {}
);

export const logout = () => (dispatch) => {};
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
  async (_, { rejectWithValue }) => {}
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
      });
  },
});
export const { clearErrors } = userSlice.actions;
export default userSlice.reducer;
