# API REST - Portfolio Pessoal 

## Visão Geral

Esta é uma API REST completa desenvolvida para o portfolio pessoal. A API fornece endpoints para gestão de utilizadores, posts de blog, projetos de portfólio, itens para download e mensagens de contacto.

## Características Principais

- **Autenticação JWT**: Sistema seguro de autenticação baseado em tokens
- **Autorização baseada em roles**: Controlo de acesso com diferentes níveis de permissão
- **Upload de ficheiros**: Suporte para upload e gestão de ficheiros
- **Validação robusta**: Validação de dados de entrada usando Joi
- **Paginação**: Suporte para paginação em todas as listagens
- **Filtros avançados**: Capacidade de filtrar e pesquisar conteúdo
- **Rate limiting**: Proteção contra abuso da API
- **CORS configurado**: Suporte para requisições cross-origin
- **Middleware de segurança**: Implementação de boas práticas de segurança

## Tecnologias Utilizadas

- **Node.js**: Runtime JavaScript
- **Express.js 4**: Framework web para Node.js
- **Sequelize**: ORM para base de dados
- **PostgreSQL/SQLite**: Sistema de gestão de base de dados
- **JWT**: Autenticação baseada em tokens
- **Bcrypt**: Hash de passwords
- **Multer**: Upload de ficheiros
- **Joi**: Validação de dados
- **Helmet**: Middleware de segurança
- **CORS**: Suporte para requisições cross-origin

## Estrutura da Base de Dados

### Modelos Principais

#### User (Utilizador)
- **id**: Identificador único
- **name**: Nome completo
- **email**: Email (único)
- **password**: Password (hash)
- **role**: Papel (admin, editor, viewer)
- **avatar**: URL do avatar
- **bio**: Biografia
- **isActive**: Estado da conta
- **lastLogin**: Último login
- **emailVerified**: Email verificado
- **timestamps**: createdAt, updatedAt

#### Post (Artigo de Blog)
- **id**: Identificador único
- **title**: Título (único)
- **slug**: URL amigável (único)
- **excerpt**: Resumo
- **fullContent**: Conteúdo completo
- **author**: Autor
- **publishDate**: Data de publicação
- **category**: Categoria
- **tags**: Array de tags (JSON)
- **imageUrl**: URL da imagem
- **isPublished**: Estado de publicação
- **viewCount**: Contador de visualizações
- **userId**: Referência ao utilizador
- **timestamps**: createdAt, updatedAt

#### Project (Projeto)
- **id**: Identificador único
- **title**: Título
- **slug**: URL amigável (único)
- **description**: Descrição breve
- **fullDescription**: Descrição completa
- **imageUrl**: URL da imagem principal
- **gallery**: Array de URLs de imagens (JSON)
- **technologies**: Array de tecnologias (JSON)
- **category**: Categoria
- **status**: Estado (planning, in_progress, completed, on_hold)
- **priority**: Prioridade (low, medium, high)
- **startDate**: Data de início
- **endDate**: Data de fim
- **projectUrl**: URL do projeto
- **githubUrl**: URL do GitHub
- **demoUrl**: URL da demonstração
- **client**: Cliente
- **budget**: Orçamento
- **isPublished**: Estado de publicação
- **isFeatured**: Projeto em destaque
- **viewCount**: Contador de visualizações
- **sortOrder**: Ordem de exibição
- **userId**: Referência ao utilizador
- **timestamps**: createdAt, updatedAt

#### Download (Item para Download)
- **id**: Identificador único
- **title**: Título
- **slug**: URL amigável (único)
- **description**: Descrição
- **category**: Categoria
- **tags**: Array de tags (JSON)
- **fileUrl**: URL do ficheiro
- **fileName**: Nome do ficheiro
- **fileSize**: Tamanho do ficheiro
- **fileType**: Tipo MIME do ficheiro
- **thumbnailUrl**: URL da miniatura
- **version**: Versão
- **author**: Autor
- **license**: Licença
- **requirements**: Requisitos
- **instructions**: Instruções
- **downloadCount**: Contador de downloads
- **isPublished**: Estado de publicação
- **isFeatured**: Item em destaque
- **requiresAuth**: Requer autenticação
- **price**: Preço
- **sortOrder**: Ordem de exibição
- **publishDate**: Data de publicação
- **expiryDate**: Data de expiração
- **userId**: Referência ao utilizador
- **timestamps**: createdAt, updatedAt

