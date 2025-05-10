import React, { useState, useEffect } from 'react';
import { Form, Modal, Button, Row, Col, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import CloudinaryUploadWidget from '../../../utils/CloudinaryUploadWidget';
import { CATEGORY, STATUS, SIZE } from '../../../constants/product.constants';
import '../style/adminProduct.style.css';
import {
  clearError,
  createProduct,
  editProduct,
} from '../../../features/product/productSlice';
import { update } from '@react-spring/web';

const InitialFormData = {
  name: '',
  sku: '',
  stock: {},
  image: '',
  description: '',
  category: [],
  status: 'active',
  price: 0,
};

const NewItemDialog = ({ mode, showDialog, setShowDialog }) => {
  const { error, success, selectedProduct } = useSelector(
    (state) => state.product
  );
  const [formData, setFormData] = useState(
    mode === 'new' ? { ...InitialFormData } : selectedProduct
  );
  const [stock, setStock] = useState([]);
  const dispatch = useDispatch();
  const [stockError, setStockError] = useState(false);

  useEffect(() => {
    if (success) setShowDialog(false);
  }, [success]);

  useEffect(() => {
    if (error || !success) {
      dispatch(clearError());
    }
    if (showDialog) {
      if (mode === 'edit') {
        setFormData(selectedProduct);
        // 객체형태로 온 stock을  다시 배열로 세팅해주기
        const sizeArray = Object.keys(selectedProduct.stock).map((size) => [
          size,
          selectedProduct.stock[size],
        ]);
        setStock(sizeArray);
      } else {
        setFormData({ ...InitialFormData });
        setStock([]);
      }
    }
  }, [showDialog]);

  const handleClose = () => {
    //모든걸 초기화시키고;
    // 다이얼로그 닫아주기
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('form data', formData); //stock 안 들어가있음
    //initail form data : stock
    //우리가 따로 만든 state에 stock을 넣어 줌!!
    //그래서 이 값을 stock의 객체 값으로 올려줘야겠죠?
    console.log('form data stock', stock);
    //['s', '3']

    //재고를 입력했는지 확인, 아니면 에러
    if (stock.length === 0) return setStockError(true);

    // 재고를 배열에서 객체로 바꿔주기
    // [['M',2]] 에서 {M:2}로

    // reduce : array 값 받아와서 내가 원하는 형태로 바꿔 줄 수 있는 것
    const totalStock = stock.reduce((total, item) => {
      return { ...total, [item[0]]: parseInt(item[1]) };
    }, {});
    console.log('form data total stock', totalStock);
    if (mode === 'new') {
      //새 상품 만들기
      dispatch(createProduct({ ...formData, stock: totalStock })); //createProduct에는 formData를 보내 줘야 함
    } else {
      //상품 수정하기
    }
  };

  // 배열을 객체로 전환하기
  const stockObject = {};
  stock.forEach(([size, quantity]) => {
    if (size) {
      stockObject[size] = quantity;
    }
  });

  // 전체 데이터 구성
  const payload = {
    ...formData, //{title:'청바지', description: '블루진}
    stock: stockObject, //{S:10, M:4}
  };

  if (mode === 'new') {
    //새 상품 만들기
    dispatch(createProduct(payload));
  } else {
    // 상품 수정하기
    dispatch(editProduct({ ...payload, id: selectedProduct._id }));
  }

  const handleChange = (event) => {
    //form에 데이터 넣어주기
    const { id, value } = event.target;
    // formData 모드가 new라면 initial form data를 쓰겠다고 정의해 둠!
    setFormData({ ...formData, [id]: value });
  };

  const addStock = () => {
    //재고타입 추가시 배열에 새 배열 추가
    setStock([...stock, []]); //stock에 새로운 배열을 추가하겠다는 의미
  };

  const deleteStock = (idx) => {
    //재고 삭제하기
    const newStock = stock.filter((item, index) => index !== idx);
    // 삭제하려고 선택한 idx를 제외하고 다 필터해서 넣으면 됨
    setStock(newStock);
  };

  const handleSizeChange = (value, index) => {
    //  재고 사이즈 변환하기
    // 인덱스 값에 있는 value를 바꿔줘야 함!!
    const newStock = [...stock];
    // index번째 값에 있는 0번째 값 : [[s,3], [m,4], [xl:5]] 중 s,m,xl를 의미
    newStock[index][0] = value; //해당 값을 내가 받아온 value 값으로 바꿔주겠다
    setStock(newStock);
  };

  const handleStockChange = (value, index) => {
    //재고 수량 변환하기
    // 수량은 [[s,3], [m,4], [xl:5]] 중 1번째 값 : 3개, 4개, 5개를 의미
    const newStock = [...stock];
    newStock[index][1] = value;
    setStock(newStock);
  };

  const onHandleCategory = (event) => {
    // 카테고리가 이미 추가되어 있으면 제거
    if (formData.category.includes(event.target.value)) {
      const newCategory = formData.category.filter(
        (item) => item !== event.target.value
      );
      setFormData({
        ...formData,
        category: [...newCategory],
      });
    } else {
      //아니면 새로 추가
      setFormData({
        ...formData,
        category: [...formData.category, event.target.value],
      });
    }
  };

  const uploadImage = (url) => {
    //이미지 업로드
    setFormData({ ...formData, image: url });
  };

  return (
    <Modal show={showDialog} onHide={handleClose}>
      <Modal.Header closeButton>
        {mode === 'new' ? (
          <Modal.Title>Create New Product</Modal.Title>
        ) : (
          <Modal.Title>Edit Product</Modal.Title>
        )}
      </Modal.Header>
      {error && (
        <div className="error-message">
          <Alert variant="danger">{error}</Alert>
        </div>
      )}
      <Form className="form-container" onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Form.Group as={Col} controlId="sku">
            <Form.Label>Sku</Form.Label>
            <Form.Control
              onChange={handleChange}
              type="string"
              placeholder="Enter Sku"
              required
              value={formData.sku}
            />
          </Form.Group>

          <Form.Group as={Col} controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              onChange={handleChange}
              type="string"
              placeholder="Name"
              required
              value={formData.name}
            />
          </Form.Group>
        </Row>

        <Form.Group className="mb-3" controlId="description">
          <Form.Label>Description</Form.Label>
          <Form.Control
            type="string"
            placeholder="Description"
            as="textarea"
            onChange={handleChange}
            rows={3}
            value={formData.description}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="stock">
          <Form.Label className="mr-1">Stock</Form.Label>
          {stockError && (
            <span className="error-message">재고를 추가해주세요</span>
          )}
          <Button size="sm" onClick={addStock}>
            Add +
          </Button>
          <div className="mt-2">
            {stock.map((item, index) => (
              <Row key={index}>
                <Col sm={4}>
                  <Form.Select
                    onChange={(event) =>
                      handleSizeChange(event.target.value, index)
                    }
                    required
                    defaultValue={item[0] ? item[0].toLowerCase() : ''}
                  >
                    <option value="" disabled selected hidden>
                      Please Choose...
                    </option>
                    {SIZE.map((item, index) => (
                      <option
                        inValid={true}
                        value={item.toLowerCase()}
                        disabled={stock.some(
                          (size) => size[0] === item.toLowerCase()
                        )}
                        key={index}
                      >
                        {item}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col sm={6}>
                  <Form.Control
                    onChange={(event) =>
                      handleStockChange(event.target.value, index)
                    }
                    type="number"
                    placeholder="number of stock"
                    value={item[1]}
                    required
                  />
                </Col>
                <Col sm={2}>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteStock(index)}
                  >
                    -
                  </Button>
                </Col>
              </Row>
            ))}
          </div>
        </Form.Group>

        <Form.Group className="mb-3" controlId="Image" required>
          <Form.Label>Image</Form.Label>
          <CloudinaryUploadWidget uploadImage={uploadImage} />

          <img
            id="uploadedimage"
            src={formData.image}
            className="upload-image mt-2"
            alt="uploadedimage"
          />
        </Form.Group>

        <Row className="mb-3">
          <Form.Group as={Col} controlId="price">
            <Form.Label>Price</Form.Label>
            <Form.Control
              value={formData.price}
              required
              onChange={handleChange}
              type="number"
              placeholder="0"
            />
          </Form.Group>

          <Form.Group as={Col} controlId="category">
            <Form.Label>Category</Form.Label>
            <Form.Control
              as="select"
              multiple
              onChange={onHandleCategory}
              value={formData.category}
              required
            >
              {CATEGORY.map((item, idx) => (
                <option key={idx} value={item.toLowerCase()}>
                  {item}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group as={Col} controlId="status">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={formData.status}
              onChange={handleChange}
              required
            >
              {STATUS.map((item, idx) => (
                <option key={idx} value={item.toLowerCase()}>
                  {item}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Row>
        {mode === 'new' ? (
          <Button variant="primary" type="submit">
            Submit
          </Button>
        ) : (
          <Button variant="primary" type="submit">
            Edit
          </Button>
        )}
      </Form>
    </Modal>
  );
};

export default NewItemDialog;
