#!/usr/bin/env python3
"""
remove_bg.py – removes the white background from the UofL Cardinal logo
using a flood-fill approach from image corners (only removes exterior white,
not the whites inside the bird like the eye).
"""
from PIL import Image

src = '/Users/andreslopez/uofl-course-catalog-challenge/public/assets/uofl-cardinal.jpg'
dst = '/Users/andreslopez/uofl-course-catalog-challenge/public/assets/uofl-cardinal.png'

img = Image.open(src).convert('RGBA')
w, h = img.size
pixels = img.load()

THRESHOLD = 30   # how close to white a pixel must be to be considered background

def is_white(px):
    r, g, b, a = px
    return r > (255 - THRESHOLD) and g > (255 - THRESHOLD) and b > (255 - THRESHOLD)

# BFS flood fill from all 4 corners
visited = [[False] * h for _ in range(w)]
queue = []

corners = [(0, 0), (w-1, 0), (0, h-1), (w-1, h-1)]
for cx, cy in corners:
    if is_white(pixels[cx, cy]) and not visited[cx][cy]:
        visited[cx][cy] = True
        queue.append((cx, cy))

while queue:
    x, y = queue.pop()
    pixels[x, y] = (255, 255, 255, 0)  # make transparent
    for dx, dy in [(-1,0),(1,0),(0,-1),(0,1)]:
        nx, ny = x+dx, y+dy
        if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
            if is_white(pixels[nx, ny]):
                visited[nx][ny] = True
                queue.append((nx, ny))

img.save(dst, 'PNG')
print(f'Done – saved to {dst}')
