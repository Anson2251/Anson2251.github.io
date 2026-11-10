---
title: "The Gate in Activation Functions: The Same x in Eleven Formulas"
published: 2026-11-10
description: "Once you write eleven activations in the same form, only one value path remains. All you can change is the gate."
tags: ["Activation Functions", "Mathematics"]
category: "Deep Learning"
lang: en
translationKey: "value-path-is-x"
---

> Previously: [From Desmos to CaLU: My Activation Function Tinkering Notes (I)](/posts/desmos-and-calu-en/) ran 45 controlled runs on MNIST and collected eleven activations plus CaLU. This post picks up from there.

At the end of the last post I said the next step was VGG on CIFAR-10. I never got around to it; co-op has kept me busy the past two weeks. In my spare moments I was tidying up old notes, and I figured I might as well rewrite those eleven activation formulas cleanly so they'd be easy to look up later. Halfway through, I realized I didn't need to copy them one by one.

Turns out I didn't need to: they're all the same expression. Start with the most familiar one: ReLU is defined as

$$
\mathrm{ReLU}(x) = \max(x,0)
$$

Expand the $\max$ by cases, and it becomes $x$ times an on/off switch:

$$
\max(x,0) = x\cdot\mathbf{1}_{x>0} = x\cdot H(x)
$$

$\mathbf{1}_{x>0}$ is the Heaviside step function $H(x)$.

The rest follow the same pattern:

$$
\begin{aligned}
\mathrm{Leaky\ ReLU}(x) &= x\cdot\left(\mathbf{1}_{x>0}+0.01\cdot\mathbf{1}_{x\le 0}\right)\\
\mathrm{SiLU}(x) &= x\cdot\sigma(x)\\
\mathrm{GELU}(x) &= x\cdot\Phi(x)\\
\mathrm{CaLU}(x) &= x\cdot C(x)
\end{aligned}
$$

That leading $x$ stays the same throughout. I call it the value path, and the term behind it the gate.

All eleven, written out:

| Activation | Gate $g(x)$ | Floor | Notes |
|---|---|---|---|
| ReLU | Heaviside $H(x)$ | $0$ | |
| Leaky ReLU | Heaviside $H(x)$ | $0.01$ | |
| PReLU | Heaviside $H(x)$ | $a$ (learnable) | |
| ELU | Heaviside $H(x)$ | saturating | negative side is a scaled $e^x-1$ whose slope decays to 0; not really a linear leak |
| SELU | Heaviside $H(x)$ | saturating | ELU times $\lambda$ |
| SiLU | logistic $\sigma$ | $0$ | |
| GELU | Gaussian CDF $\Phi$ | $0$ | |
| CaLU | Cauchy CDF $C$ | $0$ | |
| Leaky CaLU | Cauchy CDF $C$ | $\beta$ | |
| RoCLU | log-transformed $\arctan$ | $0$ | |
| Mish | $\tanh\circ\,\mathrm{softplus}$ | $0$ | |

All the variation lives in the gate and its floor: the gate is a curve climbing from 0 to 1, be it Heaviside, logistic, Gaussian CDF, or Cauchy CDF; the floor is what remains when the gate is fully closed, and it decides how completely the gate shuts. Every row is the value path times a gate. In rows with a linear leak, even a fully closed gate still leaves $\alpha x$.

One item didn't make the table: softplus, $\ln(1+e^x)$, which doesn't look like $x$ times a gate. It's really the integral of a gate, since $\frac{d}{dx}\mathrm{softplus}=\sigma(x)$. The $x$ disappears in the integration, so I left it out; few people use it as a hidden-layer activation anyway.

Once I'd written out the table, I landed on a simple conclusion: designing a new activation function mostly means designing a new gate.

That conclusion only describes; it doesn't explain. What gave me pause was two more basic questions: why the value path is always $x$, when nobody gates $x^2$ or $e^x$; and why gates are always these few curves, Heaviside, logistic, Gaussian CDF, or Cauchy CDF, rather than any S-curve you like.

## Why the value path can only be $x$

The first question comes down to asymptotics. A usable hidden-layer activation has to asymptote to $y=x$ on the positive side and to a straight line with nonnegative slope on the negative side (slope 0 falls back to ReLU). The reason is familiar: magnitudes have to get through, and so do gradients. If $f$ saturates as $x\to+\infty$, then "strong" and "stronger" come out as the same number, and the information is lost right there; meanwhile $f'$ goes to zero, killing backprop at that point too.

For positive $x$ there's only one line through the origin with slope 1: $y=x$. There's no alternative for the value path.

