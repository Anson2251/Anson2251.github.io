---
layout: post
title: "[EN] From Desmos to CaLU: My Activation Function Tinkering Notes (I)"
date: 2026-10-16
categories: [mathematics, deep-learning]
---

{% include override-styles.html %}
{% include load-barlow-font.html %}
{% include math-support.html %}

*Original post is in Chinese: [从 Desmos 到 CaLU：我的激活函数折腾手记 (I)]({% post_url 2026-10-16-desmos-and-calu %})*

*A note on division of labor: the inspiration and conjectures are mine; the code and experiments were written by AI — I was only responsible for talking, thinking, and training.*

A few days ago, tired from reviewing trigonometry, I was dragging curves around in Desmos for fun, plotting arctan and tanh on the same axes. The more I looked, the more alike they seemed — both S-shaped, both saturating on both sides. The only difference is that $\tanh$ has range $(-1, 1)$ while $\arctan$ has range $(-\frac{\pi}{2}, \frac{\pi}{2})$ — a horizontal and vertical rescaling makes them roughly coincide.

{% include center-figure.html src="/assets/2026-10-16-desmos-and-calu/01_tanh_arctan.svg" alt="tanh vs rescaled arctan: both have slope 1 at the origin; one tail converges exponentially, the other drags polynomially" maxw="339px" maxh="236px" %}

At that moment a thought popped up: **could a rescaled arctan work directly as an activation function?**

But the thought lived for about three seconds. Because the answer is obvious: definitely not good. Just as tanh and sigmoid died in deep networks, arctan would die the same way — saturating on both sides, with derivative $\frac{1}{1+x^2}$ sliding away to nothing on either flank, so gradients vanish as soon as the network gets deep. No experiment needed; one look at the supremum of the derivative tells you. So arctan fundamentalism was abandoned on the spot.

But Desmos was still open, so I stared a bit longer. I casually plotted sigmoid too.

## The infamous "dip" in Swish

My eyes moved to Swish: $f(x) = x\cdot\sigma(x)$. The left half of this curve has a famous little dip — it bottoms out at about $-0.28$ near $x\approx -1.28$ before climbing back. Everyone says this non-monotonic dip is part of why Swish works well, but I was being stubborn at the time: **what if I insisted on straightening it out?**

{% include center-figure.html src="/assets/2026-10-16-desmos-and-calu/02_swish_dip.svg" alt="Filling the dip: SiLU's dip, gradually flattened by soft leaky relu with different $\beta$ ($\beta=0.2$ is already strictly monotonic)" maxw="339px" maxh="235px" %}

The most handy fix is to add an x term and make it leaky:

$$f(x) = (1-\beta)\cdot x\cdot\sigma(x) + \beta\cdot x$$

As $x\to +\infty$ it approaches $x$, and as $x\to -\infty$ it approaches $\beta\cdot x$ — isn't that just a smoothed-out Leaky ReLU? I named it **soft leaky relu**.

Then I checked monotonicity directly in Desmos. With $\beta = 0.2$ it is solidly monotonic; with $\beta = 0.01$ the dip survives. Doing the math: $f'(x) = (1-\beta)\cdot[\text{derivative of SiLU}] + \beta$, and the SiLU derivative has a minimum of $-0.0998$ at $x\approx -2.40$. Forcing the minimum derivative above zero gives **strict monotonicity when $\beta > 0.0908$**.

That $0.09$ threshold would turn out to be interesting later — hold that thought.

## sigmoid — tanh — arctan: why not hack the gate?

After writing down soft leaky relu, I stared at it for a long time. Its structure is $x\cdot\mathrm{gate}(x) + \mathrm{leak}$. The gate is currently sigmoid, but my chain of association went like this:

**sigmoid and tanh are relatives** ($\tanh(x) = 2\sigma(2x) - 1$, second-grade knowledge), **and tanh and arctan look alike** (Desmos told me) — so why not hack arctan into a gate and plug it into the same template?

The original form I wrote down looked like this:

$$
\begin{align}
T(x) &= \frac{\arctan(x)}{\pi/2} \\
t(x) &= \frac{T(x)+1}{2} \\
a(x) &= (1-\beta)\cdot x\cdot t(x) + \beta\cdot x
\end{align}
$$

$T$ squeezes $\arctan$ into $(-1, 1)$, $t$ shifts it into $(0, 1)$ — a perfect gate. After writing it I tossed the formula to the AI, which recognized it at a glance: $\frac{1}{2}\left(\frac{2\arctan(x)}{\pi}+1\right)$ — isn't that just… the **CDF of the standard Cauchy distribution**? $C(x) = \frac{1}{2} + \frac{1}{\pi}\arctan(x)$, exactly the same.

{% include center-figure.html src="/assets/2026-10-16-desmos-and-calu/03_gates.svg" alt="Three gates side by side: sigmoid, Cauchy CDF, and RoCLU's log gate, all with range $(0,1)$" maxw="339px" maxh="327px" %}

