from playwright.sync_api import sync_playwright
F='file://CAMINHO_DA_PASTA/Kayzen_Ryuu_debug.html';O='shots/f_'
HOOK="""window.__snd=[];const _AC=window.AudioContext;window.AudioContext=function(){const c=new _AC();const o=c.createOscillator.bind(c);c.createOscillator=function(){window.__snd.push('osc');return o();};const b=c.createBufferSource.bind(c);c.createBufferSource=function(){window.__snd.push('buf');return b();};return c;};"""
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(viewport={'width':1280,'height':720});ctx.add_init_script(HOOK);pg=ctx.new_page()
    pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)));pg.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' else None)
    pg.goto(F);pg.wait_for_timeout(1500)
    V=lambda e:pg.evaluate('()=>('+e+')');S=lambda s:pg.evaluate('()=>{'+s+'}')
    box=pg.locator('#c').bounding_box()
    def sxy(x,y):return box['x']+x*box['width']/960,box['y']+y*box['height']/540
    pg.keyboard.press('Enter');pg.wait_for_timeout(300);S('__game.finishStory("start")');pg.wait_for_timeout(500);pg.keyboard.press('Enter');pg.wait_for_timeout(1500)
    # som do tiro
    S('window.__snd.length=0');pg.mouse.move(*sxy(700,270));pg.mouse.down();pg.wait_for_timeout(60);pg.mouse.up();pg.wait_for_timeout(300)
    print('tiro -> nós de áudio:',V('window.__snd'))
    for ph in (1,2,3,4):
        if ph>1:
            S(f'__game.unlocked=4;__game.startPhase({ph})');pg.wait_for_timeout(500);pg.keyboard.press('Enter');pg.wait_for_timeout(600)
        print(f'--- fase {ph}: inimigos',V('__game.enemies.length'),'chefe?',V('!!__game.boss'),'hp exemplo',V('__game.enemies[0].maxHp'))
        pg.keyboard.press('KeyE');pg.wait_for_timeout(200);print(' portal antes de limpar:',V('__game.pAim'))
        S('__game.P.inv=99;__game.enemies.forEach(m=>m.dead=true)');pg.wait_for_timeout(700)
        pg.screenshot(path=O+f'{ph}_1warn.png')
        pg.wait_for_timeout(1600)
        print(' chefe:',V('__game.boss&&__game.boss.t.name'),'ativo',V('__game.boss&&__game.boss.awake'))
        # pegar a arma
        pg.wait_for_timeout(200)
        S("const P=__game.P;P.inv=99;")
        cr=V("(()=>{const b=__game.boss;return [b.x,b.y]})()")
        # anda até a caixa: a caixa fica perto do jogador; o teste empurra o jogador por cima dela
        for dx,dy in [(0,0),(60,0),(-60,0),(0,60),(0,-60),(90,0),(-90,0),(0,90),(0,-90)]:
            S(f'__game.P.x+= {dx};__game.P.y+={dy};');pg.wait_for_timeout(60)
            if V('__game.abil!==undefined')and pg.evaluate('()=>document.querySelector("#c")')!=None:pass
        pg.wait_for_timeout(300);pg.screenshot(path=O+f'{ph}_2boss.png')
        S('__game.P.inv=99;')
        pg.keyboard.press('KeyG');pg.wait_for_timeout(900);pg.screenshot(path=O+f'{ph}_3weapon.png')
        pg.wait_for_timeout(1500);pg.screenshot(path=O+f'{ph}_4weapon2.png')
        S('__game.P.inv=99;__game.enemies.forEach(m=>m.dead=true)');pg.wait_for_timeout(800)
        print(' estado',V('__game.state'),'liberadas',V('__game.unlocked'))
        pg.screenshot(path=O+f'{ph}_5clear.png')
        if ph<3:
            pg.keyboard.press('KeyE');pg.wait_for_timeout(150);print(' mira do portal após limpar:',V('__game.pAim'))
            pg.keyboard.press('Escape');pg.wait_for_timeout(200)
        if ph>=3:
            pg.wait_for_timeout(3200);print(' história:',V('__game.intro.on'),V('__game.intro.set'));S('__game.finishStory("start")');pg.wait_for_timeout(500)
    b.close()
print('ERROS',errs[:5])
