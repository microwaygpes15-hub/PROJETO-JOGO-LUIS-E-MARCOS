# KAYZEN RYUU — Guia completo para continuar o desenvolvimento (com outra IA)

> Cole este arquivo inteiro no início da conversa com a nova IA e envie junto a pasta
> `Codigo_Fonte_PRIVADO`. Ele explica o jogo, a história, as regras de design,
> como o código está organizado, como gerar a versão final e o que já foi testado.

Criadores: **Luis Henrique e Marcos (Marcos Thz / marcos_tech)** — projeto exclusivo de Luis Henrique e Marcos Thz. Última atualização: 08/11/2026.

---

## 1. O que é o jogo

- Jogo de tiro com visão de cima (top-down / twin-stick), em **um único arquivo HTML** (HTML + CSS + JavaScript + imagens e sons embutidos em base64).
- Roda em qualquer navegador moderno, **no computador (teclado + mouse) e no celular (controles de toque, na horizontal)**.
- Sem bibliotecas externas, sem internet. Tela lógica de **960×540**, desenhada num `<canvas>` (multiplicado pela densidade da tela, `DPR`).
- Idioma de todos os textos: **português do Brasil**.

## 2. História (já implementada)

1. **2069 — O Mundo de Antes**: céu azul, cidade limpa.
2. **14/03/2071 — O Despertar**: terremoto global, cidades caem.
3. **A Fúria dos Vulcões**: lava engole o sul, nuvem de cinzas apaga o sol.
4. **O Inverno de Cinzas**: o norte congela.
5. **Neo-Akari**: última cidade, sob cúpulas de luz. Lava do sul gera energia, gelo do norte resfria os servidores. Tudo controlado pela IA **NÚCLEO**.
6. **2099 — O Véu**: a hacker **VEXX** invade o Núcleo e solta o vírus **VÉU**, que transforma máquinas em **malwares**.
7. **Kayzen Ryuu**: ex-agente da divisão Ryuu, com canhão de plasma, a energia Sobrecarga e um dispositivo de portais.
8. Final do Capítulo 1 (após a Fase 3): Vexx cai, o sol volta… mas a última armadilha dela abre **A Fenda** do multiverso.
9. Capítulo 2 (Fase 4): ecos de Kayzen de outros universos; chefe **Kayzen Ômega**. Final: "O Multiverso em Paz".

## 2b. Narração e créditos
- A abertura e os finais são **narrados** com a voz em português do próprio aparelho (`speechSynthesis`, preferindo vozes pt-BR como Luciana/Felipe). Bloco `NARR` no fim do `ext.js`: `narrate()`, `narrStop()`, `narrToggle()` (botão NARRAÇÃO ou tecla N), pronúncia ajustada em `SAY_FIX`, trilha abaixa durante a fala, cena avança sozinha ao terminar. Preferência salva em `localStorage` (`kz_narr`).
- Créditos em itálico (`drawCredits`): tela inicial, tela de título e rodapé das cenas — "Criadores: Luis Henrique e Marcos" e "Projeto exclusivo de Luis Henrique e Marcos Thz". Manter.

## 2c. Jogar no iPhone
- Tocar no .html no app Arquivos/WhatsApp **não roda o jogo** (o iOS abre só uma pré-visualização sem JavaScript). É preciso abrir por um link no Safari: página publicada no claude.ai ou site próprio (Netlify, GitHub Pages). No Safari: Compartilhar → Adicionar à Tela de Início.
- `Codigo_Fonte_PRIVADO/Kayzen_Ryuu_versao_link_claude.html` é a versão preparada para publicação como página do claude.ai (sem as tags html/head/body e sem a política CSP, que a hospedagem já fornece).

## 3. Estrutura de cada fase (regra de design atual)

1. Cartão de apresentação (objetivo, inimigos, chefe, arma final, habilidade nova).
2. O jogador destrói **todos os malwares**.
3. Aparece **⚠ ALERTA: CHEFE A CAMINHO** + uma **caixa com a ARMA LENDÁRIA** perto do jogador.
4. O **chefe** surge perto do jogador (seta na borda da tela aponta para ele se estiver fora de vista).
5. Ao vencer **todos** os inimigos: "ÁREA LIMPA! PORTAL LIBERADO". **O portal só existe a partir daqui.**
6. O jogador abre o portal (E / botão PORTAL), entra nele e escolhe a próxima fase no menu.
   - Fases 3 e 4 terminam com cenas de história (finais dos capítulos).
