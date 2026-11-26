#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从已认可的 trial-02 母图生成分区蒙版（褙子、内衫、中衣、裙、腰带、鞋履），并修掉深色换色时的米色虚边。

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
    """把衣区与真墨线之间的暖灰虚边收回该衣区。"""
    dist = []
    for region in regions:
        dist.append(ndi.distance_transform_edt(~region))
    dist = np.stack(dist, axis=0)
    nearest = np.argmin(dist, axis=0)
    best = dist.min(axis=0)
    second = np.partition(dist, 1, axis=0)[1]
    ambiguous = (second - best) < 0.5
    rim = (best <= 2.0) & (best > 0) & (y >= TRUE_INK_Y) & (y <= 220) & ~protected & ~true_ink & ~ambiguous
    out = []
    for i, region in enumerate(regions):
        take = rim & (nearest == i)
        out.append(region | take)
    return out


def split_zhongyi(im: np.ndarray, inner: np.ndarray, y: np.ndarray):
    """从内衫领口区分割最内层白色交领中衣，互不重叠。"""
    s4 = np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]], dtype=np.uint8)
    roi = np.zeros_like(inner)
    roi[240:336, 315:405] = True
    bright = inner & roi & (y >= 185)
    comp, n = ndi.label(bright, structure=s4)
    zhongyi_core = np.zeros_like(inner)
    for k in range(1, n + 1):
        m = comp == k
        area = int(m.sum())
        avg_b = float(im[:, :, 2][m].mean()) if area else 0.0
        xs = np.where(m)[1]
        if 700 <= area <= 1300 and avg_b > 214 and xs.min() >= 325 and xs.max() <= 392:
            zhongyi_core = m
            break
    inner_core = inner & ~zhongyi_core & (~roi | (y >= 185))
    rim_cands = inner & ~zhongyi_core & ~inner_core
    dz = ndi.distance_transform_edt(~zhongyi_core)
    di = ndi.distance_transform_edt(~inner_core)
    zhongyi = zhongyi_core | (rim_cands & (dz < di) & (dz <= 3.0))
    inner_out = inner & ~zhongyi
    return inner_out, zhongyi


def build(im):
    labels, strict, y = labels_of(im)
    beizi = union(labels, BEIZI_LABELS)
    inner = union(labels, INNER_LABELS)
    skirt = union(labels, SKIRT_LABELS)
    waist = union(labels, WAIST_LABELS)
    shoes = union(labels, SHOE_LABELS)
    face = union(labels, FACE_LABELS)
    hands = union(labels, HAND_LABELS)
    bg = labels == 1
    true_ink = y < TRUE_INK_Y
    protected = ndi.binary_dilation(face | hands, structure=np.ones((3, 3))) | bg
    blocked = protected | true_ink | beizi | inner | skirt | waist | shoes
    beizi = grow_once(beizi, blocked)
    inner = grow_once(inner, blocked)
    skirt = grow_once(skirt, blocked)
    waist = grow_once(waist, blocked)
    shoes = grow_once(shoes, blocked)
    beizi, inner, skirt, waist, shoes = claim_rims(
        [beizi, inner, skirt, waist, shoes], true_ink, protected, y
    )
    shoes = shoes & ~skirt & ~beizi & ~true_ink
    waist = waist & ~true_ink
    skirt = skirt & ~waist & ~shoes & ~true_ink
    inner = inner & ~skirt & ~waist & ~true_ink
    beizi = beizi & ~inner & ~skirt & ~waist & ~shoes & ~true_ink
    inner, zhongyi = split_zhongyi(im, inner, y)
    yrefs = {}
    for name, core in (
        ("beizi", union(labels, BEIZI_LABELS)),
        ("inner", inner),
        ("zhongyi", zhongyi),
        ("skirt", union(labels, SKIRT_LABELS)),
        ("waist", union(labels, WAIST_LABELS)),
        ("shoes", union(labels, SHOE_LABELS)),
    ):
        yrefs[name] = float(np.median(y[core]))
    masks = {
        "beizi": beizi,
        "inner": inner,
        "zhongyi": zhongyi,
        "skirt": skirt,
        "waist": waist,
        "shoes": shoes,
    }
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
        print(name, int(mask.sum()), "yref", round(yrefs[name], 4))
    save_mask(OUT_MASK / "ink.png", true_ink)
    return masks, yrefs


if __name__ == "__main__":
    main()
