# MentorConnect - Plataforma de Mentoria

## 📋 Descrição

MentorConnect é uma plataforma completa de mentoria profissional com modelo de negócios freemium e foco em inclusão. A plataforma conecta mentores, mentorados e empresas, oferecendo funcionalidades específicas para cada tipo de usuário.

## ✨ Funcionalidades Principais

### 🔐 Sistema de Autenticação
- Login e cadastro com email e senha (Firebase Authentication)
- Três tipos de usuário (roles):
  - **Mentorado**: Busca mentoria e desenvolvimento profissional
  - **Mentor**: Oferece mentoria e compartilha conhecimento
  - **Empresa**: Busca talentos e publica vagas

### 💎 Modelo Freemium

#### Plano Free (R$ 0/mês)
- Mentorias gratuitas ilimitadas
- Criar currículo básico
- Buscar mentores
- ❌ Sem acesso a mentorias pagas

#### Plano Pro (R$ 49/mês)
- Tudo do plano Free
- Mentorias pagas ilimitadas
- Currículo completo
- Prioridade no agendamento

#### Plano Enterprise (R$ 299/mês)
- Publicar vagas ilimitadas
- Busca avançada de talentos
- Filtro de candidatos PCD
- Suporte prioritário

### 👨‍🎓 Funcionalidades para Mentorados

1. **Gerenciamento de Currículo**
   - Dados pessoais (nome, email, telefone)
   - Profissão e experiência
   - Habilidades
   - Biografia
   - **Checkbox para indicar se é PCD** ♿

2. **Busca de Mentores**
   - Visualizar mentores disponíveis
   - Ver especialidades e preços
   - Filtrar por mentorias gratuitas ou pagas

3. **Agendamento de Mentorias**
   - Solicitar mentorias com data e hora
   - Acompanhar status (pendente, confirmada, cancelada)
   - Cancelar mentorias pendentes
   - Restrição: mentorias pagas apenas para plano Pro

### 👨‍🏫 Funcionalidades para Mentores

1. **Perfil de Mentor**
   - Especialidade
   - Biografia
   - Definir se oferece mentorias gratuitas
   - Definir preço por hora (para mentorias pagas)

2. **Gerenciamento de Solicitações**
   - Visualizar solicitações de mentoria
   - Aceitar ou recusar mentorias
   - Ver informações do mentorado

### 🏢 Funcionalidades para Empresas

1. **Perfil da Empresa**
   - Nome da empresa
   - Setor de atuação
   - Descrição da empresa

2. **Publicação de Vagas**
   - Título da vaga
   - Descrição detalhada
   - Requisitos
   - Salário
   - **Checkbox para vaga exclusiva PCD** ♿

3. **Busca de Talentos**
   - Buscar por habilidades
   - **Filtro específico para candidatos PCD** ♿
   - Visualizar currículos completos
   - Ver informações de contato

## 🎨 Design e Interface

