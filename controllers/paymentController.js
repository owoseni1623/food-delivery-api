const axios = require('axios');
require('dotenv').config();

const FLUTTERWAVE_TEST_API_URL = 'https://api.flutterwave.com/v3';
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;

if (!FLW_SECRET_KEY) {
  throw new Error("FLW_SECRET_KEY is not defined");
}

exports.initializePayment = async (req, res) => {
  const { amount, email, firstName, lastName, phone, address, description, items } = req.body;

  try {
    const payload = {
      tx_ref: `${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      amount: amount,
      currency: "NGN",
      redirect_url: `${process.env.FRONTEND_URL}/thank-you`,
      customer: {
        email: email,
        phonenumber: phone,
        name: `${firstName} ${lastName}`
      },
      customizations: {
        title: "Payment for items",
        description: description,
        logo: "https://your-logo-url.com/logo.png"
      },
      meta: {
        address: address,
        items: JSON.stringify(items)
      }
    };

    const response = await axios.post(`${FLUTTERWAVE_TEST_API_URL}/payments`, payload, {
      headers: {
        'Authorization': `Bearer ${FLW_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.status === 'success') {
      res.json({
        success: true,
        message: 'Payment initiated successfully',
        data: {
          link: response.data.data.link,
          orderId: response.data.data.tx_ref
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment initiation failed',
        error: response.data.message
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during payment initiation',
      error: error.response?.data || error.message
    });
  }
};

exports.verifyPayment = async (req, res) => {
  const { transaction_id } = req.query;

  try {
    const response = await axios.get(`${FLUTTERWAVE_TEST_API_URL}/transactions/${transaction_id}/verify`, {
      headers: {
        'Authorization': `Bearer ${FLW_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = response.data.data;

    if (data.status === "successful" && data.amount === data.charged_amount) {
      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          transactionId: data.id,
          txRef: data.tx_ref,
          amount: data.amount,
          currency: data.currency,
          customerName: data.customer.name,
          customerEmail: data.customer.email,
          paymentStatus: data.status
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        error: 'Transaction was not successful or amount mismatch'
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during payment verification',
      error: error.response?.data || error.message
    });
  }
};