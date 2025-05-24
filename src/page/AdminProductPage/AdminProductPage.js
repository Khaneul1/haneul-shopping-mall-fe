import React, { useEffect, useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import SearchBox from '../../common/component/SearchBox';
import NewItemDialog from './component/NewItemDialog';
import ProductTable from './component/ProductTable';
import {
  getProductList,
  deleteProduct,
  setSelectedProduct,
} from '../../features/product/productSlice';

const AdminProductPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useSearchParams();
  const dispatch = useDispatch();
  const { productList, totalPageNum } = useSelector((state) => state.product);
  const [showDialog, setShowDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState({
    page: query.get('page') || 1,
    name: query.get('name') || '',
  }); //검색 조건들을 저장하는 객체

  const [mode, setMode] = useState('new');

  const tableHeader = [
    '#',
    'Sku',
    'Name',
    'Price',
    'Stock',
    'Image',
    'Status',
    '',
  ];

  //상품리스트 가져오기 (url쿼리 맞춰서)
  //웹페이지 들어오자마자 상품 리스트 보여 줘야 되니까
  useEffect(() => {
    dispatch(getProductList({ ...searchQuery })); //searchQuery에 설정해 둔 조건들 함께 보내기
  }, [query]); //url query가 바뀔 때마다 해당 디스패치 호출

  useEffect(() => {
    //검색어나 페이지가 바뀌면 url바꿔주기 (검색어또는 페이지가 바뀜 => url 바꿔줌=> url쿼리 읽어옴=> 이 쿼리값 맞춰서  상품리스트 가져오기)
    //서치쿼리 없을 수도 있으니까 ~~
    if (searchQuery.name === '') {
      delete searchQuery.name;
    }
    console.log('search query object', searchQuery);
    const params = new URLSearchParams(searchQuery);
    const query = params.toString(); //문자열로 바꿔주기
    console.log('객체가 쿼리 형태로 바뀌었는지 확인 : ', query); //query를 객체로 변환해 주는 건 URLSearchParams()가 함

    navigate('?' + query); //url 변경
  }, [searchQuery]);

  const deleteItem = (id) => {
    //아이템 삭제하기
    dispatch(deleteProduct(id));
  };

  const openEditForm = (product) => {
    //edit모드로 설정하고
    setMode('edit');
    //다이얼로그 열어주기 전에 선택한 아이템 세팅을 먼저 해 줘야 함!
    dispatch(setSelectedProduct(product)); //선택한 아이템 저장만 하는 것!!
    //thunk 사용 불필요. 바로 reducer에 저장해 주면 됨

    // 아이템 수정다이얼로그 열어주기
    setShowDialog(true);
  };

  const handleClickNewItem = () => {
    //new 모드로 설정하고
    setMode('new');
    // 다이얼로그 열어주기
    // showDialog : state값이라 처음 값이 false임
    setShowDialog(true);
  };

  const handlePageClick = ({ selected }) => {
    //  쿼리에 페이지값 바꿔주기
    // 1 페이지를 누르면 콘솔창엔 0이 뜸!!!
    setSearchQuery({ ...searchQuery, page: selected + 1 }); //이렇게 바꿔주기
    console.log('선택한 페이지 값', selected);
  };

  //searchbox에서 검색어를 읽어온다 => 엔터를 치면 searchQuery 객체가 업데이트 됨
  //{name : 스트레이트 팬츠} 이런 식으로
  // => 이 searchQuery 객체 안의 아이템 기준으로 url을 새로 생성해서 다시 호출해 줌 &name=스트레이트+팬츠 이런 식
  // => url 쿼리 읽어오기 => url쿼리 기준으로 백엔드에 검색 조건과 함께 호출
  return (
    <div className="locate-center">
      <Container>
        <div className="mt-2">
          <SearchBox
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="제품 이름으로 검색"
            field="name"
          />
        </div>
        <Button className="mt-2 mb-2" onClick={handleClickNewItem}>
          Add New Item +
        </Button>

        <ProductTable
          header={tableHeader}
          data={productList}
          deleteItem={deleteItem}
          openEditForm={openEditForm}
        />
        <ReactPaginate
          nextLabel="next >"
          onPageChange={handlePageClick} //페이지 바꿀 때마다 handlePageClick 함수 호출
          pageRangeDisplayed={5}
          pageCount={totalPageNum} //전체 페이지
          forcePage={searchQuery.page - 1}
          previousLabel="< previous"
          renderOnZeroPageCount={null}
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          breakLabel="..."
          breakClassName="page-item"
          breakLinkClassName="page-link"
          containerClassName="pagination"
          activeClassName="active"
          className="display-center list-style-none"
        />
      </Container>

      <NewItemDialog
        mode={mode}
        showDialog={showDialog}
        setShowDialog={setShowDialog}
      />
    </div>
  );
};

export default AdminProductPage;