#### Contact (Contacto)
- **id**: Identificador único
- **name**: Nome
- **email**: Email
- **phone**: Telefone
- **company**: Empresa
- **subject**: Assunto
- **message**: Mensagem
- **category**: Categoria (general, project, collaboration, support, other)
- **status**: Estado (new, read, replied, closed)
- **priority**: Prioridade (low, medium, high, urgent)
- **ipAddress**: Endereço IP
- **userAgent**: User Agent
- **referrer**: Referrer
- **isSpam**: Marcado como spam
- **readAt**: Data de leitura
- **repliedAt**: Data de resposta
- **notes**: Notas internas
- **timestamps**: createdAt, updatedAt

## Endpoints da API

### Base URL
```
http://localhost:3000/api
```

### Autenticação

#### POST /auth/register
Registar novo utilizador.

**Corpo da Requisição:**
```json
{
  "name": "Nome Completo",
  "email": "email@exemplo.com",
  "password": "password123",
  "role": "viewer"
}
```

**Resposta de Sucesso (201):**
```json
{
  "message": "Utilizador criado com sucesso",
  "user": {
    "id": 1,
    "name": "Nome Completo",
    "email": "email@exemplo.com",
    "role": "viewer",
    "isActive": true,
    "emailVerified": false,
    "createdAt": "2025-06-25T20:00:00.000Z",
    "updatedAt": "2025-06-25T20:00:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /auth/login
Fazer login.

**Corpo da Requisição:**
```json
{
  "email": "email@exemplo.com",
  "password": "password123"
}
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "id": 1,
    "name": "Nome Completo",
    "email": "email@exemplo.com",
    "role": "viewer",
    "lastLogin": "2025-06-25T20:00:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /auth/refresh-token
Renovar token de acesso.

**Corpo da Requisição:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET /auth/profile
Obter perfil do utilizador autenticado.

**Cabeçalhos:**
```
Authorization: Bearer <access_token>
```

#### PUT /auth/profile
Atualizar perfil do utilizador autenticado.

**Cabeçalhos:**
```
Authorization: Bearer <access_token>
```

**Corpo da Requisição:**
```json
{
  "name": "Novo Nome",
  "bio": "Nova biografia",
  "avatar": "https://exemplo.com/avatar.jpg"
}
```

#### PUT /auth/change-password
Alterar password.

**Cabeçalhos:**
```
Authorization: Bearer <access_token>
```

**Corpo da Requisição:**
```json
{
  "currentPassword": "password_atual",
  "newPassword": "nova_password",
  "confirmPassword": "nova_password"
}
```

#### POST /auth/logout
Fazer logout.

**Cabeçalhos:**
```
Authorization: Bearer <access_token>
```

### Posts (Artigos de Blog)

#### GET /posts
Obter todos os posts com paginação e filtros.

**Parâmetros de Query:**
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10, máximo: 100)
- `sort`: Campo para ordenação (padrão: createdAt)
- `order`: Ordem (ASC/DESC, padrão: DESC)
- `category`: Filtrar por categoria
- `author`: Filtrar por autor
- `published`: Filtrar por estado de publicação (true/false)
- `search`: Pesquisar no título, resumo e conteúdo