Look at tanh and sigmoid for the flip side. When used as activations, they have no value path; they are the squashing curve themselves. For $f(x)=\sigma(x)$ the effective gain is $\sigma(x)/x$, which tends to zero as $x\to+\infty$: the stronger the signal, the harder it gets squashed. Vanishing gradients are just this fact in backprop language, not its cause.

Put that same sigmoid inside $x\cdot\sigma(x)$ and the problem goes away. What it does hasn't changed; it still climbs from 0 to 1, except it no longer has to carry the signal to the next layer. The same "boundedness" is a virtue in a gate and a defect in an activation. In the last post, sigmoid ranked last on its own and second inside SiLU: two sides of the same coin.

So far this only explains why the value path is locked to $x$. What the gate actually shuts off, and what the network loses when it does, are still open.

## Which column the gate shuts off

First, let's get the FC layer straight. One linear layer computes $y=Wx+b$, with $x\in\mathbb{R}^n$ and $W\in\mathbb{R}^{m\times n}$. This is often described as "mapping the input to another space." More concretely: each row of $W$ is a direction, and $y_i$ is the component of the input along that direction. Since activations act coordinate-wise, gates switch one component at a time.

What happens algebraically when a gate shuts depends on the next layer. The next layer's pre-activation is

$$
z = W'y = \sum_{i=1}^{m} W'_i\, y_i
$$

where $W'_i$ is the $i$-th column of $W'$. When the $i$-th gate closes fully ($y_i=0$), the term $W'_i y_i$ drops out of the sum, which is the same as deleting the $i$-th column of $W'$. So one neuron's contribution to the whole network is the rank-one atom formed by the input direction $w_i$ and the output direction $W'_i$:

$$
A_i = W'_i\, w_i^\top
$$

The gate decides whether that atom counts for this input. Selection and assembly come apart here: the atom itself is the feature, one input direction paired with one output direction; the gate picks, the sum assembles. Between layers the network just recombines the selected atoms.

The atoms are generally not orthogonal. Shutting one gate doesn't cleanly remove one feature; the remaining atoms still leak a little in that direction, and how much leaks depends on their overlap with $A_i$. That's what sparse coding means by a low-coherence dictionary.

How the gates open determines how many regimes the network has. With $\alpha=0$, a shut gate outputs an exact zero, and each input turns on one set of gates, so the network picks one subnetwork for that input: it uses a submatrix of $W'$, and the mapping stays linear, just cut into many pieces. With $\alpha>0$, no column is ever deleted; the shut ones are just scaled by $\alpha$, the matrix stays full rank, and the condition number worsens. Both versions train; the difference is how much the network truly stops using those atoms.

This also changes how to read a neuron's output. A linear layer returns a nonzero number for any input, so it has no "absent" state; once the gate shuts, absence can be represented for the first time. A neuron that speaks up only on some inputs carries information in its silence; one that never shuts up can't signal "present" vs. "absent" in its output. Which direction it prefers is up to $w_i$; the gate decides when it sits out.

If all gates stay open, every atom contributes to the output, the layer collapses to a fixed linear map, and "this coordinate is a feature" breaks down, because every coordinate mixes all directions. Only a sparse code aligns coordinates with features. A big part of why ReLU ruled for so many years is that it shuts decisively: the output is genuinely sparse, and the next layer gets a list of who is present.

These gates are all cumulative distribution functions: Heaviside is a degenerate distribution concentrated at 0, and $\sigma$, $\Phi$, $C$ are the logistic, Gaussian, and Cauchy CDFs. So $f(x)=x\cdot F(x)$ reads as an expectation: take $Z\sim F$ independent of $x$, keep $x$ when $Z\le x$ and drop it otherwise, and the expectation is exactly $x\cdot F(x)$. One motivation given in the GELU paper was to multiply by a 0/1 mask drawn from $\mathrm{Bernoulli}(\Phi(x))$. The gate's output is this component's cumulative probability (percentile) under its own distribution.

Choosing a gate amounts to a hypothesis about this coordinate: how big it usually is, and how heavy its tail is. Heaviside is a point mass with no tail, which is why ReLU is so harsh; logistic means exponential tails, Gaussian means Gaussian tails, Cauchy means polynomial tails. Read that way, the gate comparison figure from the last post is several distributional assumptions side by side: Cauchy has a heavy tail, large values are no surprise, so the gate crawls toward 1; Gaussian is steepest in the middle, so GELU is most sensitive to mid-sized activations.

