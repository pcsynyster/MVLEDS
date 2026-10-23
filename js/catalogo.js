/* Lê os produtos do Supabase; sem configuração ou em caso de falha, mantém a lista de products.js */
const CATALOGO = (() => {
  const url = (CONFIG.SUPABASE_URL || "").replace(/\/+$/, "");
  const chave = CONFIG.SUPABASE_ANON_KEY || "";
  const ativo = Boolean(url && chave);

  const esc = (v) =>
    String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const opcional = (v) => (v ? esc(v) : undefined);
  const imagemSegura = (v) =>
    typeof v === "string" && /^(https:\/\/|assets\/)/.test(v) ? esc(v) : "assets/images/logo-cropped.jpeg";

  function paraProduto(r) {
    const variantes = Array.isArray(r.variants) && r.variants.length
      ? r.variants.map((v) => ({ id: esc(v.id), label: esc(v.label), price: Number(v.price) }))
      : undefined;
    return {
      id: esc(r.id),
      name: esc(r.name),
      category: r.category,
      image: imagemSegura(r.image),
      shortDesc: esc(r.short_desc),
      description: esc(r.description),
      specs: Array.isArray(r.specs) ? r.specs.map((x) => ({ label: esc(x.label), value: esc(x.value) })) : [],
      variants: variantes,
      price: variantes || r.price == null ? null : Number(r.price),
      priceOnRequest: Boolean(r.price_on_request),
      priceLabel: opcional(r.price_label),
      priceUnit: opcional(r.price_unit),
      priceNote: opcional(r.price_note),
      highlights: Array.isArray(r.highlights) ? r.highlights.map(esc) : [],
      power: Number(r.power) || undefined,
      badge: r.badge && r.badge.text
        ? { text: esc(r.badge.text), tone: ["red", "green", "steel"].includes(r.badge.tone) ? r.badge.tone : "red" }
        : undefined,
    };
  }

  async function carregar() {
    if (!ativo) return false;
    const controle = new AbortController();
    const limite = setTimeout(() => controle.abort(), 6000);
    try {
      const resposta = await fetch(
        `${url}/rest/v1/produtos?select=*&active=eq.true&order=position.asc,name.asc`,
        { headers: { apikey: chave }, signal: controle.signal }
      );
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      const linhas = await resposta.json();
      if (!Array.isArray(linhas) || !linhas.length) return false;
      PRODUCTS.splice(0, PRODUCTS.length, ...linhas.map(paraProduto));
      return true;
    } catch (erro) {
      console.warn("Catálogo online indisponível, usando a lista local.", erro);
      return false;
    } finally {
      clearTimeout(limite);
    }
  }

  return { ativo, carregar };
})();
