// server.js
const express = require('express'); // Importa o módulo Express.js
const bodyParser = require('body-parser'); // Importa body-parser para processar requisições JSON
const mysql = require('mysql2'); // mysql2 para interagir com o banco de dados MySQL
const cors = require('cors'); // Importa o módulo cors para lidar com a política de mesma origem (CORS)

const app = express();
app.use(cors());
const port = 3000; // Define a porta onde o servidor irá escutar as solicitações

// body-parser para analisar o corpo das solicitações como JSON
app.use(bodyParser.json());

//Permitir solicitações de diferentes origens

// Configuração do banco de dados MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
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

//Função de retorno de chamada executada após a tentativa de conexão
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
  // Extrai os dados da requisição do corpo da mensagem
  const { titulo, descricao, prioridade } = req.body;

  // Verifica se os campos obrigatórios foram fornecidos
  if (!titulo || !descricao || !prioridade) {
    return res.status(400).send({ error: 'Campos obrigatórios não fornecidos.' }); //BadRequest
  }
  const insertQuery = `INSERT INTO tarefas (titulo, descricao, prioridade, status) VALUES (?, ?, ?, 'pendente')`;

  // Executa a query SQL com os parâmetros fornecidos
  connection.query(insertQuery, [titulo, descricao, prioridade], (err, result) => {
    if (err) {
      res.status(500).send(err); //Erro
    } else {
      res.status(201).send({ id: result.insertId, titulo, descricao, prioridade }); //Inserido com Sucesso!
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
  // Extrai o parâmetro ID da URL da requisição
  const { id } = req.params;

  // Query SQL para selecionar a tarefa com o ID fornecido
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
  // Extrai os dados da requisição do corpo da mensagem
  const { titulo, descricao, prioridade, status } = req.body;

  // Verifica se o ID fornecido é um número válido
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
app.listen(port, () => {  //Escutando a porta 3000
  // Inicia o servidor Express para escutar as requisições na porta especificada  
  console.log(`Servidor rodando em http://localhost:${port}`);
});
