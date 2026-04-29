from PIL import Image, ImageDraw, ImageFont
import os

os.makedirs('src/assets', exist_ok=True)
width, height = 1200, 280
img = Image.new('RGB', (width, height), '#F3E5E7')
draw = ImageDraw.Draw(img)

# background gradient
for i in range(width):
    r = int(243 - (i / width) * 20)
    g = int(229 - (i / width) * 30)
    b = int(231 - (i / width) * 70)
    draw.line([(i, 0), (i, height)], fill=(r, g, b))

try:
    font_title = ImageFont.truetype('arialbd.ttf', 60)
    font_sub = ImageFont.truetype('arialbd.ttf', 28)
    font_small = ImageFont.truetype('arial.ttf', 24)
    font_button = ImageFont.truetype('arialbd.ttf', 28)
except Exception:
    font_title = ImageFont.load_default()
    font_sub = ImageFont.load_default()
    font_small = ImageFont.load_default()
    font_button = ImageFont.load_default()

# left text block
x_offset = 50
y_offset = 40
draw.text((x_offset, y_offset), 'Saman kinam', font=font_title, fill='#C1121F')
draw.text((x_offset, y_offset + 70), 'weekly super discounts', font=font_sub, fill='#4A4A4A')

draw.rectangle([x_offset, y_offset + 120, x_offset + 260, y_offset + 180], fill='#EDF7EE', outline='#60A566', width=2)
draw.text((x_offset + 15, y_offset + 130), 'VEGETABLES', font=font_small, fill='#1A5A1A')

draw.rectangle([x_offset + 280, y_offset + 120, x_offset + 520, y_offset + 180], fill='#FFF4E5', outline='#D38B00', width=2)
draw.text((x_offset + 295, y_offset + 130), 'FRUITS', font=font_small, fill='#A84700')

draw.rectangle([x_offset + 560, y_offset + 120, x_offset + 860, y_offset + 180], fill='#E9F5FF', outline='#1E66B0', width=2)
draw.text((x_offset + 575, y_offset + 130), 'GROCERIES', font=font_small, fill='#12568C')

# button area
button_text = 'SHOP NOW'
w, h = font_button.getbbox(button_text)[2:]
button_x = x_offset
draw.rectangle([button_x - 10, y_offset + 200, button_x + w + 30, y_offset + 245], fill='#C1121F')
draw.text((button_x + 10, y_offset + 205), button_text, font=font_button, fill='white')

# fruit/produce decoration on right
circle_x = width - 320
for color, dx, dy in [('#F7B32B', 0, 40), ('#EA5B0C', 90, 15), ('#4CA64C', 170, 55), ('#F35B7A', 230, 25)]:
    draw.ellipse([circle_x + dx, y_offset + dy, circle_x + dx + 120, y_offset + dy + 120], fill=color)

# small fruit accent
draw.ellipse([width - 150, height - 120, width - 60, height - 40], fill='#FFE066')

img_path = 'src/assets/banner-mobile.jpg'
img.save(img_path, quality=95)
print(f'Created banner {img_path}')
