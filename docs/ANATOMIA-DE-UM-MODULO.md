# Anatomia de um módulo

Contrato técnico de um módulo de jogos. Quem cria módulo novo — pessoa ou agente — segue isto.

## Estrutura de pastas

```
nome-do-modulo/
├── index.html     # o módulo inteiro: HTML + CSS + JS, autocontido
├── audio/         # um .mp3 por chave do VOICE, gerado
└── README.md      # o que o módulo cobre
```

Nada de build, bundler ou dependência. O `index.html` abre sozinho num navegador.

## As três estruturas do JavaScript

### `VOICE` — tudo que é falado
```js
const VOICE = {
  q_cores: "Qual é a cor do céu?",
  c_azul: "azul",
  exp_azul: "o céu é azul por causa da luz do sol",
};
```
Cada chave vira `audio/<chave>.mp3`. É o dicionário que o `ferramentas/gerar-audios.py` lê.

Chaves de infraestrutura que todo módulo tem: `greet`, `test`, `win`, `choose`, `ok1`…`ok6` (elogios), `no1`…`no3` (incentivos).

Módulo bilíngue (inglês) tem um segundo dicionário, `VOICE_EN`, gerado com voz en-US.

### `GAMES` — os cards do menu do módulo
```js
const GAMES = [
  {id:'cores', ico:'🎨', nome:'Cores', sub:'Qual é a cor?', cls:'c1'},
];
```
`cls` vai de `c1` a `c8` (cores definidas no CSS do próprio módulo).

### `BUILDERS` — quem gera as rodadas
```js
const BUILDERS = {
  cores(){
    const rounds = [];
    for (let i = 0; i < 8; i++) {
      rounds.push({
        q: 'Qual é a cor do <b>céu</b>?',
        audio: ['q_cores'],
        stage: '<span style="font-size:60px">☁️</span>',
        options: [
          {label:'Azul',     aud:'c_azul',    correct:true, expAud:'exp_azul'},
          {label:'Vermelho', aud:'c_vermelho'},
          {label:'Verde',    aud:'c_verde'},
        ],
      });
    }
    return shuffle(rounds);
  },
};
```

Uma função por `id` de `GAMES`. Devolve um array de rodadas.

## Campos de uma rodada

| Campo | Obrigatório | O quê |
|---|---|---|
| `q` | sim | Enunciado (aceita HTML) |
| `audio` | sim | Chaves narradas do enunciado |
| `options` | sim* | As alternativas |
| `stage` | não | HTML do "palco" acima das opções |
| `expAud` | não | Explicação falada após acertar |
| `colorOpts` | não | Renderiza as opções como cores |

\* Alguns jogos usam formato próprio (`mode:'seq'`, `mode:'build'`). O QA ignora o que não conhece.

Cada opção: `{label, aud, correct?, expAud?}`. O `aud` pode ser **uma chave** (`'c_azul'`) ou **uma lista** (`['n2','n5','n9']`), quando a opção é falada como sequência.

## As regras que o QA cobra

`node ferramentas/qa-modulo.js <pasta>` sorteia ~400 partidas de cada jogo e reprova se:

1. Alguma rodada não tem **exatamente uma** resposta certa
2. Duas opções repetem `label` ou `aud`
3. Alguma chave de áudio não existe no `VOICE`, ou não virou `.mp3`
4. O `label` não tem relação com o texto falado
5. O enunciado **contém a resposta certa**
6. A resposta certa é **sistematicamente a mais longa** (acima de 45% — o acaso é 33%)
7. Os jogos têm números diferentes de rodadas

A regra 6 é a mais fácil de violar sem perceber: se a alternativa certa é sempre a mais detalhada, a criança aprende a chutar na maior e o jogo deixa de ensinar. **Escreva as três opções com comprimento parecido.**

A regra 4 tem exceção para alfabetização: o card mostra `r` e a narração fala `"erre"` — rótulos de até 3 caracteres não são comparados.

## Fluxo completo

```bash
# 1. criar nome-do-modulo/index.html (copiando a estrutura de um existente)

# 2. gerar os áudios do módulo
.venv/bin/python ferramentas/gerar-audios.py nome-do-modulo

# 3. QA do conteúdo — precisa passar
node ferramentas/qa-modulo.js nome-do-modulo

# 4. registrar no menu: uma linha em MODULOS e uma em VOICE (index.html da raiz)

# 5. áudio do menu + QA do menu
.venv/bin/python ferramentas/gerar-audios.py
node ferramentas/qa-menu.js

# 6. publicar
git add -A && git commit -m "Módulo N: matéria" && git push origin main
```

## Dívida conhecida

**O motor está duplicado em todos os módulos.** As funções `shuffle`, `renderRound`, `answer`, `playKeys`, `burst`, `shell` são idênticas byte a byte. Corrigir um bug no motor hoje exige editar todos os arquivos.

Foi uma decisão consciente de adiar: extrair um `motor.js` compartilhado mexeria nos módulos que já funcionam e estão em uso. Ao criar um módulo novo, **copie o motor como está** — não tente melhorá-lo isoladamente, senão a divergência piora.

**O QA tem ruído nos módulos legados.** Ele foi escrito a partir do `ciencias2` e generalizado depois; nos outros módulos, de formatos mais heterogêneos, ainda acusa falsos positivos. Para módulos novos, que seguem este contrato, ele é confiável.
