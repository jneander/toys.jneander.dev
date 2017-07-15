import React from 'react';

function buildColumnCssRule (column, left = 0) {
  return {
    width: `${column.width}px`
  };
}

function buildColumnsCssRules (columns) {
  const ruleMap = {};
  let left = 0;
  columns.forEach((column) => {
    ruleMap[column.id] = buildColumnCssRule(column, left);
    left += column.width;
  });
  return ruleMap;
}

function renderGridRules (props, state) {
  return `
    .Grid {
      box-sizing: border-box;
      overflow: scroll;
      z-index: ${props.zIndex || 0}
    }
    .Grid__Header {
      display: block;
      position: sticky;
      top: 0;
      white-space: nowrap;
      z-index: 1;
    }
    .Grid__Body {
      display: block;
      position: relative;
    }
    .Grid__Row {
      display: block;
      white-space: nowrap;
    }
    .Grid__HeaderCell,
    .Grid__RowCell {
      display: inline-block;
      height: 100%;
      position: relative;
      width: 100%;
    }
  `;
}

function renderColumnRules (props, state) {
  const allColumnRules = props.columns.map((column, columnIndex) => {
    const columnRules = state.rules.columns[column.id];
    return `
      .Grid__Column--${column.id} {
        position: relative;
        width: ${columnRules.width};
      }
    `;
  });
  return allColumnRules.join(' ');
}

class GridStyles extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      rules: {
        columns: buildColumnsCssRules(this.props.columns)
      }
    };

    this.setColumnWidth = this.setColumnWidth.bind(this);
  }

  setColumnWidth (columnIndex, width) {
    this.props.columns[columnIndex].width = width;

    this.setState({
      rules: {
        ...this.state.rules,
        columns: buildColumnsCssRules(this.props.columns)
      }
    });
  }

  render () {
    const { props, state } = this;
    const styleText = [
      renderGridRules(props, state),
      renderColumnRules(props, state)
    ].join(' ');

    return (
      <style type="text/css" ref="stylesheet">{ styleText }</style>
    );
  }
}

export default GridStyles;