Following that hint, Swish and GELU all clicked together:

- Logistic CDF → SiLU/Swish
- Gaussian CDF → GELU
- **Cauchy CDF → ??? empty slot**

The missing piece of the $x\cdot\mathrm{CDF}(x)$ trinity looks like this. The name was coined by the coding AI: **CaLU (Cauchy Linear Unit)**, the full version called **Leaky CaLU** — one family with SiLU and GELU, and I approved it. The gate slopes at zero line up neatly too: Gaussian $0.399$ > Cauchy $0.318$ > Logistic $0.25$, with Cauchy sitting exactly in the middle — heaviest tails, middling turn-on, beautifully symmetric.

{% include center-figure.html src="/assets/2026-10-16-desmos-and-calu/04_family.svg" alt="$x\cdot\mathrm{gate}(x)$ family portrait: SiLU, CaLU, Leaky CaLU, RoCLU" maxw="319px" maxh="236px" %}

After naming it I went to search the literature, and my heart sank halfway and then warmed back up: a paper from September 3, 2026 by Küçükali et al., **RoCLU** (Robust Cauchy Linear Unit), with formula $1.444\cdot x\cdot \ln\left(1.5 + \frac{\arctan(x)}{\pi}\right)$ — the same $x\cdot g(\arctan(x))$ family, with a log-transformed gate.

On second thought, that's good news: first, it means I'm not the only one walking the Cauchy-gate path, so the direction is probably right; second, their gate and mine differ (log gate vs. exact CDF gate), so our stories don't collide; third, **a ready-made literature baseline**, free for the taking. I promptly added it to the comparison runs.

## Experiments: 45 runs, just the results

The experimental design is simple, with one core idea in a single sentence: **make the model skinny and the differences reveal themselves**. Classic LeNet on MNIST hits 99% with eyes closed — every activation looks the same — so I deliberately crippled the network down to $5.4\text{k}$ parameters (about $\frac{1}{10}$ of the original), with no BN, no Dropout, and only $10$ training epochs. The model looks like this ($28\times28$ input):

| # | Layer | Config | Output size | Params |
|---|---|---|---|---|
| 1 | Conv1 + Act | $1{\to}4$ channels, $5{\times}5$ | $4\times24\times24$ | 104 |
| 2 | AvgPool | $2{\times}2$ | $4\times12\times12$ | 0 |
| 3 | Conv2 + Act | $4{\to}8$ channels, $5{\times}5$ | $8\times8\times8$ | 808 |
| 4 | AvgPool | $2{\times}2$ | $8\times4\times4$ | 0 |
| 5 | Flatten | — | $128$ | 0 |
| 6 | FC1 + Act | $128{\to}32$ | $32$ | 4128 |
| 7 | FC2 (no activation) | $32{\to}10$ | $10$ (logits) | 330 |
| | **Total** | | | **5370** |

11 activation functions; everything except what's inside Act is **strictly identical**: the same Xavier initialization, the same optimizer (Adam, $\text{lr}=10^{-3}$, $\text{weight decay}=0$, no scheduler), the same batch size ($512$), the same device (mps), 3 seeds per activation. The code was done by AI — I just supplied the hyperparameters and the experiment-ID mapping table, and then did the training.

### Main results (MNIST test set, 3-seed mean $\pm$ std, in %)

| Activation | seed0 | seed1 | seed2 | Mean |
|---|---|---|---|---|
| Soft Leaky ReLU | 97.78 | 97.39 | 97.82 | **$97.66 \pm 0.24$** |
| SiLU | 97.67 | 97.38 | 97.83 | **$97.63 \pm 0.23$** |
| GELU | 97.58 | 97.54 | 97.71 | **$97.61 \pm 0.09$** |
| RoCLU | 97.90 | 97.04 | 97.69 | **$97.54 \pm 0.45$** |
| Tanh | 97.53 | 97.67 | 97.37 | $97.52 \pm 0.15$ |
| Leaky CaLU | 97.75 | 97.17 | 97.60 | $97.51 \pm 0.30$ |
| CaLU | 97.76 | 97.12 | 97.60 | $97.49 \pm 0.33$ |
| Arctan | 97.40 | 97.70 | 97.21 | $97.44 \pm 0.25$ |
| Leaky ReLU | 97.54 | 97.55 | 97.15 | $97.41 \pm 0.23$ |
| ReLU | 97.52 | 97.53 | 97.15 | $97.40 \pm 0.22$ |
| Sigmoid | 90.66 | 94.33 | 90.30 | $91.76 \pm 2.23$ |

SiLU ($97.63$) > GELU ($97.61$) > CaLU ($97.49$). GELU has the smallest variance in the field ($\pm 0.09$) and the fastest epoch-1 startup ($90.17$) — the Gaussian gate, battle-tested by industry, is scarily stable. RoCLU ranks fourth and took the single best run of the field ($97.90$), but its variance is also the largest apart from sigmoid. Sigmoid finishing last is no surprise: only $43.7\%$ after the first epoch, a textbook vanishing-gradient scene.

