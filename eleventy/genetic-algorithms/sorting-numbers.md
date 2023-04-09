---
layout: content-page
entrypoint: sorting-numbers
title: Sorting Numbers
---

This algorithm receives an array of unique numbers and iteratively sorts it in descending order.
Each iteration mutates the chromosome (array of numbers) by swapping two genes (two array
positions). The fitness value has two parts:

1. order: the count of numbers which are in the correct order after their predecessor (higher is
   more fit)
2. gap: the sum of the difference between adjacent numbers that are incorrectly ordered (lower is
   more fit; zero is best)

<div class="interactive-region">
  <sorting-numbers></sorting-numbers>
</div>