7. Cada fase é **mais difícil** (tabela `DIFF_T`: vida ×1 / 1,2 / 1,4 / 1,6; dano ×1 / 1,15 / 1,3 / 1,45; velocidade ×1 / 1,05 / 1,1 / 1,15).

| Fase | Cenário | Desafio do cenário | Inimigos | Chefe (poderes) | Arma lendária (tecla G) | Habilidade nova |
|---|---|---|---|---|---|---|
| 1 Distrito Neon | cidade noturna | — | Atacante, Defensor (escudo), Híbrido | **Rainha do Enxame** (laser giratório, chuva ácida, invoca drones) — 650 HP | **Canhão de Plasma**: carrega 0,45 s e solta raio que atravessa tudo (150 dano), recarga 22 s | Sobrecarga (Q) |
| 2 Fundição Rubra | fábrica, lava | poças de lava ferem (pular evita) | Torreta, Kamikaze | **Forja-X** (anel de brasas, investida — atordoa se bater na parede, invoca kamikazes) — 900 HP | **Chuva de Meteoros**: 9 meteoros na área mirada (55 cada), 28 s | Dash do Dragão (Shift/K) |
| 3 Cripta Glacial | servidores congelados | chão escorregadio, gelo deixa lento | Espectro (teleporta), Sentinela (gelo) | **Vexx** (espiral, leque de gelo, teletransporte) — 1100 HP | **Zero Absoluto**: congela tudo a 700 px (chefe 2,5 s, outros 4 s), 50 de dano, congelados levam +50%, 32 s | Escudo Crio (F) |
| 4 Fenda do Multiverso | 4 universos (Gibi, Noir P&B, 8-Bit, Neon) | filtros de tela por universo, falhas de realidade | Eco Gibi (investe), Eco Noir (atira), Eco Pixel (divide em 2) | **Kayzen Ômega** (leque de plasma, dash, ataques em área, portais com ecos, se divide em clones) — 1300 HP | **Arsenal do Multiverso**: 6 s de tiros teleguiados automáticos, 36 s | Eco Aliado (V) |

Cada arma tem habilidade, dinâmica e **sons próprios** (objeto `WSND`).
Todos os chefes entram em **FÚRIA** com metade da vida.

## 3b. Itens
- **Inalador** (recupera 30 de vida): 3 espalhados no mapa de cada fase (aparecem no minimapa com uma cruz verde), 12% de chance de cair de cada inimigo (24% se a vida estiver abaixo de 40%; os que caem somem em 16 s, piscando antes) e o chefe solta 1 ao entrar em fúria. Com a vida cheia, o inalador fica no chão. Código: bloco `INH` / `inhalers` no fim do `ext.js`.

## 4. Controles

**Computador:** WASD/setas mover · mouse mirar · clique/J atirar · R recarregar · Espaço pular (aperte de novo no ar = **pulo duplo**) · Q Sobrecarga · E Portal (só no fim) · Shift/K Dash · F Escudo · V Eco Aliado · G Arma lendária · P/Esc pausa · M som · H caixas de colisão (debug).

**Celular (horizontal):** analógico à esquerda; ATIRAR (com mira automática), PULAR (2 toques = pulo duplo), RECARGA, SOBRECARGA, DASH, ESCUDO à direita em arco; ECO e PORTAL à esquerda; ARMA (dourado) aparece acima da RECARGA quando coletada; pausa embaixo no centro. Botões ficam escondidos durante história/cartões/menu.

## 5. Como o código está organizado (IMPORTANTE)

O jogo **não é editado direto no HTML final**. Ele é gerado por um script:

```
Codigo_Fonte_PRIVADO/
  base/Kayzen_Ryuu_base_original.html   ← jogo original do Marcos (fase 1, portal, sprites e sons embutidos)
  ext.js        ← TODO o código novo (história, fases 2–4, chefes, armas, áudio, segurança do save, HUD…)
  ext.css       ← estilos novos (botões do celular, áreas seguras)
  patch.py      ← aplica substituições exatas no HTML base + injeta ext.js/ext.css → gera os HTMLs
  minify.py     ← minifica/ofusca a versão final com o terser
  Kayzen_Ryuu_DEBUG_para_testes.html  ← versão com window.__game (para testes automáticos)
  Kayzen_Ryuu_codigo_legivel.html     ← versão final NÃO minificada (para ler)
  testes/       ← scripts Playwright que jogam o jogo automaticamente
```

