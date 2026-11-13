# Catálogo de interações

Os módulos nasceram como "pergunta + 3 alternativas". Funciona para revisar, mas
uma criança de 6 anos que ainda não lê fica ouvindo frases e escolhendo cartões —
é prova, não brincadeira. Este catálogo reúne mecânicas que treinam o mesmo
conteúdo com **as mãos**: arrastar, ligar, virar, estourar, procurar, desenhar.

O protótipo de tudo está em `laboratorio/` (conteúdo de Ciências Novembro).

## Princípios (valem para qualquer mecânica)

1. **Não depende de leitura.** Tudo que importa é imagem + voz. Texto na tela é para o adulto.
2. **Toda coisa tocável fala.** Tocar num adesivo, carta ou grupo diz o nome dele.
3. **Arrastar sempre tem alternativa de toque**: tocar no objeto e depois no destino.
4. **Erro é gentil e informativo**: o objeto treme, volta ao lugar e a voz diz o que ele é.
5. **Ilustração no lugar de emoji.** Emoji é pequeno, varia por aparelho e não mostra
   "mercado municipal" nem "cartilha antiga". Adesivos gerados mostram.
6. **Alvo grande.** Nada tocável com menos de ~70 px no celular.
7. **Fiel ao livro.** A mecânica muda; o conteúdo continua sendo só o das fotos.

## Mecânicas prontas (`motor/interacoes.js`)

| Modo | O que a criança faz | Serve para | Exemplo do livro |
|---|---|---|---|
| `classificar` | Arrasta adesivos para 2–4 grupos | Categorias, "é ou não é", antes × hoje | Público × privado; materiais de antigamente × hoje |
| `ligar` | Puxa uma linha entre pares | Relações 1-para-1 | Profissional ↔ o que faz; animal ↔ casa; número ↔ quantidade |
| `memoria` | Vira cartas e acha pares | Fixar vocabulário visual | Meios de transporte; palavra ↔ figura (par `a`/`b`) |
| `baloes` | Estoura só os balões que seguem a regra | Discriminar rápido, com ação | "Só o que não polui"; "só as palavras com R" |
| `cena` | Procura e toca coisas numa ilustração | Observar, localizar | Funções da rua; seres vivos num jardim |
| `tracar` | Escreve a letra com o dedo | Alfabetização, números | E de Escola; B de Bicicleta |
| `ordenar` | Arrasta quadros para as vagas 1, 2, 3… | Sequência, antes/depois, ciclo, crescente | Rua de terra → pedra → asfalto; vida do pintor |
| `cofre` | Junta peças (moedas, barras de 10, cubinhos) até o valor pedido; tocar numa peça do cofre devolve ela | Dinheiro, composição de números, somar | Pagar R$ 7 com cédulas e moedas; montar 34 com dezenas e unidades |
| `mascote` | Dá ao personagem o que ele pede (arrasta até ele) | Escuta e compreensão; vocabulário (inglês!) | "Give me the brush!"; "quero algo que começa com B" |
| `quebra` | Monta uma ilustração cortada em 4 ou 9 pedaços | Observar detalhes de uma imagem | Noite Estrelada de Van Gogh |

