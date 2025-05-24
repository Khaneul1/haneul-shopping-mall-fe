import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { showToastMessage } from '../common/uiSlice';
import { act } from 'react';
import ToastMessage from '../../common/component/ToastMessage';

const initialState = {
  loading: false,
  error: '',
  cartList: [],
  selectedItem: {},
  cartItemCount: 0,
  totalPrice: 0,
};

// Async thunk actions
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ id, size }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/cart', { productId: id, size, qty: 1 }); //qty == 개수 (일단 1로 기본값 설정)
      if (response.status !== 200) throw new Error(response.error);
      dispatch(
        showToastMessage({
          message: '카트에 아이템이 추가됐습니다',
          status: 'success',
        })
      );
      return response.data.cartItemQty; //성공했을 때 무슨 데이터를 전달 받을까요
    } catch (error) {
      dispatch(
        showToastMessage({
          message: '카트에 아이템 추가 실패',
          status: 'error',
        })
      );
      return rejectWithValue(error.error);
    }
  }
);

export const getCartList = createAsyncThunk(
  'cart/getCartList',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get('/cart');
      if (response.status !== 200) throw new Error(response.error);
      console.log('cart response', response);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.error);
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  'cart/deleteCartItem',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.delete(`/cart/${id}`); //id=1234
      if (response.status !== 200) throw new Error(response.error);

      dispatch(
        showToastMessage({
          message: '상품이 삭제되었습니다',
          status: 'success',
        })
      );
      dispatch(getCartList());
      return response.data.cartItemCount;
    } catch (error) {
      dispatch(
        showToastMessage({ message: '상품 삭제 실패', status: 'error' })
      );
      return rejectWithValue(error.error);
    }
  }
);

//기찬 오빠 코드 참고 ㅎ...
export const updateQty = createAsyncThunk(
  'cart/updateQty',
  async ({ id, value }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/cart/${id}`, { qty: value });
      console.log('오빠 감사합니다', response);
      if (response.status !== 200) throw new Error(response.error);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.error);
    }
  }
);

export const getCartQty = createAsyncThunk(
  'cart/getCartQty',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get('/cart/qty');
      console.log('get cart qty', response.data);
      if (response.status !== 200) throw new Error(response.error);
      //dispatch(getCartList());
      return response.data.cartItemCount;
    } catch (error) {
      return rejectWithValue(error.error);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    initialCart: (state) => {
      state.cartItemCount = 0;
    },
    // You can still add reducers here for non-async actions if necessary
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.error = '';
        state.cartItemCount = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCartList.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(getCartList.fulfilled, (state, action) => {
        state.loading = false;
        state.error = '';
        state.cartList = action.payload;
        state.totalPrice = action.payload.reduce(
          (total, item) => total + item.productId.price * item.qty,
          0
        );
      }) //reduce는 숫자이기 때문에 초기값 0으로 설정
      //아이템의 가격 * 아이템 개수를 계속 더해나감!!
      //cartList는 배열이기 때문에 reduce를 사용해 값을 계산할 수 있었던 것
      //totalPrice는 리듀서에 저장해야 하는 내용까진 아님!! 그런데 totalPrice가 상당히 많은 곳에서 쓰임
      //로직이 되게 간단해 보이지만, cartList에 아이템이 많아지면 계산하는 데 시간이 걸림
      //저장하고 쓰는 게 낫겠다~~ 싶어서 리듀서에 넣은 것!! 한 번 계산하고 가져다 쓸 수 있도록!!
      .addCase(getCartList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCartItem.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.error = '';
        state.cartItemCount = action.payload;
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateQty.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(updateQty.fulfilled, (state, action) => {
        state.loading = false;
        state.error = '';
        state.cartList = action.payload;
        state.totalPrice = action.payload.reduce(
          (total, item) => total + item.productId.price * item.qty,
          0
        );
      })
      .addCase(updateQty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCartQty.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(getCartQty.fulfilled, (state, action) => {
        state.loading = false;
        state.error = '';
        state.cartItemCount = action.payload;
      })
      .addCase(getCartQty.rejected, (state, action) => {
        state.loading = true;
        state.error = action.payload;
      });
  },
});

export default cartSlice.reducer;
export const { initialCart } = cartSlice.actions;
