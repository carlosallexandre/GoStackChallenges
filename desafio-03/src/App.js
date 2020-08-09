import React, { useState, useEffect } from "react";

import api from './services/api';

import "./styles.css";

function App() {
  const [repositories, setRepositories] = useState([]);

  useEffect(() => { loadRepositories() }, []);

  async function loadRepositories() {
    const response = await api.get('/repositories');

    setRepositories([...repositories, ...response.data]);
  }

  async function handleAddRepository() {
    const response = await api.post('repositories', {
      url: 'https://github.com/carlosallexandre/gostack-challenges',
      title: 'GoStack Challenges',
      owner: 'carlosallexandre',
    });

    setRepositories([...repositories, response.data]);
  }

  async function handleRemoveRepository(id) {
    const response = await api.delete(`repositories/${id}`);

    if (response.status === 204) {
      setRepositories(repositories.filter(repository => repository.id !== id));
    }
  }

  return (
    <div>
      <ul data-testid="repository-list">
        {repositories.map(repository => (
          <li key={repository.id}>
            {repository.title}
            <button onClick={() => handleRemoveRepository(repository.id)}>
              Remover
            </button>
          </li>
        ))}
      </ul>

      <button onClick={handleAddRepository}>Adicionar</button>
    </div>
  );
}

export default App;
