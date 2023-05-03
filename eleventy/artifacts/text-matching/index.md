---
layout: content-page
entrypoint: text-matching
title: Text Matching
---

This exercise demonstrates an algorithm mutating a string of characters until it matches a target
string. It uses a simple numerical fitness value based on the total count of characters that are
same in each position between the given chromosome and the target.

{% renderTemplate "webc" %}

<interactive-embed src="/artifacts/text-matching/fullscreen" title="Text Matching">
  [View Text Matching on its own page.](/artifacts/text-matching/fullscreen)
</interactive-embed>

{% endrenderTemplate %}

This exercise came from Chapter 1 of
[Genetic Algorithms with Python](https://github.com/handcraftsman/GeneticAlgorithmsWithPython#description)
by [Clinton Sheppard](https://www.cs.unm.edu/~sheppard/).
