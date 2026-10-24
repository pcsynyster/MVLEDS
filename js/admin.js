/* Painel de produtos da MV LEDs (Supabase) */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const BUCKET = "produtos";
  const CATEGORIAS = CATEGORIES.filter((c) => c.key !== "todos");
  const nomeCategoria = (key) => CATEGORIAS.find((c) => c.key === key)?.label || key;

  const telas = {
    login: $("telaLogin"),
    semAcesso: $("telaSemAcesso"),
    painel: $("telaPainel"),
  };

  const state = {
    produtos: [],
    editando: null,
    novaFoto: null,
    novaFotoUrl: null,
  };

  const esc = (v) =>
    String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const formatBRL = (v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  function lerPreco(texto) {
    const limpo = String(texto || "").trim().replace(/\s|R\$/g, "");
    if (!limpo) return null;
    const normal = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
    const valor = Number(normal);
    return Number.isFinite(valor) && valor >= 0 ? Math.round(valor * 100) / 100 : NaN;
  }

  const precoParaCampo = (v) => (v == null ? "" : Number(v).toFixed(2).replace(".", ","));

  const slug = (texto) =>
    String(texto)
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "produto";

  let avisoTimer = null;
  function aviso(texto, erro = false) {
    const el = $("aviso");
    el.textContent = texto;
    el.classList.toggle("aviso--erro", erro);
    el.classList.add("is-visivel");
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(() => el.classList.remove("is-visivel"), 3200);
  }

  function confirmar(titulo, texto, rotulo = "Excluir") {
    const dialogo = $("dialogo");
    $("dialogoTitulo").textContent = titulo;
    $("dialogoTexto").textContent = texto;
    $("dialogoSim").textContent = rotulo;
    dialogo.hidden = false;
    $("dialogoNao").focus();
    return new Promise((resolve) => {
      const fechar = (resposta) => {
        dialogo.hidden = true;
        $("dialogoSim").onclick = null;
        $("dialogoNao").onclick = null;
        resolve(resposta);
      };
      $("dialogoSim").onclick = () => fechar(true);
      $("dialogoNao").onclick = () => fechar(false);
    });
  }

  function mostrar(nome) {
    Object.entries(telas).forEach(([chave, el]) => (el.hidden = chave !== nome));
  }

  /* Configuração ausente */
  if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY || !window.supabase) {
    mostrar("login");
    $("loginErro").textContent = "O painel ainda não foi conectado ao banco de dados (js/config.js).";
    $("loginBtn").disabled = true;
    return;
  }

  const sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

  /* Autenticação */
  function traduzirErro(erro) {
    const msg = (erro && erro.message) || "";
    if (/invalid login credentials/i.test(msg)) return "E-mail ou senha incorretos.";
    if (/email not confirmed/i.test(msg)) return "Este e-mail ainda não foi confirmado.";
    if (/rate limit|too many/i.test(msg)) return "Muitas tentativas. Aguarde alguns minutos.";
    if (/password should be at least/i.test(msg)) return "A senha precisa ter pelo menos 8 caracteres.";
    if (/failed to fetch|network/i.test(msg)) return "Sem conexão com o servidor. Verifique a internet.";
    if (/row-level security|permission denied/i.test(msg)) return "Este usuário não tem permissão para alterar produtos.";
    return msg || "Algo deu errado. Tente de novo.";
  }

  let emRecuperacao = /type=recovery/.test(location.hash);

  async function entrar(usuario) {
    if (emRecuperacao) return;
    const { data, error } = await sb.from("admins").select("user_id").eq("user_id", usuario.id).maybeSingle();
    if (error || !data) {
      mostrar("semAcesso");
      return;
    }
    mostrar("painel");
    await carregar();
  }

  $("formLogin").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = $("loginEmail").value.trim();
    const senha = $("loginSenha").value;
    $("loginErro").textContent = "";
    if (!email || !senha) {
      $("loginErro").textContent = "Preencha e-mail e senha.";
      return;
    }
    const botao = $("loginBtn");
    botao.disabled = true;
    botao.textContent = "Entrando…";
    const { data, error } = await sb.auth.signInWithPassword({ email, password: senha });
    botao.disabled = false;
    botao.textContent = "Entrar";
    if (error) {
      $("loginErro").textContent = traduzirErro(error);
      return;
    }
    $("loginSenha").value = "";
    await entrar(data.user);
  });

  $("esqueciBtn").addEventListener("click", async () => {
    const email = $("loginEmail").value.trim();
    if (!email) {
      $("loginErro").textContent = "Digite seu e-mail acima e toque em \"Esqueci minha senha\" de novo.";
      $("loginEmail").focus();
      return;
    }
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: location.origin + location.pathname,
    });
    if (error) {
      $("loginErro").textContent = traduzirErro(error);
      return;
    }
    $("loginErro").textContent = "";
    aviso("Enviamos um link para criar uma nova senha no seu e-mail.");
  });

  $("formNovaSenha").addEventListener("submit", async (e) => {
    e.preventDefault();
    const senha = $("novaSenha").value;
    if (senha.length < 8) {
      $("novaSenhaErro").textContent = "A senha precisa ter pelo menos 8 caracteres.";
      return;
    }
    const { data, error } = await sb.auth.updateUser({ password: senha });
    if (error) {
      $("novaSenhaErro").textContent = traduzirErro(error);
      return;
    }
    $("novaSenha").value = "";
    $("formNovaSenha").hidden = true;
    $("formLogin").hidden = false;
    $("voltarSenhaBtn").hidden = true;
    emRecuperacao = false;
    history.replaceState(null, "", location.pathname);
    aviso("Senha atualizada.");
    await entrar(data.user);
  });

  $("trocarSenhaBtn").addEventListener("click", () => {
    mostrar("login");
    $("formLogin").hidden = true;
    $("formNovaSenha").hidden = false;
    $("voltarSenhaBtn").hidden = false;
    $("novaSenhaErro").textContent = "";
    $("novaSenha").focus();
  });

  $("voltarSenhaBtn").addEventListener("click", () => {
    $("formNovaSenha").hidden = true;
    $("formLogin").hidden = false;
    $("voltarSenhaBtn").hidden = true;
    mostrar("painel");
  });

  document.querySelectorAll("[data-sair]").forEach((botao) =>
    botao.addEventListener("click", async () => {
      await sb.auth.signOut();
      state.produtos = [];
      mostrar("login");
    })
  );

  sb.auth.onAuthStateChange((evento) => {
    if (evento === "PASSWORD_RECOVERY") {
      emRecuperacao = true;
      mostrar("login");
      $("formLogin").hidden = true;
      $("formNovaSenha").hidden = false;
      $("novaSenha").focus();
    }
  });

  /* Lista de produtos */
  const ICONES = {
    subir: '<svg viewBox="0 0 24 24"><path d="m6 15 6-6 6 6"/></svg>',
    descer: '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
    visivel: '<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    oculto: '<svg viewBox="0 0 24 24"><path d="M3 3l18 18"/><path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1M6.6 6.6A17.4 17.4 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>',
    editar: '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  };

  function resumoPreco(p) {
    if (Array.isArray(p.variants) && p.variants.length) {
      return `A partir de ${formatBRL(Math.min(...p.variants.map((v) => Number(v.price))))}`;
    }
    if (p.price_on_request || p.price == null) return "Sob consulta";
    return `${formatBRL(p.price)}${p.price_unit ? ` / ${esc(p.price_unit)}` : ""}`;
  }

  async function carregar() {
    $("lista").innerHTML = '<li class="vazio">Carregando produtos…</li>';
    const { data, error } = await sb.from("produtos").select("*").order("position").order("name");
    if (error) {
      $("lista").innerHTML = `<li class="vazio">Não foi possível carregar: ${esc(traduzirErro(error))}</li>`;
      return;
    }
    state.produtos = data || [];
    renderLista();
  }

  function filtrados() {
    const termo = $("busca").value.trim().toLowerCase();
    const cat = $("filtroCategoria").value;
    return state.produtos.filter(
      (p) => (!cat || p.category === cat) && (!termo || p.name.toLowerCase().includes(termo))
    );
  }

  function renderLista() {
    const lista = filtrados();
    const filtrando = lista.length !== state.produtos.length;
    const visiveis = state.produtos.filter((p) => p.active).length;
    $("resumo").textContent = `${state.produtos.length} produtos · ${visiveis} no site`;

    if (!lista.length) {
      $("lista").innerHTML = '<li class="vazio">Nenhum produto encontrado.</li>';
      return;
    }

    $("lista").innerHTML = lista
      .map((p, i) => {
        const imagem = /^(https:\/\/|assets\/)/.test(p.image || "") ? p.image : "assets/images/logo-cropped.jpeg";
        return `
        <li class="item${p.active ? "" : " item--oculto"}" data-id="${esc(p.id)}">
          <img class="item-foto" src="${esc(imagem)}" alt="" loading="lazy" />
          <div class="item-info">
            <span class="item-nome">${esc(p.name)}</span>
            <span class="item-meta">${esc(nomeCategoria(p.category))} · ${resumoPreco(p)}</span>
            <span class="item-status">${p.active ? "No site" : "Oculto"}</span>
          </div>
          <div class="item-acoes">
            <button type="button" class="icone" data-acao="subir" aria-label="Subir ${esc(p.name)}" ${filtrando || i === 0 ? "disabled" : ""}>${ICONES.subir}</button>
            <button type="button" class="icone" data-acao="descer" aria-label="Descer ${esc(p.name)}" ${filtrando || i === lista.length - 1 ? "disabled" : ""}>${ICONES.descer}</button>
            <button type="button" class="icone" data-acao="visibilidade" aria-label="${p.active ? "Esconder" : "Mostrar"} ${esc(p.name)} no site">${p.active ? ICONES.visivel : ICONES.oculto}</button>
            <button type="button" class="icone icone--editar" data-acao="editar" aria-label="Editar ${esc(p.name)}">${ICONES.editar}</button>
          </div>
        </li>`;
      })
      .join("");
  }

  $("busca").addEventListener("input", renderLista);
  $("filtroCategoria").addEventListener("change", renderLista);

  $("lista").addEventListener("click", async (e) => {
    const botao = e.target.closest("[data-acao]");
    if (!botao) return;
    const id = botao.closest(".item").dataset.id;
    const produto = state.produtos.find((p) => p.id === id);
    if (!produto) return;

    if (botao.dataset.acao === "editar") abrirEditor(produto);
    if (botao.dataset.acao === "visibilidade") await alternarVisibilidade(produto);
    if (botao.dataset.acao === "subir") await mover(produto, -1);
    if (botao.dataset.acao === "descer") await mover(produto, 1);
  });

  async function alternarVisibilidade(produto) {
    const { error } = await sb.from("produtos").update({ active: !produto.active }).eq("id", produto.id);
    if (error) return aviso(traduzirErro(error), true);
    produto.active = !produto.active;
    renderLista();
    aviso(produto.active ? "Produto visível no site." : "Produto escondido do site.");
  }

  async function mover(produto, direcao) {
    const i = state.produtos.indexOf(produto);
    const vizinho = state.produtos[i + direcao];
    if (!vizinho) return;
    let a = vizinho.position;
    let b = produto.position;
    if (a === b) a = b + direcao;
    const r1 = await sb.from("produtos").update({ position: a }).eq("id", produto.id);
    const r2 = await sb.from("produtos").update({ position: b }).eq("id", vizinho.id);
    if (r1.error || r2.error) return aviso(traduzirErro(r1.error || r2.error), true);
    produto.position = a;
    vizinho.position = b;
    state.produtos.sort((x, y) => x.position - y.position || x.name.localeCompare(y.name));
    renderLista();
  }

  /* Editor */
  const tipoPreco = () => document.querySelector('input[name="tipoPreco"]:checked').value;

  function mostrarTipoPreco() {
    const tipo = tipoPreco();
    document.querySelectorAll("[data-preco]").forEach((el) => (el.hidden = el.dataset.preco !== tipo));
    if (tipo === "opcoes" && !$("opcoes").children.length) adicionarLinha("opcoes");
  }

  document.querySelectorAll('input[name="tipoPreco"]').forEach((r) => r.addEventListener("change", mostrarTipoPreco));

  function adicionarLinha(lista, a = "", b = "", id = "") {
    const opcao = lista === "opcoes";
    const li = document.createElement("li");
    li.className = "linha";
    if (id) li.dataset.id = id;
    li.innerHTML = `
      <input type="text" maxlength="60" placeholder="${opcao ? "Ex.: Encaixe H4" : "Ex.: Garantia"}" aria-label="${opcao ? "Nome da opção" : "Especificação"}" />
      <input type="text" ${opcao ? 'inputmode="decimal" placeholder="0,00" aria-label="Preço da opção"' : 'placeholder="Ex.: 1 ano" aria-label="Valor"'} maxlength="60" />
      <button type="button" class="icone" aria-label="Remover linha"><svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></button>`;
    const [campoA, campoB] = li.querySelectorAll("input");
    campoA.value = a;
    campoB.value = b;
    li.querySelector("button").addEventListener("click", () => li.remove());
    $(lista).appendChild(li);
    return campoA;
  }

  $("addOpcao").addEventListener("click", () => adicionarLinha("opcoes").focus());
  $("addSpec").addEventListener("click", () => adicionarLinha("specs").focus());

  function definirPrevia(url) {
    $("fotoPrevia").hidden = !url;
    $("fotoVazia").hidden = Boolean(url);
    if (url) $("fotoPrevia").src = url;
    $("fotoBtnTexto").textContent = url ? "Trocar foto" : "Escolher foto";
  }

  function abrirEditor(produto) {
    state.editando = produto || null;
    state.novaFoto = null;
    if (state.novaFotoUrl) URL.revokeObjectURL(state.novaFotoUrl);
    state.novaFotoUrl = null;

    const p = produto || {};
    $("folhaTitulo").textContent = produto ? "Editar produto" : "Novo produto";
    $("fNome").value = p.name || "";
    $("fCategoria").value = p.category || CATEGORIAS[0].key;
    $("fCurta").value = p.short_desc || "";
    $("fDescricao").value = p.description || "";
    $("fPreco").value = precoParaCampo(p.price);
    $("fRotulo").value = p.price_label || "";
    $("fUnidade").value = p.price_unit || "";
    $("fNota").value = p.price_note || "";
    $("fDestaques").value = (p.highlights || []).join(", ");
    $("fPotencia").value = p.power || "";
    $("fSelo").value = p.badge?.text || "";
    const cor = document.querySelector(`input[name="corSelo"][value="${p.badge?.tone || "red"}"]`);
    if (cor) cor.checked = true;
    $("fAtivo").checked = produto ? p.active : true;

    $("opcoes").innerHTML = "";
    $("specs").innerHTML = "";
    (p.variants || []).forEach((v) => adicionarLinha("opcoes", v.label, precoParaCampo(v.price), v.id));
    (p.specs || []).forEach((s) => adicionarLinha("specs", s.label, s.value));

    const tipo = Array.isArray(p.variants) && p.variants.length ? "opcoes" : p.price_on_request ? "consulta" : "unico";
    document.querySelector(`input[name="tipoPreco"][value="${tipo}"]`).checked = true;
    mostrarTipoPreco();

    definirPrevia(p.image && /^(https:\/\/|assets\/)/.test(p.image) ? p.image : null);
    $("fotoInput").value = "";
    $("formErro").textContent = "";
    $("excluirBtn").hidden = !produto;
    $("folha").hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(() => $("fNome").focus({ preventScroll: true }), 300);
  }

  function fecharEditor() {
    $("folha").hidden = true;
    document.body.style.overflow = "";
    state.editando = null;
  }

  $("novoBtn").addEventListener("click", () => abrirEditor(null));
  $("cancelarBtn").addEventListener("click", fecharEditor);
  $("folha").addEventListener("click", (e) => {
    if (e.target === $("folha")) fecharEditor();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!$("dialogo").hidden) $("dialogoNao").click();
    else if (!$("folha").hidden) fecharEditor();
  });

  /* Foto: reduz no próprio aparelho antes de enviar */
  function reduzirImagem(arquivo, maximo = 1200) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(arquivo);
      const img = new Image();
      img.onload = () => {
        const escala = Math.min(1, maximo / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.type === "image/webp") return resolve(blob);
            canvas.toBlob((jpg) => (jpg ? resolve(jpg) : reject(new Error("Não foi possível ler a foto."))), "image/jpeg", 0.86);
          },
          "image/webp",
          0.86
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Formato de foto não suportado. Use JPG ou PNG."));
      };
      img.src = url;
    });
  }

  $("fotoInput").addEventListener("change", async () => {
    const arquivo = $("fotoInput").files[0];
    if (!arquivo) return;
    try {
      state.novaFoto = await reduzirImagem(arquivo);
      if (state.novaFotoUrl) URL.revokeObjectURL(state.novaFotoUrl);
      state.novaFotoUrl = URL.createObjectURL(state.novaFoto);
      definirPrevia(state.novaFotoUrl);
    } catch (erro) {
      aviso(erro.message, true);
    }
  });

  const caminhoNoBucket = (url) => {
    const marca = `/storage/v1/object/public/${BUCKET}/`;
    const i = (url || "").indexOf(marca);
    return i === -1 ? null : decodeURIComponent(url.slice(i + marca.length));
  };

  async function enviarFoto(id) {
    const extensao = state.novaFoto.type === "image/webp" ? "webp" : "jpg";
    const caminho = `${id}-${Date.now()}.${extensao}`;
    const { error } = await sb.storage.from(BUCKET).upload(caminho, state.novaFoto, {
      contentType: state.novaFoto.type,
      cacheControl: "31536000",
    });
    if (error) throw error;
    return sb.storage.from(BUCKET).getPublicUrl(caminho).data.publicUrl;
  }

  async function removerFoto(url) {
    const caminho = caminhoNoBucket(url);
    if (caminho) await sb.storage.from(BUCKET).remove([caminho]);
  }

  /* Validação e montagem do registro */
  function coletar() {
    const nome = $("fNome").value.trim();
    if (!nome) throw new Error("Dê um nome ao produto.");

    const registro = {
      name: nome,
      category: $("fCategoria").value,
      short_desc: $("fCurta").value.trim() || null,
      description: $("fDescricao").value.trim() || null,
      price_note: $("fNota").value.trim() || null,
      highlights: $("fDestaques").value.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 3),
      power: Number($("fPotencia").value) || null,
      badge: $("fSelo").value.trim()
        ? { text: $("fSelo").value.trim(), tone: document.querySelector('input[name="corSelo"]:checked').value }
        : null,
      active: $("fAtivo").checked,
      specs: [...$("specs").children]
        .map((li) => {
          const [a, b] = li.querySelectorAll("input");
          return { label: a.value.trim(), value: b.value.trim() };
        })
        .filter((s) => s.label && s.value),
      variants: null,
      price: null,
      price_on_request: false,
      price_label: null,
      price_unit: null,
    };

    const tipo = tipoPreco();
    if (tipo === "unico") {
      const preco = lerPreco($("fPreco").value);
      if (preco == null || Number.isNaN(preco)) throw new Error("Informe um preço válido, por exemplo 130,00.");
      registro.price = preco;
      registro.price_label = $("fRotulo").value.trim() || null;
      registro.price_unit = $("fUnidade").value.trim() || null;
    } else if (tipo === "opcoes") {
      const usados = new Set();
      const opcoes = [...$("opcoes").children].map((li) => {
        const [a, b] = li.querySelectorAll("input");
        return { id: li.dataset.id, label: a.value.trim(), price: lerPreco(b.value) };
      });
      if (!opcoes.length) throw new Error("Adicione pelo menos uma opção de preço.");
      registro.variants = opcoes.map((o) => {
        if (!o.label) throw new Error("Toda opção precisa de um nome.");
        if (o.price == null || Number.isNaN(o.price)) throw new Error(`Informe o preço da opção "${o.label}".`);
        let id = o.id || slug(o.label);
        while (usados.has(id)) id += "-2";
        usados.add(id);
        return { id, label: o.label, price: o.price };
      });
    } else {
      registro.price_on_request = true;
    }
    return registro;
  }

  function novoId(nome) {
    const base = slug(nome);
    let id = base;
    let n = 2;
    while (state.produtos.some((p) => p.id === id)) id = `${base}-${n++}`;
    return id;
  }

  async function salvar(e) {
    e.preventDefault();
    $("formErro").textContent = "";
    let registro;
    try {
      registro = coletar();
    } catch (erro) {
      $("formErro").textContent = erro.message;
      return;
    }

    const botoes = [$("salvarBtn"), $("salvarTopoBtn")];
    botoes.forEach((b) => (b.disabled = true));
    $("salvarBtn").textContent = "Salvando…";

    const editando = state.editando;
    const id = editando ? editando.id : novoId(registro.name);
    const fotoAntiga = editando?.image;

    try {
      if (state.novaFoto) registro.image = await enviarFoto(id);

      let erro;
      if (editando) {
        ({ error: erro } = await sb.from("produtos").update(registro).eq("id", id));
      } else {
        const ultima = Math.max(0, ...state.produtos.map((p) => p.position || 0));
        ({ error: erro } = await sb.from("produtos").insert({ ...registro, id, position: ultima + 10 }));
      }
      if (erro) throw erro;

      if (state.novaFoto && fotoAntiga && fotoAntiga !== registro.image) await removerFoto(fotoAntiga);

      fecharEditor();
      aviso(editando ? "Produto atualizado." : "Produto adicionado ao site.");
      await carregar();
    } catch (erro) {
      if (registro.image && registro.image !== fotoAntiga) await removerFoto(registro.image);
      $("formErro").textContent = traduzirErro(erro);
    } finally {
      botoes.forEach((b) => (b.disabled = false));
      $("salvarBtn").textContent = "Salvar produto";
    }
  }

  $("formProduto").addEventListener("submit", salvar);

  $("excluirBtn").addEventListener("click", async () => {
    const produto = state.editando;
    if (!produto) return;
    const ok = await confirmar(
      "Excluir produto?",
      `"${produto.name}" vai sair do site de vez. Se quiser só esconder, desligue "Mostrar no site".`
    );
    if (!ok) return;
    const { error } = await sb.from("produtos").delete().eq("id", produto.id);
    if (error) return aviso(traduzirErro(error), true);
    await removerFoto(produto.image);
    fecharEditor();
    aviso("Produto excluído.");
    await carregar();
  });

  /* Início */
  const opcoesCategoria = CATEGORIAS.map((c) => `<option value="${c.key}">${esc(c.label)}</option>`).join("");
  $("fCategoria").innerHTML = opcoesCategoria;
  $("filtroCategoria").innerHTML = `<option value="">Todas</option>${opcoesCategoria}`;

  (async () => {
    const { data } = await sb.auth.getSession();
    if (emRecuperacao && !data.session) {
      emRecuperacao = false;
      history.replaceState(null, "", location.pathname);
      mostrar("login");
      $("loginErro").textContent = "O link de recuperação expirou. Peça um novo em \"Esqueci minha senha\".";
      return;
    }
    if (emRecuperacao) return;
    if (data.session) await entrar(data.session.user);
    else mostrar("login");
  })();
})();
