import React from 'react';

export default function StructureOnly () {
  return (
    <div role="grid">
      <div role="rowgroup">
        <div role="row">
          <span role="gridcell"></span>
          <span role="columnheader">John</span>
          <span role="columnheader">Ivan</span>
        </div>
      </div>

      <div role="rowgroup">
        <div role="row">
          <span role="rowheader">
            <span>Apples</span>
          </span>
          <span role="gridcell">
            <span>10</span>
          </span>
          <span role="gridcell">
            <span>12</span>
          </span>
        </div>

        <div role="row">
          <span role="rowheader">
            <span>Oranges</span>
          </span>
          <span role="gridcell">
            <span>1</span>
          </span>
          <span role="gridcell">
            <span>9</span>
          </span>
        </div>

        <div role="row">
          <span role="rowheader">
            <span>Bananas</span>
          </span>
          <span role="gridcell">
            <span>8</span>
          </span>
          <span role="gridcell">
            <span>4</span>
          </span>
        </div>
      </div>
    </div>
  );
}
