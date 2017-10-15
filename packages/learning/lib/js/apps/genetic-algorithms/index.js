import React from 'react';

import AppHarness from 'js/shared/components/AppHarness';
import ExampleHarness from 'js/shared/components/ExampleHarness';

import CardSplitting from './CardSplitting';
import OneMax from './OneMax';
import Queens from './Queens';
import SortingNumbers from './SortingNumbers';
import TextMatching from './TextMatching';

const examples = [
  { label: 'Text Matching', component: TextMatching },
  { label: 'One Max', component: OneMax },
  { label: 'Sorting Numbers', component: SortingNumbers },
  { label: 'Queens', component: Queens },
  { label: 'Card Splitting', component: CardSplitting }
];

export default function GeneticAlgorithms (props) {
  return (
    <AppHarness page="geneticAlgorithms">
      <ExampleHarness
        defaultExample={examples[4]}
        examples={examples}
        heading="Genetic Algorithms"
      >
        <div>
          I recommend not trying the Genetic Algorithms on your mobile device. They consume a lot of power.
        </div>
      </ExampleHarness>
    </AppHarness>
  );
}