- **Framework CSS**: Tailwind CSS
- **Design**: Moderno, responsivo e acessível
- **Cores**:
  - Primária: Azul (#3b82f6)
  - Secundária: Verde (#10b981)
  - Empresa: Roxo (#8b5cf6)
- **Navegação**: SPA (Single Page Application) com JavaScript vanilla

## 🔧 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3 (Tailwind CSS), JavaScript (ES6+)
- **Backend**: Firebase
  - Firebase Authentication (autenticação)
  - Cloud Firestore (banco de dados)
- **Hospedagem**: Firebase Hosting

## 📊 Estrutura do Banco de Dados (Firestore)

### Collection: `users`
```javascript
{
  uid: string,
  name: string,
  email: string,
  role: 'mentorado' | 'mentor' | 'empresa',
  plan: 'free' | 'pro' | 'enterprise',
  createdAt: timestamp
}
```

### Collection: `profiles` (Mentorados)
```javascript
{
  userId: string,
  name: string,
  email: string,
  phone: string,
  profession: string,
  experience: number,
  skills: string,
  bio: string,
  isPCD: boolean, // ♿ Indicador PCD
  updatedAt: timestamp
}
```

### Collection: `mentors`
```javascript
{
  userId: string,
  name: string,
  email: string,
  specialty: string,
  bio: string,
  isFree: boolean,
  price: number,
  updatedAt: timestamp
}
```

### Collection: `companies`
```javascript
{
  userId: string,
  companyName: string,
  sector: string,
  description: string,
  email: string,
  updatedAt: timestamp
}
```

### Collection: `mentorships`
```javascript
{
  mentoradoId: string,
  mentoradoName: string,
  mentorId: string,
  date: string,
  time: string,
  status: 'pending' | 'confirmed' | 'cancelled',
  isFree: boolean,
  createdAt: timestamp
}
```

### Collection: `jobs`
```javascript
{
  companyId: string,
  companyName: string,
  title: string,
  description: string,
  requirements: string,
  salary: number,
  pcdExclusive: boolean, // ♿ Vaga exclusiva PCD
  createdAt: timestamp
}
```

## 🚀 Como Executar

### Opção 1: Firebase Hosting (Produção)
```bash
npm install -g firebase-tools
firebase login
firebase deploy
```

### Opção 2: Servidor Local
```bash
# Usando http-server (Node.js)
cd /vercel/sandbox
npx http-server public -p 3000

# Ou usando Python
cd /vercel/sandbox/public
python3 -m http.server 3000
```

Acesse: `http://localhost:3000`

## 📱 Fluxos de Uso

### Fluxo 1: Mentorado buscando mentoria
1. Cadastrar como "Mentorado"
2. Preencher currículo (marcar PCD se aplicável)
3. Buscar mentores disponíveis
4. Agendar mentoria (gratuita ou paga)
5. Aguardar confirmação do mentor

### Fluxo 2: Mentor oferecendo mentoria
1. Cadastrar como "Mentor"
2. Configurar perfil (especialidade, preço)
3. Receber solicitações de mentoria
4. Aceitar ou recusar mentorias

### Fluxo 3: Empresa buscando talentos
1. Cadastrar como "Empresa" (plano Enterprise)
2. Configurar perfil da empresa
3. Publicar vagas (marcar como PCD se exclusiva)
4. Buscar talentos (usar filtro PCD se necessário)
5. Visualizar currículos e entrar em contato

## ♿ Recursos de Inclusão

A plataforma possui recursos específicos para promover a inclusão de Pessoas com Deficiência (PCD):

1. **Para Mentorados PCD**:
   - Checkbox no currículo para se identificar como PCD
   - Visibilidade aumentada para empresas que buscam diversidade

2. **Para Empresas**:
   - Filtro específico para buscar apenas candidatos PCD
   - Opção para marcar vagas como exclusivas para PCD
   - Identificação visual de candidatos PCD nos resultados

## 🔒 Segurança

- Autenticação segura via Firebase Authentication
- Senhas criptografadas
- Validação de dados no frontend
- Proteção de rotas baseada em autenticação
- Dados sensíveis armazenados no Firestore com regras de segurança

## 📈 Próximas Melhorias

- [ ] Sistema de pagamento integrado (Stripe/PayPal)
- [ ] Chat em tempo real entre mentor e mentorado
- [ ] Avaliações e reviews de mentorias
- [ ] Calendário integrado para agendamentos
- [ ] Notificações por email
- [ ] Dashboard com estatísticas
- [ ] Filtros avançados de busca
- [ ] Upload de documentos e certificados
- [ ] Videoconferência integrada

## 📄 Licença

Este projeto foi desenvolvido como demonstração de uma plataforma de mentoria com foco em inclusão.

## 👥 Suporte

Para dúvidas ou suporte, entre em contato através da plataforma.

---

**MentorConnect** - Conectando Mentores e Talentos 🚀
