# Michelle Farias · Gestão (protótipo B)

Aplicativo web de gestão para o estúdio de piercing **Michelle Farias**. Ele junta agenda, clientes, cartão fidelidade virtual, estoque de materiais e caixa, e as áreas conversam entre si: um atendimento concluído já atualiza o estoque, o cartão da cliente, o caixa e a agenda.

Este é o **protótipo B**, a versão minimalista e mais feminina, feita a partir da identidade da recepção do estúdio: monograma MF, painel em arco, manchas de oncinha rosa e a frase "Toda musa usa piercing".

Autora: **Hanna Sophia Aragão Cerqueira**, 2026.

## Como abrir

- **No computador:** baixe a pasta e abra o `index.html` no navegador. Não precisa instalar nada.
- **No GitHub Pages:** no repositório, vá em **Settings → Pages**. Em *Build and deployment*, escolha *Deploy from a branch*, a branch `main` e a pasta `/ (root)`, e clique em **Save**. Em alguns minutos o site abre em `https://<seu-usuário>.github.io/<nome-do-repositório>/`.

## Linguagens e tecnologias

| Parte | Linguagem | Arquivo |
|---|---|---|
| Estrutura da página e ícones | HTML5 e SVG | `index.html` |
| Visual: cores, letras, layout no celular e no computador | CSS3 | `css/style.css` |
| Lógica: dados, telas, botões e formulários | JavaScript (ES2020) | `js/app.js` |
| Dados de exemplo | JavaScript (objeto no formato JSON) | `js/exemplos.js` |
| Letras | Google Fonts: Cormorant Garamond, Jost e Allura | link no `index.html` |

O projeto não usa framework (React, Vue, Bootstrap), biblioteca nem etapa de build. O navegador lê os arquivos do jeito que estão.

## Estrutura das pastas

```
michelle-farias-plano-b/
├── index.html        estrutura da página e ícones (SVG)
├── css/
│   └── style.css     cores, letras, layout e responsividade
├── js/
│   ├── exemplos.js   dados de exemplo (fictícios)
│   └── app.js        lógica do aplicativo
├── .gitignore        impede subir cópias de segurança com dados reais
└── README.md
```

## Como o código funciona

### index.html

- Um `<svg>` escondido guarda os ícones como `<symbol id="i-cal">`, `<symbol id="i-heart">` e outros. Cada ícone é usado com `<use href="#i-cal">`.
- `<header class="top">` tem o monograma MF, o nome do estúdio, o botão **Novo atendimento**, o botão de **Ajustes** e as abas: Hoje, Clientes, Fidelidade, Materiais e Caixa.
- `<main id="main">` fica vazio no HTML: o JavaScript desenha ali a tela da aba aberta.
- `#sheet` é a janela que sobe da parte de baixo, `#toast` é o aviso com o botão **Desfazer** e `#ask` é a caixa de confirmação.

### css/style.css

