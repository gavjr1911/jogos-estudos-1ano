# 🌍 Ciências 2 — Módulo 8

App de jogos educativos para estudar para a **avaliação de Ciências do 1º ano** (Bernoulli Sistema de Ensino, **Capítulos 4, 5 e 6**).

Mesmo formato dos outros módulos: **um único `index.html`**, narração com **voz neural em MP3** (pasta `audio/`), estrelas, confete e botões grandes — pensado para quem ainda não lê fluentemente.

## 🎮 Os 9 mini-games

| Jogo | O que treina (conteúdo da prova) |
|------|----------------------------------|
| ⚡ **Energia do Corpo** | A energia vem dos **alimentos**, fica guardada nas **células** e faz o coração bater, o pulmão respirar, os músculos se mexerem e o cérebro pensar |
| 🏃 **Corpo em Movimento** | O que acontece ao se exercitar (coração acelera, respiração fica rápida, músculos se movem) — e que isso é **normal e saudável**; mexer o corpo × ficar parado; movimento também ajuda a mente |
| 😴 **Hora de Dormir** | O sono recupera a energia, ajuda o corpo a **crescer** e a construir a **memória**; montar a **rotina da noite** na ordem (jantar cedo → escovar os dentes → história → dormir); o que atrapalha o sono |
| 💚 **Corpo e Mente** | A mente como guia; o lugar muda o que sentimos (barulho, luz, pessoas); atitudes de bem-estar: falar das emoções, se divertir, aprender coisas novas |
| 🌳 **Vivo ou Não Vivo?** | Componentes **vivos** (nascem, crescem, se reproduzem, morrem — incluindo algas, fungos e bactérias) × **naturais não vivos** (luz do sol, **ar**, água, solo) × **construídos pelas pessoas**; o que é **ambiente** |
| 🔍 **Cada Um é Diferente** | Diferenças entre os seres vivos: tamanho (baleia-azul × o sapinho brasileiro), tempo de vida, hábitos alimentares (vaca, jacaré, sagui, borboleta, pica-pau), **adaptações** (urso-polar, bicho-pau, camuflagem) e os tipos de ambiente (quente/frio, seco/úmido) |
| 🪵 **Natural ou Artificial?** | Materiais **naturais** (madeira, areia, algodão, ferro, rocha) × **artificiais** (papel, vidro, tecido, aço, plástico) e as transformações: madeira→papel, areia→vidro, algodão→tecido, ferro→aço |
| 💧 **Água, Solo e Sol** | Os três elementos que mantêm a vida: onde a água está, **hábitat**, **lençóis freáticos**, o solo e as raízes, o **ar** e o pólen, por que existe **dia e noite**, as estações do ano, as placas solares |
| 🌾 **Recursos Naturais** | O que são recursos naturais, exemplos do livro (água, mel, pesca, plantio), os usos da água no dia a dia e o **uso responsável** da água e do solo |

## ✅ Como as questões foram construídas

- **Nenhuma pergunta entrega a resposta** no próprio enunciado.
- **Distratores plausíveis, nunca bobos de propósito**: nas perguntas sobre o corpo, as opções erradas são funções de **outros órgãos** (o coração *bate*, o pulmão *respira*, o cérebro *pensa*) — a criança precisa mesmo saber qual é qual.
- **Classificações sempre com item sorteado**: "vivo ou não vivo", "natural ou artificial", "mexer o corpo ou ficar parado" e "o que este animal come" sorteiam o item a cada rodada, então nunca é decoreba de posição.
- **Tudo é narrado**: a pergunta, cada opção e a explicação do acerto. O texto que aparece na tela é **exatamente** o texto falado.
- **Depois de acertar as perguntas-conceito, o app explica**: "os seres vivos nascem, crescem, podem ter filhotes e um dia morrem" — ele ensina, não só testa.
- **Nada de pista visual**: nenhuma opção é verde (verde é a cor de "acertou") e a resposta certa nunca é um botão muito mais comprido que os outros — senão dava para acertar de olho, sem entender.
- **Só entra o que o livro afirma**: a classificação "come plantas / come outros animais" ficou restrita à vaca, à ovelha e ao jacaré, que são os casos que o livro classifica assim. Nada de pergunta subjetiva, sem gabarito.
- Um teste automatizado (`_qa.js`) percorre **25.200 rodadas sorteadas** conferindo que cada pergunta tem exatamente uma resposta certa, sem opções repetidas, com todos os áudios existentes, com o rótulo e a legenda batendo com a narração, sem vazamento da resposta, sem viés de comprimento e com os 9 jogos tendo o mesmo número de rodadas (7).

```bash
cd ciencias2 && node _qa.js
```

## 🎙️ Regerar os áudios (opcional)

```bash
cd ciencias2
../.venv/bin/python gerar-audios.py                          # voz Francisca (padrão)
VOZ=pt-BR-AntonioNeural ../.venv/bin/python gerar-audios.py  # voz masculina
RATE=-15% ../.venv/bin/python gerar-audios.py                # mais devagar
```

## 🌐 Online

`https://gavjr1911.github.io/matematica-vitor/ciencias2/`

---
Feito com 💚 para estudar pra prova.
