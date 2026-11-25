#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从已认可的 trial-02 母图生成分区蒙版，并修掉深色换色时的米色虚边。

母图像素来自 JPEG 解码后的固定栅格。运行时用无损 PNG，保证和蒙版对齐。
不调用生成模型。只做确定性的连通域和邻域规则。
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image
import scipy.ndimage as ndi

ART = Path(__file__).resolve().parent
MASTER_JPG = ART / "source" / "song-wardrobe-character-trial-02-illustration.jpg"
OUT_MASK = ART / "masks"
PKG_IMG = ART.parent / "pkg" / "images"

LINE_SPLIT_Y = 145
TRUE_INK_Y = 105
WALL = 3

BEIZI_LABELS = (15, 16)
SKIRT_LABELS = (21, 43, 44, 45, 46, 47, 48, 49, 50)
WAIST_LABELS = (20,)
INNER_LABELS = (14, 27, 29, 31)
FACE_LABELS = (4, 13)
HAND_LABELS = tuple(range(32, 43))
SHOE_LABELS = (51, 52)

LUMA_W = np.array([0.2126, 0.7152, 0.0722], dtype=np.float64)


def luma(rgb: np.ndarray) -> np.ndarray:
    return (rgb.astype(np.float64) * LUMA_W).sum(axis=-1)


def labels_of(im: np.ndarray):
    y = luma(im)
    strict = y < LINE_SPLIT_Y
    walls = ndi.binary_dilation(strict, structure=np.ones((WALL, WALL)))
    s4 = np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]], dtype=np.uint8)
    labels, _n = ndi.label(~walls, structure=s4)
    return labels, strict, y


def union(labels, ids):
    m = np.zeros(labels.shape, dtype=bool)
    for i in ids:
        m |= labels == i
    return m


