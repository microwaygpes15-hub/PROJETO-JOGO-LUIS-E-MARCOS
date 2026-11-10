from playwright.sync_api import sync_playwright
F='file://CAMINHO_DA_PASTA/Kayzen_Ryuu_debug.html';O='shots/p4_'
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(viewport={'width':1280,'height':720});pg=ctx.new_page()
    pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)));pg.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' else None)
    pg.goto(F);pg.wait_for_timeout(1500)
    V=lambda e:pg.evaluate('()=>('+e+')');S=lambda s:pg.evaluate('()=>{'+s+'}')
    box=pg.locator('#c').bounding_box()
    def sxy(x,y):return box['x']+x*box['width']/960,box['y']+y*box['height']/540
    pg.keyboard.press('Enter');pg.wait_for_timeout(200)
    # simula ter vencido a fase 3 -> final do capítulo 1
    S('__game.unlocked=3;__game.finishStory("start")');pg.wait_for_timeout(300);S('__game.startPhase(3)');pg.wait_for_timeout(500);pg.keyboard.press('Enter');pg.wait_for_timeout(300)
    S('__game.enemies.forEach(m=>m.dead=true)');pg.wait_for_timeout(3600)
    print('story',V('__game.intro.on'),V('__game.intro.set'),'unlocked',V('__game.unlocked'))
    for i in range(3):
        pg.keyboard.press('Enter');pg.wait_for_timeout(120);pg.keyboard.press('Enter');pg.wait_for_timeout(1800)
        pg.screenshot(path=O+f'0{i}_end.png')
    pg.wait_for_timeout(800);pg.screenshot(path=O+'03_endtitle.png')
    pg.keyboard.press('Enter');pg.wait_for_timeout(700)
    print('phase',V('__game.curPhase'),'card',V('__game.pcard.on'));pg.screenshot(path=O+'04_card.png')
    pg.keyboard.press('Space');pg.wait_for_timeout(1500);pg.screenshot(path=O+'05_gibi.png')
    # eco aliado
    pg.keyboard.press('KeyV');pg.wait_for_timeout(200);print('ally cd',V('__game.abil.allyCd'))
    e=V("(()=>{const m=__game.enemies.find(e=>e.type==='egb');return m?[m.x,m.y]:null})()")
    S(f'__game.P.x={e[0]-220};__game.P.y={e[1]};__game.P.hp=100;');pg.wait_for_timeout(1600);pg.screenshot(path=O+'06_gibi_eco.png')
    print('hp',V('__game.P.hp'))
    # universo noir
    e=V("(()=>{const m=__game.enemies.find(e=>e.type==='enr'&&e.x>2400&&e.y<1500)||__game.enemies.find(e=>e.type==='enr');return [m.x,m.y]})()")
    S(f'__game.P.x={e[0]-300};__game.P.y={e[1]};__game.P.hp=100;');pg.wait_for_timeout(2200);pg.screenshot(path=O+'07_noir.png')
    S('__game.P.x=3600;__game.P.y=2300;__game.P.hp=100;');pg.wait_for_timeout(1600);pg.screenshot(path=O+'08_neon.png')
    e=V("(()=>{const m=__game.enemies.find(e=>e.type==='epx');return [m.x,m.y]})()")
    S(f'__game.P.x={e[0]-200};__game.P.y={e[1]};__game.P.hp=100;');pg.wait_for_timeout(1200)
    n0=V('__game.enemies.length');S("const m=__game.enemies.find(e=>e.type==='epx');m.hp=1;")
    # atirar no pixel
    pg.mouse.move(*sxy(480+200,270-20));pg.mouse.down();pg.wait_for_timeout(900);pg.mouse.up();pg.wait_for_timeout(300)
    print('enemies before/after split',n0,V('__game.enemies.length'),'mini',V("__game.enemies.filter(e=>e.type==='epm').length"))
    pg.screenshot(path=O+'09_pixel.png')
    # chefe
    S('const b=__game.boss;__game.P.x=b.x-360;__game.P.y=b.y;__game.P.hp=100;');pg.wait_for_timeout(3500);pg.screenshot(path=O+'10_omega.png')
    acts=set()
    for i in range(14):
        S('__game.P.hp=100');pg.wait_for_timeout(500);a=V('__game.boss&&__game.boss.act');acts.add(a)
        if i in(3,7,11):pg.screenshot(path=O+f'11_omega_{i}.png')
    print('omega acts',acts)
    S('__game.boss.hp=500;__game.P.hp=100');pg.wait_for_timeout(1500);print('clones',V("__game.enemies.filter(e=>e.type==='ecl').length"));pg.screenshot(path=O+'12_rage.png')
    # portal: menu com fase 4
    S('__game.boss.awake=false;__game.boss.alert=0;__game.P.x=600;__game.P.y=500;__game.P.hp=100');pg.wait_for_timeout(500)
    pg.keyboard.press('KeyE');pg.wait_for_timeout(100);pg.mouse.click(*sxy(620,230));pg.wait_for_timeout(700)
    S('const p=__game.portal;if(p){__game.P.x=p.x;__game.P.y=p.y+34;}');pg.wait_for_timeout(1300);pg.screenshot(path=O+'13_menu.png');pg.keyboard.press('Escape');pg.wait_for_timeout(600)
    # vencer fase 4
    S('__game.boss.hp=1;__game.boss.awake=true;__game.P.inv=9');S('__game.enemies.forEach(m=>{if(!m.boss)m.dead=true})');
    S('const b=__game.boss;__game.P.x=b.x-200;__game.P.y=b.y;__game.P.reloadT=0;__game.P.ammo=12;')
    for i in range(5):
        d=V('__game.boss?[__game.boss.x-__game.P.x,__game.boss.y-__game.P.y]:null')
        if not d:break
        pg.mouse.move(*sxy(max(10,min(950,480+d[0])),max(10,min(530,270+d[1]-50))));pg.mouse.down();pg.wait_for_timeout(400);pg.mouse.up()
    pg.wait_for_timeout(500);print('state',V('__game.state'));pg.wait_for_timeout(3300)
    print('end2',V('__game.intro.on'),V('__game.intro.set'));pg.wait_for_timeout(2500);pg.screenshot(path=O+'14_mended.png')
    pg.keyboard.press('Escape');pg.wait_for_timeout(1500);pg.screenshot(path=O+'15_final.png')
    b.close()
print('ERRORS',errs[:10])
