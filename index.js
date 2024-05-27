const express = require('express');
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');

const app = express()

app.use(express.json());
app.use(cors());

let users = [
  {
    "id": 1,
    "username": "Joel",
    "password": "123456"
  },
  {
    "id": 2,
    "username": "Eduardo",
    "password": "456789"
  },
  {
    "id": 3,
    "username": "Andres",
    "password": "789123"
  }
]
const port = process.env.PORT || 3000;

//Rutas de Express
app.post('/login', (req, res) => {

  const { username, password } = req.body;
  /* Prueba de conexion
  res.send(`El usuario logueado es ${username} y la contraseña es ${password}`); */

  //Comprobamos si el usuario y la contraseña son correctos
  const user = users.find(user => user.username === username && user.password === password);
  if (user.username === username && user.password === password) {
    //Generamos el token
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: '1m'
    });
    res.status(202).send({ token });
  } else {
    res.status(401).send('Credenciales incorrectas');
  }

});

app.get('/dashboard', verifyToken, (req, res) => {
  res.json({
    message: `Bienvenido al Dashboard, ${req.user.username}`,
  })
});

app.get('/detail/:id', verifyToken, (req, res) => {
  const id = req.params.id;

  res.json({
    message: `Detalles de ${id}, ${req.user.username.toUpperCase()}`,
  });
});

function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ')[1];
    jwt.verify(bearer, process.env.JWT_SECRET, (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        const decoded = jwt.decode(bearer);
        const user = users.find(user => user.username === decoded.username);
        req.user = user;
        next();
      }
    });
  } else {
    res.sendStatus(403);
  }
}

app.listen(port, () => console.log(`Servidor desplegado en el Puerto ${port}`));