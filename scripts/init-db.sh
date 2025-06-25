#!/bin/bash

# Script de inicialização da base de dados para produção
# Este script deve ser executado apenas uma vez para configurar a base de dados

echo "🚀 Inicializando base de dados do Portfolio API..."

# Verificar se as variáveis de ambiente estão definidas
if [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    echo "❌ Erro: Variáveis de ambiente DB_NAME, DB_USER e DB_PASSWORD devem estar definidas"
    exit 1
fi

# Criar base de dados (se não existir)
echo "📊 Criando base de dados $DB_NAME..."
createdb $DB_NAME 2>/dev/null || echo "Base de dados já existe"

# Criar utilizador (se não existir)
echo "👤 Criando utilizador $DB_USER..."
psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || echo "Utilizador já existe"

# Conceder permissões
echo "🔐 Concedendo permissões..."
psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
psql -c "ALTER USER $DB_USER CREATEDB;"

echo "✅ Base de dados inicializada com sucesso!"
echo ""
echo "Próximos passos:"
echo "1. Configurar o arquivo .env com as credenciais da base de dados"
echo "2. Executar 'npm start' para iniciar o servidor"
echo "3. O Sequelize criará automaticamente as tabelas na primeira execução"

