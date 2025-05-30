import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import OrderReceipt from './component/OrderReceipt';
import PaymentForm from './component/PaymentForm';
import './style/paymentPage.style.css';
import { cc_expires_format } from '../../utils/number';
import { createOrder, getOrderList } from '../../features/order/orderSlice';

const PaymentPage = () => {
  const dispatch = useDispatch();
  const { orderNum } = useSelector((state) => state.order);
  const [cardValue, setCardValue] = useState({
    cvc: '',
    expiry: '',
    focus: '',
    name: '',
    number: '',
  });
  const navigate = useNavigate();
  const [firstLoading, setFirstLoading] = useState(true);
  const [shipInfo, setShipInfo] = useState({
    firstName: '',
    lastName: '',
    contact: '',
    address: '',
    city: '',
    zip: '',
  });
  const { cartList, totalPrice } = useSelector((state) => state.cart);
  const [couponCode, setCouponCode] = useState('');
  const [discountRate, setDiscounRate] = useState(0);
  const [discountedPriece, setDiscountedPrice] = useState(totalPrice);

  console.log('shipinfo', shipInfo);

  useEffect(() => {
    // 오더번호를 받으면 어디로 갈까?
    if (firstLoading) {
      //해당 if문을 작성하지 않을 시 결제하기 버튼 누르면 주문 완료 페이지로 넘어가버림!!
      //결제하고 주문 완료 페이지가 렌더링 되어야 하자나요?
      //useEffect가 처음에 호출될 때 오더 성공 페이지로 넘어가는 걸 막기 위해
      setFirstLoading(false);
    } else {
      if (orderNum !== '') {
        navigate('/payment/success');
      }
    }
  }, [orderNum]);

  const handleSubmit = (event) => {
    event.preventDefault();
    // 오더 생성하기
    const { firstName, lastName, contact, address, city, zip } = shipInfo;
    dispatch(
      createOrder({
        totalPrice: discountedPriece,
        shipTo: { address, city, zip },
        contact: { firstName, lastName, contact },
        orderList: cartList.map((item) => {
          return {
            productId: item.productId._id,
            price: item.productId.price,
            qty: item.qty,
            size: item.size,
          };
        }),
      })
    );
  };

  const handleFormChange = (event) => {
    //shipInfo에 값 넣어주기
    const { name, value } = event.target;
    setShipInfo({ ...shipInfo, [name]: value });
  };

  const handlePaymentInfoChange = (event) => {
    //카드정보 넣어주기
    const { name, value } = event.target;
    if (name === 'expriy') {
      let newValue = cc_expires_format(value);
      setCardValue({ ...cardValue, [name]: newValue });
      return;
    }
    setCardValue({ ...cardValue, [name]: value });
  };

  const handleInputFocus = (e) => {
    setCardValue({ ...cardValue, focus: e.target.name });
  };
  //카트에 아이템이 없다면 다시 카트 페이지로 돌아가기
  //결제할 아이템이 없으면 결제 페이지로 들어가면 안 되기 때문!!
  if (cartList?.length === 0) {
    navigate('/cart');
  } // 주문할 아이템이 없다면 주문하기로 안넘어가게 막음

  const applyCoupon = async () => {
    try {
      const res = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();

      if (res.ok) {
        setDiscounRate(data.discountRate);
        const discounted = totalPrice - (totalPrice * data.discountRate) / 100;
        setDiscountedPrice(discounted);
        alert(`쿠폰이 적용되었습니다! ${data.discountRate}% 할인`);
      } else {
        setDiscounRate(0);
        setDiscountedPrice(totalPrice);
        alert(data.message || '유효하지 않은 쿠폰입니다.');
      }
    } catch (error) {
      console.error('쿠폰 적용 실패:', error);
      alert('쿠폰 적용 중 오류가 발생했습니다.');
    }
  };

  return (
    <Container>
      <Row>
        <Col lg={7}>
          <div>
            <h2 className="mb-2">배송 주소</h2>
            <div>
              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="lastName">
                    <Form.Label>성</Form.Label>
                    <Form.Control
                      type="text"
                      onChange={handleFormChange}
                      required
                      name="lastName"
                    />
                  </Form.Group>

                  <Form.Group as={Col} controlId="firstName">
                    <Form.Label>이름</Form.Label>
                    <Form.Control
                      type="text"
                      onChange={handleFormChange}
                      required
                      name="firstName"
                    />
                  </Form.Group>
                </Row>

                <Form.Group className="mb-3" controlId="formGridAddress1">
                  <Form.Label>연락처</Form.Label>
                  <Form.Control
                    placeholder="010-xxx-xxxxx"
                    onChange={handleFormChange}
                    required
                    name="contact"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formGridAddress2">
                  <Form.Label>주소</Form.Label>
                  <Form.Control
                    placeholder="Apartment, studio, or floor"
                    onChange={handleFormChange}
                    required
                    name="address"
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formGridCity">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      onChange={handleFormChange}
                      required
                      name="city"
                    />
                  </Form.Group>

                  <Form.Group as={Col} controlId="formGridZip">
                    <Form.Label>Zip</Form.Label>
                    <Form.Control
                      onChange={handleFormChange}
                      required
                      name="zip"
                    />
                  </Form.Group>
                </Row>
                <div className="mobile-receipt-area">
                  <OrderReceipt cartList={cartList} totalPrice={totalPrice} />
                </div>
                <div>
                  <h2 className="payment-title">결제 정보</h2>
                  <PaymentForm
                    cardValue={cardValue}
                    handleInputFocus={handleInputFocus}
                    handlePaymentInfoChange={handlePaymentInfoChange}
                  />
                </div>

                <Button
                  variant="dark"
                  className="payment-button pay-button"
                  type="submit"
                >
                  결제하기
                </Button>
              </Form>
            </div>
          </div>
        </Col>
        <Col lg={5} className="receipt-area">
          <OrderReceipt cartList={cartList} totalPrice={totalPrice} />
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentPage;
