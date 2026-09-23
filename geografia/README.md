# 🏠 Geografia e História Divertida — Módulo 5

App de jogos educativos para estudar para a **atividade avaliativa de Geografia e História do 1º ano** (livro Bernoulli Sistema de Ensino, capítulos 3 e 4).

Mesmo formato dos outros módulos: **um único `index.html`**, narração com **voz neural em MP3** (pasta `audio/`), estrelas, confete e botões grandes — pensado para quem ainda não lê.

## 🎮 Os 8 mini-games

| Jogo | O que treina (conteúdo da prova) |
|------|----------------------------------|
| 🏠 **Tipos de Moradia** | Casa, sobrado, apartamento, oca, casas geminadas, barraco; campo × cidade; do que a moradia protege |
| 🚪 **Cômodos da Casa** | Função de cada cômodo (quarto, banheiro, cozinha, sala, lavanderia, quintal); área de lazer |
| 👨‍👩‍👧‍👦 **Minha Família** | Laços familiares: avós, tios, primos, irmãos, bisavós; família = primeiro grupo social |
| 📜 **História da Família** | Antepassados; fontes históricas (fotografia, carta); música "Paratodos" (Chico Buarque) |
| ✍️ **Nomes e Sobrenomes** | A família de Pedro Henrique Silva — nome e sobrenome em comum |
| 🤝 **Bons Vizinhos** | Regras de convivência: o que ajuda e o que atrapalha |
| 🧹 **Quem Faz o Quê?** | Responsabilidades de adultos × o que a criança pode fazer |
| 🗺️ **Mapa da Rotina** | Localização: esquerda, direita, no meio; lugares da rotina da família |

## 🎙️ Regerar os áudios (opcional)

```bash
cd geografia
../.venv/bin/python gerar-audios.py                          # voz Francisca (padrão)
VOZ=pt-BR-AntonioNeural ../.venv/bin/python gerar-audios.py  # voz masculina
```

## 🌐 Online

Depois do push, o jogo fica no ar em:
`https://gavjr1911.github.io/jogos-estudos-1ano/geografia/`

---
Feito com 💜 para estudar pra prova.
