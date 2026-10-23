/* ============================================================
   CONFIGURAÇÃO DA LOJA — MV LEDs
   Edite os valores abaixo para atualizar informações do site.
   ============================================================ */

const CONFIG = {
  // Número de WhatsApp do Marcos (proprietário) no formato:
  // 55 + DDD + número (somente dígitos, sem espaços, +, ou traços)
  // Exemplo atual: +55 84 98620-7942
  WHATSAPP_NUMBER: "5584986207942",

  STORE_NAME: "MV LEDs",
  OWNER_NAME: "Marcos",
  LOCATION: "Parnamirim, Rio Grande do Norte",

  // Mensagem inicial enviada ao clicar no botão flutuante de WhatsApp
  // (sem produtos, apenas um "oi" comercial)
  WHATSAPP_DEFAULT_MESSAGE:
    "Olá! Vim pelo site da MV LEDs e gostaria de mais informações.",

  // Barra de vantagem do carrinho: valor mínimo (R$) e benefício liberado.
  // Para desativar, use threshold: 0
  CART_GOAL: {
    threshold: 300,
    reward: "instalação grátis na loja",
  },

  // Catálogo online (Supabase > Project Settings > API).
  // Enquanto estiver vazio, o site usa a lista de js/products.js.
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",
};
