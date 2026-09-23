# 📚 Português de Setembro — Módulo 7

App de jogos educativos para estudar para a **avaliação de Língua Portuguesa do 1º ano** (Bernoulli Sistema de Ensino, **Capítulo 4** — páginas 125 a 159).

Mesmo formato dos outros módulos: **um único `index.html`**, narração com **voz neural em MP3** (pasta `audio/`), **44 ilustrações em SVG desenhadas à mão** (nenhuma imagem externa), estrelas, confete e botões grandes — pensado para quem ainda não lê fluentemente.

## 🎮 Os 9 mini-games

| Jogo | O que treina (conteúdo da prova) |
|------|----------------------------------|
| 🔤 **Encontro Consonantal** | O conceito (duas consoantes juntas), reconhecer quais palavras têm e qual é o encontro dentro da palavra |
| Ⓡ **Põe o R!** | Formar palavras novas acrescentando **R**: PATO → PRATO, FACA → FRACA, FIO → FRIO, TEM → TREM |
| Ⓛ **Põe o L!** | Formar palavras novas acrescentando **L**: PACA → PLACA, FOCO → FLOCO, CARO → CLARO, PANO → PLANO |
| ✍️ **Complete a Palavra** | Completar com o encontro que falta, olhando o desenho: `[?]AMA` → **GR**AMA, `ZE[?]A` → ZE**BR**A |
| 📝 **Frase Certa** | Par mínimo dentro das frases dos contos: FIO/**FRIO**, PONTA/**PRONTA**, CARO/**CLARO**, FACA/**FRACA** — e a pegadinha ao contrário (**PATA**/PRATA) |
| 👏 **Conta Sílabas** | Separar em sílabas batendo palmas. A palavra aparece **inteira**, sem os pontinhos — a criança é que separa |
| 📕 **Capa do Livro** | O gênero capa: localizar **título**, **autor(a)**, **ilustrador(a)** e **editora**, e para que a capa serve |
| 🐻 **Os Contos** | Compreensão de **Cachinhos Dourados**, **Os Três Porquinhos** e **O Soldadinho de Chumbo** |
| 🧩 **Ordem da História** | Partes do conto (introdução, desenvolvimento, conclusão), montar a sequência dos acontecimentos e o título embaralhado |

## ✅ Como as questões foram construídas

- **Nenhuma pergunta entrega a resposta.** As sílabas nunca aparecem separadas, o encontro consonantal nunca vem destacado na palavra e o enunciado nunca contém a alternativa certa.
- **Distratores plausíveis.** Nos jogos do R e do L, as opções erradas são a mesma palavra com a letra no lugar errado (FRACA / FARCA / FACRA). Em "Complete a Palavra", as opções são sempre da mesma família (só com R ou só com L).
- **A capa é a única tela em que a resposta está visível** — de propósito: o exercício do livro é justamente *localizar* a informação na capa.
- Um teste automatizado percorreu **2.760 rodadas sorteadas** conferindo que cada pergunta tem exatamente uma resposta certa, sem opções repetidas, com todos os áudios existentes e sem vazamento da resposta.

## 🎙️ Regerar os áudios (opcional)

```bash
cd portugues-setembro
../.venv/bin/python gerar-audios.py                          # voz Francisca (padrão)
VOZ=pt-BR-AntonioNeural ../.venv/bin/python gerar-audios.py  # voz masculina
RATE=-15% ../.venv/bin/python gerar-audios.py                # mais devagar
```

## 🌐 Online

`https://gavjr1911.github.io/jogos-estudos-1ano/portugues-setembro/`

---
Feito com 💜 para estudar pra prova.
