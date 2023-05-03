---
layout: content-page
entrypoint: knight-covering
title: The Knights Problem
---

This exercise uses a genetic algorithm to place a minimum number of knight pieces on a chess board
in such a way that each position on the board can be attacked by at least one of the knights. The
original puzzle is for a standard 8x8 chess board. Here it can be based on a board sized from a
minimum of 4x4 up to an arbitrary limit of 20x20.

Like with [The Queens Puzzle](/artifacts/chess-queens), the number of knights on the board is fixed.
However, this value is defined by a known minimum count required to achieve the goal of the puzzle
for each of the allowed board sizes.

{% renderTemplate "webc" %}

<interactive-embed src="/artifacts/chess-knights/fullscreen" title="The Knights Problem">
  [View the Knights Problem on its own page.](/artifacts/chess-knights/fullscreen)
</interactive-embed>

{% endrenderTemplate %}

This exercise came from Chapter 7 of
[Genetic Algorithms with Python](https://github.com/handcraftsman/GeneticAlgorithmsWithPython#description)
by [Clinton Sheppard](https://www.cs.unm.edu/~sheppard/).
