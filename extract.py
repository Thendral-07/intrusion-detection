import re
try:
    text = open('uiverse_css_dump.txt', 'r', encoding='utf-16le', errors='ignore').read()
    match = re.search(r'"previewCss":"(.*?)"', text, re.DOTALL)
    if match:
        css = bytes(match.group(1), 'utf-8').decode('unicode_escape')
        open('frontend/src/broadside.css', 'w', encoding='utf-8').write(css)
        print('SUCCESS')
    else:
        print('FAILED TO FIND previewCss')
except Exception as e:
    print('Error:', e)
