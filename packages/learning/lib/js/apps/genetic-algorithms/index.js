import React from 'react';

import AppHarness from 'js/shared/components/AppHarness';
import ExampleHarness from 'js/shared/components/ExampleHarness';

import OneMax from './OneMax';
import SortingNumbers from './SortingNumbers';
import TextMatching from './TextMatching';

const examples = [
  { label: 'Text Matching', component: TextMatching },
  { label: 'One Max', component: OneMax },
  { label: 'Sorting Numbers', component: SortingNumbers }
];

export default function GeneticAlgorithms (props) {
  return (
    <AppHarness page="geneticAlgorithms">
      <ExampleHarness
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
