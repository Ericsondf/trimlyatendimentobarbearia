# 🗡 Trimly — App de Agendamento de Barbearia

## Como hospedar HOJE (grátis)

### Opção 1 — Netlify (recomendado, mais fácil)
1. Acesse https://netlify.com e crie uma conta grátis
2. Clique em "Add new site" → "Deploy manually"
3. Arraste a pasta `trimly` inteira para a área indicada
4. Pronto! Você recebe um link como: `https://seusite.netlify.app`
5. Em "Domain settings" você pode colocar um nome personalizado grátis

### Opção 2 — Vercel
1. Acesse https://vercel.com e crie uma conta grátis
2. Clique em "Add New Project" → "Deploy without Git"
3. Arraste a pasta `trimly`
4. Link pronto em 30 segundos

### Opção 3 — GitHub Pages
1. Crie um repositório no GitHub
2. Faça upload dos arquivos
3. Em Settings → Pages → Source: main branch
4. Link: `https://seuuser.github.io/trimly`

---

## Personalizar antes de publicar

Edite o arquivo `js/data.js`:

```js
shop: {
  name: "Barbearia Isaías Sousa",      // nome da barbearia
  whatsapp: "5511999999999",            // seu WhatsApp (com DDI)
  instagram: "@isaiassousa.barber",
},
```

Adicione/remova serviços, barbeiros e horários no mesmo arquivo.

---

## Estrutura dos arquivos
```
trimly/
├── index.html          ← página principal
├── css/
│   └── style.css       ← visual/design
├── js/
│   ├── data.js         ← ⭐ suas configurações (edite aqui)
│   └── app.js          ← lógica do app
└── README.md
```

---

## Compartilhar com seu cliente
Depois de hospedar, envie o link por WhatsApp ou coloque no Instagram como "link da bio".

O app funciona 100% no celular, sem precisar instalar nada.

---

Feito com ❤️ por Trimly
