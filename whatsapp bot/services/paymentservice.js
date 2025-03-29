const mercadopago = require('mercadopago');
mercadopago.configure({ access_token: process.env.MERCADOPAGO_ACCESS_TOKEN });

const createPayment = async (amount, description) => {
  try {
    const preference = {
      items: [{
        title: description,
        unit_price: parseFloat(amount),
        quantity: 1,
      }],
      back_urls: {
        success: "https://seusite.com/success",
        failure: "https://seusite.com/failure",
        pending: "https://seusite.com/pending"
      },
      auto_return: "approved",
    };

    const response = await mercadopago.preferences.create(preference);
    return response.body.init_point;
  } catch (error) {
    console.error('Erro no pagamento:', error);
    throw error;
  }
};

module.exports = { createPayment };