### Gerar o jogo
```bash
cd Codigo_Fonte_PRIVADO
python3 patch.py                 # gera Kayzen_Ryuu_debug.html, Kayzen_Ryuu_release_src.html e Kayzen_Ryuu.html
npm i terser@5.31.0              # uma vez
python3 minify.py                # Kayzen_Ryuu.html final minificado (é o que vai em Jogo/)
```
`patch.py` usa a função `R(antigo, novo)`, que **exige que o trecho antigo exista exatamente 1 vez** — se algo mudar no base, ele para e mostra qual trecho falhou. Assim nenhuma alteração é aplicada “pela metade”.

### Ordem do código dentro do `<script>`
Tudo fica dentro de `(()=>{ "use strict"; ... })();` (nada fica acessível pelo console).
1. Código original (CFG, ETYPES, SPR com sprites base64, entrada, mundo, áudio, lógica, portal, Sobrecarga, desenho, HUD).
2. Logo antes de `window.__game` (só na versão debug), entra o `ext.js` inteiro, nesta ordem:
   - Estado/fases (`PHASE_DEF`, `BOSS`, `ABIL`), salvamento, áudio, mira do celular, mapas (`loadMap`, `buildFloorForge/Ice`), IA de inimigos (`EXT_AI`), chefes (`forjaAI`, `vexxAI`), desenho (`EXT_DRAW`, `drawForja`, `drawVexx`), habilidades (dash, escudo), HUD, cartão de fase, **história** (`STORY`, `sceneAudio`, `drawStoryScene`, `drawGate`), teclado/toque, botões do celular, `start()`.
   - Bloco **multiverso** (Fase 4): `ZONES`, `makeEcoSheets`, ecos, `omegaAI`, Eco Aliado, `buildFloorMulti`, `drawMultiFX`.
   - Bloco **progressão**: `DIFF_T`, `WPN` + `WSND`, `extCheckClear`, `spawnPhaseBoss`, caixa da arma, `useWeapon`, `queenAI/drawQueen`, `phaseWon`, seta do chefe, som de tiro garantido, desbloqueio de áudio no iPhone.

### Pontos de extensão (para adicionar coisas)
- **Nova fase N**: `PHASE_DEF[N]` (nome, mix de inimigos, quantidade, chefe, início, cartão), `loadMap(N)` + `buildFloorX()`, `WPN[N]`, `DIFF_T[N]`, `PHASE_BOSS_TXT[N]`, texto em `refreshPhases()` (hoje vai até 4), menu do portal já tem 12 cartões (`PHASES`). Ajustar `phaseWon()` (quando há história) e o limite de `unlocked` em `loadProgress()`.
- **Novo inimigo**: entrada em `ETYPES` (no `patch.py`), comportamento em `EXT_AI.tipo(m,dt)`, desenho em `EXT_DRAW.tipo(m)`.
- **Novo chefe**: `BOSS.nome`, `nomeAI(m,dt,d)` chamado em `updateBoss`, `drawNome(m)` chamado em `drawBoss`.
- **Nova arma**: `WPN[fase]` + ramo em `useWeapon()` / `updateWeapon()` / `drawWeaponWorld()` + sons em `WSND`.
- **Nova cena de história**: item em `STORY.intro|end|end2`, caso em `drawStoryScene` e em `sceneAudio`.
- **Sons**: tudo sintetizado com Web Audio (`tone`, `noiseBurst`, `iaPad`, `iaNoise`…), exceto tiro/recarga/raio (MP3 embutidos, tocados via `playBuf`).

