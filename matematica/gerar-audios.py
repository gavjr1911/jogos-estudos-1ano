#!/usr/bin/env python3
# ============================================================
#  GERADOR DE ÁUDIOS NEURAIS — Matemática Divertida do Vitor
#  Usa edge-tts (vozes neurais da Microsoft, grátis, sem chave).
#  Lê o dicionário VOICE de dentro do index.html e gera um
#  arquivo audio/<chave>.mp3 com voz natural em português.
#
#  Uso:
#    .venv/bin/python gerar-audios.py
#    VOZ=pt-BR-AntonioNeural .venv/bin/python gerar-audios.py   (voz masculina)
# ============================================================
import os, re, sys, asyncio
import edge_tts

ROOT = os.path.dirname(os.path.abspath(__file__))
VOICE_NAME = os.environ.get("VOZ", "pt-BR-FranciscaNeural")
RATE = os.environ.get("RATE", "-8%")     # um pouco mais devagar p/ a criança acompanhar
PITCH = os.environ.get("PITCH", "+0Hz")
OUT = os.path.join(ROOT, "audio")
CONCURRENCY = 8

def ler_voice():
    html = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
    m = re.search(r"const VOICE\s*=\s*\{(.*?)\n\};", html, re.S)
    if not m:
        print("❌ Não encontrei o objeto VOICE no index.html"); sys.exit(1)
    bloco = m.group(1)
    # captura pares  chave:"texto"  (todos os valores usam aspas duplas)
    pares = re.findall(r'(\w+)\s*:\s*"([^"]*)"', bloco)
    return dict(pares)

async def gerar(sem, key, texto):
    async with sem:
        path = os.path.join(OUT, key + ".mp3")
        try:
            comm = edge_tts.Communicate(texto, VOICE_NAME, rate=RATE, pitch=PITCH)
            await comm.save(path)
            print(f"✅ {key:<16} “{texto}”")
            return True
        except Exception as e:
            print(f"❌ {key}: {e}")
            return False

async def main():
    voice = ler_voice()
    os.makedirs(OUT, exist_ok=True)
    print(f"🎙️  Gerando {len(voice)} áudios NEURAIS com a voz {VOICE_NAME} (rate {RATE})...\n")
    sem = asyncio.Semaphore(CONCURRENCY)
    res = await asyncio.gather(*(gerar(sem, k, t) for k, t in voice.items()))
    ok = sum(1 for r in res if r)
    print(f"\nPronto! {ok}/{len(voice)} áudios gerados em /audio com voz natural.")

if __name__ == "__main__":
    asyncio.run(main())