E, sem configurar nada, o **álbum de figurinhas**: cada jogo terminado dá a figurinha
dele (a ilustração do card do menu, ou `GAMES[].figurinha`). O menu ganha o botão
"📒 Meu álbum". Vozes opcionais: `figurinha` ("Você ganhou uma figurinha nova para o
seu álbum!") e `album` ("Este é o seu álbum..."). O cofre fala o total somado se o
módulo tiver as vozes `n1`, `n2`... (`n7: "sete"`).

Formato de cada rodada (o QA confere tudo isto):

```js
{mode:'classificar', q, audio:[...], expAud,
 grupos:[{id, img, aud}], itens:[{img, aud, grupo}]}          // 2–4 grupos, 3–10 itens

{mode:'ligar', q, audio, expAud, pares:[{a:{img,aud}, b:{img,aud}}]}   // 2–5 pares

{mode:'memoria', q, audio, expAud, pares:[{img, aud}]}         // 2–6 pares (ou {a,b})

{mode:'baloes', q, audio, expAud, meta:5, itens:[{img, aud, certo}]}   // certo e errado

{mode:'cena', q, audio, expAud, fundo:'cenario',
 objetos:[{img, aud, certo, x, y, w}]}                         // x,y,w em % do cenário 3:2

{mode:'tracar', q, audio, expAud, letra:'E', img?}

{mode:'ordenar', q, audio, expAud, itens:[{img, aud}]}          // 2–6, JÁ na ordem certa

{mode:'cofre', q, audio, expAud, alvo:7, prefixo:'R$', alvoImg?,
 pecas:[{img, aud, valor}]}                                     // 1–6 peças, reutilizáveis

{mode:'mascote', q, audio, expAud, mascote:'mascote',
 itens:[{img, aud, certo}]}                                     // 3–8, termina ao dar todos os certos

{mode:'quebra', q, audio, expAud, img:'chave', grade:2|3}
// img precisa ser ilustração cheia (IMAGENS ou CENARIOS) — adesivo de fundo
// transparente vira pedaços em branco.
```

## Imagens

Declaradas no `index.html` do módulo, geradas por `node ferramentas/gerar-imagens.mjs <pasta>`:

| Dicionário | Para quê | Modelo | Custo aprox. |
|---|---|---|---|
| `ADESIVOS` | Objeto isolado, **fundo transparente** — tudo que se arrasta, vira ou aparece em cena | gpt-image-1-mini | US$ 0,002 |
| `CENARIOS` | Fundo em paisagem 3:2, com espaço livre na frente | gpt-image-2 | US$ 0,005 |
| `IMAGENS` | Ilustração quadrada com fundo branco (formato antigo) | gpt-image-2 | US$ 0,006 |

Um módulo inteiro com ~40 adesivos sai por volta de **US$ 0,10**. O gpt-image-2 não
aceita fundo transparente — por isso os adesivos usam o gpt-image-1-mini.

Descreva em inglês, só o objeto, **sem palavras na imagem** ("no words or letters").
Cuidado com figuras que entregam a resposta: num jogo de ligar profissional ↔ ferramenta,
o profissional não pode estar segurando a ferramenta.

## Animação

O motor anima com CSS e `requestAnimationFrame`, sem biblioteca e sem custo:
entrada com pulo, flutuar parado, voar até o grupo, virar carta em 3D, balão subindo
com balanço, estouro com faíscas, tremida no erro, brilho no acerto.
Respeita `prefers-reduced-motion`.

## Próximas mecânicas (estudadas, ainda não implementadas)

Ordenadas pelo que mais acrescenta para o Vitor:

Já implementadas desde a primeira versão deste estudo: álbum de figurinhas,
ordenar arrastando, alimentar o mascote (`mascote`), cofre (somar até o valor) e
quebra-cabeça.

3. **Contar tocando**: objetos caem na tela; cada toque conta em voz alta; depois escolhe
   o número. Para matemática do 1º ano é mais concreto que ver "7" num cartão.
5. **Montar a palavra com sílabas arrastáveis** (evolução do `build` de Português).
6. **Balança / comparar**: arrastar objetos para os pratos — mais, menos, igual.
7. **História com escolhas**: 4–6 quadros ilustrados narrados; em pontos-chave a
   criança escolhe o que o personagem faz. Bom para cidadania e convivência.
8. **Falar a palavra** (Web Speech API, pt-BR): a criança fala e o app reconhece.
   Atrativo, mas o reconhecimento no Safari/iPad é instável e erra com voz infantil —
   só como bônus, nunca como único caminho.
9. **Animação gerada por vídeo** (Sora/Veo): impressiona, mas custa dólares por
   segundo e pesa megabytes. Para ilustração de jogo, a animação CSS dos adesivos
   entrega quase todo o efeito por zero.

## Como montar um módulo variado

- **No máximo 2 dos jogos** podem ser pergunta + alternativa (`options`).
- Use pelo menos **5 mecânicas diferentes** por módulo.
- Termine cada jogo com uma explicação curta (`expAud`) que **ensina**, não só elogia.
- Comece fácil e suba: rodada 1 com menos itens, a última com mais ou com distratores parecidos.
- Escolha a mecânica pelo tipo de conteúdo (tabela acima), não por gosto.
- Conceitos abstratos ("o que é patrimônio cultural?") ainda cabem em pergunta +
  alternativa — mas com figura em cada opção.