def save_mask(path: Path, mask: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(np.where(mask, 255, 0).astype(np.uint8), mode="L").save(path)


def grow_once(region, blocked):
    grown = ndi.binary_dilation(region, structure=np.ones((3, 3)))
    return region | (grown & ~blocked & ~region)


def claim_rims(regions, true_ink, protected, y):
    """把衣区与真墨线之间的暖灰虚边收回该衣区。

    真墨线（很暗）不动。接近背景的亮像素不动，避免把奶油底涂进衣服。
    两个衣区都够得到的像素不分配，以免串色。
    """
    dist = []
    for region in regions:
        dist.append(ndi.distance_transform_edt(~region))
    dist = np.stack(dist, axis=0)
    nearest = np.argmin(dist, axis=0)
    best = dist.min(axis=0)
    second = np.partition(dist, 1, axis=0)[1]
    ambiguous = (second - best) < 0.5
    # 虚边比衣身暗一截，又没有暗到成为墨线。
    # 196 仍会留下一圈偏亮的抗锯齿。抬到 220，但脸和手先膨胀，避免染到皮肤。
    rim = (best <= 2.0) & (best > 0) & (y >= TRUE_INK_Y) & (y <= 220) & ~protected & ~true_ink & ~ambiguous
    out = []
    for i, region in enumerate(regions):
        take = rim & (nearest == i)
        out.append(region | take)
    return out


def recolor(im, mask, target, yref):
    out = im.astype(np.float64).copy()
    if not np.any(mask):
        return out
    y = luma(out)
    target = np.array(target, dtype=np.float64)
    yt = float((target * LUMA_W).sum())
    ynew = np.clip(yt + (y - yref), 8.0, 250.0)
    chroma = target / max(yt, 1e-6)
    painted = np.clip(ynew[..., None] * chroma, 0, 255)
    out[mask] = painted[mask]
    return out


def build(im):
    labels, strict, y = labels_of(im)
    beizi = union(labels, BEIZI_LABELS)
    inner = union(labels, INNER_LABELS)
    skirt = union(labels, SKIRT_LABELS)
    waist = union(labels, WAIST_LABELS)
    face = union(labels, FACE_LABELS)
    hands = union(labels, HAND_LABELS)
    shoes = union(labels, SHOE_LABELS)
    bg = labels == 1
    true_ink = y < TRUE_INK_Y
    protected = ndi.binary_dilation(face | hands, structure=np.ones((3, 3))) | shoes | bg
    # 先向非保护区的线缝长 1px，只吃还没有任何衣区的中间调。
    blocked = protected | true_ink | beizi | inner | skirt | waist
    beizi = grow_once(beizi, blocked | inner | skirt | waist)
    inner = grow_once(inner, blocked | beizi | skirt | waist)
    skirt = grow_once(skirt, blocked | beizi | inner | waist)
    waist = grow_once(waist, blocked | beizi | inner | skirt)
    beizi, inner, skirt, waist = claim_rims(
        [beizi, inner, skirt, waist], true_ink, protected, y
    )
    # 衣区之间若重叠，留给先绘制的外衣以外的更靠内区域：重叠处去掉外衣。
    waist = waist & ~true_ink
    skirt = skirt & ~waist & ~true_ink
    inner = inner & ~skirt & ~waist & ~true_ink
    beizi = beizi & ~inner & ~skirt & ~waist & ~true_ink
    yrefs = {}
    for name, core in (
        ("beizi", union(labels, BEIZI_LABELS)),
        ("inner", union(labels, INNER_LABELS)),
        ("skirt", union(labels, SKIRT_LABELS)),
        ("waist", union(labels, WAIST_LABELS)),
    ):
        yrefs[name] = float(np.median(y[core]))
    masks = {"beizi": beizi, "inner": inner, "skirt": skirt, "waist": waist}
    return masks, yrefs, true_ink, y


def main():
    im = np.array(Image.open(MASTER_JPG).convert("RGB"))
    if im.shape[:2] != (1280, 720):
        raise SystemExit("unexpected master size %s" % (im.shape,))
    masks, yrefs, true_ink, y = build(im)
    OUT_MASK.mkdir(parents=True, exist_ok=True)
    PKG_IMG.mkdir(parents=True, exist_ok=True)
    Image.fromarray(im).save(PKG_IMG / "figure.png")
    for name, mask in masks.items():
        save_mask(OUT_MASK / (name + ".png"), mask)
        save_mask(PKG_IMG / ("mask-" + name + ".png"), mask)
        print(name, int(mask.sum()), "yref", round(yrefs[name], 1))
    save_mask(OUT_MASK / "ink.png", true_ink)

    tests = {
        "navy": {"beizi": (36, 58, 92), "inner": (236, 226, 206), "skirt": (186, 168, 176), "waist": (120, 96, 78)},
        "purple": {"beizi": (72, 42, 86), "inner": (244, 228, 210), "skirt": (92, 48, 64), "waist": (160, 120, 90)},
        "light": {"beizi": (214, 228, 226), "inner": (246, 236, 220), "skirt": (232, 214, 196), "waist": (214, 186, 150)},
        "vivid": {"beizi": (176, 48, 58), "inner": (250, 236, 210), "skirt": (48, 96, 168), "waist": (212, 168, 48)},
    }
    if "--demo" in sys.argv:
        demo = ART / "demo"
        demo.mkdir(exist_ok=True)
        for key, cols in tests.items():
            out = im.astype(np.float64)
            for part, rgb in cols.items():
                out = recolor(out, masks[part], rgb, yrefs[part])
            rec = np.clip(np.round(out), 0, 255).astype(np.uint8)
            Image.fromarray(rec).save(demo / (key + ".png"))
            # 前襟与外轮廓放大
            for cname, box in (
                ("front", (300, 300, 430, 560)),
                ("ledge", (160, 400, 250, 560)),
                ("cuff", (180, 630, 280, 740)),
            ):
                crop = Image.fromarray(rec).crop(box)
                crop.resize((crop.width * 4, crop.height * 4), Image.NEAREST).save(demo / ("%s_%s.png" % (key, cname)))
        print("demos written")
    return masks, yrefs


if __name__ == "__main__":
    main()
