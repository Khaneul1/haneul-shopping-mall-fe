import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { showToastMessage } from '../common/uiSlice';

// 비동기 액션 생성
export const getProductList = createAsyncThunk(
  'products/getProductList',
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get('/product', { params: { ...query } }); //받은 query 내용을 params에 넣어주겠다
      if (response.status !== 200) throw new Error(response.error);

      return response.data.data;
    } catch (error) {
      rejectWithValue(error.error);
    }
  }
);

export const getProductDetail = createAsyncThunk(
  'products/getProductDetail',
  async (id, { rejectWithValue }) => {}
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/product', formData);

      if (response.status !== 200) throw new Error(response.error);
      dispatch(
        showToastMessage({ message: '상품 생성 완료', status: 'success' })
      );
      return response.data.data;
    } catch (error) {
      console.log('상품 생성 실패...');
      return rejectWithValue(error.error);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { dispatch, rejectWithValue }) => {}
);

export const editProduct = createAsyncThunk(
  'products/editProduct',
  async ({ id, ...formData }, { dispatch, rejectWithValue }) => {}
);

// 슬라이스 생성
const productSlice = createSlice({
  name: 'products',
  initialState: {
    productList: [],
    selectedProduct: null,
    loading: false,
    error: '',
    totalPageNum: 1,
    success: false,
  },
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    setFilteredList: (state, action) => {
      state.filteredList = action.payload;
    },
    clearError: (state) => {
      state.error = '';
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProduct.pending, (state, action) => {
        //create 하는 중 : 로딩스피너 보여 주면 좋자나
        state.loading(true);
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        //데이터 받았자나 : 로딩스피너 꺼도 되자나
        state.loading(false);
        //에러 있었다? 성공했으면 필요없자나
        state.error = '';
        state.success = true; //이거 역할 뭔데요?
        //상품 생성을 성공했다? 다이얼로그를 닫고, 실패? 실패 메시지를 다이얼로그에 보여주고 닫진 않음
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(getProductList.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(getProductList.fulfilled, (state, action) => {
        //성공한 케이스 ~~
        state.loading = false;
        //product list 받을 거니까 이걸 저장해 둬야죠 ~~
        state.productList = action.payload;
        state.error = ''; //에러 초기화
      })
      .addCase(getProductList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedProduct, setFilteredList, clearError } =
  productSlice.actions;
export default productSlice.reducer;