### Gate $\times$ leak

Pulling out the four "in-group" members, gate (sigmoid gate vs. Cauchy gate) $\times$ leak ($\beta=0$ vs. $\beta=0.01$) forms a clean controlled comparison:

| Mean | $\beta=0$ | $\beta=0.01$ |
|---|---|---|
| sigmoid gate | SiLU 97.63 | Soft 97.66 |
| Cauchy gate | CaLU 97.49 | LeakyCaLU 97.51 |

The leak effect is $+0.02\sim0.03$ in both rows, and the gate effect is sigmoid gate $+0.14\sim0.15$ in both columns — fully consistent directions, though unfortunately both within the noise band. RoCLU (log gate) lands in between at $97.54$, matching its gate shape sitting in the middle too ($g'(0)\approx 0.306$, with a deeper negative-side asymptote than Cauchy: $-0.46$ vs. $-0.32$). And inside the trinity, SiLU > GELU > CaLU is exactly the **reverse order** of gate turn-on sharpness. But honestly, apart from sigmoid everyone is within noise of each other — not enough significance.

### The most interesting part: β ablation vs. the monotonicity threshold

As computed in Desmos earlier, the derivative of soft leaky relu is

$$f'(x) = (1-\beta)\,[\sigma(x) + x\sigma(x)(1-\sigma(x))] + \beta$$

The bracket is the SiLU derivative, with minimum about $-0.0998$ (at $x\approx -2.40$). Setting it above zero:

$$(1-\beta)(-0.0998) + \beta > 0 \quad\Longrightarrow\quad \beta > \beta^* \approx 0.0908$$

So $\beta=0.2$ is solidly monotonic, $\beta=0.1$ is borderline monotonic (minimum derivative $0.01$), and $\beta=0.01$ is non-monotonic (keeps the dip). I ran four settings, scaling $\beta$ from $0.01$ up to $0.3$:

| $\beta$ | Final accuracy (mean$\pm$std) | epoch-1 mean | Monotonicity (min derivative) |
|---|---|---|---|
| 0.01 | **$97.66\pm0.24$** | 89.92 | non-monotonic ($-0.089$, keeps dip) |
| 0.1 | $97.47\pm0.44$ | 88.99 | borderline monotonic ($+0.010$) |
| 0.2 | $97.36\pm0.46$ | 88.02 | solidly monotonic ($+0.120$) |
| 0.3 | $97.00\pm0.41$ | 87.30 | solidly monotonic ($+0.230$) |

Mean and startup speed both decline strictly monotonically, while variance grows overall ($\pm0.24\to\pm0.41$, peaking at $\pm0.46$ for $\beta=0.2$). In other words, **the monotonic versions are actually worse**. That dip is at least not a bad thing on shallow-network MNIST. My original obsession with "straightening it out" was refuted by my own experiment. That's science: conjectures get to be beautiful, data gets to be merciless.

## Next: VGG

My intuition: a heavy-tailed, polynomial-dragging design like the Cauchy gate can't show its strength in a slimmed-down LeNet with only 3 nonlinear layers, because gate differences like these only compound after being multiplied 8–10 times. The figure below shows why: $1-g(x)$ of the sigmoid gate decays exponentially (a straight line on semi-log axes), saturating to the bottom in no time; while the Cauchy gate and RoCLU gate drag polynomial tails that stay soft for a long while. As depth grows, the former "decides" early while the latter still keeps gradients alive (a BN-free deep net like VGG is its home turf). The RoCLU paper likewise tested deep (up to 700 layers).

{% include center-figure.html src="/assets/2026-10-16-desmos-and-calu/05_tails.svg" alt="Gate tail comparison (semi-log axes): exponential vs. polynomial tails, two orders of magnitude apart by just $x\approx8$" maxw="678px" maxh="498px" %}

So next up: VGG + CIFAR-10. Which of the three gate families (sigmoid / Cauchy-CDF / log) fights best in deep water — stay tuned for part II.

---

*The full experiment report and **raw results** of all 45 training runs are in the archive ([calu-archive.zip](/assets/2026-10-16-desmos-and-calu/calu-archive.zip), 42 experiment directories in total: 11 activations × 3 seeds = 33 main runs, plus 9 new β-ablation runs; the β=0.01 setting reuses the main runs. Unzip and run `collect_results.py` / `beta_ablation.py` to reproduce all figures). Critiques welcome. And please tell me if the CaLU name collides with anyone's — as of writing, RoCLU is the only relative I found.*

## References

[1] Küçükali Ö, Bozkurt MH, Ulutaş E, Bozkurt I. A Novel Activation Function for Enhancing Deep Neural Network Stability and Performance. *Concurrency and Computation: Practice and Experience*. 2026;38:e70944. DOI: [10.1002/cpe.70944](https://doi.org/10.1002/cpe.70944).
