import compression from 'compression';
import Knex from 'knex';
import express from 'express';
import next from 'next';

// Models
import knexConfig from './knexfile';
import { Model } from 'objection';

// Controllers
import autocompleteController from './controllers/autocomplete';

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'

const knex = Knex(dev ? knexConfig.development : knexConfig.production);

Model.knex(knex);

const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express();
  server.use(compression());

  server.get('/autocomplete/:term', async (req, res) => {
    const { term } = req.params;
    const result = await autocompleteController.search(term);

    res.send(result);
  });

  server.get('/s/:term', (req, res) => {
    app.render(req, res, '/subs',  { ...req.query, ...req.params })
  })

  server.get('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
});
