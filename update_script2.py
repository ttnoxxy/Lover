import codecs

with codecs.open('src/screens/HistoryScreen.tsx', 'r', 'utf-8') as f:
    lines = f.readlines()

out = []
for line in lines:
    if line.startswith('function lightenHex') and any('function lightenHex' in l for l in out):
        continue # skip duplicate
    if 'const canvasRef =' in line:
        continue
    if 'const onFlip =' in line:
        out.append('const onFlip = (e: any) => { return; }\n')
        continue
    if 'const Page =' in line:
        out.append('// ' + line)
        continue
    out.append(line)

with codecs.open('src/screens/HistoryScreen.tsx', 'w', 'utf-8') as f:
    f.writelines(out)
