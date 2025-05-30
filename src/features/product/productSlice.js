import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { showToastMessage } from '../common/uiSlice';

// 비동기 액션 생성
export const getProductList = createAsyncThunk(
  'products/getProductList',
  async (query, { rejectWithValue }, params) => {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await api.get('/product', { params: { ...query } }); //받은 query 내용을 params에 넣어주겠다
      console.log('response 확인', response);
      // if (response.status !== 200) throw new Error(response.error);
      //위의 로직 지워 줘도 됨!!
      //api 호출 : axios 라이브러리 통해 호출...
      //그래서 해당 라이브러리가 위의 코드를 넣어 주지 않더라도 자동으로 넣어 줌!!
      //그래서 전부 ~~ 정리해 줘도 됩니당

      return response.data;
    } catch (error) {
      rejectWithValue(error.error);
    }
  }
);

export const getProductDetail = createAsyncThunk(
  'products/getProductDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/product/${id}`);
      // if (response.status !== 200) throw new Error(response.error);
      return response.data.data;
    } catch (error) {
      rejectWithValue(error.error);
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/product', formData);

      // if (response.status !== 200) throw new Error(response.error);
      dispatch(
        showToastMessage({ message: '상품 생성 완료', status: 'success' })
      );
      dispatch(getProductList({ page: 1 }));
      return response.data.data;
    } catch (error) {
      console.log('상품 생성 실패...');
      return rejectWithValue(error.error);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.delete(`/product/${id}`);
      // if (response.status !== 200) throw new Error(response.error);

      dispatch(
        showToastMessage({ message: '상품 삭제 완료', status: 'success' })
      );
      dispatch(getProductList({ page: 1 }));
      return response.data;
    } catch (error) {
      dispatch(
        showToastMessage({ message: '상품 삭제 실패', status: 'error' })
      );
      return rejectWithValue(
        error.error || '상품 삭제 중 오류가 발생했습니다.'
      );
    }
  }
);

export const editProduct = createAsyncThunk(
  'products/editProduct',
  async ({ id, ...formData }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.put(`/product/${id}`, formData);
      // if (response.status !== 200) throw new Error(response.error);
      dispatch(getProductList({ page: 1 }));

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.error);
    }
  }
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
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        //데이터 받았자나 : 로딩스피너 꺼도 되자나
        state.loading = false;
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
        state.productList = action.payload.data;
        state.error = ''; //에러 초기화
        state.totalPageNum = action.payload.totalPageNum;
      })
      .addCase(getProductList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editProduct.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.error = '';
        //edit이 성공하면 팝업 닫아주기 (거의 createProduct와 로직이 똑같음)
        state.success = true;
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        // state.success = true;
        state.error = '';
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        // state.success = false;
        state.error = action.payload;
      })
      .addCase(getProductDetail.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(getProductDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
        state.error = '';
      })
      .addCase(getProductDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedProduct, setFilteredList, clearError } =
  productSlice.actions;
export default productSlice.reducer;