### Personagem: movimento e animação (detalhes importantes)
- Pulo com física: `P.vz` (velocidade vertical), gravidade 1216, impulso 334; `P.jumpT>0` indica "no ar"; `P.jumps` conta 1 ou 2 (pulo duplo, impulso 330; `P.djFX` só encolhe o corpo — sem cambalhota).
- Corrida de lado: a folha `walk` tem 3 quadros de passada quase iguais e 1 de cruzamento; o jogo usa a sequência 0-1-2-1 (passada, cruzamento) a ~9 quadros/s, com inclinação e balanço. Uma arte nova de corrida (8 quadros, pernas alternando) melhoraria ainda mais.
- `drawPlayer` escolhe a folha: `backwalk` (andando para cima), `frontwalk` (para baixo), `walk` (de lado, também ao atirar andando), `shoot` (atirando parado), `idle` (parado).
- Direção com tolerância (`walkDir` só troca se um eixo for 35% maior) para não piscar na diagonal; o passo da animação acompanha a velocidade.
- A folha `frontwalk` original tem quadros quase iguais; o código compensa com balanço do corpo. Uma arte nova de caminhada de frente (4 quadros) deixaria ainda melhor.
- Cada folha de sprite é alinhada pelo centro do corpo (`SPR[k].cx`), calculado em `upscaleSprites()`.

## 6. Segurança (já implementada)
- Código isolado num IIFE; sem variáveis globais (não dá para trapacear pelo console).
- `Content-Security-Policy` na `<meta>`: bloqueia scripts externos e qualquer conexão de rede.
- Progresso salvo em `localStorage` (`kz_save_v2`) **embaralhado e assinado** (`writeSave/readSave`, hash `kzHash`); se alguém editar, o save é descartado.
- Versão final minificada (terser). **Não publicar** a pasta `Codigo_Fonte_PRIVADO`.
- Limite honesto: jogo de navegador nunca é 100% inviolável.

## 7. Testes
Os scripts em `testes/` usam Python + Playwright (Chromium) e a versão DEBUG (`window.__game`):
`flow.py` (fluxo de todas as fases: alerta, chefe, arma, portal), `p4.py` (Fase 4), `mob.py` (celulares/tablet com toque), `rel.py` (versão final protegida), `snd.py` (sons), `jump.py` (animação do pulo).
Troque `CAMINHO_DA_PASTA` pelo caminho real antes de rodar.

## 8. Regras do projeto (respeitar ao continuar)
- Textos em português; manter o visual escuro/neon; telas e botões precisam funcionar no PC e no celular.
- **Não usar personagens, nomes, logos ou artes de terceiros** (ex.: nada de Homem-Aranha; a Fase 4 é inspirada só no *estilo* “multiverso em quadrinhos”).
- Crédito obrigatório da arte do malware: **"Dregfly" por Emcee Flesher (OpenGameArt, CC-BY / OGA-BY 3.0)** — aparece na tela de título; manter.
- Cada fase nova: mais difícil, chefe no final com poderes diferentes, arma lendária diferente (habilidade, dinâmica e sons próprios), portal só depois de vencer tudo.
- Sempre testar no computador **e** no celular antes de entregar; entregar em `.zip` com o jogo + código + este guia.

## 9. Ideias para as próximas fases (sugestões)
- Fase 5 “Abismo Oceânico” (cidade submersa, correntezas que empurram, chefe Leviatã-Bot).
- Fase 6 “Deserto de Vidro” (tempestade de areia reduz visão, chefe Escorpião Solar).
- Sistema de melhorias entre fases (vida, munição, recarga), placar e conquistas.
- Seleção de dificuldade (Fácil/Normal/Difícil) multiplicando `DIFF_T`.

## 10. Histórico de versões
- **v1** (original do Marcos): Fase 1, Sobrecarga, Portal, sons de tiro/recarga/raio.
- **v2**: correções mobile/PC, abertura de história, Fases 2 e 3 (Forja-X, Vexx), Dash e Escudo.
- **v3**: abertura com o desastre natural + sons, sprites nítidos, áudio confiável, segurança.
- **v7 (esta)**: narração da história, créditos dos criadores, versão em link para iPhone.
- **v6**: inalador de vida, corrida com ritmo regular, pulo duplo sem cambalhota.
- **v5**: caminhada corrigida (pernas se mexem em todas as direções, sem deslizar ao atirar, sem piscar na diagonal, sem pulo lateral ao parar) e **pulo duplo**.
- **v4**: pulo corrigido, Fase 4 (multiverso, Kayzen Ômega, Eco Aliado), chefe só no fim de cada fase (novo chefe da Fase 1: Rainha do Enxame), armas lendárias com sons próprios, portal só no final, dificuldade crescente, tela mais limpa, som do tiro garantido (inclusive iPhone).
