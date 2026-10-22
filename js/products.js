
const CATEGORIES = [
  { key: "todos", label: "Todos" },
  { key: "led", label: "Lâmpadas LED" },
  { key: "interno", label: "Iluminação Interna" },
  { key: "placa", label: "Lâmpada de Placa" },
  { key: "halogena", label: "Lâmpadas Halógenas" },
  { key: "servicos", label: "Serviços" },
];

/*
  Campos de apresentação:
  - highlights: até 3 etiquetas curtas exibidas no card
  - power: potência em mil lúmens (gera o medidor de potência da linha LED)
  - badge: selo no canto da foto ({ text, tone: "red" | "green" | "steel" })
  - priceNote: linha extra abaixo do preço no card
*/
const PRODUCTS = [
  {
    id: "led-10k",
    name: "Lâmpada LED 10 Mil Lúmens",
    category: "led",
    image: "assets/images/led-10mil.jpeg",
    shortDesc: "A porta de entrada da linha LED: luz branca e proteção contra água.",
    description:
      "Lâmpada de LED automotiva com 10 mil lúmens de potência luminosa. Cor 6000K branco frio, com proteção à prova d'água. O preço varia de acordo com o encaixe do seu veículo — selecione abaixo.",
    specs: [
      { label: "Potência luminosa", value: "10.000 lúmens" },
      { label: "Temperatura de cor", value: "6000K · Branco frio" },
      { label: "Proteção", value: "À prova d'água" },
      { label: "Garantia", value: "6 meses" },
    ],
    power: 10,
    highlights: ["6000K", "À prova d'água", "Garantia 6 meses"],
    variants: [
      { id: "outros", label: "H1, H7, H11, HB3/4", price: 130 },
      { id: "h4", label: "Encaixe H4", price: 160 },
    ],
  },
  {
    id: "led-15k",
    name: "Lâmpada LED 15 Mil Lúmens",
    category: "led",
    image: "assets/images/led-15mil.jpeg",
    shortDesc: "Mais luz para o dia a dia, com o dobro da garantia da linha de entrada.",
    description:
      "Lâmpada de LED automotiva com 15 mil lúmens de potência luminosa e garantia estendida de 1 ano. O preço varia de acordo com o encaixe do seu veículo — selecione abaixo.",
    specs: [
      { label: "Potência luminosa", value: "15.000 lúmens" },
      { label: "Garantia", value: "1 ano" },
    ],
    power: 15,
    highlights: ["Garantia 1 ano"],
    variants: [
      { id: "outros", label: "H1, H7, H11, HB3/4", price: 200 },
      { id: "h4", label: "Encaixe H4", price: 230 },
    ],
  },
  {
    id: "led-22k",
    name: "Lâmpada LED 22 Mil Lúmens",
    category: "led",
    image: "assets/images/led-22mil.jpeg",
    shortDesc: "Alta performance para quem roda à noite com frequência.",
    description:
      "Lâmpada de LED automotiva com 22 mil lúmens de potência luminosa e garantia de 1 ano. O preço varia de acordo com o encaixe do seu veículo — selecione abaixo.",
    specs: [
      { label: "Potência luminosa", value: "22.000 lúmens" },
      { label: "Garantia", value: "1 ano" },
    ],
    power: 22,
    highlights: ["Garantia 1 ano"],
    variants: [
      { id: "outros", label: "H1, H7, H11, HB3/4", price: 270 },
      { id: "h4", label: "Encaixe H4", price: 300 },
    ],
  },
  {
    id: "led-30k",
    name: "Lâmpada LED 30 Mil Lúmens",
    category: "led",
    image: "assets/images/led-30mil.jpeg",
    shortDesc: "A mais forte entre as lâmpadas com preço fixo de tabela.",
    description:
      "Lâmpada de LED automotiva com 30 mil lúmens de potência luminosa — a mais forte da tabela de valores — com garantia de 1 ano. O preço varia de acordo com o encaixe do seu veículo — selecione abaixo.",
    specs: [
      { label: "Potência luminosa", value: "30.000 lúmens" },
      { label: "Garantia", value: "1 ano" },
    ],
    power: 30,
    highlights: ["Garantia 1 ano"],
    variants: [
      { id: "outros", label: "H1, H7, H11, HB3/4", price: 350 },
      { id: "h4", label: "Encaixe H4", price: 380 },
    ],
  },
  {
    id: "led-40k-premium",
    name: "Lâmpada LED 40 Mil Lúmens — Linha Premium",
    category: "led",
    image: "assets/images/card-led-forte.jpeg",
    shortDesc: "A lâmpada mais forte do catálogo, em alta potência e 6000K.",
    description:
      "A lâmpada de LED mais forte do catálogo da MV LEDs: 40 mil lúmens, cor 6000K branco frio e alta potência, com 1 ano de garantia. Valor sob consulta — fale com a gente pelo WhatsApp para o encaixe do seu veículo.",
    specs: [
      { label: "Potência luminosa", value: "40.000 lúmens" },
      { label: "Temperatura de cor", value: "6000K · Branco frio" },
      { label: "Potência", value: "Alta potência" },
      { label: "Garantia", value: "1 ano" },
    ],
    power: 40,
    highlights: ["6000K", "Garantia 1 ano"],
    badge: { text: "Topo de linha", tone: "red" },
    price: null,
    priceOnRequest: true,
  },
  {
    id: "led-projetor",
    name: "LED Projetor",
    category: "led",
    image: "assets/images/led-projetor.jpeg",
    shortDesc: "Kit projetor de LED de alta performance, avulso ou no par com desconto.",
    description:
      "Kit LED Projetor de alta performance, 6000K e 12V. Leve a unidade avulsa por R$ 150 ou o par por R$ 280 — economia de R$ 20 em relação a duas unidades.",
    specs: [
      { label: "Tonalidade", value: "6000K" },
      { label: "Voltagem", value: "12V" },
      { label: "Unidade", value: "R$ 150,00" },
      { label: "Par", value: "R$ 280,00" },
    ],
    highlights: ["6000K", "12V"],
    badge: { text: "Par com desconto", tone: "green" },
    priceNote: "ou R$ 280 o par",
    variants: [
      { id: "unidade", label: "1 Unidade", price: 150 },
      { id: "par", label: "Par (2 unidades) · Com desconto", price: 280 },
    ],
  },
  {
    id: "pingo-led-projetor",
    name: "Pingo de LED T10 com Projetor",
    category: "led",
    image: "assets/images/pingo-led-projetor.jpg",
    shortDesc: "Pingo com lente projetora e luz super branca, sem erro no painel.",
    description:
      "O pingo de LED mais forte do mercado! Modelo equipado com lente projetora frontal e 1600 lúmens de fluxo luminoso, proporcionando luz super branca de alta definição. Já vem com sistema Canbus integrado, evitando avisos de lâmpada queimada no painel.",
    specs: [
      { label: "Encaixe", value: "T10 / W5W (Pingo)" },
      { label: "Luminosidade", value: "1600 Lúmens" },
      { label: "Temperatura de cor", value: "6000K · Branco Frio" },
      { label: "Construção", value: "Lente com Mini Projetor" },
      { label: "Tecnologia", value: "Canbus integrado (Sem erro no painel)" },
    ],
    highlights: ["1600 lm", "6000K", "Canbus"],
    price: 60,
    priceLabel: "Preço do par",
    priceUnit: "par",
  },
  {
    id: "kit-led-interno",
    name: "Kit LED Interno",
    category: "interno",
    image: "assets/images/card-kit-interno.jpeg",
    shortDesc: "Teto, portas e demais pontos internos com mais claridade e baixo consumo.",
    description:
      "Kit de LED para iluminação interna do veículo (teto, portas e demais pontos internos). Compatível com todos os veículos, com mais claridade e baixo consumo de energia.",
    specs: [
      { label: "Compatibilidade", value: "Todos os veículos" },
      { label: "Claridade", value: "Mais claridade" },
      { label: "Consumo", value: "Baixo consumo de energia" },
      { label: "Durabilidade", value: "Durabilidade e resistência" },
      { label: "Instalação", value: "Fácil instalação" },
    ],
    highlights: ["Todos os veículos", "Baixo consumo"],
    price: 20,
    priceLabel: "A partir de",
    priceUnit: "lâmpada",
  },
  {
    id: "torpedo-led",
    name: "Torpedo LED (31mm a 41mm)",
    category: "interno",
    image: "assets/images/prod-torpedo.jpeg",
    shortDesc: "Para luz de teto, porta-malas e outros pontos internos.",
    description:
      "Lâmpada torpedo de LED, tamanhos de 31mm a 41mm, indicada para luz de teto, porta-malas e outros pontos internos do veículo.",
    specs: [{ label: "Tamanho", value: "31mm a 41mm" }],
    highlights: ["31 a 41 mm"],
    price: 20,
    priceUnit: "unidade",
  },
  {
    id: "led-placa",
    name: "Lâmpada LED para Placa",
    category: "placa",
    image: "assets/images/card-led-placa.jpeg",
    shortDesc: "Placa bem iluminada, com instalação simples e acabamento discreto.",
    description:
      "Lâmpada de LED para iluminação da placa do veículo. Instalação simples e acabamento discreto.",
    specs: [{ label: "Aplicação", value: "Iluminação de placa" }],
    highlights: ["Instalação simples"],
    price: 20,
    priceLabel: "A partir de",
    priceUnit: "unidade",
  },
  {
    id: "halogena-unidade",
    name: "Lâmpada Halógena",
    category: "halogena",
    image: "assets/images/prod-halogena-unidade.jpeg",
    shortDesc: "Encaixes H1, H3, H4, HB3, HB4, H11 e outros. Shocklight, Osram e Cindy.",
    description:
      "Lâmpada halógena avulsa, disponível para diversos encaixes (H1, H3, H4, HB3, HB4, H11, entre outros), compatível com todos os veículos. Marcas como Shocklight, Osram e Cindy disponíveis em loja.",
    specs: [
      { label: "Compatibilidade", value: "Para todos os veículos" },
      { label: "Garantia", value: "3 meses" },
    ],
    highlights: ["Todos os veículos", "Garantia 3 meses"],
    price: 35,
    priceUnit: "unidade",
  },
  {
    id: "super-brancas",
    name: "Lâmpadas Super Brancas",
    category: "halogena",
    image: "assets/images/prod-super-brancas.jpeg",
    shortDesc: "Luz mais branca que a halógena comum, sem precisar trocar para LED.",
    description:
      "Lâmpada halógena super branca, com luz mais próxima do branco em comparação à halógena comum, sem precisar trocar para LED.",
    specs: [{ label: "Tipo", value: "Halógena super branca" }],
    highlights: ["Halógena"],
    price: 70,
    priceUnit: "unidade",
  },
  {
    id: "t10-halogena",
    name: "T10 Halógena",
    category: "halogena",
    image: "assets/images/prod-t10.jpeg",
    shortDesc: "Para lanternas, placa e luz de posição.",
    description:
      "Lâmpada halógena modelo T10, usada em lanternas, placa e luz de posição.",
    specs: [{ label: "Modelo", value: "T10" }],
    highlights: ["T10"],
    price: 10,
    priceUnit: "unidade",
  },
  {
    id: "halogena-1-2-polos",
    name: "Halógena 1 Polo / 2 Polos",
    category: "halogena",
    image: "assets/images/prod-1polo-2polos.jpeg",
    shortDesc: "Para setas e lanternas.",
    description:
      "Lâmpada halógena em versão 1 polo ou 2 polos, usada em setas e lanternas.",
    specs: [{ label: "Modelo", value: "1 polo / 2 polos" }],
    highlights: ["1 ou 2 polos"],
    price: 15,
    priceUnit: "unidade",
  },
  {
    id: "regulagem-farol",
    name: "Regulagem de Farol",
    category: "servicos",
    image: "assets/images/servico-regulagem-farol.jpeg",
    shortDesc: "Serviço feito na loja pela equipe da MV LEDs.",
    description:
      "Serviço de regulagem de farol, feito na loja pela equipe da MV LEDs.",
    specs: [{ label: "Tipo", value: "Serviço" }],
    highlights: ["Feito na loja"],
    price: 40,
  },
  {
    id: "revitalizacao-farol",
    name: "Revitalização de Faróis",
    category: "servicos",
    image: "assets/images/servico-revitalizacao-farol.jpeg",
    shortDesc: "Devolve a transparência e o brilho do farol, com vitrificação.",
    description:
      "Serviço de revitalização de faróis com vitrificação, devolvendo a transparência e o brilho do farol.",
    specs: [{ label: "Inclui", value: "Vitrificação" }],
    highlights: ["Com vitrificação"],
    price: 200,
  },
];
