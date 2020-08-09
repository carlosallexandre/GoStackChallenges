const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repositoryIndex = isUuid(id) 
    ? repositories.findIndex(repository => repository.id === id)
    : -1;

  if (repositoryIndex < 0) {
    return response.status(400).json({ error: 'Repository not found.' });
  }
  
  repository = {
    id,
    title: title ? title : repositories[repositoryIndex].title,
    url: url ? url : repositories[repositoryIndex].url,
    techs: techs ? techs : repositories[repositoryIndex].techs,
    likes: repositories[repositoryIndex].likes,
  };
  
  repositories[repositoryIndex] = repository;

  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = isUuid(id) 
    ? repositories.findIndex(repository => repository.id === id)
    : -1;

  if (repositoryIndex < 0) {
    return response.status(400).json({ error: 'Repository not found.' });
  }
  
  repositories.splice(repositoryIndex, 1);

  return response.send(204);
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = isUuid(id) 
    ? repositories.findIndex(repository => repository.id === id)
    : -1;
  
  if (repositoryIndex < 0) {
    return response.status(400).json({ error: 'Repository not found' });
  }

  repositories[repositoryIndex].likes += 1;

  return response.json(repositories[repositoryIndex]);
});

module.exports = app;
