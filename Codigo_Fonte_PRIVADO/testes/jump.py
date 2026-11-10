from playwright.sync_api import sync_playwright
import sys
F='file://CAMINHO_DA_PASTA/Kayzen_Ryuu_debug.html' if len(sys.argv)<2 else sys.argv[1]
tag=sys.argv[2] if len(sys.argv)>2 else 'new'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1280,'height':720},device_scale_factor=2)
    pg.goto(F);pg.wait_for_timeout(1500)
    if 'debug' in F:
        pg.evaluate('()=>__game.finishStory("start")');pg.wait_for_timeout(500);pg.keyboard.press('Enter');pg.wait_for_timeout(300)
    else:
        pass
    frames=[]
    for mode in ['parado','andando','andandoCima']:
        if mode=='andando':pg.keyboard.down('KeyD')
        if mode=='andandoCima':pg.keyboard.up('KeyD');pg.keyboard.down('KeyW')
        pg.wait_for_timeout(300);pg.keyboard.press('Space')
        for i in range(5):
            pg.wait_for_timeout(95);pg.screenshot(path=f'jump_{tag}_{mode}_{i}.png',clip={'x':560,'y':230,'width':160,'height':200})
    pg.keyboard.up('KeyW');b.close()
from PIL import Image
import glob
rows=[]
for mode in ['parado','andando','andandoCima']:
    ims=[Image.open(f'jump_{tag}_{mode}_{i}.png') for i in range(5)]
    r=Image.new('RGB',(320*5,400));[r.paste(im,(i*320,0)) for i,im in enumerate(ims)];rows.append(r)
W=Image.new('RGB',(1600,1200));[W.paste(r,(0,i*400)) for i,r in enumerate(rows)];W.resize((1200,900)).save(f'JUMP_{tag}.png')