- **Cores em variáveis**, no `:root` do começo do arquivo: `--bg` (fundo, #EDE3E3), `--ink` (texto), `--mute` (texto de apoio), `--blush` (destaques), `--line` (linhas) e outras. Mudando uma variável, o app inteiro muda junto.
- **Faixa xadrez** rosa e branca com contorno preto, embaixo do cabeçalho: `.top::after`, feita com `repeating-conic-gradient`. Ela acompanha o cabeçalho quando a página rola.
- **Cartão fidelidade em arco**: `.arch`, com `border-radius: 999px 999px 30px 30px`. Os selos são manchas de oncinha desenhadas em SVG.
- **Celular e computador**: abaixo de 760 px de largura (`@media (max-width: 759px)`), as abas vão para uma barra fixa embaixo e aparece o botão flutuante **Atender**.

### js/app.js

O arquivo é dividido em partes, e cada uma começa com um comentário `/* ---------- ... ---------- */`:

| Parte | O que faz |
|---|---|
| Funções de apoio | Formatam dinheiro (`brl`), datas, telefones, link do WhatsApp (`wa`) e ícones |
| Fora do Claude | Salva e carrega os dados no `localStorage` do navegador |
| Dados | O objeto `st` cria, altera e apaga registros, no banco do Claude ou no navegador |
| Janelas | Abrem e fecham as fichas (`openSh`, `closeSh`) |
| Telas | `V.hoje`, `V.clientes`, `V.fidelidade`, `V.materiais`, `V.caixa` e `V.ajustes` devolvem o HTML de cada aba |
| Ações | Objeto `A`: um botão com `data-act="selo"` chama `A.selo` |
| Formulários | Objeto `FORMS`: o formulário de novo atendimento, com `data-form="at"`, é tratado por `FORMS.at` |
| Eventos | Ouvintes ligados ao documento inteiro: todo clique em botão com `data-act` e todo envio de formulário passam por eles |
| Início | Escolhe onde guardar os dados e desenha a primeira tela |

**Navegação.** Cada aba é um endereço com `#` (`#hoje`, `#clientes`, `#fidelidade`, `#materiais`, `#caixa`, `#ajustes`). Quando o endereço muda, o app troca a aba e redesenha a tela.

**Redesenho.** Sempre que um dado muda, `changed()` pede um redesenho com `requestAnimationFrame`, e `paint()` monta a tela de novo com o HTML da aba.

**Atendimento integrado.** Ao concluir um atendimento, o app faz tudo de uma vez:

1. tira do estoque os materiais do serviço e a joia usada, guardando o lote;
2. dá o selo no cartão fidelidade da cliente;
3. lança a entrada no caixa, com a forma de pagamento;
4. marca o horário como atendido e, se o serviço tiver retorno, agenda a troca de haste.

Se algo for lançado errado, o atendimento pode ser desfeito e tudo volta como estava.

**Cartão fidelidade.** A regra fica em Ajustes: selo por atendimento ou por valor gasto, de 3 a 20 selos, e o prêmio. A imagem do cartão enviada à cliente (1080 × 1350 pixels) é desenhada num `<canvas>` e baixada como PNG.

**Planilhas e cópia de segurança.** O estoque e o caixa do mês podem ser baixados em CSV, e todos os dados em um arquivo JSON.

## Dados

Os dados ficam em oito coleções. Cada coleção é uma lista de registros, e cada registro tem um `id`.

| Coleção | O que guarda |
|---|---|
| `config` | Nome do estúdio, WhatsApp, Instagram e regra do cartão fidelidade |
| `servicos` | Serviços, preço, materiais usados (kit) e dias até o retorno |
| `materiais` | Joias, agulhas, descartáveis, assepsia e acessórios: quantidade, mínimo, custo, venda, lote, validade e fornecedor |
| `clientes` | Nome, telefone, nascimento, responsável (menores de idade), observações e selos |
| `atendimentos` | Data, cliente, itens, materiais usados, pagamento e total |
| `agenda` | Dia, hora, cliente, serviço e situação (marcado, feito ou faltou) |
| `despesas` | Data, descrição, categoria e valor |
| `movs` | Entradas, perdas e ajustes de estoque |

### Onde os dados ficam

- **Dentro do Claude**, onde o protótipo foi publicado: no banco de dados do Claude (`window.claude.use('db')`), compartilhado entre quem tem acesso de edição.
- **Fora do Claude** (GitHub Pages ou arquivo aberto no computador): no `localStorage` do navegador, na chave `michelle-farias-plano-b`. Só aquele navegador, naquele aparelho, vê os dados. Limpar os dados do navegador apaga tudo, então é bom baixar a cópia de segurança em Ajustes de vez em quando.

### Dados de exemplo

Os registros de `js/exemplos.js` são fictícios: os nomes são inventados e os telefones seguem o padrão (12) 90000-0xxx. Todos têm `"ex": true`. Na primeira vez que o app abre fora do Claude, eles são carregados com as datas ajustadas para a semana atual. Para usar de verdade, apague os exemplos em **Ajustes → Dados**.

## Privacidade

O app guarda dados pessoais das clientes, incluindo observações de saúde, como alergia a metais. Por isso o uso real deve seguir a Lei Geral de Proteção de Dados (Lei nº 13.709/2018): registrar só o necessário, pedir o consentimento da cliente para dados de saúde e tratar com o responsável os dados de menores de idade.

Os dados digitados no app não vão para o GitHub. Nunca suba para o repositório uma cópia de segurança com dados reais: o `.gitignore` já bloqueia os arquivos `michelle-farias-plano-b-*.json`.

## Paleta

| Cor | Código | Uso |
|---|---|---|
| Ballet Flats | `#EDE3E3` | Fundo |
| Mocha | `#60412F` | Textos e botões |
| Taupe | `#836150` | Textos de apoio (no app, um tom mais escuro, `#7A5847`, para dar leitura no fundo) |
| Blush | `#CD7787` | Selos e destaques |
| Dusty Rose | `#BDA197` | Linhas e selos vazios |
| Sakura e branco | `#EC9C9D` e `#FFFFFF` | Faixa xadrez, com contorno preto |
