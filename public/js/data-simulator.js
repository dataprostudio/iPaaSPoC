import { faker } from '@faker-js/faker';
import { EventEmitter } from 'events';

export class DataSimulator extends EventEmitter {
  constructor(system = 'salesforce') {
    super();
    this.system = system;
  }

  generateSalesforceData() {
    return {
      type: 'opportunity',
      id: faker.string.uuid(),
      name: faker.company.name(),
      amount: faker.number.float({ min: 1000, max: 1000000, precision: 2 }),
      stage: faker.helpers.arrayElement(['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']),
      closeDate: faker.date.future(),
      accountId: faker.string.uuid(),
      ownerId: faker.string.uuid()
    };
  }

  generateSAPData() {
    return {
      type: 'salesOrder',
      id: faker.string.numeric(10),
      customerNumber: faker.string.numeric(8),
      orderDate: faker.date.recent(),
      deliveryDate: faker.date.future(),
      totalAmount: faker.number.float({ min: 100, max: 100000, precision: 2 }),
      currency: faker.finance.currencyCode(),
      items: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
        materialNumber: faker.string.alphanumeric(10),
        quantity: faker.number.int({ min: 1, max: 100 }),
        unitPrice: faker.number.float({ min: 10, max: 1000, precision: 2 })
      }))
    };
  }

  generateOracleData() {
    return {
      type: 'invoice',
      id: faker.string.numeric(8),
      customerName: faker.company.name(),
      invoiceDate: faker.date.recent(),
      dueDate: faker.date.future(),
      totalAmount: faker.number.float({ min: 100, max: 50000, precision: 2 }),
      status: faker.helpers.arrayElement(['Draft', 'Submitted', 'Approved', 'Paid']),
      lineItems: Array.from({ length: faker.number.int({ min: 1, max: 10 }) }, () => ({
        itemId: faker.string.alphanumeric(6),
        description: faker.commerce.productName(),
        quantity: faker.number.int({ min: 1, max: 50 }),
        unitPrice: faker.number.float({ min: 10, max: 500, precision: 2 })
      }))
    };
  }

  generateData() {
    switch (this.system.toLowerCase()) {
      case 'salesforce':
        return this.generateSalesforceData();
      case 'sap':
        return this.generateSAPData();
      case 'oracle':
        return this.generateOracleData();
      default:
        throw new Error(`Unsupported system: ${this.system}`);
    }
  }

  startSimulation(interval = 1000) {
    this.intervalId = setInterval(() => {
      const data = this.generateData();
      this.emit('data', data);
    }, interval);
  }

  stopSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

// Remove or comment out the usage example since it's now a module
// const simulator = new DataSimulator('salesforce');

// simulator.on('data', (data) => {
//   console.log('Received data:', JSON.stringify(data, null, 2));
// });

// simulator.startSimulation(2000); // Generate data every 2 seconds

// Stop the simulation after 10 seconds
// setTimeout(() => {
//   simulator.stopSimulation();
//   console.log('Simulation stopped');
// }, 10000);