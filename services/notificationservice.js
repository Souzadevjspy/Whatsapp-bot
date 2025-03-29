const axios = require('axios');

const notifyAdmin = async (message) => {
  try {
    // Envia para o WhatsApp do admin
    await axios.post('https://api.twilio.com/...', { 
      to: process.env.ADMIN_PHONE,
      body: message 
    });
    
    console.log('📢 Notificação enviada ao admin!');
  } catch (error) {
    console.error('Erro na notificação:', error);
  }
};

module.exports = { notifyAdmin };