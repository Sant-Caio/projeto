// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
const port = 3000;

app.use(bodyParser.json());

// Configuração do banco de dados MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'tarefas'
});

// Conectar ao banco de dados MySQL
connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados MySQL:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL.');
});

// Criar tabela 'tarefas' se não existir
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS tarefas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    status VARCHAR(255),
    prioridade VARCHAR(50)
  )
`;

connection.query(createTableQuery, (err, result) => {
  if (err) {
    console.error('Erro ao criar a tabela:', err);
    return;
  }
  console.log('Tabela "tarefas" criada ou já existe.');
});

// Rotas
// Rota para criar uma nova tarefa
app.post('/tarefas', (req, res) => {
  const { titulo, descricao, prioridade } = req.body;

  if (!titulo || !descricao || !prioridade) {
    return res.status(400).send({ error: 'Campos obrigatórios não fornecidos.' });
  }
  const insertQuery = `INSERT INTO tarefas (titulo, descricao, prioridade, status) VALUES (?, ?, ?, 'pendente')`;
  connection.query(insertQuery, [titulo, descricao, prioridade], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send({ id: result.insertId, titulo, descricao, prioridade });
    }
  });
});

// Rota para listar todas as tarefas
app.get('/tarefas', (req, res) => {
  const selectQuery = `SELECT * FROM tarefas`;
  connection.query(selectQuery, (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send({data: results});
    }
  });
});

// Rota para obter uma única tarefa pelo ID
app.get('/tarefas/:id', (req, res) => {
  const { id } = req.params;
  const selectQuery = `SELECT * FROM tarefas WHERE id = ?`;
  connection.query(selectQuery, [id], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else if (results.length === 0) {
      res.status(404).send('Tarefa não encontrada.');
    } else {
      res.send(results[0]);
    }
  });
});

// Rota para atualizar uma tarefa pelo ID
app.put('/tarefas/:id', (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, prioridade, status } = req.body;

  if (isNaN(id)) {
    return res.status(400).send({ error: 'ID da tarefa inválido.' });
  }

  // Verifica se os campos obrigatórios estão presentes
  if (!titulo || !descricao || !prioridade || !status) {
    return res.status(400).send({ error: 'Campos obrigatórios não fornecidos.' });
  }

  const updateQuery = `UPDATE tarefas SET titulo = ?, descricao = ?, prioridade = ?, status = ? WHERE id = ?`;
  connection.query(updateQuery, [titulo, descricao, prioridade, status, id], (err, result) => {
    if (err) {
      res.status(500).send({error: err});
    } else if (result.affectedRows === 0) {
      res.status(404).send({message:'Tarefa não encontrada.'});
    } else {
      res.status(200).send({message: 'Tarefa atualizada com sucesso.'});
    }
  });
});

// Rota para deletar uma tarefa pelo ID
app.delete('/tarefa/:id', (req, res) => {
  const { id } = req.params;
  const deleteQuery = `DELETE FROM tarefas WHERE id = ?`;

  if (isNaN(id)) {
    return res.status(400).send({ error: 'ID da tarefa inválido.' });
  }
  
  connection.query(deleteQuery, [id], (err, result) => {
    if (err) {
      res.status(500).send({error: err});
    } else if (result.affectedRows === 0) {
      res.status(404).send({error:'Tarefa não encontrada.'});
    } else {
      res.status(200).send({message: 'Tarefa deletada com sucesso.'});
    }
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
