const { create } = require('wa-automate');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { createPayment } = require('./paymentService');
const { notifyAdmin } = require('./notificationService');

const initWhatsAppBot = () => {
  create({
    sessionId: 'sales-bot',
    multiDevice: true,
    authTimeout: 60,
    blockCrashLogs: true,
  }).then(client => {

    client.onReady(() => {
      console.log('🚀 Bot de Vendas iniciado!');
    });

    client.onMessage(async message => {
      try {
        const userMsg = message.body.toLowerCase();

        // Menu Principal
        if (/^(oi|ola|menu)$/i.test(userMsg)) {
          await client.sendButtons(
            message.from,
            '🛍️ *LOJA VIP* 🛍️\nEscolha uma opção:',
            [
              { buttonId: 'produtos', buttonText: { displayText: '📦 Ver Produtos' } },
              { buttonId: 'pedidos', buttonText: { displayText: '📋 Meus Pedidos' } }
            ],
            'Clique nos botões abaixo:'
          );
        }

        // Lista de Produtos
        else if (userMsg === 'produtos' || userMsg === '1') {
          const products = await Product.find({ stock: { $gt: 0 } });

          if (products.length === 0) {
            return client.sendText(message.from, '⚠️ Nenhum produto disponível no momento.');
          }

          const sections = [{
            title: '📦 CATÁLOGO',
            rows: products.map(prod => ({
              title: prod.name,
              description: `R$ ${prod.price} | Estoque: ${prod.stock}`,
              rowId: `detalhes_${prod._id}`
            }))
          }];

          await client.sendListMessage(
            message.from,
            {
              title: 'NOSSOS PRODUTOS',
              text: 'Escolha para ver detalhes:',
              buttonText: 'Ver Opções',
              sections
            }
          );
        }

        // Detalhes do Produto
        else if (message.body.startsWith('detalhes_')) {
          const productId = message.body.split('_')[1];
          const product = await Product.findById(productId);

          if (!product) {
            return client.sendText(message.from, '❌ Produto não encontrado.');
          }

          await client.sendButtons(
            message.from,
            `*${product.name}*\n\n${product.description}\n\n💵 Preço: R$ ${product.price}\n📦 Estoque: ${product.stock}`,
            [
              { buttonId: `comprar_${product._id}`, buttonText: { displayText: '🛒 COMPRAR AGORA' } },
              { buttonId: 'voltar', buttonText: { displayText: '↩️ VOLTAR' } }
            ],
            'Escolha uma opção:'
          );
        }

        // Processar Compra
        else if (message.body.startsWith('comprar_')) {
          const productId = message.body.split('_')[1];
          const product = await Product.findById(productId);

          if (!product || product.stock < 1) {
            return client.sendText(message.from, '❌ Produto esgotado!');
          }

          const paymentLink = await createPayment(product.price, product.name);

          const newOrder = new Order({
            client: message.from,
            products: [{ productId: product._id, quantity: 1 }],
            total: product.price,
            paymentLink,
          });

          await newOrder.save();

          await client.sendButtons(
            message.from,
            `✅ *PEDIDO CRIADO!*\n\n*Produto:* ${product.name}\n*Total:* R$ ${product.price}\n\nClique abaixo para pagar:`,
            [
              { buttonId: 'pagar', buttonText: { displayText: '💳 PAGAR AGORA' } }
            ],
            paymentLink
          );

          await notifyAdmin(`📦 NOVA VENDA!\nCliente: ${message.from}\nProduto: ${product.name}\nTotal: R$ ${product.price}`);
        }

      } catch (error) {
        console.error('Erro no bot:', error);
      }
    });
  });
};

module.exports = initWhatsAppBot;