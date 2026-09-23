# 🎲 Matemática Divertida 2 — Módulo 6

App de jogos educativos para estudar para a **avaliação de Matemática do 1º ano** (livro Bernoulli Sistema de Ensino, capítulos 2, 3, 4 e 5).

Mesmo formato dos outros módulos: **um único `index.html`**, narração com **voz neural em MP3** (pasta `audio/`), estrelas, confete e botões grandes — pensado para quem ainda não lê.

## 🎮 Os 8 mini-games

| Jogo | O que treina (conteúdo da prova) |
|------|----------------------------------|
| 🎲 **Juntar** | Ideia de **juntar** da adição: Some 10 (marcou ponto?), gols do campeonato, adição com 3 parcelas |
| ➕ **Acrescentar** | Ideia de **acrescentar** da adição: palitos na mesa, crianças que chegaram |
| ➖ **Tirar** | Ideia de **tirar** da subtração: dança das cadeiras, prova tirando palitos (10 − dado) |
| 🧩 **Completar** | Ideia de **completar** da subtração: quantos faltam para a equipe / para os pompons |
| 📦 **Agrupar e Contar** | Agrupar de 2 em 2 e de 5 em 5; coleção; estimar; agrupar pela forma |
| 🧮 **Ábaco D e U** | Dezena e unidade, ler o ábaco, **somar no ábaco** (13 + 26), material dourado |
| 📊 **Tabelas e Gráficos** | Pesquisa estatística, linha e coluna, ler tabela e gráfico de malha, empate e **escala de 2 em 2** |
| 🎯 **Certeza ou Não?** | Probabilidade: **com certeza**, **é possível**, **é impossível** |

Depois de cada acerto de conta, o app fala a **sentença numérica** como no livro:
*"4 palitos mais 6 palitos é igual a 10 palitos"*.

No gráfico, o número **não** aparece escrito em cima da coluna: a criança conta os quadradinhos da malha, como na prova.

## 🎙️ Regerar os áudios (opcional)

```bash
cd matematica2
../.venv/bin/python gerar-audios.py                          # voz Francisca (padrão)
VOZ=pt-BR-AntonioNeural ../.venv/bin/python gerar-audios.py  # voz masculina
```

## 🌐 Online

Depois do push, o jogo fica no ar em:
`https://gavjr1911.github.io/jogos-estudos-1ano/matematica2/`

---
Feito com 💜 para estudar pra prova.
