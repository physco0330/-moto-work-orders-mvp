const { sequelize, Client, Bike, WorkOrder, ChecklistItem, WorkOrderItem, WorkOrderStatusHistory } = require('../src/models');

const seedData = async () => {
  try {
    console.log('🔄 Limpiando base de datos...');
    await sequelize.sync({ force: true });
    
    console.log('📝 Creando pilotos...');
    const clientes = await Client.bulkCreate([
      { name: 'Carlos Martinez', phone: '3001234567', email: 'carlos.m@email.com' },
      { name: 'Maria Lopez', phone: '3109876543', email: 'maria.l@email.com' },
      { name: 'Juan Perez', phone: '3205551234', email: 'juan.p@email.com' },
      { name: 'Ana Rodriguez', phone: '3154445678', email: 'ana.r@email.com' },
      { name: 'Pedro Sanchez', phone: '3187778888', email: 'pedro.s@email.com' },
    ]);
    
    console.log('🏍️ Creando motocicletas...');
    const motos = await Bike.bulkCreate([
      { clientId: clientes[0].id, model: 'KTM EXC 450', year: 2023, hours: 45, brand: 'KTM', cylinder: 450 },
      { clientId: clientes[0].id, model: 'Yamaha YZ 250F', year: 2022, hours: 120, brand: 'Yamaha', cylinder: 250 },
      { clientId: clientes[1].id, model: 'Honda CRF 450R', year: 2024, hours: 20, brand: 'Honda', cylinder: 450 },
      { clientId: clientes[1].id, model: 'Kawasaki KX 250', year: 2023, hours: 85, brand: 'Kawasaki', cylinder: 250 },
      { clientId: clientes[2].id, model: 'Suzuki RM-Z 450', year: 2022, hours: 150, brand: 'Suzuki', cylinder: 450 },
      { clientId: clientes[3].id, model: 'Husqvarna FC 350', year: 2024, hours: 30, brand: 'Husqvarna', cylinder: 350 },
      { clientId: clientes[4].id, model: 'Beta RR 300', year: 2023, hours: 65, brand: 'Beta', cylinder: 300 },
    ]);
    
    console.log('✅ Creando items de checklist...');
    const items = await ChecklistItem.bulkCreate([
      { name: 'Lavada de moto', active: true },
      { name: 'Limpieza filtro de aire', active: true },
      { name: 'Revisión de frenos', active: true },
      { name: 'Tensión de cadena', active: true },
      { name: 'Revisión de radios', active: true },
      { name: 'Revisión de suspensión', active: true },
      { name: 'Revisión de maniguetas y controles', active: true },
      { name: 'Revisión de plásticos', active: true },
      { name: 'Lubricación de partes móviles', active: true },
      { name: 'Revisión nivel de aceite 2t', active: true },
      { name: 'Revisión de sistema eléctrico', active: true },
      { name: 'Inspección de neumáticos', active: true },
    ]);
    
    console.log('📋 Creando órdenes de trabajo...');
    const orden1 = await WorkOrder.create({
      bikeId: motos[0].id,
      pilotName: clientes[0].name,
      serviceType: 'ALISTAMIENTO',
      status: 'LISTA',
      hoursUsed: 16,
      hoursRegistered: 0,
      total: 150000,
      entryDate: new Date('2026-04-13'),
    });
    
    await WorkOrderItem.bulkCreate([
      { workOrderId: orden1.id, checklistItemId: items[0].id, completed: true },
      { workOrderId: orden1.id, checklistItemId: items[1].id, completed: true },
      { workOrderId: orden1.id, checklistItemId: items[2].id, completed: true },
      { workOrderId: orden1.id, checklistItemId: items[3].id, completed: true },
      { workOrderId: orden1.id, checklistItemId: items[4].id, completed: false },
      { workOrderId: orden1.id, checklistItemId: items[5].id, completed: true },
      { workOrderId: orden1.id, checklistItemId: items[6].id, completed: true },
      { workOrderId: orden1.id, checklistItemId: items[7].id, completed: false },
      { workOrderId: orden1.id, checklistItemId: items[8].id, completed: true },
      { workOrderId: orden1.id, checklistItemId: items[9].id, completed: true },
    ]);
    
    const orden2 = await WorkOrder.create({
      bikeId: motos[2].id,
      pilotName: clientes[1].name,
      serviceType: 'MANTENIMIENTO',
      status: 'EN_PROCESO',
      hoursUsed: 8,
      hoursRegistered: 0,
      total: 200000,
      entryDate: new Date('2026-04-15'),
    });
    
    await WorkOrderItem.bulkCreate([
      { workOrderId: orden2.id, checklistItemId: items[0].id, completed: true },
      { workOrderId: orden2.id, checklistItemId: items[2].id, completed: true },
      { workOrderId: orden2.id, checklistItemId: items[5].id, completed: false },
    ]);
    
    const orden3 = await WorkOrder.create({
      bikeId: motos[4].id,
      pilotName: clientes[2].name,
      serviceType: 'REPARACION',
      status: 'RECIBIDA',
      hoursUsed: 0,
      hoursRegistered: 150,
      total: 350000,
      entryDate: new Date('2026-04-16'),
    });
    
    const orden4 = await WorkOrder.create({
      bikeId: motos[5].id,
      pilotName: clientes[3].name,
      serviceType: 'ALISTAMIENTO',
      status: 'LISTA',
      hoursUsed: 12,
      hoursRegistered: 30,
      total: 180000,
      entryDate: new Date('2026-04-10'),
    });
    
    await WorkOrderItem.bulkCreate([
      { workOrderId: orden4.id, checklistItemId: items[0].id, completed: true },
      { workOrderId: orden4.id, checklistItemId: items[1].id, completed: true },
      { workOrderId: orden4.id, checklistItemId: items[2].id, completed: true },
      { workOrderId: orden4.id, checklistItemId: items[3].id, completed: true },
      { workOrderId: orden4.id, checklistItemId: items[4].id, completed: true },
      { workOrderId: orden4.id, checklistItemId: items[5].id, completed: true },
    ]);
    
    const orden5 = await WorkOrder.create({
      bikeId: motos[6].id,
      pilotName: clientes[4].name,
      serviceType: 'MANTENIMIENTO',
      status: 'ENTREGADA',
      hoursUsed: 20,
      hoursRegistered: 65,
      total: 220000,
      entryDate: new Date('2026-04-08'),
    });
    
    console.log('📊 Creando historial de estados...');
    await WorkOrderStatusHistory.bulkCreate([
      { workOrderId: orden1.id, status: 'RECIBIDA', timestamp: new Date('2026-04-13T08:00:00') },
      { workOrderId: orden1.id, status: 'EN_PROCESO', timestamp: new Date('2026-04-13T09:00:00') },
      { workOrderId: orden1.id, status: 'LISTA', timestamp: new Date('2026-04-13T16:00:00') },
      { workOrderId: orden2.id, status: 'RECIBIDA', timestamp: new Date('2026-04-15T08:00:00') },
      { workOrderId: orden2.id, status: 'EN_PROCESO', timestamp: new Date('2026-04-15T09:30:00') },
      { workOrderId: orden4.id, status: 'RECIBIDA', timestamp: new Date('2026-04-10T08:00:00') },
      { workOrderId: orden4.id, status: 'EN_PROCESO', timestamp: new Date('2026-04-10T09:00:00') },
      { workOrderId: orden4.id, status: 'LISTA', timestamp: new Date('2026-04-10T15:00:00') },
      { workOrderId: orden4.id, status: 'ENTREGADA', timestamp: new Date('2026-04-11T10:00:00') },
    ]);
    
    console.log('✅ Base de datos poblada exitosamente!');
    console.log(`   - ${clientes.length} pilotos`);
    console.log(`   - ${motos.length} motorcycles`);
    console.log(`   - ${items.length} items de checklist`);
    console.log(`   - 5 órdenes de trabajo`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error poblando base de datos:', error);
    process.exit(1);
  }
};

seedData();
