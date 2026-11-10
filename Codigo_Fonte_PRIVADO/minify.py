import subprocess,re
s=open('Kayzen_Ryuu_release_src.html',encoding='utf-8').read()
a=s.index('<script>')+8;b=s.rindex('</script>')
open('/tmp/rel.js','w',encoding='utf-8').write(s[a:b])
subprocess.run(['node_modules/.bin/terser','/tmp/rel.js','-c','passes=2,drop_debugger=true','-m','--ecma','2019','-o','/tmp/rel.min.js'],check=True)
js=open('/tmp/rel.min.js',encoding='utf-8').read()
out=s[:a]+'\n'+js+'\n'+s[b:]
# remove comentários do CSS
out=re.sub(r'/\*[^*]*\*+(?:[^/*][^*]*\*+)*/','',out[:out.index('<script>')])+out[out.index('<script>'):]
open('Kayzen_Ryuu.html','w',encoding='utf-8').write(out)
print(len(s),len(out))
