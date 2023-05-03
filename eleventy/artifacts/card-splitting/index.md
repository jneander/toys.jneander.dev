---
layout: content-page
entrypoint: card-splitting
title: The Card Problem
---

This algorithm splits a group of playing cards, faces of ace through ten (values 1 through 10), into
two groups such that the sum of one group is 36 and the product of the second group is 360.

I'm unsure where this originated. I suspect it came from a puzzle book, but I haven't been able to
find the source or even identify this puzzle or the type of puzzle.

{% renderTemplate "webc" %}

<interactive-embed src="/artifacts/card-splitting/fullscreen" title="The Card Problem">
  [View the Card Problem on its own page.](/artifacts/card-splitting/fullscreen)
</interactive-embed>

{% endrenderTemplate %}

This exercise came from Chapter 6 of
[Genetic Algorithms with Python](https://github.com/handcraftsman/GeneticAlgorithmsWithPython#description)
by [Clinton Sheppard](https://www.cs.unm.edu/~sheppard/).
