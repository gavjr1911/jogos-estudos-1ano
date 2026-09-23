# 🌟 Estudos Divertidos do Vitor

Jogos educativos do **1º ano** (conteúdo do Bernoulli Sistema de Ensino), feitos para o Vitor (6 anos) estudar brincando.

**👉 [Abrir o app](https://gavjr1911.github.io/matematica-vitor/)**

Tudo começa por uma **página de menu única**. A partir dela se navega para cada matéria — não é mais preciso guardar uma URL por módulo.

## 📚 Módulos

| # | Módulo | Pasta | Conteúdo |
|---|--------|-------|----------|
| 1 | 🔢 Matemática | `matematica/` | Números, sólidos e figuras |
| 2 | 📚 Português | `portugues2/` | Letras, sílabas e palavras |
| 3 | 🔬 Ciências | `ciencias/` | Seres vivos e natureza |
| 4 | 🦉 English Fun! | `ingles2/` | Cores, animais e números |
| 5 | 🏠 Geo e História | `geografia/` | Casa, escola e tempo |
| 6 | 🎲 Matemática 2 | `matematica2/` | Somar, tirar e comparar |
| 7 | ✏️ Português 2 | `portugues-setembro/` | Sílabas, rimas e frases |
| 8 | 🌍 Ciências 2 | `ciencias2/` | Corpo, materiais e ambiente |

## ➕ Como adicionar um módulo novo

1. Crie a pasta com o `index.html` do jogo (copie a estrutura de um módulo existente).
2. Gere os áudios: `.venv/bin/python gerar-audios.py` dentro da pasta nova.
3. Abra o `index.html` da **raiz** e acrescente **uma linha** no array `MODULOS`:

```js
{pasta:'nome-da-pasta', ico:'🎯', nome:'Nome Curto', sub:'Descrição pequena', tag:'Módulo 9', cls:'c1'},
```

Só isso — o menu se monta sozinho a partir desse array. As cores vão de `c1` a `c8`.

## 🧭 Navegação

- **Menu → módulo**: toque num card.
- **Módulo → menu**: botão roxo **⬅️** na barra de cima.
- **🏠** volta para o início *daquele módulo* (escolher outro jogo da mesma matéria).

## 👶 Pensado para quem ainda não lê

- 🔊 **Narração pré-gravada em MP3** (pasta `audio/` de cada módulo) — a pergunta **e todas as respostas** são faladas. Não depende de voz instalada no aparelho e funciona offline.
- 🗣️ **Cada opção fala** quando tocada, inclusive as erradas — a criança aprende errando.
- ⭐ **Estrelas e pontos**, com confete e som de vitória.
- 🎨 **Botões enormes e coloridos**, fáceis de tocar.

### 🔈 Sobre o áudio
- **Toque em "▶ COMEÇAR" primeiro** — esse toque libera o som (regra dos navegadores).
- **iPhone/iPad**: tire do modo silencioso (chavinha lateral) e suba o volume.
- Para repetir a leitura, toque no botão amarelo **🔊** ao lado da pergunta.

### 🎙️ Regerar os áudios
Os áudios já estão prontos. Foram gerados com vozes neurais (`edge-tts`, grátis, sem chave de API):

```bash
python3 -m venv .venv && .venv/bin/pip install edge-tts   # 1ª vez
cd matematica && ../.venv/bin/python gerar-audios.py       # dentro do módulo
VOZ=pt-BR-AntonioNeural ../.venv/bin/python gerar-audios.py  # voz masculina
RATE=-15% ../.venv/bin/python gerar-audios.py                # mais devagar
```

Vozes pt-BR: `pt-BR-FranciscaNeural` (feminina, padrão), `pt-BR-AntonioNeural` (masculina), `pt-BR-ThalitaMultilingualNeural`.

## ✅ Qualidade

O módulo `ciencias2` tem um verificador automático:

```bash
node ciencias2/_qa.js
```

Ele sorteia milhares de rodadas e confere que cada uma tem exatamente uma resposta certa, que nenhuma opção se repete, que todo áudio referenciado existe e que o enunciado não entrega a resposta.

## 🚀 Publicação

GitHub Pages, branch `main`, pasta raiz. Publica sozinho a cada push.

---
Feito com 💜 para o Vitor.