**Resposta de Sucesso (200):**
```json
{
  "posts": [
    {
      "id": 1,
      "title": "Título do Post",
      "slug": "titulo-do-post",
      "excerpt": "Resumo do post...",
      "author": "Cesário Machava",
      "publishDate": "2025-06-25",
      "category": "Engenharia",
      "tags": ["civil", "gestão"],
      "imageUrl": "https://exemplo.com/imagem.jpg",
      "isPublished": true,
      "viewCount": 150,
      "createdAt": "2025-06-25T20:00:00.000Z",
      "user": {
        "id": 1,
        "name": "Cesário Machava",
        "email": "cesario@exemplo.com",
        "avatar": "https://exemplo.com/avatar.jpg"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

#### GET /posts/:slug
Obter post específico por slug.

**Resposta de Sucesso (200):**
```json
{
  "post": {
    "id": 1,
    "title": "Título do Post",
    "slug": "titulo-do-post",
    "excerpt": "Resumo do post...",
    "fullContent": "Conteúdo completo do post...",
    "author": "Cesário Machava",
    "publishDate": "2025-06-25",
    "category": "Engenharia",
    "tags": ["civil", "gestão"],
    "imageUrl": "https://exemplo.com/imagem.jpg",
    "isPublished": true,
    "viewCount": 151,
    "createdAt": "2025-06-25T20:00:00.000Z",
    "updatedAt": "2025-06-25T20:00:00.000Z",
    "user": {
      "id": 1,
      "name": "Cesário Machava",
      "email": "cesario@exemplo.com",
      "avatar": "https://exemplo.com/avatar.jpg"
    }
  }
}
```

#### POST /posts
Criar novo post (requer autenticação e role editor/admin).

**Cabeçalhos:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Corpo da Requisição:**
```json
{
  "title": "Título do Novo Post",
  "slug": "titulo-do-novo-post",
  "excerpt": "Resumo do post...",
  "fullContent": "Conteúdo completo do post...",
  "author": "Cesário Machava",
  "publishDate": "2025-06-25",
  "category": "Engenharia",
  "tags": ["civil", "gestão"],
  "imageUrl": "https://exemplo.com/imagem.jpg",
  "isPublished": true
}
```

#### PUT /posts/:slug
Atualizar post existente.

**Cabeçalhos:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### DELETE /posts/:slug
Eliminar post.

**Cabeçalhos:**
```
Authorization: Bearer <access_token>
```

#### GET /posts/categories
Obter lista de categorias de posts.

**Resposta de Sucesso (200):**
```json
{
  "categories": ["Engenharia", "Gestão", "Tecnologia"]
}
```

#### GET /posts/tags
Obter lista de tags de posts.

**Resposta de Sucesso (200):**
```json
{
  "tags": ["civil", "gestão", "risco", "lean", "six-sigma"]
}
```

### Projetos

#### GET /projects
Obter todos os projetos com paginação e filtros.

**Parâmetros de Query:**
- `page`: Número da página
- `limit`: Itens por página
- `sort`: Campo para ordenação
- `order`: Ordem (ASC/DESC)
- `category`: Filtrar por categoria
- `status`: Filtrar por estado
- `published`: Filtrar por estado de publicação
- `featured`: Filtrar projetos em destaque
- `search`: Pesquisar no título e descrição

#### GET /projects/:slug
Obter projeto específico por slug.

#### POST /projects
Criar novo projeto (requer autenticação e role editor/admin).

#### PUT /projects/:slug
Atualizar projeto existente.

#### DELETE /projects/:slug
Eliminar projeto.

#### GET /projects/categories
Obter lista de categorias de projetos.

#### GET /projects/technologies
Obter lista de tecnologias utilizadas nos projetos.

### Downloads

#### GET /downloads
Obter todos os downloads com paginação e filtros.

**Parâmetros de Query:**
- `page`: Número da página
- `limit`: Itens por página
- `sort`: Campo para ordenação
- `order`: Ordem (ASC/DESC)
- `category`: Filtrar por categoria
- `fileType`: Filtrar por tipo de ficheiro
- `published`: Filtrar por estado de publicação
- `featured`: Filtrar itens em destaque
- `free`: Filtrar itens gratuitos (true/false)
- `search`: Pesquisar no título, descrição e nome do ficheiro

#### GET /downloads/:slug
Obter download específico por slug.

#### GET /downloads/:slug/download
Fazer download do ficheiro.

#### POST /downloads
Criar novo download com upload de ficheiro (requer autenticação e role editor/admin).

**Cabeçalhos:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Corpo da Requisição (form-data):**
- `file`: Ficheiro para upload
- `title`: Título
- `slug`: URL amigável
- `description`: Descrição
- `category`: Categoria
- `tags`: Array de tags
- `author`: Autor
- `license`: Licença
- `requirements`: Requisitos
- `instructions`: Instruções
- `isPublished`: Estado de publicação
- `isFeatured`: Item em destaque
- `requiresAuth`: Requer autenticação
- `price`: Preço

#### PUT /downloads/:slug
Atualizar download existente (ficheiro opcional).

#### DELETE /downloads/:slug
Eliminar download.

#### GET /downloads/categories
Obter lista de categorias de downloads.

#### GET /downloads/tags
Obter lista de tags de downloads.

### Utilizadores

#### GET /users
Obter todos os utilizadores (apenas admin).

**Cabeçalhos:**
```
Authorization: Bearer <access_token>
```

**Parâmetros de Query:**
- `page`: Número da página
- `limit`: Itens por página
- `sort`: Campo para ordenação
- `order`: Ordem (ASC/DESC)
- `role`: Filtrar por papel
- `active`: Filtrar por estado ativo
- `search`: Pesquisar no nome e email

#### GET /users/:id
Obter utilizador específico por ID.

#### POST /users
Criar novo utilizador (apenas admin).

#### PUT /users/:id
Atualizar utilizador.

#### DELETE /users/:id
Eliminar utilizador (apenas admin).

#### GET /users/:id/stats
Obter estatísticas do utilizador.

### Contactos

#### POST /contacts
Criar nova mensagem de contacto (público).

**Corpo da Requisição:**
```json
{
  "name": "Nome Completo",
  "email": "email@exemplo.com",
  "phone": "+351 123 456 789",
  "company": "Empresa Lda",
  "subject": "Assunto da Mensagem",
  "message": "Conteúdo da mensagem...",
  "category": "general"
}
```

**Resposta de Sucesso (201):**
```json
{
  "message": "Mensagem enviada com sucesso. Entraremos em contacto em breve.",
  "contact": {
    "id": 1,
    "name": "Nome Completo",
    "email": "email@exemplo.com",
    "subject": "Assunto da Mensagem",
    "category": "general",
    "createdAt": "2025-06-25T20:00:00.000Z"
  }
}
```

#### GET /contacts
Obter todas as mensagens de contacto (apenas admin/editor).

**Cabeçalhos:**
```
Authorization: Bearer <access_token>
```

**Parâmetros de Query:**
- `page`: Número da página
- `limit`: Itens por página
- `sort`: Campo para ordenação
- `order`: Ordem (ASC/DESC)
- `status`: Filtrar por estado
- `category`: Filtrar por categoria
- `priority`: Filtrar por prioridade
- `search`: Pesquisar no nome, email, assunto e mensagem

#### GET /contacts/stats
Obter estatísticas de contactos (apenas admin/editor).

#### GET /contacts/:id
Obter contacto específico por ID (apenas admin/editor).

#### PUT /contacts/:id/status
Atualizar estado do contacto (apenas admin/editor).

#### PUT /contacts/:id/spam
Marcar contacto como spam (apenas admin/editor).

#### DELETE /contacts/:id
Eliminar contacto (apenas admin).

## Códigos de Estado HTTP

- **200 OK**: Requisição bem-sucedida
- **201 Created**: Recurso criado com sucesso
- **400 Bad Request**: Dados inválidos ou em falta
- **401 Unauthorized**: Autenticação necessária ou token inválido
- **403 Forbidden**: Permissão insuficiente
- **404 Not Found**: Recurso não encontrado
- **429 Too Many Requests**: Limite de requisições excedido
- **500 Internal Server Error**: Erro interno do servidor

## Autenticação e Autorização

### Tokens JWT

A API utiliza tokens JWT (JSON Web Tokens) para autenticação. Após o login bem-sucedido, são fornecidos dois tokens:

- **Access Token**: Utilizado para autenticar requisições (válido por 7 dias)
- **Refresh Token**: Utilizado para renovar o access token (válido por 30 dias)

### Roles de Utilizador

- **admin**: Acesso total a todos os recursos
- **editor**: Pode criar, editar e eliminar posts, projetos e downloads
- **viewer**: Apenas visualização de conteúdo público

### Cabeçalho de Autorização

Para endpoints protegidos, incluir o token no cabeçalho:

```
Authorization: Bearer <access_token>
```

## Rate Limiting

A API implementa rate limiting para prevenir abuso:

- **Janela**: 15 minutos (900.000 ms)
- **Máximo**: 100 requisições por janela por IP

## Upload de Ficheiros

### Tipos de Ficheiro Suportados

- **Documentos**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV
- **Imagens**: JPEG, PNG, GIF, WebP
- **Vídeos**: MP4, AVI, QuickTime
- **Áudio**: MP3, WAV, OGG
- **Arquivos**: ZIP, RAR, 7Z

### Limitações

- **Tamanho máximo**: 5MB por ficheiro
- **Máximo de ficheiros**: 5 ficheiros por upload

## Validação de Dados

A API utiliza Joi para validação robusta de dados de entrada. Todos os campos obrigatórios são validados, bem como formatos específicos (emails, URLs, etc.).

## Segurança

### Medidas Implementadas

- **Helmet**: Middleware de segurança para Express
- **CORS**: Configurado para permitir apenas origens autorizadas
- **Rate Limiting**: Proteção contra ataques de força bruta
- **Validação de entrada**: Prevenção de injeção de dados maliciosos
- **Hash de passwords**: Utilização de bcrypt com salt
- **JWT**: Tokens seguros com expiração

### Boas Práticas

- Utilizar HTTPS em produção
- Configurar variáveis de ambiente adequadamente
- Implementar logging de segurança
- Monitorizar tentativas de acesso não autorizado
- Manter dependências atualizadas

## Configuração de Ambiente

### Variáveis de Ambiente Necessárias

```env
# Base de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portfolio_db
DB_USER=portfolio_user
DB_PASSWORD=portfolio_password

