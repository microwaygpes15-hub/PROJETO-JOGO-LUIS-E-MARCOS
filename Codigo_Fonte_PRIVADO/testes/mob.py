import os
from playwright.sync_api import sync_playwright
F='file://'+os.path.abspath('build/Kayzen_Ryuu_debug.html');O='shots/m'
with sync_playwright() as p:
    b=p.chromium.launch()
    for dev in ['iPhone 13 landscape','Pixel 7 landscape','iPad (gen 7) landscape','iPhone 13']:
        if dev not in p.devices:continue
        errs=[];tag=dev.replace(' ','_').replace('(','').replace(')','')
        ctx=b.new_context(**p.devices[dev]);pg=ctx.new_page()
        pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)));pg.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' else None)
        pg.goto(F);pg.wait_for_timeout(1500)
        V=lambda e:pg.evaluate('()=>('+e+')');S=lambda s:pg.evaluate('()=>{'+s+'}')
        if dev=='iPhone 13':pg.screenshot(path=O+'_'+tag+'_portrait.png');print(dev,'portrait ok',errs);ctx.close();continue
        box=pg.locator('#c').bounding_box()
        def tap(x,y):pg.touchscreen.tap(box['x']+x*box['width']/960,box['y']+y*box['height']/540)
        pg.screenshot(path=O+'_'+tag+'_0gate.png');tap(480,300);pg.wait_for_timeout(1200)
        pg.screenshot(path=O+'_'+tag+'_1intro.png')
        tap(480,300);pg.wait_for_timeout(200);tap(480,300);pg.wait_for_timeout(600)
        print(dev,'slide',V('__game.intro.slide'))
        tap(900,60);pg.wait_for_timeout(1200)   # PULAR
        pg.screenshot(path=O+'_'+tag+'_2title.png')
        tap(480,446);pg.wait_for_timeout(500);print('card',V('__game.pcard.on'))
        pg.screenshot(path=O+'_'+tag+'_3card.png')
        tap(480,300);pg.wait_for_timeout(400);print('card after tap',V('__game.pcard.on'),'state',V('__game.state'))
        # botões
        vis=V("['mobileJoystick','mobileFire','mobileReload','mobileJump','mobileSkill','mobilePortal','mobileDash','mobileShield','mobilePause'].map(id=>{const e=document.getElementById(id),r=e.getBoundingClientRect(),cs=getComputedStyle(e);return id+':'+cs.display+':'+cs.visibility+':'+Math.round(r.left)+','+Math.round(r.top)+','+Math.round(r.width)})")
        print(vis)
        # sobreposição entre botões
        ov=V("""(()=>{const ids=['mobileJoystick','mobileFire','mobileReload','mobileJump','mobileSkill','mobilePortal','mobilePause'];const rs=ids.map(i=>[i,document.getElementById(i).getBoundingClientRect()]);const out=[];
          for(let a=0;a<rs.length;a++)for(let c=a+1;c<rs.length;c++){const A=rs[a][1],B=rs[c][1];if(A.width&&B.width&&A.left<B.right&&A.right>B.left&&A.top<B.bottom&&A.bottom>B.top)out.push(rs[a][0]+'x'+rs[c][0]);}
          const W=innerWidth,H=innerHeight;rs.forEach(([i,r])=>{if(r.width&&(r.left<0||r.top<0||r.right>W||r.bottom>H))out.push(i+' fora da tela');});return out})()""")
        print('overlaps',ov)
        pg.screenshot(path=O+'_'+tag+'_4play.png')
        # joystick: arrastar
        jr=pg.locator('#mobileJoystick').bounding_box();cx=jr['x']+jr['width']/2;cy=jr['y']+jr['height']/2
        x0=V('__game.P.x')
        cdp=ctx.new_cdp_session(pg)
        def touch(t,pts):cdp.send('Input.dispatchTouchEvent',{'type':t,'touchPoints':pts})
        touch('touchStart',[{'x':cx,'y':cy,'id':1}]);touch('touchMove',[{'x':cx+40,'y':cy,'id':1}]);pg.wait_for_timeout(500)
        fr=pg.locator('#mobileFire').bounding_box()
        touch('touchStart',[{'x':cx+40,'y':cy,'id':1},{'x':fr['x']+fr['width']/2,'y':fr['y']+fr['height']/2,'id':2}]);pg.wait_for_timeout(700)
        print('moved',round(V('__game.P.x')-x0),'ammo',V('__game.P.ammo'))
        touch('touchEnd',[]);pg.wait_for_timeout(200)
        # sobrecarga: botão + arrastar na tela
        pg.locator('#mobileSkill').tap();pg.wait_for_timeout(150);print('aiming',V('__game.skill.aiming'))
        pg.screenshot(path=O+'_'+tag+'_5aim.png')
        tap(600,250);pg.wait_for_timeout(300);print('skill cd',V('__game.skill.cd'))
        # pausa
        pg.locator('#mobilePause').tap();pg.wait_for_timeout(200);print('paused',V('__game.paused'));pg.screenshot(path=O+'_'+tag+'_6pause.png')
        tap(480,270);pg.wait_for_timeout(200);print('paused after tap',V('__game.paused'))
        # portal
        pg.locator('#mobilePortal').tap();pg.wait_for_timeout(150);tap(640,220);pg.wait_for_timeout(700);print('portal',V('!!__game.portal'))
        S('const p=__game.portal;if(p){__game.P.x=p.x;__game.P.y=p.y+34;}');pg.wait_for_timeout(1300);print('menu',V('__game.pmenu.open'))
        pg.screenshot(path=O+'_'+tag+'_7menu.png')
        tap(110,120);pg.wait_for_timeout(1500);print('travel to 1, phase',V('__game.curPhase'))
        # fase 2 + dash
        S('__game.unlocked=3');S('__game.startPhase(2)');pg.wait_for_timeout(700);tap(480,300);pg.wait_for_timeout(300)
        pg.screenshot(path=O+'_'+tag+'_8phase2.png')
        print('dash visible',V("getComputedStyle(document.getElementById('mobileDash')).display"),'shield',V("getComputedStyle(document.getElementById('mobileShield')).display"))
        pg.locator('#mobileDash').tap();pg.wait_for_timeout(100);print('dashCd',V('__game.abil.dashCd'))
        S('__game.startPhase(3)');pg.wait_for_timeout(700);tap(480,300);pg.wait_for_timeout(300)
        pg.locator('#mobileShield').tap();pg.wait_for_timeout(200);print('shieldT',V('__game.abil.shieldT'))
        S('const b=__game.boss;__game.P.x=b.x-330;__game.P.y=b.y;');pg.wait_for_timeout(2500)
        pg.screenshot(path=O+'_'+tag+'_9phase3.png')
        # morrer e tocar para tentar de novo
        S('__game.abil.shieldT=0;__game.P.inv=0;__game.P.hp=1;__game.boss.awake=true;');pg.wait_for_timeout(4000)
        print('state',V('__game.state'));pg.screenshot(path=O+'_'+tag+'_10dead.png')
        tap(480,270);pg.wait_for_timeout(500);print('after retry tap',V('__game.state'),V('__game.curPhase'),'card',V('__game.pcard.on'))
        print('errors',errs[:10]);ctx.close()
    b.close()
