# MV LEDs — Site & Catálogo

Site institucional da **MV LEDs**, loja de iluminação automotiva em
Parnamirim, Rio Grande do Norte. Funciona como catálogo de produtos
com carrinho de compras, permitindo que o cliente monte o pedido e
finalize direto pelo **WhatsApp** do proprietário.

## Funcionalidades

- Catálogo de produtos com filtro por categoria (LED, iluminação
  interna, lâmpada de placa, halógenas, serviços)
- Página de detalhes do produto com ficha técnica e seleção de
  variante (encaixe)
- Carrinho de compras (adicionar, remover, alterar quantidade,
  subtotal)
- Finalização de pedido com mensagem automática pré-formatada,
  aberta direto no WhatsApp
- Botão flutuante de WhatsApp
- 100% responsivo (mobile, tablet e desktop)

## Tecnologias

HTML, CSS e JavaScript puros — sem frameworks, sem build, sem
dependências. Basta abrir o `index.html` no navegador.

## Estrutura do projeto

```
mvleds/
├── index.html          # Estrutura da página
├── css/
│   └── styles.css      # Estilos
├── js/
│   ├── config.js       # Configurações (número de WhatsApp, nome da loja)
│   ├── products.js     # Catálogo de produtos (fácil de editar)
│   └── main.js         # Lógica do site (carrinho, filtros, modal, WhatsApp)
└── assets/
    └── images/         # Imagens da logo e dos produtos
```

## Como editar

- **Número de WhatsApp / nome da loja** → `js/config.js`
- **Produtos, preços e categorias** → `js/products.js` (basta copiar
  um bloco existente e ajustar os campos)

## Como rodar localmente

Não precisa de servidor nem instalação — é só abrir o `index.html`
no navegador, ou usar a extensão **Live Server** do VS Code para
recarregar automaticamente durante a edição.
# MVLEDS
