"""Gate tails figure (matplotlib version): 1 - g(x) on semilog axis.

pgfplots 单精度放不下 1e-9 量级的小数, 这张改用 matplotlib 出 SVG.
"""
import numpy as np
from pathlib import Path

OUT = Path(__file__).parent

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

x = np.linspace(0.5, 20, 500)
sig = 1 / (1 + np.exp(-x))
C = 0.5 + np.arctan(x) / np.pi
R = 1.444 * np.log(1.5 + np.arctan(x) / np.pi)

plt.rcParams.update({"font.size": 11, "axes.grid": True, "grid.alpha": 0.3,
                     "figure.dpi": 150, "savefig.bbox": "tight"})
fig, ax = plt.subplots(figsize=(8, 5.6))
ax.semilogy(x, 1 - sig, linewidth=2.5, label=r"$1-\sigma(x)$ (exponential)")
ax.semilogy(x, 1 - C, linewidth=2.5, linestyle="--",
            label=r"$1-C(x)$ (polynomial $\sim 1/\pi x$)")
ax.semilogy(x, 1 - R, linewidth=2.5, linestyle="-.",
            label=r"$1-g_{\mathrm{RoCLU}}(x)$ (heaviest)")
ax.set_xlabel("x")
ax.set_ylabel("1 - g(x)")
ax.set_title("Gate tails: how fast the gate saturates to 1")
ax.legend()
fig.savefig(OUT / "05_tails.svg")
print("wrote", OUT / "05_tails.svg")