This reading has its limits: each gate looks only at its own component, which amounts to assuming independence across components. Real features aren't independent, and $F(x_i)$ can't express "shut B off when A is on."

## What the optimizer and low precision see

Everything so far started from the function itself. The same formula looks like two different things to the optimizer and to numeric formats.

First, the optimizer. As gradients flow back, the activation contributes a local gain $m(x)\in[\alpha,1]$. One layer is like that; stack $L$ layers and the gain along one path lands in $[\alpha^L,1]$. The bound is crude, but it spells out the depth-vs-leak tradeoff: with $\alpha=0$, once a path shuts, nothing flows back through it; with $\alpha>0$ there is still a narrow road of width $\alpha^L$. Narrow, but not zero.

Then, scale. ReLU is positively homogeneous of degree one, $f(\lambda x)=\lambda f(x)$ for $\lambda>0$. Ignoring biases, scaling up a layer's weights scales its output along with it and leaves the shape alone. SiLU and GELU don't have this: blowing up the weights pushes $x$ further right on the gating curve and washes the nonlinearity out. With BN this effect is mostly held down, since each layer's scale gets normalized back; without BN it stays active, and weight decay slowly reshapes the activation's effective form. That last claim is reasoning only; I haven't tested it.

The number-format side is more direct. Piecewise-linear, bounded operators can be written entirely in integer arithmetic, which is where ReLU6 and hardswish come from: the former clips the range to $[0,6]$, the latter approximates SiLU with $x\cdot\mathrm{ReLU6}(x+3)/6$ to skip exponentials and division. They caught on on mobile because the hardware can compute the whole operator exactly, which has little to do with whether the shape is nice.

SiLU has an awkward range. The negative side dips to about $-0.278$, and asymmetric quantization has to cover that stretch, which eats into the resolution on the positive side. To actually use it you usually need a zero point that covers the negative values.

The real trouble is the leak itself. $\alpha=0.01$ lives happily in floating point, but in int8, if the shut-off value falls below half a quantization step, it rounds to 0. You think you're running Leaky ReLU, but you're really running ReLU; soft support degrades to hard support, the submatrix gets truly deleted, and the dead-unit risk comes back in full. fp16 has its own version: $\sigma(x)$ underflows to 0 around $x\approx-16.6$, so the gate on that side shuts completely as well.

So low precision isn't just about accuracy loss; it rewrites the activation's effective parameters. $\alpha$ is continuous on paper, but not on hardware.

## Who the gate looks at

Back to that limitation. In $f(x)=x\cdot g(x)$, the gate and the gated value are the same scalar, so the only information the gate can use is "how big is this component." That is a magnitude criterion: keep the big ones, shut the small ones. It can't express "let B through when A is present."

Make $x$ a vector instead of a scalar and the restriction loosens. GLU does exactly this. GLU stands for Gated Linear Unit: two linear projections of the same input, one as the value, one through a sigmoid as the gate.

$$
\mathrm{GLU}(x) = (Wx)\odot\sigma(Vx)
$$

Here $x$ is a vector, $W$ and $V$ are two matrices, $\odot$ is elementwise multiplication, biases omitted. The value path is $Wx$, the gate is $\sigma(Vx)$. The gate on the $i$-th component is decided by $(Vx)_i$, which is a linear combination of all input components. The gate looks along another direction, not at its own component.

Once the gate can see other components, selection becomes conditional: whether one feature stays can depend on whether another feature is there.

Check it against the earlier template and nothing has changed: the value path is still linear, the gate is still logistic. SwiGLU and GeGLU only swap the gate for SiLU and GELU. Same family. Only one thing changed: the gate's input went from its own component to another projection.

If the earlier reading holds, this is the remaining degree of freedom in gate design. A one-dimensional gate can only haggle over "how big counts as big," and the curves can only differ so much; give the gate more to look at, and what it can express jumps by an order of magnitude. The question the gate asks changes too: from "is this component big" to "given that component, should this one stay." My guess is that this is why the GLU family keeps winning in language models: what wins isn't the gate's shape, it's what the gate gets to see. The price is an extra projection, costing extra parameters and compute; whether that trade pays off depends on the task.

## Closing

The VGG experiment is still pending. But before that, I looked at the table again and the whole story boils down to one line: the value path is $x$, the gate is some CDF, and the only thing you can change is who the gate looks at.

If this reading is right, "inventing a new activation" is mostly swapping a new gate curve into the same template, and swapping curves may matter less than swapping what the gate gets to see. The 45 runs in the last post never separated, staying within noise, and looking back that is probably why: I kept tuning the less important parameter.
