# 🌟 Estudos Divertidos do Vitor

Jogos educativos do **1º ano** (conteúdo do Bernoulli Sistema de Ensino), feitos para o Vitor (6 anos) estudar brincando.

**👉 [Abrir o app](https://gavjr1911.github.io/jogos-estudos-1ano/)**

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
2. Gere os áudios do jogo: `../.venv/bin/python gerar-audios.py` dentro da pasta nova.
3. Abra o `index.html` da **raiz** e acrescente **uma linha** no array `MODULOS`:

```js
{pasta:'nome-da-pasta', ico:'🎯', nome:'Nome Curto', sub:'Descrição pequena', tag:'Módulo 9', cor:'var(--turquesa)'},
```

4. Acrescente a narração do card no objeto `VOICE` do mesmo arquivo. A chave é
   `m_` + o nome da pasta, com `-` virando `_`:

```js
m_nome_da_pasta: "Nome falado da matéria",
```

5. Gere o áudio do menu e confira tudo:

```bash
.venv/bin/python gerar-audios.py   # na raiz
node _qa-menu.js
```

A `cor` aceita qualquer cor CSS. As prontas: `var(--rosa)`, `--azul`, `--verde`,
`--laranja`, `--roxo`, `--vermelho`, `--turquesa`, `--magenta`.

## 🧭 Navegação

Um símbolo, um significado — importante para quem ainda não lê:

- **🏠** leva sempre ao **menu de matérias** (em qualquer tela do app).
- **🔄** troca de jogo **dentro da mesma matéria**.
- Tocar num card do menu abre a matéria, falando o nome dela em voz alta.

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

Dois verificadores automáticos:

```bash
node _qa-menu.js        # menu ↔ módulos
node ciencias2/_qa.js   # conteúdo do módulo Ciências 2
```

O **`_qa-menu.js`** confere que todo item do menu aponta para uma pasta existente,
que nenhuma pasta ficou de fora, que não há cor repetida, que todo módulo tem o
botão 🏠 de voltar e que toda narração tem seu `.mp3`. **Rode sempre que adicionar
um módulo.**

O **`ciencias2/_qa.js`** sorteia milhares de rodadas e confere que cada uma tem
exatamente uma resposta certa, que nenhuma opção se repete, que todo áudio existe
e que o enunciado não entrega a resposta.

## 🚀 Publicação

GitHub Pages, branch `main`, pasta raiz. Publica sozinho a cada push.

---
Feito com 💜 para o Vitor.
