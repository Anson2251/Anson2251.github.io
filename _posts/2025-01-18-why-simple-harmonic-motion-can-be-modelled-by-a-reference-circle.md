---
layout: post
title: "Why Simple Harmonic Motion Can Be Modelled by a Reference Circle"
date: 2025-01-18
categories: physics mathematics
---

{% include override-styles.html %}

{% include math-support.html %}

## Introduction

During a physics lesson I was introduced to the concept of Simple Harmonic Motion (SHM), which can be modelled using a reference circle. At first I was puzzled: why can SHM be represented by a circle? Is it an assumption or a coincidence? To understand this in a more "sensible" way, I decided to derive the relationship between SHM and the reference circle mathematically.

## 1. What is SHM (Simple Harmonic Motion)

SHM is the motion of an object about a fixed point such that its acceleration $$a$$ is proportional to its displacement $$x$$ from the fixed point, and is directed towards the point. In other words, SHM follows the following equation:

$$a = -C x$$

where $$C$$ is a positive constant.

How to model this motion? A reference circle can be used.

{% include center-figure.html src="/assets/2025-01-18-why-simple-harmonic-motion-can-be-modelled-by-a-reference-circle/Unit_circle_angles_color.svg" alt="A reference circle" maxw="400px" maxh="400px" %}

> A reference circle. By [Jim.belk](//commons.wikimedia.org/w/index.php?title=User:Jim.belk&action=edit&redlink=1) - *Own work*, Public Domain, [Link](https://commons.wikimedia.org/w/index.php?curid=12062595)

By projecting the motion of a particle moving in a circle onto a diameter, we have:

$$
\begin{align}
x &= x_0\sin(\omega t+\theta) \\
v &= \dfrac{\mathrm{d}{x}}{\mathrm{d}{t}}=x_0\omega \cos(\omega t+\theta) \\
a &= \dfrac{\mathrm{d}{v}}{\mathrm{d}{t}}=-x_0\omega^2 \sin(\omega t+\theta) = -\omega^2 x
\end{align}
$$

Where $$\omega$$ is the angular speed of the reference circle, and $$\theta$$ is the initial phase angle. The radius of the circle corresponds to the amplitude of the SHM.

But wait, why can we model SHM with a reference circle? In order to answer this question, we need to dive into the mathematics behind it.

## 2. Some Mathematical Derivation

In the following equation, we are going to ignore frictions and other external forces.

Since we were introduced to simple harmonic motion from the motion of a spring. Let's start from the Hooke's Law, which states the force $$F$$ exerted by a spring is proportional to the displacement $$x$$ from its equilibrium position:

$$
F=-kx
$$

According to Newton's Second Law, we have:

$$
F=ma
$$

Additionally, due to the definition of acceleration, we have:

$$
a=\dfrac{\mathrm{d}^2}{\mathrm{d}t^2}x
$$

Let's combine these equations:

$$
\begin{align}
ma &= -kx \\
m\dfrac{\mathrm{d}^2x}{\mathrm{d}t^2} &= -kx \\
\dfrac{\mathrm{d}^2x}{\mathrm{d}t^2} &= -\dfrac{k}{m}x \\
\dfrac{\mathrm{d}^2x}{\mathrm{d}t^2} + \dfrac{k}{m}x &= 0
\end{align}
$$

Well, we have obtained a second-order differential equation. To solve it, we can assume a solution of the form:

$$x(t) = e^{rt}$$

Why we use this form? Because exponential functions $$e^x$$ have the property that their derivatives are proportional to themselves, which makes them suitable for solving differential equations. Let's substitute this into our differential equation:

Now we substitue $$x(t) = e^{rt}$$ into the differential equation:

$$
\begin{align}
r^2 e^{rt} + \frac{k}{m} e^{rt} &= 0
\end{align}
$$

By factoring out $$e^{rt}$$, we can obtain the characteristic equation, since $$e^{rt} \neq 0$$:

$$
\begin{align}
e^{rt}\left(r^2 + \frac{k}{m}\right) &= 0 \\
r^2 + \frac{k}{m} &= 0
\end{align}
$$

Now, we can solve the characteristic equation:

$$
\begin{align}
r^2 &= -\frac{k}{m} \\
r &= \pm i \sqrt{\frac{k}{m}}
\end{align}
$$

Finally, since the roots of the characteristic equation are complex, the general solution to the differential equation is:

$$
\begin{align}
x(t) &= C_1 e^{i \sqrt{\frac{k}{m}} t} + C_2 e^{-i \sqrt{\frac{k}{m}} t}
\end{align}
$$

Where $$C_1$$ and $$C_2$$ are arbitrary constants determined by initial conditions.

Then, according to Euler's formula: $$e^{i\theta} = \cos \theta + i \sin \theta$$, we can rewrite the general solution as:

$$
\begin{align}
x(t) &= C_1 \left(\cos\left(\sqrt{\frac{k}{m}} t\right) + i\sin\left(\sqrt{\frac{k}{m}} t\right)\right) \\& \quad + C_2 \left(\cos\left(\sqrt{\frac{k}{m}} t\right) - i\sin\left(\sqrt{\frac{k}{m}} t\right)\right) \notag\\
x(t) &= (C_1 + C_2)\cos\left(\sqrt{\frac{k}{m}} t\right) + i(C_1 - C_2)\sin\left(\sqrt{\frac{k}{m}} t\right)
\end{align}
$$

Let $$A = C_1 + C_2$$ and $$B = i(C_1 - C_2)$$, so:

$$
x(t) = A\cos\left(\sqrt{\frac{k}{m}} t\right) + B\sin\left(\sqrt{\frac{k}{m}} t\right)
$$

By using the trigonometric identity (compound angle formula) we used in Pure Mathmatics 3:
<!-- add more details -->

$$
\begin{align}
A\cos\left(\sqrt{\frac{k}{m}} t\right) + B\sin\left(\sqrt{\frac{k}{m}} t\right) = R\sin\left(\sqrt{\frac{k}{m}} t + \theta \right)
\end{align}
$$

where:

$$
R = \sqrt{A^2 + B^2} \quad \text{and} \quad \theta = \tan^{-1}\left(\frac{A}{B}\right).
$$

We are very close to the final solution. Let's define $$\omega = \sqrt{\frac{k}{m}}$$ and $$x_0 = R$$, so:

$$
x(t) = x_0\sin(\omega t + \theta)
$$

It is obvious that this equation is the same as the equation of the projection of the reference circle.

By getting the second derivative of $$x(t)$$, we can get the expression of $$a(t)$$:

$$
\begin{align}
a(t) &= \frac{\mathrm{d^2} v}{\mathrm{d}t^2} = -x_0\omega^2\sin(\omega t + \theta)
\end{align}
$$

Now, we can combine two equations to get the relationship bewteen $$a(t)$$ and $$x(t)$$:

$$
\begin{align}
a(t) &= -\omega^2 (x_0\sin(\omega t + \theta)) \\
a(t) &= -\omega^2 x(t)
\end{align}
$$

In this way, we have proved that the acceleration of the mass is proportional to its displacement from the equilibrium position and is always directed towards the equilibrium position. This is the defining characteristic of simple harmonic motion.

$$
\text{Q.E.D.}
$$
