with open('public/app.js','r',encoding='utf-8') as f:
    lines = f.readlines()

assert "lightboxEl=document.create" in lines[66], "OFFSET_MISMATCH_67: " + lines[66]
assert 'closeLightbox()' in lines[74], "OFFSET_MISMATCH_75: " + lines[74]

# نحذف من السطر 67 (index 66) لغاية 75 (index 74) شامل
del lines[66:75]

with open('public/app.js','w',encoding='utf-8') as f:
    f.writelines(lines)
print("REMOVED_LIGHTBOX")
