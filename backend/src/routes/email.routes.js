const express = require('express');
const auth = require('../middlewares/auth');
const { sendWorkOrderEmail } = require('../services/email.service');

const router = express.Router();

router.post('/send-work-order-notification', auth, async (req, res) => {
  try {
    const { orderId, emailType } = req.body;
    
    const WorkOrder = require('../models/WorkOrder');
    const Bike = require('../models/Bike');
    const Client = require('../models/Client');
    
    const order = await WorkOrder.findByPk(orderId, {
      include: [{
        model: Bike,
        as: 'bike',
        include: [{ model: Client, as: 'client' }]
      }]
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    const client = order.bike?.client;
    if (!client || !client.email) {
      return res.status(400).json({ error: 'Cliente sin email registrado' });
    }

    const subjects = {
      status_update: `Orden #${order.id} - Actualización de estado`,
      completed: `Orden #${order.id} - Servicio completado`,
      delivered: `Orden #${order.id} - Entrega de moto`,
      invoice: `Orden #${order.id} - Factura`
    };

    const result = await sendWorkOrderEmail({
      to: client.email,
      subject: subjects[emailType] || subjects.status_update,
      order: order.toJSON(),
      clientName: client.name,
      bikeInfo: `${order.bike?.brand || ''} ${order.bike?.model || ''} ${order.bike?.plate || ''}`.trim() || '-'
    });

    if (result.success) {
      res.json({ success: true, message: 'Email enviado', simulated: result.simulated });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Error al enviar email' });
  }
});

module.exports = router;