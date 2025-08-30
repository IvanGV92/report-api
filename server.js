const express = require('express');
const { createClient } = require('redis');

const app = express();
const PORT = 8080;

// Middleware para leer JSON
app.use(express.json());

// Configuración de Redis remoto
const redisClient = createClient({
  
    username: 'ubuntu',
    password: 'AnFel.024',
    socket: {
        host: '98.83.134.207',
        port: '6397',
    }

});

redisClient.on('error', (err) => console.error('Redis error:', err));
(async () => {
  await redisClient.connect();
  console.log('✅ Conectado a Redis');

  // POST /reporte
  app.post('/reporte', async (req, res) => {
    const { id, title, value } = req.body;

    if (!id || !title || !value) {
      return res.status(400).json({ error: 'Faltan campos requeridos: id, title, value' });
    }

    const key = `reporte:${id}`;
    const data = JSON.stringify({ title, value });

    try {
      await redisClient.set(key, data);
      res.status(201).json({ message: `Reporte ${id} creado con éxito` });
    } catch (err) {
      console.error('Error al guardar el reporte:', err);
      res.status(500).json({ error: 'Error del servidor al guardar el reporte' });
    }
  });

  // GET /reporte/:id
  app.get('/reporte/:id', async (req, res) => {
    const id = req.params.id;
    const key = `reporte:${id}`;

    try {
      const data = await redisClient.get(key);
      if (!data) {
        return res.status(404).json({ error: `Reporte con id ${id} no encontrado` });
      }

      res.json(JSON.parse(data));
    } catch (err) {
      console.error('Error al obtener el reporte:', err);
      res.status(500).json({ error: 'Error del servidor' });
    }
  });

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
})();
