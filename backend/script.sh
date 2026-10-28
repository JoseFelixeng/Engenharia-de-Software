#!/usr/bin/env bash

# Arquivos na raiz
touch setup.py
touch {settings,.secrets}.toml
touch {requirements-dev,MANIFEST}.in
touch Dockerfile.dev docker-compose.yaml

# Imagem do banco de dados
mkdir -p postgres
touch postgres/{Dockerfile,create-databases.sh}

# Aplicação
mkdir -p backend/{models,routes}
touch backend/default.toml
touch backend/{__init__,cli,app,auth,db,security,config}.py
touch backend/models/{__init__,post,user}.py
touch backend/routes/{__init__,auth,post,user}.py

# Testes
mkdir -p tests
touch test.sh
touch tests/{__init__,conftest,test_api}.py
