#!/usr/bin/env python3
# ============================================================
#  GERADOR DE ÁUDIOS NEURAIS
#  Usa edge-tts (vozes neurais da Microsoft, grátis, sem chave).
#
#  Lê os dicionários de dentro do index.html do módulo e gera
#  um audio/<chave>.mp3 para cada frase:
#    VOICE     -> voz pt-BR   (perguntas, opções, feedback)
#    VOICE_EN  -> voz en-US   (opcional; só o módulo de inglês usa)
#
#  Uso:
#    python ferramentas/gerar-audios.py              # o menu (raiz)
#    python ferramentas/gerar-audios.py ciencias2    # um módulo
#    python ferramentas/gerar-audios.py --todos      # tudo
#
#  Variáveis:
#    VOZ=pt-BR-AntonioNeural   voz masculina em português
#    VOZ_EN=en-US-GuyNeural    voz masculina em inglês
#    RATE=-15%                 mais devagar
# ============================================================
import os, re, sys, asyncio
import edge_tts

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOZ_PT = os.environ.get("VOZ", os.environ.get("VOZ_PT", "pt-BR-FranciscaNeural"))
VOZ_EN = os.environ.get("VOZ_EN", "en-US-AnaNeural")
RATE = os.environ.get("RATE", "-8%")   # um pouco mais devagar p/ a criança acompanhar
PITCH = os.environ.get("PITCH", "+0Hz")
CONCURRENCY = 8


def ler_dicionario(html: str, nome: str) -> dict:
    """Extrai `const <nome> = { chave: "texto", ... }` do HTML."""
    m = re.search(r"const " + nome + r"\s*=\s*\{(.*?)\n\};", html, re.S)
    if not m:
        return {}
    return dict(re.findall(r'(\w+)\s*:\s*"([^"]*)"', m.group(1)))


async def gerar(sem, out_dir, key, texto, voz):
    async with sem:
        path = os.path.join(out_dir, key + ".mp3")
        try:
            comm = edge_tts.Communicate(texto, voz, rate=RATE, pitch=PITCH)
            await comm.save(path)
            print(f"  ✅ {key:<22} “{texto[:44]}”")
            return True
        except Exception as e:
            print(f"  ❌ {key}: {e}")
            return False


async def gerar_modulo(pasta: str) -> bool:
    base = os.path.join(RAIZ, pasta) if pasta else RAIZ
    html_path = os.path.join(base, "index.html")
    if not os.path.exists(html_path):
        print(f"❌ {html_path} não existe"); return False

    html = open(html_path, encoding="utf-8").read()
    pt = ler_dicionario(html, "VOICE")
    en = ler_dicionario(html, "VOICE_EN")
    if not pt and not en:
        print(f"❌ nenhum dicionário VOICE encontrado em {html_path}"); return False

    out = os.path.join(base, "audio")
    os.makedirs(out, exist_ok=True)

    nome = pasta or "(menu principal)"
    total = len(pt) + len(en)
    print(f"\n🎙️  {nome}: {total} áudios  [pt={len(pt)} en={len(en)}]")

    sem = asyncio.Semaphore(CONCURRENCY)
    tarefas = [gerar(sem, out, k, t, VOZ_PT) for k, t in pt.items()]
    tarefas += [gerar(sem, out, k, t, VOZ_EN) for k, t in en.items()]
    res = await asyncio.gather(*tarefas)

    ok = sum(1 for r in res if r)
    print(f"   {ok}/{total} gerados em {os.path.relpath(out, RAIZ)}/")
    return ok == total


def modulos_existentes():
    return sorted(
        d for d in os.listdir(RAIZ)
        if os.path.isdir(os.path.join(RAIZ, d))
        and not d.startswith((".", "_"))
        and d not in ("audio", "ferramentas", "docs")
        and os.path.exists(os.path.join(RAIZ, d, "index.html"))
    )


async def main():
    args = sys.argv[1:]
    if args and args[0] == "--todos":
        alvos = [""] + modulos_existentes()
    elif args:
        alvos = [args[0].strip("/")]
    else:
        alvos = [""]

    resultados = [await gerar_modulo(a) for a in alvos]
    if not all(resultados):
        print("\n❌ Alguns áudios falharam."); sys.exit(1)
    print(f"\n✅ Pronto: {len(alvos)} alvo(s) com áudio gerado.")


if __name__ == "__main__":
    asyncio.run(main())
