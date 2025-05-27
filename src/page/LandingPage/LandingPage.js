import React, { useEffect, useState } from 'react';
import ProductCard from './components/ProductCard';
import { Row, Col, Container } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductList } from '../../features/product/productSlice';

const LandingPage = () => {
  const dispatch = useDispatch();

  const productList = useSelector((state) => state.product.productList);
  const selectedCategory = useSelector(
    (state) => state.product.selectedCategory
  );

  const [query] = useSearchParams();
  const name = query.get('name');
  const [category, setCategory] = useState('');

  useEffect(() => {
    dispatch(
      getProductList({
        name,
        category: selectedCategory,
      })
    );
  }, [query, category, dispatch, selectedCategory]);

  const handleCateGoryChange = (event) => {
    setCategory(event.target.value);
  };

  return (
    <Container>
      <Row>
        {productList.length > 0 ? (
          productList.map((item) => (
            <Col md={3} sm={12} key={item._id}>
              <ProductCard item={item} />
            </Col>
          ))
        ) : (
          <div className="text-align-center empty-bag">
            {name === '' ? (
              <h2>등록된 상품이 없습니다!</h2>
            ) : (
              <h2>{name}과 일치한 상품이 없습니다!`</h2>
            )}
          </div>
        )}
      </Row>
    </Container>
  );
};

export default LandingPage;
