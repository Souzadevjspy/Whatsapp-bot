require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const initWhatsAppBot = require('./services/whatsappService');

const app = express();

// Conectar ao MongoDB
connectDB();

// Iniciar Bot do WhatsApp
initWhatsAppBot();

app.get('/', (req, res) => {
  res.send('🤖 WhatsApp Sales Bot Online!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});