# Servidor
PORT=3000
NODE_ENV=production

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://seudominio.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

## Instalação e Configuração

### Pré-requisitos

- Node.js (versão 18 ou superior)
- PostgreSQL (versão 12 ou superior)
- npm ou yarn

### Passos de Instalação

1. **Clonar o repositório:**
```bash
git clone https://github.com/mmaunze/personal-portfolio-website-api.git
cd personal-portfolio-website-api
```

2. **Instalar dependências:**
```bash
npm install
```

3. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
# Editar .env com as configurações adequadas
```

4. **Configurar base de dados:**
```bash
# Criar base de dados PostgreSQL
createdb portfolio_db
```

5. **Iniciar servidor de desenvolvimento:**
```bash
npm run dev
```

6. **Iniciar servidor de produção:**
```bash
npm start
```

### Scripts Disponíveis

- `npm start`: Iniciar servidor de produção
- `npm run dev`: Iniciar servidor de desenvolvimento com nodemon
- `npm test`: Executar testes (a implementar)

## Estrutura de Ficheiros

```
portfolio-api/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── postController.js
│   │   ├── projectController.js
│   │   ├── downloadController.js
│   │   └── contactController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── authorization.js
│   │   ├── validation.js
│   │   └── upload.js
│   ├── models/
│   │   ├── index.js
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Project.js
│   │   ├── Download.js
│   │   └── Contact.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── posts.js
│   │   ├── projects.js
│   │   ├── downloads.js
│   │   └── contacts.js
│   ├── utils/
│   │   └── jwt.js
│   └── app.js
├── uploads/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Exemplos de Uso

