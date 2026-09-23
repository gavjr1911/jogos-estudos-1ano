# 🌟 Matemática Divertida do Vitor

App de jogos educativos para o Vitor (6 anos) estudar para a prova de **Matemática do 1º ano** (conteúdo do livro Bernoulli Sistema de Ensino).

Feito como **um único arquivo `index.html`** — sem instalação, sem internet depois de aberto. Funciona em celular, tablet e computador.

## 🎮 Os 8 mini-games

| Jogo | O que treina (conteúdo da prova) |
|------|----------------------------------|
| 🔢 **Contando** | Números de 0 a 9 — contar e representar quantidades |
| 🪜 **Sequência** | Número que falta + ordem crescente e decrescente |
| 🥇 **Posição na Fila** | Números ordinais (1º ao 9º) |
| 📦 **Sólidos** | Cubo, esfera, cone, cilindro, pirâmide, paralelepípedo |
| 🔺 **Figuras Planas** | Quadrado, triângulo, círculo, retângulo |
| 🧭 **Onde Está?** | Localização: dentro, fora, em cima, embaixo, entre |
| ⚖️ **Mais ou Menos** | Comparar quantidades: mais, menos, igual |
| 📊 **Gráficos** | Ler gráfico de colunas (maior / menor) |

## 👶 Pensado para quem ainda não lê

- 🔊 **Narração com voz natural** — a pergunta **e todas as respostas** são faladas em voz alta (português), com uma **voz neural natural** (não robótica). O áudio é **pré-gravado em arquivos MP3** (pasta `audio/`), então **funciona em qualquer aparelho, sem depender de voz instalada** no navegador.
- 🗣️ **Cada opção fala** — quando o Vitor toca numa resposta, o app fala o nome dela (ex.: "cubo!"), ajudando a aprender mesmo errando.
- ⭐ **Estrelas e pontos** — recompensa a cada acerto, com confete e som de vitória.
- 🎨 **Visual grande e colorido** — emojis e botões enormes, fáceis de tocar.
- 🔁 **Repetição infinita** — as perguntas são sorteadas, então sempre tem treino novo.

### 🔈 Sobre o áudio
- O áudio fica em **arquivos `.mp3`** na pasta `audio/` (≈ 2 MB no total) — toca em iPhone, Android, Chrome, Safari, Edge e Firefox, **online ou offline**.
- **Toque sempre em "▶ COMEÇAR" primeiro** — esse toque libera o som (regra dos navegadores).
- **iPhone/iPad**: tire do **modo silencioso** (chavinha lateral) e suba o volume.
- Para **repetir** a leitura, toque no botão amarelo **🔊** ao lado da pergunta.
- Tem um botão **🔈 Testar som** na tela inicial para conferir.

### 🎙️ Regerar os áudios (opcional)
Os áudios já estão prontos na pasta `audio/`. Foram gerados com **vozes neurais** (`edge-tts`, grátis, sem chave de API). Para regravar (ex.: trocar a voz):
```bash
python3 -m venv .venv && .venv/bin/pip install edge-tts   # 1ª vez
.venv/bin/python gerar-audios.py                          # voz Francisca (padrão)
VOZ=pt-BR-AntonioNeural .venv/bin/python gerar-audios.py  # voz masculina
RATE=-15% .venv/bin/python gerar-audios.py                # mais devagar
```
O script lê os textos do próprio `index.html` e gera um MP3 por frase. Vozes pt-BR: `pt-BR-FranciscaNeural` (feminina), `pt-BR-AntonioNeural` (masculina), `pt-BR-ThalitaMultilingualNeural` (feminina).

## 🚀 Como publicar no GitHub Pages

1. Crie um repositório no GitHub (ex.: `matematica-vitor`).
2. Envie o arquivo `index.html` para o repositório:
   ```bash
   git init
   git add index.html README.md
   git commit -m "Jogos de matemática do Vitor"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/matematica-vitor.git
   git push -u origin main
   ```
3. No GitHub, vá em **Settings → Pages**.
4. Em **Branch**, escolha `main` e a pasta `/ (root)`. Salve.
5. Em ~1 minuto o jogo estará no ar em:
   `https://SEU_USUARIO.github.io/matematica-vitor/`

Abra esse link no celular ou tablet e deixe o Vitor brincar! 🎉

## 💡 Dicas para usar com a criança

- No **iPhone/iPad**, toque uma vez no botão "COMEÇAR" para liberar o som da narração.
- Se a voz não falar, é só tocar no botão amarelo 🔊 ao lado da pergunta.
- As estrelas ⭐ ficam guardadas no aparelho — ele acumula a cada partida.

---
Feito com 💜 para o Vitor.
