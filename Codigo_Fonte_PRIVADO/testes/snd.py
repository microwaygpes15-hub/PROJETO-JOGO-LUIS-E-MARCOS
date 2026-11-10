import os,sys,json
from playwright.sync_api import sync_playwright
HOOK="""
window.__snd=[];
const _p=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__snd.push('AUDIO:'+(this.src||'').slice(5,25)+':len'+(this.src||'').length);return _p.call(this);};
const _AC=window.AudioContext;window.AudioContext=function(){const c=new _AC();const o=c.createOscillator.bind(c);c.createOscillator=function(){window.__snd.push('osc');return o();};const b=c.createBufferSource.bind(c);c.createBufferSource=function(){window.__snd.push('noise');return b();};window.__actx=c;return c;};
"""
def run(f,newv,mobile):
    with sync_playwright() as p:
        b=p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        ctx=b.new_context(**p.devices['Pixel 7 landscape']) if mobile else b.new_context(viewport={'width':1280,'height':720})
        ctx.add_init_script(HOOK);pg=ctx.new_page();errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('file://'+f);pg.wait_for_timeout(1500)
        V=lambda e:pg.evaluate('()=>('+e+')');S=lambda s:pg.evaluate('()=>{'+s+'}')
        box=pg.locator('#c').bounding_box()
        if newv:
            if mobile: pg.touchscreen.tap(box['x']+box['width']/2,box['y']+box['height']/2)
            else: pg.mouse.click(box['x']+box['width']/2,box['y']+box['height']/2)
            pg.wait_for_timeout(300)
            S('window.__snd.length=0')
            pg.wait_for_timeout(2500);print('  sons da abertura (2,5 s):',len(V('window.__snd')))
            S('__game.finishStory("start")');pg.wait_for_timeout(500)
            if mobile: pg.touchscreen.tap(box['x']+box['width']/2,box['y']+box['height']/2)
            else: pg.keyboard.press('Enter')
            pg.wait_for_timeout(400)
        S('window.__snd.length=0')
        log={}
        def step(name,fn):
            S('window.__snd.length=0');fn();pg.wait_for_timeout(500);log[name]=V('window.__snd.slice()')
        if mobile:
            fb=pg.locator('#mobileFire').bounding_box();jb=pg.locator('#mobileJump').bounding_box();rb=pg.locator('#mobileReload').bounding_box()
            step('tiro',lambda:pg.touchscreen.tap(fb['x']+fb['width']/2,fb['y']+fb['height']/2))
            step('pulo',lambda:pg.touchscreen.tap(jb['x']+jb['width']/2,jb['y']+jb['height']/2))
            step('recarga',lambda:pg.touchscreen.tap(rb['x']+rb['width']/2,rb['y']+rb['height']/2))
        else:
            step('tiro',lambda:(pg.mouse.move(box['x']+200,box['y']+300),pg.mouse.down(),pg.wait_for_timeout(100),pg.mouse.up()))
            step('pulo',lambda:pg.keyboard.press('Space'))
            step('recarga',lambda:pg.keyboard.press('KeyR'))
            step('sobrecarga',lambda:(pg.keyboard.press('KeyQ'),pg.wait_for_timeout(100),pg.mouse.click(box['x']+box['width']/2+50,box['y']+box['height']/2),pg.wait_for_timeout(900)))
            step('portal',lambda:(pg.keyboard.press('KeyE'),pg.wait_for_timeout(100),pg.mouse.click(box['x']+box['width']*0.7,box['y']+box['height']*0.4)))
            step('dano',lambda:S('__game.P.inv=0;const m=__game.enemies[0];m.x=__game.P.x+5;m.y=__game.P.y;m.hitT=0;'))
        step('acerto',lambda:S('const m=__game.enemies.find(e=>!e.dead);__game.P.x=m.x-150;__game.P.y=m.y;'))
        b.close()
        return log,errs
for f,nv in [('original/Kayzen_Ryuu.html',False),('build/Kayzen_Ryuu_debug.html',True)]:
    for mob in (False,True):
        log,errs=run(f,nv,mob)
        print('NOVO' if nv else 'ORIGINAL','celular' if mob else 'pc',errs)
        for k,v in log.items():
            from collections import Counter
            print('  ',k,dict(Counter(v)))