### Exemplo 1: Autenticação e Criação de Post

```javascript
// 1. Fazer login
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@exemplo.com',
    password: 'password123'
  })
});

const { tokens } = await loginResponse.json();

// 2. Criar novo post
const postResponse = await fetch('http://localhost:3000/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${tokens.accessToken}`
  },
  body: JSON.stringify({
    title: 'Gestão de Riscos em Projetos de Engenharia',
    slug: 'gestao-riscos-projetos-engenharia',
    excerpt: 'Uma abordagem prática para identificar e mitigar riscos...',
    fullContent: 'Conteúdo completo do artigo...',
    author: 'Cesário Machava',
    publishDate: '2025-06-25',
    category: 'Engenharia',
    tags: ['risco', 'gestão', 'engenharia'],
    isPublished: true
  })
});
```

### Exemplo 2: Upload de Ficheiro para Download

```javascript
// Criar FormData para upload
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('title', 'Manual de Gestão de Ativos');
formData.append('slug', 'manual-gestao-ativos');
formData.append('description', 'Guia completo para gestão de ativos...');
formData.append('category', 'Manuais');
formData.append('author', 'Cesário Machava');
formData.append('isPublished', 'true');

const response = await fetch('http://localhost:3000/api/downloads', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});
```

### Exemplo 3: Envio de Mensagem de Contacto

```javascript
const contactResponse = await fetch('http://localhost:3000/api/contacts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'João Silva',
    email: 'joao@empresa.com',
    company: 'Empresa XYZ',
    subject: 'Proposta de Colaboração',
    message: 'Gostaria de discutir uma possível colaboração...',
    category: 'collaboration'
  })
});
```

## Considerações de Performance

### Otimizações Implementadas

- **Paginação**: Todas as listagens suportam paginação para reduzir carga
- **Índices de base de dados**: Campos frequentemente consultados são indexados
- **Eager loading**: Associações são carregadas eficientemente
- **Rate limiting**: Previne sobrecarga do servidor
- **Compressão**: Middleware de compressão para reduzir tamanho das respostas

### Recomendações para Produção

- Implementar cache (Redis)
- Utilizar CDN para ficheiros estáticos
- Configurar load balancer
- Implementar monitoring e logging
- Otimizar queries de base de dados

## Monitorização e Logging

### Logs Implementados

- Conexão com base de dados
- Início do servidor
- Erros de autenticação
- Erros de validação
- Erros internos do servidor

### Métricas Recomendadas

- Tempo de resposta das requisições
- Taxa de erro por endpoint
- Utilização de recursos (CPU, memória)
- Número de utilizadores ativos
- Volume de uploads

## Testes

### Estratégia de Testes

A API está preparada para implementação de testes automatizados:

- **Testes unitários**: Para funções utilitárias e middleware
- **Testes de integração**: Para endpoints da API
- **Testes de carga**: Para verificar performance

### Ferramentas Recomendadas

- Jest: Framework de testes
- Supertest: Testes de API
- Artillery: Testes de carga

## Deployment

### Opções de Deployment

1. **Servidor VPS**: Deployment tradicional em servidor virtual
2. **Docker**: Containerização para facilitar deployment
3. **Cloud Platforms**: Heroku, AWS, Google Cloud, Azure
4. **Serverless**: AWS Lambda, Vercel Functions

### Checklist de Produção

- [ ] Configurar variáveis de ambiente de produção
- [ ] Configurar base de dados PostgreSQL
- [ ] Configurar HTTPS
- [ ] Implementar backup da base de dados
- [ ] Configurar monitoring
- [ ] Implementar logging centralizado
- [ ] Configurar alertas de erro
- [ ] Testar todos os endpoints
- [ ] Configurar domínio personalizado

## Suporte e Manutenção

### Atualizações Regulares

- Atualizar dependências de segurança
- Monitorizar vulnerabilidades
- Otimizar performance
- Adicionar novas funcionalidades

### Backup e Recuperação

- Backup automático da base de dados
- Backup de ficheiros de upload
- Plano de recuperação de desastres
- Testes regulares de restauro

## Conclusão

Esta API REST fornece uma base sólida e escalável para o portfolio pessoal. Com funcionalidades completas de gestão de conteúdo, autenticação segura e arquitetura bem estruturada, a API está preparada para suportar o crescimento e evolução do portfolio.

A implementação segue as melhores práticas de desenvolvimento de APIs REST, garantindo segurança, performance e facilidade de manutenção. A documentação detalhada facilita a integração com o frontend e futuras expansões da funcionalidade.


