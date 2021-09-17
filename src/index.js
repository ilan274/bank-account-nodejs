const express = require('express');
const { v4: uuidv4 } = require('uuid');

const verifyIfExistsAccountCpf = require('./middlewares/verifyIfExistsAccountCpf');

const app = express();
app.use(express.json());

const customers = require('./config/database');
const getBalance = require('./utils/getBalance');

app.post('/account', (request, response) => {
  const { cpf, name } = request.body;

  const customerExists = customers.some((costumer) => costumer.cpf === cpf);

  if (customerExists) {
    return response.status(400).json({
      error: 'Customer already exists.',
    });
  }

  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  });

  return response.status(201).send();
});

app.get('/statement', verifyIfExistsAccountCpf, (request, response) => {
  const { customer } = request;

  return response.json(customer.statement);
});

app.get('/statement/date', verifyIfExistsAccountCpf, (request, response) => {
  const { customer } = request;
  const { date } = request.query;

  const dateFormat = new Date(`${date} 00:00`);

  const statement = customer.statement.filter((statement) =>
    statement.created_at.toLocaleString('pt-BR').includes(date)
  );

  return response.json(statement);
});

app.post('/deposit', verifyIfExistsAccountCpf, (request, response) => {
  const { description, amount } = request.body;

  const { customer } = request;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: 'credit',
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.post('/withdraw', verifyIfExistsAccountCpf, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return response.status(400).json({ error: 'Insufficient funds.' });
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: 'debit',
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.put('/account', verifyIfExistsAccountCpf, (request, response) => {
  const { name } = request.body;
  const { customer } = request;

  customer.name = name;
  return response.status(201).json(customer);
});

app.get('/account', verifyIfExistsAccountCpf, (request, response) => {
  const { customer } = request;

  return response.status(201).json(customer);
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`Started at port ${PORT}`));
