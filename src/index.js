const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const customers = [];

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

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`Started at port ${PORT}`));
